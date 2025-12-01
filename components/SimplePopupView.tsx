import { View } from "react-native";

export default function SimplePopupView({children, style}: {children: any, style?: any[]}) {
	if (style == undefined)
		style = [];
    return <View style={[{
		width: '90%',
		maxWidth: 400,
		backgroundColor: '#1E293B',
		borderRadius: 20,
		borderColor: 'rgba(99, 102, 241, 0.2)',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 100,
        overflowY: 'scroll',
		boxSizing: 'border-box',
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 20,
	}, ...style]}>{children}</View>
}