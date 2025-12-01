import {
	Board,
	BoardBlockType,
	forEachBoardBlock,
	GRID_BLOCK_SIZE,
	HITBOX_SIZE,
	PossibleBoardSpots,
} from "@/constants/Board";
import { colorToHex } from "@/constants/Color";
import { Hand } from "@/constants/Hand";
import { randomWithRange } from "@/constants/Math";
import {
	createEmptyBlockStyle,
	createFilledBlockStyle,
} from "@/constants/Piece";
import { useDroppable } from "@mgcrea/react-native-dnd";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	SharedValue,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

interface BlockGridProps {
	board: SharedValue<Board>;
	possibleBoardDropSpots: SharedValue<PossibleBoardSpots>;
	hand: SharedValue<Hand>
	draggingPiece: SharedValue<number | null>
}

function encodeDndId(x: number, y: number): string {
	return `${x},${y}`;
}

function createBlockStyle(x: number, y: number, board: SharedValue<Board>): any {
    const boardSize = board.value.length;
    const loadBlockFlash = useSharedValue(0);
    const placedBlockFall = useSharedValue(0);
    
    useAnimatedReaction(() => {
        return board.value[y][x].blockType
    }, (cur, prev) => {
        // Block clearing animation - spin and shrink
        if (cur == BoardBlockType.EMPTY && (prev == BoardBlockType.FILLED || prev == BoardBlockType.HOVERED_BREAK_EMPTY || prev == BoardBlockType.HOVERED_BREAK_FILLED)) {
            // No need for direction/rotation values since we're just spinning in place
            placedBlockFall.value = withTiming(1, { 
                duration: 500 
            }, (finished) => {
                'worklet';
                if (finished) {
                    placedBlockFall.value = 0;
                }
            });
        }
    });

    useEffect(() => {
        if (board.value[y][x].blockType != BoardBlockType.EMPTY) 
            return;
        // Simplified - no flash animation to reduce delays
        loadBlockFlash.value = 0;
    }, [board.value[y][x].blockType]);

    const animatedStyle = useAnimatedStyle(() => {
        const block = board.value[y][x];
        
        if (block.blockType == BoardBlockType.EMPTY && loadBlockFlash.value != 0) {
            return {
                ...createFilledBlockStyle(block.color),
                opacity: Math.min(1, loadBlockFlash.value * 10),
            };
        }

        // No enlargement effect - just show the hovered break blocks normally

        if (placedBlockFall.value > 0) {
            let progress = placedBlockFall.value;
			progress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);// easeOutCirc
            // Spin and shrink animation instead of dispersing
            const spinRotation = progress * Math.PI * 4; // 2 full rotations
            return {
                ...createFilledBlockStyle(block.color),
                opacity: 1 - progress,
                transform: [
                    { scale: 1 - progress }, // Shrink to 0
                    { 
                        rotate: `${spinRotation}rad` // Spin 2 full rotations
                    }
                ]
            }
        }

        let style: any = createEmptyBlockStyle();
        if (block.blockType == BoardBlockType.FILLED || block.blockType == BoardBlockType.HOVERED) {
            style = {
                ...createFilledBlockStyle(block.color),
                opacity: block.blockType == BoardBlockType.HOVERED ? 0.3 : 1,
            };
        } else if (block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY || block.blockType == BoardBlockType.HOVERED_BREAK_FILLED) {
            const blockColor =
                block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY
                    ? block.color
                    : block.hoveredBreakColor;
            style = {
                ...createFilledBlockStyle(blockColor),
            };
        }

        return {...style, transform: []};
    });
    
    return animatedStyle;
}

export default function BlockGrid({
	board,
	possibleBoardDropSpots,
	draggingPiece,
	hand
}: BlockGridProps) {
	const blockElements: any[] = [];
	const boardLength = board.value.length;
	forEachBoardBlock(board.value, (_block, x, y) => {
		const blockStyle = createBlockStyle(x, y, board);
		const blockPositionStyle = {
			position: "absolute",
			top: y * GRID_BLOCK_SIZE,
			left: x * GRID_BLOCK_SIZE,
		};

		blockElements.push(
			<Animated.View
				key={`av${x},${y}`}
				style={[styles.emptyBlock, blockPositionStyle as any, blockStyle]}
			>
				<BlockDroppable
					x={x}
					y={y}
					style={styles.hitbox}
					possibleBoardDropSpots={possibleBoardDropSpots}
				></BlockDroppable>
			</Animated.View>
		);
	});
	
	const gridStyle = useAnimatedStyle(() => {
		let style: any;
		if (draggingPiece.value == null) {
			style = {
				borderColor: 'transparent',
			}
		} else {
			const pieceColor = colorToHex(hand.value[draggingPiece.value!]!.color);
			style = {
				borderWidth: 2,
				borderColor: pieceColor,
				borderRadius: 16,
			}
		}
		return style;
	});
	
	return (
		<Animated.View
			style={[
				styles.grid,
				{
					width: GRID_BLOCK_SIZE * boardLength + 6,
					height: GRID_BLOCK_SIZE * boardLength + 6,
				},
				gridStyle
			]}
		>
			{blockElements}
		</Animated.View>
	);
}

interface BlockDroppableProps {
	children?: any;
	x: number;
	y: number;
	style: any;
	possibleBoardDropSpots: SharedValue<PossibleBoardSpots>;
}

function BlockDroppable({
	children,
	x,
	y,
	style,
	possibleBoardDropSpots,
	...otherProps
}: BlockDroppableProps) {
	const id = `${x},${y}`;
	const { props, activeId } = useDroppable({
		id,
	});

	// internally of react-native-dnd, the cache of this draggable's layout is only updated in onLayout
	// reanimated styles/animated styles do not call onLayout
	// because of above, react-native-dnd does not see width or height changes and collisions become off
	// below is a very hacky fix

	const updateLayout = () => {
		// this is a weird solution, but pretty much there is a race condition with updating layout immediately
		// after returning a style within useAnimatedStyle on the UI thread
		// 20ms should be good (> 1000ms/60)
		setTimeout(() => {
			(props.onLayout as any)(null);
		}, 1000 / 60);
	};

	const animatedStyle = useAnimatedStyle(() => {
		runOnJS(updateLayout)();
		const active = possibleBoardDropSpots.value[y][x] == 1;
		if (active) {
			// Very large hitbox - covers almost the entire block for maximum drop area
			return {
				width: HITBOX_SIZE,
				height: HITBOX_SIZE,
				position: 'absolute',
				top: (GRID_BLOCK_SIZE - HITBOX_SIZE) / 2,
				left: (GRID_BLOCK_SIZE - HITBOX_SIZE) / 2,
			};
		} else {
			return {
				width: 0,
				height: 0,
				position: 'absolute',
				top: (GRID_BLOCK_SIZE) / 2,
				left: (GRID_BLOCK_SIZE) / 2,
			};
		}
	}, [props, possibleBoardDropSpots]);

	return (
		<Animated.View {...props} style={[style, animatedStyle]} {...otherProps}>
			{children}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	emptyBlock: {
		width: GRID_BLOCK_SIZE,
		height: GRID_BLOCK_SIZE,
		margin: 0,
		borderWidth: 0,
		borderRadius: 9999, // Make it a circle
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
	},
	grid: {
		//width: GRID_BLOCK_SIZE * BOARD_LENGTH + 8,
		//height: GRID_BLOCK_SIZE * BOARD_LENGTH + 8,
		position: "relative",
		backgroundColor: "#1E293B",
		borderWidth: 1,
		borderRadius: 20,
		borderColor: "rgba(99, 102, 241, 0.2)",
		opacity: 1,
		overflow: 'visible',
		pointerEvents: 'box-none',
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	hitbox: {
		width: HITBOX_SIZE,
		height: HITBOX_SIZE,
	},
});
