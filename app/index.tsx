import {
	StyleSheet,
	View,
} from "react-native";
import { ReanimatedLogLevel, configureReanimatedLogger } from "react-native-reanimated";
import Game from "@/components/game/Game";
import { GameModeType } from '@/hooks/useAppState';
import React from "react";
import OptionsMenu from "@/components/OptionsMenu";
import { MenuStateType, useAppState } from "@/hooks/useAppState";
import MainMenu from "@/components/MainMenu";
import HighScores from "@/components/HighScoresMenu";

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

export default function App() {
	// No custom fonts needed - using system default sans-serif
	const [ appState ] = useAppState();

	// Check the current state directly, not the entire chain
	const currentState = appState.current;
	const isGameMode = Object.values(GameModeType).includes(currentState as GameModeType);
	const gameMode = isGameMode ? currentState as GameModeType : undefined;
	const isMenu = currentState === MenuStateType.MENU;
	const isOptions = currentState === MenuStateType.OPTIONS;
	const isHighScores = currentState === MenuStateType.HIGH_SCORES;
	
	return (
		<View style={styles.container}>
			{ isMenu && !gameMode && <MainMenu></MainMenu> }
			{ gameMode && <Game gameMode={gameMode}></Game> }
			{ isOptions && <OptionsMenu></OptionsMenu> }
			{ isHighScores && <HighScores></HighScores>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
		background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%',
		position: 'relative',
	},
});
