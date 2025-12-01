import { PieceData, getBlockCount, pieceColors, Color } from '@/constants/Piece';
import { DndProvider, DndProviderProps, Rectangle } from '@mgcrea/react-native-dnd';
import React, { DependencyList, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import { ReduceMotion, runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BoardBlockType, GRID_BLOCK_SIZE, JS_emptyPossibleBoardSpots, PossibleBoardSpots, XYPoint, breakLines, breakColorMatches, canAnyPieceBePlaced, clearHoverBlocks, createPossibleBoardSpots, emptyPossibleBoardSpots, newEmptyBoard, placePieceOntoBoard, updateHoveredBreaks } from '@/constants/Board';
import { StatsGameHud, StickyGameHud } from '@/components/game/GameHud';
import BlockGrid from '@/components/game/BlockGrid';
import { createRandomHand, createRandomHandWorklet } from '@/constants/Hand';
import HandPieces from '@/components/game/HandPieces';
import { GameModeType, MenuStateType, useSetAppState } from '@/hooks/useAppState';
import { createHighScore, HighScoreId, updateHighScore } from '@/constants/Storage';
import GameSettingsMenu from '@/components/game/GameSettingsMenu';

// layout = active/dragging
const pieceOverlapsRectangle = (layout: Rectangle, other: Rectangle) => {
	"worklet";
	if (other.width == 0 && other.height == 0) {
		return false;
	}

	// Extremely forgiving overlap detection - if piece is anywhere near the droppable, accept it
	const pieceCenterX = layout.x + GRID_BLOCK_SIZE / 2;
	const pieceCenterY = layout.y + GRID_BLOCK_SIZE / 2;
	const droppableCenterX = other.x + other.width / 2;
	const droppableCenterY = other.y + other.height / 2;
	
	// Use distance-based detection - if centers are within 0.75 block sizes, accept it
	const maxDistance = GRID_BLOCK_SIZE * 0.75;
	const distanceX = Math.abs(pieceCenterX - droppableCenterX);
	const distanceY = Math.abs(pieceCenterY - droppableCenterY);
	
	return distanceX <= maxDistance && distanceY <= maxDistance;
};

const SPRING_CONFIG_MISSED_DRAG = {
	mass: 1,
	damping: 15, // Increased damping for less bouncy return
	stiffness: 300, // Reduced stiffness for smoother return
	overshootClamping: true,
	restDisplacementThreshold: 0.01,
	restSpeedThreshold: 0.01,
	reduceMotion: ReduceMotion.Never,
}

function decodeDndId(id: string): XYPoint {
	"worklet";
	return {x: Number(id[0]), y: Number(id[2])}
}

function impactAsyncHelper(style: Haptics.ImpactFeedbackStyle) {
	Haptics.impactAsync(style);
}

function runPiecePlacedHaptic() {
	"worklet";
	runOnJS(impactAsyncHelper)(Haptics.ImpactFeedbackStyle.Light);
}

// Helper function to check if two colors match
function colorsEqual(color1: Color, color2: Color): boolean {
	"worklet";
	return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

// Helper function to remove a color from array (worklet-safe)
function removeColorFromArray(colors: Color[], colorToRemove: Color): Color[] {
	"worklet";
	const result: Color[] = [];
	for (let i = 0; i < colors.length; i++) {
		if (!colorsEqual(colors[i], colorToRemove)) {
			result.push(colors[i]);
		}
	}
	return result;
}

export const Game = (({gameMode}: {gameMode: GameModeType}) => {
	const boardLength = gameMode == GameModeType.Chaos ? 10 : 8;
	const handSize = gameMode == GameModeType.Chaos ? 5 : 3;
	const board = useSharedValue(newEmptyBoard(boardLength));
	const draggingPiece = useSharedValue<number | null>(null);
	const possibleBoardDropSpots = useSharedValue<PossibleBoardSpots>(JS_emptyPossibleBoardSpots(boardLength));
	
	// Color rotation system - track available colors
	const availableColors = useSharedValue<Color[]>([...pieceColors]);
	
	// Initialize hand with unique colors - ensure at least 2 pieces can be placed
	const hand = useSharedValue(createRandomHand(handSize, availableColors.value, board.value, 2));
	
	const score = useSharedValue(0);
	const combo = useSharedValue(0);
	// How many moves ago was the last broken line?
	const lastBrokenLine = useSharedValue(0);
	const gameOver = useSharedValue(false);
	const lastValidDropPosition = useSharedValue<XYPoint | null>(null);

	const scoreStorageId = useSharedValue<HighScoreId | undefined>(undefined);
	const [_, setAppState] = useSetAppState();
	const [isGameOver, setIsGameOver] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	useEffect(() => {
		if (scoreStorageId.value != undefined)
			return;
		createHighScore({score: score.value, date: new Date().getTime(), type: gameMode}).then((id) => {
			scoreStorageId.value = id;
		});
	}, [scoreStorageId]);

	const handleDragEnd: DndProviderProps["onDragEnd"] = ({ active, over }) => {
		"worklet";
		if (draggingPiece.value == null) {
			board.value = clearHoverBlocks([...board.value]);
			draggingPiece.value = null;
			possibleBoardDropSpots.value = emptyPossibleBoardSpots(boardLength);
			return;
		}

		const piece: PieceData = hand.value[draggingPiece.value!]!;
		let dropX: number | null = null;
		let dropY: number | null = null;
		let isDirectDrop = false; // Track if this is a direct drop from the drag library

		// Priority 1: Use the exact drop position if provided - ALWAYS trust the drag library
		if (over) {
			const dropIdStr = over.id.toString();
			const decoded = decodeDndId(dropIdStr);
			dropX = decoded.x;
			dropY = decoded.y;
			isDirectDrop = true; // This is a direct drop, skip validation
		} 
		// Priority 2: Use the last valid position we were hovering over
		else if (lastValidDropPosition.value != null) {
			dropX = lastValidDropPosition.value.x;
			dropY = lastValidDropPosition.value.y;
		}
		
		// Priority 3: If we're dragging and there's ANY valid position, find and use the first one
		// This ensures we NEVER return if there's a valid spot available
		if (dropX == null || dropY == null) {
			const possibleSpots = createPossibleBoardSpots(board.value, piece);
			// Find the first valid position
			for (let y = 0; y < possibleSpots.length; y++) {
				for (let x = 0; x < possibleSpots[y].length; x++) {
					if (possibleSpots[y][x] == 1) {
						dropX = x;
						dropY = y;
						break;
					}
				}
				if (dropX != null) break;
			}
		}

		// If we found a valid position, ALWAYS place it
		if (dropX != null && dropY != null) {
			// If the drag library detected we're over a valid drop zone (over is set),
			// ALWAYS place it - no validation needed, trust the library completely
			// For fallback positions (lastValidDropPosition or first found), validate first
			let shouldPlace = false;
			
			if (isDirectDrop) {
				// Direct drop from drag library - ALWAYS place, no questions asked
				shouldPlace = true;
			} else {
				// Fallback position - verify it's still valid
				const possibleSpots = createPossibleBoardSpots(board.value, piece);
				if (dropY < possibleSpots.length && dropX < possibleSpots[dropY].length && possibleSpots[dropY][dropX] == 1) {
					shouldPlace = true;
				}
			}
			
			if (shouldPlace) {
				// Valid position - ALWAYS place the block
				if (Platform.OS != 'web')
					runPiecePlacedHaptic();

				// Create a deep copy of the board to avoid modifying the original
				const newBoard = clearHoverBlocks([...board.value].map(row => [...row].map(block => ({ ...block }))));
				
				// Track which blocks we're placing
				const placedBlocks: { x: number; y: number }[] = [];
				for (let y = 0; y < piece.matrix.length; y++) {
					for (let x = 0; x < piece.matrix[0].length; x++) {
						if (piece.matrix[y][x] == 1) {
							placedBlocks.push({ x: dropX + x, y: dropY + y });
						}
					}
				}
				
				placePieceOntoBoard(newBoard, piece, dropX, dropY, BoardBlockType.FILLED)
				
				// Check for color matches first (before line breaks) - only check matches involving newly placed blocks
				const colorMatchesRemoved = breakColorMatches(newBoard, placedBlocks);
				
				// Then check for line breaks
				const linesBroken = breakLines(newBoard);
				
				// add score from placing block
				const pieceBlockCount = getBlockCount(piece);
				score.value += pieceBlockCount;
				
				// Score for color matches
				if (colorMatchesRemoved > 0) {
					lastBrokenLine.value = 0;
					combo.value += Math.floor(colorMatchesRemoved / 3); // Combo based on groups removed
					// Color match score: more blocks = more points
					score.value += colorMatchesRemoved * 2 * (combo.value / 2);
				}
				
				// Score for line breaks
				if (linesBroken > 0) {
					lastBrokenLine.value = 0;
					combo.value += linesBroken;
					// line break score + combo multiplier stuff
					score.value += linesBroken * boardLength * (combo.value / 2) * pieceBlockCount;
				} else if (colorMatchesRemoved === 0) {
					// Only increment if no matches or lines were broken
					lastBrokenLine.value++;
					if (lastBrokenLine.value >= handSize) {
						combo.value = 0;
					}
				}
				if (scoreStorageId)
					runOnJS(updateHighScore)(scoreStorageId.value!, {score: score.value, date: new Date().getTime(), type: gameMode});
				
				// Remove the placed piece's color from available colors
				const placedColor = piece.color;
				let newAvailableColors = removeColorFromArray(availableColors.value, placedColor);
				
				// If all colors have been used, reset to all colors
				if (newAvailableColors.length === 0) {
					newAvailableColors = [...pieceColors];
				}
				availableColors.value = newAvailableColors;
				
				const newHand = [...hand.value];
				newHand[draggingPiece.value!] = null;

				// is hand empty?
				let empty = true
				for (let i = 0; i < handSize; i++) {
					if (newHand[i] != null) {
						empty = false;
						break;
					}
				}
				if (empty) {
					// When refilling hand, ensure at least 2 pieces can be placed
					hand.value = createRandomHandWorklet(handSize, newAvailableColors, newBoard, 2);
				} else {
					hand.value = newHand;
				}
				board.value = newBoard;
				
				// Check if game is over after updating hand
				// Note: finalHand is already validated to have at least 2 placeable pieces if empty
				const finalHand = empty ? hand.value : newHand;
				if (!canAnyPieceBePlaced(newBoard, finalHand)) {
					gameOver.value = true;
					runOnJS(setIsGameOver)(true);
				}
			} else {
				// Position became invalid, clear
				board.value = clearHoverBlocks([...board.value]);
			}
		} else {
			// No valid position exists at all - only then do we return
			board.value = clearHoverBlocks([...board.value]);
		}
		
		draggingPiece.value = null;
		possibleBoardDropSpots.value = emptyPossibleBoardSpots(boardLength);
		lastValidDropPosition.value = null;
	};

	const handleBegin: DndProviderProps["onBegin"] = (event, meta) => {
		"worklet";
		const handIndex = Number(meta.activeId.toString());
		if (hand.value[handIndex] != null) {
			draggingPiece.value = handIndex;
			possibleBoardDropSpots.value = createPossibleBoardSpots(board.value, hand.value[handIndex]);
			lastValidDropPosition.value = null; // Clear previous position
		}
	};

	const handleFinalize: DndProviderProps["onFinalize"] = ({ state }) => {
		"worklet";
		if (state !== State.END) {
			draggingPiece.value = null;
		}
	};

	const handleUpdate: DndProviderProps["onUpdate"] = (event, {activeId, activeLayout, droppableActiveId}) => {
		"worklet";
		if (draggingPiece.value == null) {
			return;
		}

		if (!droppableActiveId) {
			board.value = clearHoverBlocks([...board.value]);
			lastValidDropPosition.value = null;
			return;
		}

		const dropIdStr = droppableActiveId.toString();
		const {x: dropX, y: dropY} = decodeDndId(dropIdStr);
		const piece: PieceData = hand.value[draggingPiece.value!]!;

		// Store the last valid drop position
		lastValidDropPosition.value = {x: dropX, y: dropY};

		const newBoard = clearHoverBlocks([...board.value]);
		updateHoveredBreaks(newBoard, piece, dropX, dropY);

		board.value = newBoard
	}
	
	const handleReplay = () => {
		// Reset game state
		board.value = newEmptyBoard(boardLength);
		hand.value = createRandomHand(handSize, availableColors.value, board.value, 2);
		score.value = 0;
		combo.value = 0;
		lastBrokenLine.value = 0;
		gameOver.value = false;
		setIsGameOver(false);
		availableColors.value = [...pieceColors];
		setShowSettings(false);
	};
	
	return (        
		<SafeAreaView style={styles.root}>
			<GestureHandlerRootView style={styles.root}>
				<View style={styles.root}>
					<StickyGameHud 
						gameMode={gameMode} 
						score={score}
						onSettingsPress={() => setShowSettings(true)}
					/>
					<DndProvider shouldDropWorklet={pieceOverlapsRectangle} springConfig={SPRING_CONFIG_MISSED_DRAG} onBegin={handleBegin} onFinalize={handleFinalize} onDragEnd={handleDragEnd} onUpdate={handleUpdate}>
						<StatsGameHud score={score} combo={combo} lastBrokenLine={lastBrokenLine} hand={hand}></StatsGameHud>
						<BlockGrid board={board} possibleBoardDropSpots={possibleBoardDropSpots} hand={hand} draggingPiece={draggingPiece}></BlockGrid>
						<HandPieces hand={hand}></HandPieces>
					</DndProvider>
					{isGameOver && <GameOverOverlay score={score} gameMode={gameMode} />}
					{showSettings && (
						<GameSettingsMenu 
							onClose={() => setShowSettings(false)}
							onReplay={handleReplay}
						/>
					)}
				</View>
			</GestureHandlerRootView>
		</SafeAreaView>
	);
})

function GameOverOverlay({score, gameMode}: {score: SharedValue<number>, gameMode: GameModeType}) {
	const [scoreText, setScoreText] = useState("0");
	const [_, setAppState] = useSetAppState();
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useAnimatedReaction(() => {
		return score.value;
	}, (current) => {
		runOnJS(setScoreText)(String(Math.floor(current)));
	});

	useEffect(() => {
		// Auto-return to menu after 5 seconds
		timerRef.current = setTimeout(() => {
			setAppState(MenuStateType.MENU);
		}, 5000);
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	const handleBackToMenu = () => {
		// Clear the auto-return timer
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		// Navigate back to menu - explicitly reset to menu state
		// This ensures we completely clear any game mode from the state
		setAppState(MenuStateType.MENU);
	};

	return (
		<View style={styles.gameOverOverlay}>
			<View style={styles.gameOverContent}>
				<Text style={styles.gameOverTitle}>Game Over</Text>
				<Text style={styles.gameOverScore}>Final Score: {scoreText}</Text>
				<Pressable 
					style={styles.gameOverButton}
					onPress={handleBackToMenu}
				>
					<Text style={styles.gameOverButtonText}>Back to Menu</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		width: '100%',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
		overflow: 'hidden',
		backgroundColor: '#0F172A',
		background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
	},
	gameOverOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(15, 23, 42, 0.95)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2000,
	},
	gameOverContent: {
		backgroundColor: '#1E293B',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(99, 102, 241, 0.3)',
		padding: 40,
		alignItems: 'center',
		minWidth: 300,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 20,
	},
	gameOverTitle: {
		fontSize: 36,
		fontWeight: '700',
		color: '#EC4899',
		marginBottom: 20,
		letterSpacing: 0.5,
	},
	gameOverScore: {
		fontSize: 24,
		fontWeight: '600',
		color: '#6366F1',
		marginBottom: 30,
	},
	gameOverButton: {
		backgroundColor: '#6366F1',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		shadowColor: "#6366F1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	gameOverButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		letterSpacing: 0.5,
	},
})

export default Game;