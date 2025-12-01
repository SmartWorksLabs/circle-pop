import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Switch, Share, Platform } from "react-native";
import SimplePopupView from "../SimplePopupView";
import StylizedButton from "../StylizedButton";
import { cssColors } from "@/constants/Color";
import { MenuStateType, useSetAppState } from "@/hooks/useAppState";
import { Ionicons } from "@expo/vector-icons";
import InfoModal from "./InfoModal";

interface GameSettingsMenuProps {
	onClose: () => void;
	onReplay: () => void;
}

type SettingsView = 'main' | 'more';
type InfoModalType = 'contact' | 'terms' | 'privacy' | 'about' | null;

export default function GameSettingsMenu({ onClose, onReplay }: GameSettingsMenuProps) {
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [bgmEnabled, setBgmEnabled] = useState(true);
	const [currentView, setCurrentView] = useState<SettingsView>('main');
	const [infoModal, setInfoModal] = useState<InfoModalType>(null);
	const [setAppState] = useSetAppState();

	const handleHome = () => {
		setAppState(MenuStateType.MENU);
	};

	const handleShare = async () => {
		try {
			const result = await Share.share({
				message: 'Check out Circle Pop! - An awesome circular block puzzle game!',
				url: Platform.OS === 'ios' ? 'https://circlepop.app' : undefined,
			});
		} catch (error) {
			console.error('Error sharing:', error);
		}
	};

	const handleContactUs = () => {
		setInfoModal('contact');
	};

	const handleTermsOfService = () => {
		setInfoModal('terms');
	};

	const handlePrivacyPolicy = () => {
		setInfoModal('privacy');
	};

	const handleAboutUs = () => {
		setInfoModal('about');
	};

	const renderContent = () => {
		if (currentView === 'more') {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>More Settings</Text>
					
					<Pressable style={styles.menuItem} onPress={handleContactUs}>
						<Text style={styles.menuItemText}>Contact Us</Text>
						<Ionicons name="chevron-forward" size={20} color="#6366F1" />
					</Pressable>
					
					<Pressable style={styles.menuItem} onPress={handleShare}>
						<Text style={styles.menuItemText}>Share with Friends</Text>
						<Ionicons name="chevron-forward" size={20} color="#6366F1" />
					</Pressable>
					
					<Pressable style={styles.menuItem} onPress={handleTermsOfService}>
						<Text style={styles.menuItemText}>Terms of Service</Text>
						<Ionicons name="chevron-forward" size={20} color="#6366F1" />
					</Pressable>
					
					<Pressable style={styles.menuItem} onPress={handlePrivacyPolicy}>
						<Text style={styles.menuItemText}>Privacy Policy</Text>
						<Ionicons name="chevron-forward" size={20} color="#6366F1" />
					</Pressable>
					
					<Pressable style={styles.menuItem} onPress={handleAboutUs}>
						<Text style={styles.menuItemText}>About Us</Text>
						<Ionicons name="chevron-forward" size={20} color="#6366F1" />
					</Pressable>
					
					<View style={styles.buttonContainer}>
						<StylizedButton 
							text="Back" 
							onClick={() => setCurrentView('main')} 
							backgroundColor={cssColors.spaceGray}
						/>
					</View>
				</View>
			);
		}

		return (
			<View style={styles.container}>
				<Text style={styles.title}>Settings</Text>
				
				<View style={styles.settingRow}>
					<View style={styles.settingInfo}>
						<Text style={styles.settingLabel}>Sound</Text>
						<Text style={styles.settingDesc}>Enable sound effects</Text>
					</View>
					<Switch
						value={soundEnabled}
						onValueChange={setSoundEnabled}
						trackColor={{ false: '#475569', true: '#6366F1' }}
						thumbColor={soundEnabled ? '#FFFFFF' : '#94A3B8'}
					/>
				</View>
				
				<View style={styles.settingRow}>
					<View style={styles.settingInfo}>
						<Text style={styles.settingLabel}>Background Music</Text>
						<Text style={styles.settingDesc}>Enable background music</Text>
					</View>
					<Switch
						value={bgmEnabled}
						onValueChange={setBgmEnabled}
						trackColor={{ false: '#475569', true: '#6366F1' }}
						thumbColor={bgmEnabled ? '#FFFFFF' : '#94A3B8'}
					/>
				</View>
				
				<View style={styles.buttonContainer}>
					<StylizedButton 
						text="Home" 
						onClick={handleHome} 
						backgroundColor={cssColors.brightNiceRed}
					/>
					<StylizedButton 
						text="Replay" 
						onClick={onReplay} 
						backgroundColor="#10B981"
					/>
					<StylizedButton 
						text="More Settings" 
						onClick={() => setCurrentView('more')} 
						backgroundColor="#8B5CF6"
					/>
					<StylizedButton 
						text="Close" 
						onClick={onClose} 
						backgroundColor={cssColors.spaceGray}
					/>
				</View>
			</View>
		);
	};

	return (
		<>
			<View style={styles.overlay}>
				<Pressable 
					style={styles.backdrop} 
					onPress={onClose}
				/>
				<View style={styles.popupContainer}>
					<SimplePopupView>
						{renderContent()}
					</SimplePopupView>
				</View>
			</View>
			{infoModal && (
				<InfoModal 
					type={infoModal} 
					onClose={() => setInfoModal(null)}
				/>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 20,
		alignItems: 'center',
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#6366F1',
		marginBottom: 30,
		textAlign: 'center',
	},
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingVertical: 16,
		paddingHorizontal: 20,
		marginBottom: 12,
		backgroundColor: 'rgba(99, 102, 241, 0.1)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(99, 102, 241, 0.2)',
	},
	settingInfo: {
		flex: 1,
		marginRight: 16,
	},
	settingLabel: {
		fontSize: 18,
		fontWeight: '600',
		color: '#6366F1',
		marginBottom: 4,
	},
	settingDesc: {
		fontSize: 14,
		color: '#94A3B8',
	},
	buttonContainer: {
		width: '100%',
		marginTop: 20,
		gap: 12,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingVertical: 16,
		paddingHorizontal: 20,
		marginBottom: 12,
		backgroundColor: 'rgba(99, 102, 241, 0.1)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(99, 102, 241, 0.2)',
	},
	menuItemText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#6366F1',
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
		justifyContent: 'center',
		alignItems: 'center',
	},
	popupContainer: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(15, 23, 42, 0.7)',
	},
});

