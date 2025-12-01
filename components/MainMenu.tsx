import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSetAppState } from "@/hooks/useAppState";
import { cssColors } from "@/constants/Color";
import { GameModeType } from '@/hooks/useAppState';

export default function MainMenu() {
	const [ _, appendAppState ] = useSetAppState();
	
	return <View style={styles.container}>
		<Text style={styles.logo}>
			CIRCLE POP!
		</Text>

		<Pressable 
			style={styles.startButton}
			onPress={() => {
				appendAppState(GameModeType.Classic);
			}}
		>
			<Text style={styles.startButtonText}>
				START
			</Text>
		</Pressable>
	</View>
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%'
	},
	logo: {
		fontSize: 48,
		color: "#6366F1",
		marginBottom: 80,
		textAlign: "center",
		fontWeight: '700',
		letterSpacing: 1,
	},
	startButton: {
		width: 200,
		height: 56,
		backgroundColor: "#6366F1",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 0,
		shadowColor: "#6366F1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	startButtonText: {
		fontSize: 18,
		color: "#FFFFFF",
		fontWeight: '600',
		letterSpacing: 0.5,
	},
});
