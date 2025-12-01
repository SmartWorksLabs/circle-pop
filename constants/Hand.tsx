import { PieceData, getRandomPiece, getRandomPieceWorklet, pieceColors, Color } from "./Piece";
import { Board, countPlaceablePieces } from "./Board";

export type Hand = (PieceData | null)[]

// Create a hand with unique colors from available colors
// Optionally validates that at least minPlaceable pieces can be placed
export function createRandomHand(size: number, availableColors: Color[], board?: Board, minPlaceable: number = 0): Hand {
	let attempts = 0;
	const maxAttempts = 100; // Prevent infinite loops
	
	while (attempts < maxAttempts) {
		const hand = new Array<PieceData | null>(size);
		const colorsToUse = [...availableColors].slice(0, size); // Use first N colors
		
		// Shuffle the colors to use
		for (let i = colorsToUse.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[colorsToUse[i], colorsToUse[j]] = [colorsToUse[j], colorsToUse[i]];
		}
		
		for (let i = 0; i < size; i++) {
			hand[i] = getRandomPiece(colorsToUse[i]);
		}
		
		// If validation is requested and board is provided, check placeable count
		if (minPlaceable > 0 && board) {
			const placeableCount = countPlaceablePieces(board, hand);
			if (placeableCount >= minPlaceable) {
				return hand;
			}
		} else {
			return hand;
		}
		
		attempts++;
	}
	
	// If we couldn't generate a valid hand after max attempts, return the last one
	// This should rarely happen, but prevents infinite loops
	const hand = new Array<PieceData | null>(size);
	const colorsToUse = [...availableColors].slice(0, size);
	for (let i = colorsToUse.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[colorsToUse[i], colorsToUse[j]] = [colorsToUse[j], colorsToUse[i]];
	}
	for (let i = 0; i < size; i++) {
		hand[i] = getRandomPiece(colorsToUse[i]);
	}
	return hand;
}

export function createRandomHandWorklet(size: number, availableColors: Color[], board?: Board, minPlaceable: number = 0): Hand {
	"worklet";
	let attempts = 0;
	const maxAttempts = 100; // Prevent infinite loops
	
	while (attempts < maxAttempts) {
		const hand = new Array<PieceData | null>(size);
		const colorsToUse = [...availableColors].slice(0, size); // Use first N colors
		
		// Simple shuffle for worklet
		for (let i = colorsToUse.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = colorsToUse[i];
			colorsToUse[i] = colorsToUse[j];
			colorsToUse[j] = temp;
		}
		
		for (let i = 0; i < size; i++) {
			hand[i] = getRandomPieceWorklet(colorsToUse[i]);
		}
		
		// If validation is requested and board is provided, check placeable count
		if (minPlaceable > 0 && board) {
			const placeableCount = countPlaceablePieces(board, hand);
			if (placeableCount >= minPlaceable) {
				return hand;
			}
		} else {
			return hand;
		}
		
		attempts++;
	}
	
	// If we couldn't generate a valid hand after max attempts, return the last one
	const hand = new Array<PieceData | null>(size);
	const colorsToUse = [...availableColors].slice(0, size);
	for (let i = colorsToUse.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = colorsToUse[i];
		colorsToUse[i] = colorsToUse[j];
		colorsToUse[j] = temp;
	}
	for (let i = 0; i < size; i++) {
		hand[i] = getRandomPieceWorklet(colorsToUse[i]);
	}
	return hand;
}