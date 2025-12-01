import { Pressable, StyleSheet, Text } from "react-native";


export default function StylizedButton({text, onClick, backgroundColor, centered, borderColor}: {text: string, onClick?: () => void, backgroundColor: string, centered?: boolean, borderColor?: string}) {
    if (centered == undefined) {
        centered = true;
    }
    return <Pressable onPress={onClick} style={[styles.stylizedButton, {
            backgroundColor, alignSelf: 
            centered ? 'center' : 'flex-start', 
            borderWidth: 2, 
            borderColor: borderColor ? borderColor : "transparent"
        }]}>
        <Text style={styles.stylizedButtonText}>{text}</Text>
    </Pressable>
}

const styles = StyleSheet.create({
	stylizedButton: {
		width: 160,
		height: 40,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 4,
		borderWidth: 0,
		backgroundColor: '#6366F1',
		shadowColor: "#6366F1",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	stylizedButtonText: {
		fontSize: 14,
		color: '#FFFFFF',
        fontWeight: '600',
		letterSpacing: 0.5,
	}
});