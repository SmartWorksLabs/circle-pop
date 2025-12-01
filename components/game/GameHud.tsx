import { useState } from "react"
import { StyleSheet, Text, View, Pressable } from "react-native"
import { SharedValue, runOnJS, useAnimatedReaction, useSharedValue, withTiming } from "react-native-reanimated"
import { Hand } from "@/constants/Hand";
import { GameModeType } from "@/hooks/useAppState";
import { Ionicons } from "@expo/vector-icons";


interface GameHudProps {
	score: SharedValue<number>,
	combo: SharedValue<number>,
	lastBrokenLine: SharedValue<number>,
	hand: SharedValue<Hand>
}

export function StatsGameHud({ score, combo, lastBrokenLine, hand}: GameHudProps) {
	const [scoreText, setScoreText] = useState("0");
	const scoreAnimValue = useSharedValue(0); // stores the score, used to interpolate the number for animation

	useAnimatedReaction(() => {
		return score.value;
	}, (current, prev) => {
		scoreAnimValue.value = withTiming(current, { duration: 200 });
	})
	
	useAnimatedReaction(() => {
		return scoreAnimValue.value
	}, (current, _prev) => {
		runOnJS(setScoreText)(String(Math.floor(current)));
	})

	return <>
		<View style={styles.hudContainer}>
			<View style={styles.scoreContainer}>
				<Text style={styles.scoreValue}>{scoreText}</Text>
			</View>
		</View>
	</>
}


export function StickyGameHud({gameMode, score, onSettingsPress}: {gameMode: GameModeType, score: SharedValue<number>, onSettingsPress: () => void}) {
	return (
		<View style={styles.stickyContainer}>
			<Pressable style={styles.settingsButton} onPress={onSettingsPress}>
				<Ionicons name="settings" size={24} color="#6366F1" />
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	hudContainer: {
		width: '100%',
		height: 120,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scoreContainer: {
		width: '100%',
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 20,
	},
	scoreValue: {
		color: '#6366F1',
		fontSize: 56,
		fontWeight: '700',
		letterSpacing: 0,
	},
	hudLabel: {
		color: 'white',
		fontWeight: '900',
		fontSize: 30,
		marginLeft: 2,
		alignSelf: 'flex-start',
		position: 'absolute',
	},
	stickyContainer: {
		position: 'absolute',
		top: 20,
		right: 20,
		zIndex: 1000,
	},
	settingsButton: {
		width: 48,
		height: 48,
		borderRadius: 16,
		backgroundColor: 'rgba(99, 102, 241, 0.15)',
		borderColor: '#6366F1',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
	},
})