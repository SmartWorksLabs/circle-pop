import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import SimplePopupView from "../SimplePopupView";
import StylizedButton from "../StylizedButton";
import { cssColors } from "@/constants/Color";
import { Ionicons } from "@expo/vector-icons";

type InfoModalType = 'contact' | 'terms' | 'privacy' | 'about';

interface InfoModalProps {
	type: InfoModalType;
	onClose: () => void;
}

export default function InfoModal({ type, onClose }: InfoModalProps) {
	const renderContent = () => {
		switch (type) {
			case 'contact':
				return (
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
						<Text style={styles.title}>Contact Us</Text>
						<Text style={styles.sectionText}>
							We'd love to hear from you! Whether you have a question, feedback, or need support, we're here to help.
						</Text>
						<View style={styles.contactSection}>
							<Text style={styles.sectionTitle}>Email Support</Text>
							<Text style={styles.sectionText}>
								For general inquiries, support, or feedback:
							</Text>
							<Text style={styles.emailText}>support@circlepop.app</Text>
						</View>
						<View style={styles.contactSection}>
							<Text style={styles.sectionTitle}>Response Time</Text>
							<Text style={styles.sectionText}>
								We typically respond within 24-48 hours during business days.
							</Text>
						</View>
						<View style={styles.contactSection}>
							<Text style={styles.sectionTitle}>Bug Reports</Text>
							<Text style={styles.sectionText}>
								If you encounter any bugs or issues, please include:
							</Text>
							<Text style={styles.bulletText}>• Device type and OS version</Text>
							<Text style={styles.bulletText}>• Steps to reproduce the issue</Text>
							<Text style={styles.bulletText}>• Screenshots if possible</Text>
						</View>
					</ScrollView>
				);
			case 'terms':
				return (
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
						<Text style={styles.title}>Terms of Service</Text>
						<Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
							<Text style={styles.sectionText}>
								By downloading, installing, or using Circle Pop! ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>2. Use of the App</Text>
							<Text style={styles.sectionText}>
								You may use the App for personal, non-commercial purposes only. You agree not to:
							</Text>
							<Text style={styles.bulletText}>• Reverse engineer, decompile, or disassemble the App</Text>
							<Text style={styles.bulletText}>• Use the App for any illegal or unauthorized purpose</Text>
							<Text style={styles.bulletText}>• Attempt to gain unauthorized access to any part of the App</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>3. Intellectual Property</Text>
							<Text style={styles.sectionText}>
								All content, features, and functionality of the App are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>4. User Content</Text>
							<Text style={styles.sectionText}>
								Any scores, achievements, or data you create while using the App may be stored locally on your device. We do not claim ownership of your gameplay data.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>5. Disclaimer</Text>
							<Text style={styles.sectionText}>
								The App is provided "as is" without warranties of any kind. We do not guarantee that the App will be uninterrupted, secure, or error-free.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
							<Text style={styles.sectionText}>
								To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>7. Changes to Terms</Text>
							<Text style={styles.sectionText}>
								We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.
							</Text>
						</View>
					</ScrollView>
				);
			case 'privacy':
				return (
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
						<Text style={styles.title}>Privacy Policy</Text>
						<Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>1. Information We Collect</Text>
							<Text style={styles.sectionText}>
								Circle Pop! is designed with privacy in mind. We collect minimal information:
							</Text>
							<Text style={styles.bulletText}>• High scores and game progress (stored locally on your device)</Text>
							<Text style={styles.bulletText}>• Device information for app functionality</Text>
							<Text style={styles.sectionText}>
								We do not collect personal information such as your name, email address, or location unless you explicitly provide it (e.g., through support requests).
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>2. How We Use Information</Text>
							<Text style={styles.sectionText}>
								Any information collected is used solely to:
							</Text>
							<Text style={styles.bulletText}>• Provide and improve the App's functionality</Text>
							<Text style={styles.bulletText}>• Respond to support requests</Text>
							<Text style={styles.bulletText}>• Ensure the App works correctly on your device</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>3. Data Storage</Text>
							<Text style={styles.sectionText}>
								Your game data (scores, progress) is stored locally on your device using secure local storage. We do not transmit this data to external servers unless you explicitly choose to sync or share it.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>4. Third-Party Services</Text>
							<Text style={styles.sectionText}>
								The App may use third-party services (such as analytics) that have their own privacy policies. We recommend reviewing their policies for information on how they handle data.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>5. Children's Privacy</Text>
							<Text style={styles.sectionText}>
								Circle Pop! is suitable for all ages. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>6. Your Rights</Text>
							<Text style={styles.sectionText}>
								You have the right to:
							</Text>
							<Text style={styles.bulletText}>• Access your local game data</Text>
							<Text style={styles.bulletText}>• Delete your game data by uninstalling the App</Text>
							<Text style={styles.bulletText}>• Contact us with privacy concerns</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>7. Changes to Privacy Policy</Text>
							<Text style={styles.sectionText}>
								We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the "Last Updated" date.
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>8. Contact Us</Text>
							<Text style={styles.sectionText}>
								If you have questions about this Privacy Policy, please contact us at:
							</Text>
							<Text style={styles.emailText}>support@circlepop.app</Text>
						</View>
					</ScrollView>
				);
			case 'about':
				return (
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
						<Text style={styles.title}>About Circle Pop!</Text>
						
						<View style={styles.section}>
							<Text style={styles.sectionText}>
								Circle Pop! is a modern, addictive block puzzle game that combines strategic thinking with satisfying gameplay. Place circular pieces on the board, match colors, and clear lines to achieve the highest score possible!
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Features</Text>
							<Text style={styles.bulletText}>• Strategic circular block placement</Text>
							<Text style={styles.bulletText}>• Color matching mechanics - match 3+ colors to clear them</Text>
							<Text style={styles.bulletText}>• Line clearing - fill rows or columns to clear them</Text>
							<Text style={styles.bulletText}>• Score tracking and high scores</Text>
							<Text style={styles.bulletText}>• Modern, clean design</Text>
							<Text style={styles.bulletText}>• Smooth animations and satisfying gameplay</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>How to Play</Text>
							<Text style={styles.sectionText}>
								1. Drag and drop pieces from the bottom onto the board
							</Text>
							<Text style={styles.sectionText}>
								2. Fill complete rows or columns to clear them and score points
							</Text>
							<Text style={styles.sectionText}>
								3. Match 3 or more connected blocks of the same color to clear them
							</Text>
							<Text style={styles.sectionText}>
								4. Plan ahead - when your hand is empty, you'll get new pieces
							</Text>
							<Text style={styles.sectionText}>
								5. The game ends when no more pieces can be placed
							</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Version</Text>
							<Text style={styles.sectionText}>1.0.0</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Built With</Text>
							<Text style={styles.sectionText}>React Native, Expo, TypeScript</Text>
						</View>
						
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Contact</Text>
							<Text style={styles.sectionText}>For support, feedback, or inquiries:</Text>
							<Text style={styles.emailText}>support@circlepop.app</Text>
						</View>
					</ScrollView>
				);
		}
	};

	return (
		<View style={styles.overlay}>
			<Pressable style={styles.backdrop} onPress={onClose} />
			<SimplePopupView>
				<View style={styles.container}>
					{renderContent()}
					<View style={styles.buttonContainer}>
						<StylizedButton 
							text="Close" 
							onClick={onClose} 
							backgroundColor={cssColors.spaceGray}
						/>
					</View>
				</View>
			</SimplePopupView>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 2000,
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(15, 23, 42, 0.7)',
	},
	container: {
		width: '100%',
		height: '100%',
		padding: 20,
	},
	scrollView: {
		flex: 1,
		width: '100%',
	},
	scrollContent: {
		paddingBottom: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#6366F1',
		marginBottom: 20,
		textAlign: 'center',
	},
	lastUpdated: {
		fontSize: 14,
		color: '#94A3B8',
		marginBottom: 20,
		textAlign: 'center',
	},
	section: {
		marginBottom: 24,
	},
	contactSection: {
		marginBottom: 24,
		padding: 16,
		backgroundColor: 'rgba(99, 102, 241, 0.1)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(99, 102, 241, 0.2)',
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#6366F1',
		marginBottom: 12,
	},
	sectionText: {
		fontSize: 14,
		color: '#E2E8F0',
		lineHeight: 22,
		marginBottom: 8,
	},
	emailText: {
		fontSize: 16,
		color: '#6366F1',
		fontWeight: '600',
		marginTop: 8,
	},
	bulletText: {
		fontSize: 14,
		color: '#E2E8F0',
		lineHeight: 22,
		marginLeft: 12,
		marginBottom: 4,
	},
	buttonContainer: {
		width: '100%',
		marginTop: 20,
	},
});

