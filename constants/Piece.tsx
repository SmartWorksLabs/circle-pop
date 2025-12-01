import { Color, colorToHex } from "./Color";

export interface PieceData {
	matrix: number[][];
	distributionPoints: number;
	color: Color;
}

// same as piecedata but with no color
// this is because color is random each time
// so we will use this one to store piece shape and info
interface PieceDataSaved {
	matrix: number[][];
	distributionPoints: number
}

export const piecesData: PieceDataSaved[] = [
	// L-shape
	{
		matrix: [
			[1, 0, 0],
			[1, 1, 1],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[1, 1],
			[1, 0],
			[1, 0],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[1, 1, 1],
			[0, 0, 1],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[0, 1],
			[0, 1],
			[1, 1],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[0, 0, 1],
			[1, 1, 1],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[1, 1, 1],
			[1, 0, 0],
		],
		distributionPoints: 2,

	},
	{
		matrix: [
			[1, 1],
			[0, 1],
			[0, 1],
		],
		distributionPoints: 2,

	},
	// Triangle shape
	{
		matrix: [
			[1, 1, 1],
			[0, 1, 0],
		],
		distributionPoints: 1.5,

	},
	{
		matrix: [
			[1, 0],
			[1, 1],
			[1, 0],
		],
		distributionPoints: 1.5,

	},
	{
		matrix: [
			[0, 1, 0],
			[1, 1, 1],
		],
		distributionPoints: 1.5,

	},
	{
		matrix: [
			[0, 1],
			[1, 1],
			[0, 1],
		],
		distributionPoints: 1.5,

	},
	// Z/S shape
	{
		matrix: [
			[0, 1, 1],
			[1, 1, 0],
		],
		distributionPoints: 1,

	},
	{
		matrix: [
			[1, 0],
			[1, 1],
			[0, 1],
		],
		distributionPoints: 1,

	},
	{
		matrix: [
			[1, 1, 0],
			[0, 1, 1],
		],
		distributionPoints: 1,

	},
	{
		matrix: [
			[0, 1],
			[1, 1],
			[1, 0],
		],
		distributionPoints: 1,

	},
	// 3x3
	{
		matrix: [
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],
		distributionPoints: 3,

	},
	// 2x2
	{
		matrix: [
			[1, 1],
			[1, 1],
		],
		distributionPoints: 6,

	},
	// 4x1
	{
		matrix: [
			[1],
			[1],
			[1],
			[1],
		],
		distributionPoints: 2,
	},
	// 1x4
	{
		matrix: [
			[1, 1, 1, 1],
		],
		distributionPoints: 2,
	},
	// 3x1
	{
		matrix: [
			[1],
			[1],
			[1],
		],
		distributionPoints: 4,
	},
	// 1x3
	{
		matrix: [
			[1, 1, 1],
		],
		distributionPoints: 4,
	},
	// 2x1
	{
		matrix: [
			[1],
			[1],
		],
		distributionPoints: 2,
	},
	// 1x2
	{
		matrix: [
			[1, 1],
		],
		distributionPoints: 2,
	},
];

export const pieceColors = [
	{ r: 239, g: 68, b: 68 }, // Red - very distinct
	{ r: 34, g: 197, b: 94 }, // Green - very distinct
	{ r: 59, g: 130, b: 246 }, // Blue - very distinct
	{ r: 245, g: 158, b: 11 }, // Yellow/Amber - very distinct
	{ r: 168, g: 85, b: 247 }, // Purple - very distinct
	{ r: 236, g: 72, b: 153 }, // Pink - very distinct
	{ r: 6, g: 182, b: 212 }, // Cyan - very distinct
	{ r: 251, g: 146, b: 60 } // Orange - very distinct
]

export function getBlockCount(piece: PieceData): number {
	"worklet";
	let count = 0;
	for (let y = 0; y < piece.matrix.length; y++) {
		for (let x = 0; x < piece.matrix[0].length; x++) {
			if (piece.matrix[y][x] == 1)
				count++;
		}
	}
	return count;
}

const totalDistributionPoints = piecesData.reduce((sum, piece) => sum + piece.distributionPoints, 0);

export function getRandomPieceColor(): Color {
	return pieceColors[Math.floor(Math.random() * pieceColors.length)];
}

export function getRandomPieceColorWorklet(): Color {
	"worklet";
	return pieceColors[Math.floor(Math.random() * pieceColors.length)];
}

export function getRandomPiece(availableColor?: Color): PieceData {
	let position = Math.random() * totalDistributionPoints;
	let piece: PieceDataSaved;
	for (let i = 0; i < piecesData.length; i++) {
		position -= piecesData[i].distributionPoints;
		if (position < 0) {
			piece = piecesData[i];
			break;
		}
	}

	return {
		...piece!,
		color: availableColor || getRandomPieceColor()
	};
}

export function getRandomPieceWorklet(availableColor?: Color): PieceData {
	"worklet";
	let position = Math.random() * totalDistributionPoints;
	let piece: PieceDataSaved;
	for (let i = 0; i < piecesData.length; i++) {
		position -= piecesData[i].distributionPoints;
		if (position < 0) {
			piece = piecesData[i];
			break;
		}
	}

	return {
		...piece!,
		color: availableColor || getRandomPieceColorWorklet()
	};
}

function getBorderColor(backgroundColor: Color) {
	"worklet";
	const { r, g, b } = backgroundColor;
	// Simple, clean border - slightly darker for definition
	const borderR = Math.max(0, r * 0.85);
	const borderG = Math.max(0, g * 0.85);
	const borderB = Math.max(0, b * 0.85);
	return `rgb(${Math.round(borderR)}, ${Math.round(borderG)}, ${Math.round(borderB)})`;
}

export function createFilledBlockStyle(color: Color, borderWidth: number = 2): object {
	"worklet";
	const hexColor = colorToHex(color);
	const borderColor = getBorderColor(color);
	return {
		backgroundColor: hexColor,
		borderColor: borderColor,
		borderWidth: borderWidth,
		borderRadius: 9999, // Make it a circle
		boxSizing: 'border-box',
		// Subtle shadow for depth without gloss
		boxShadow: `0 2px 4px rgba(0, 0, 0, 0.2)`,
	}
}

export function createEmptyBlockStyle(): object {
	"worklet";
	const borderColor = 'rgba(99, 102, 241, 0.15)'; // Subtle indigo border
	return {
		backgroundColor: '#1E293B',
		borderColor: borderColor,
		opacity: 1,
		borderWidth: 1,
		borderRadius: 9999, // Make it a circle
		boxSizing: 'border-box',
		boxShadow: 'none',
	}
}