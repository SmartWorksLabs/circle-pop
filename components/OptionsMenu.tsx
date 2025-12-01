import { cssColors } from "@/constants/Color";
import { MenuStateType, useAppState, useAppStateValue } from "@/hooks/useAppState";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import SimplePopupView from "./SimplePopupView";
import StylizedButton from "./StylizedButton";

export default function OptionsMenu() {
	const [ appState, setAppState, _appendAppState, popAppState ] = useAppState();

	return <SimplePopupView>
		<View style={styles.optionsContainer}>
			<Text style={styles.optionsTitle}>Settings</Text>
			<View style={styles.buttonContainer}>
				<StylizedButton onClick={popAppState} text="Back" backgroundColor={cssColors.spaceGray}></StylizedButton>
				{ appState.containsGameMode() && 
					<StylizedButton onClick={() => { setAppState(MenuStateType.MENU) }} text="Quit Run" backgroundColor={cssColors.brightNiceRed}></StylizedButton>
				}
			</View>
		</View>
	</SimplePopupView>
}

function SettingLabel({title, description, children}: {title: string, description?: string, children?: any}) {
	return <View style={styles.settingLabelContainer}>
		<Text style={styles.settingTitle}>{title}</Text>
		{description && <Text style={styles.settingDesc}>{description}</Text>}
		<View style={styles.settingLabelChildren}>
			{children}
		</View>
	</View>
}

const styles = StyleSheet.create({
	optionsContainer: {
		width: '100%',
		alignItems: 'center',
		padding: 20,
	},
	optionsTitle: {
		color: '#6366F1',
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 30,
		letterSpacing: -0.5,
	},
	buttonContainer: {
		width: '100%',
		alignItems: 'center',
		gap: 12,
	},
	settingLabelContainer: {
		width: '80%',
		height: 'auto',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginTop: 6,
		marginBottom: 6
	},
	settingLabelChildren: {
		width: 'auto',
		height: 'auto',
		position: 'absolute',
		alignSelf: 'flex-end',
		justifyContent: 'flex-end',
	},
	settingTitle: {
		color: '#6366F1',
		fontSize: 16,
		fontWeight: '600',
	},
	settingDesc: {
		color: '#94A3B8',
		fontSize: 12,
		fontWeight: '400',
	}
});