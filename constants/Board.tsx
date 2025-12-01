import { Color } from "./Color";
import { getRandomPieceColor, PieceData } from "./Piece";

export const GRID_BLOCK_SIZE = 46;
export const HAND_BLOCK_SIZE = 22;
export const HITBOX_SIZE = 36; // Increased from 12 to make dropping easier
export const DRAG_JUMP_LENGTH = 116;

export interface XYPoint {
  x: number;
  y: number;
}

export enum BoardBlockType {
  EMPTY,
  HOVERED,
  HOVERED_BREAK_FILLED,
  HOVERED_BREAK_EMPTY,
  FILLED,
}

export interface BoardBlock {
  blockType: BoardBlockType;
  color: Color;
  hoveredBreakColor: Color;
}

export type Board = BoardBlock[][];

export function newEmptyBoard(boardLength: number): Board {
  return new Array(boardLength).fill(null).map(() => {
    return new Array(boardLength).fill(null).map(() => {
      return {
        blockType: BoardBlockType.EMPTY,
        color: getRandomPieceColor(), // used in the load up animation where blocks show on the grid
        hoveredBreakColor: { r: 0, g: 0, b: 0 },
      };
    });
  });
}

export type PossibleBoardSpots = number[][];

export function emptyPossibleBoardSpots(
  boardLength: number,
): PossibleBoardSpots {
  "worklet";
  return new Array(boardLength).fill(null).map(() => {
    return new Array(boardLength).fill(null).map(() => {
      return 0;
    });
  });
}

export function JS_emptyPossibleBoardSpots(
  boardLength: number,
): PossibleBoardSpots {
  return new Array(boardLength).fill(null).map(() => {
    return new Array(boardLength).fill(null).map(() => {
      return 0;
    });
  });
}
export function createPossibleBoardSpots(
  board: Board,
  piece: PieceData | null,
): PossibleBoardSpots {
  "worklet";
  const boardLength = board.length;
  if (piece == null) {
    return [];
  }
  const pieceHeight = piece.matrix.length;
  const pieceWidth = piece.matrix[0].length;
  const fitPositions: PossibleBoardSpots = emptyPossibleBoardSpots(boardLength);

  for (let boardY = 0; boardY <= boardLength - pieceHeight; boardY++) {
    for (let boardX = 0; boardX <= boardLength - pieceWidth; boardX++) {
      let canFit = true;

      for (let pieceY = 0; pieceY < pieceHeight; pieceY++) {
        for (let pieceX = 0; pieceX < pieceWidth; pieceX++) {
          if (
            piece.matrix[pieceY][pieceX] === 1 &&
            board[boardY + pieceY][boardX + pieceX].blockType ==
              BoardBlockType.FILLED
          ) {
            canFit = false;
            break;
          }
        }
        if (!canFit) break;
      }

      if (canFit) {
        fitPositions[boardY][boardX] = 1;
      }
    }
  }

  return fitPositions;
}

export function canAnyPieceBePlaced(board: Board, hand: (PieceData | null)[]): boolean {
  "worklet";
  for (let i = 0; i < hand.length; i++) {
    const piece = hand[i];
    if (piece == null) continue;
    
    const possibleSpots = createPossibleBoardSpots(board, piece);
    // Check if there's any valid spot
    for (let y = 0; y < possibleSpots.length; y++) {
      for (let x = 0; x < possibleSpots[y].length; x++) {
        if (possibleSpots[y][x] == 1) {
          return true; // At least one piece can be placed
        }
      }
    }
  }
  return false; // No pieces can be placed
}

// Count how many pieces in the hand can be placed
export function countPlaceablePieces(board: Board, hand: (PieceData | null)[]): number {
  "worklet";
  let count = 0;
  for (let i = 0; i < hand.length; i++) {
    const piece = hand[i];
    if (piece == null) continue;
    
    const possibleSpots = createPossibleBoardSpots(board, piece);
    // Check if there's any valid spot
    let canPlace = false;
    for (let y = 0; y < possibleSpots.length; y++) {
      for (let x = 0; x < possibleSpots[y].length; x++) {
        if (possibleSpots[y][x] == 1) {
          canPlace = true;
          break;
        }
      }
      if (canPlace) break;
    }
    if (canPlace) count++;
  }
  return count;
}

export function clearHoverBlocks(board: Board): Board {
  "worklet";
  const boardLength = board.length;
  for (let y = 0; y < boardLength; y++) {
    for (let x = 0; x < boardLength; x++) {
      const blockType = board[y][x].blockType;
      if (
        blockType == BoardBlockType.HOVERED ||
        blockType == BoardBlockType.HOVERED_BREAK_EMPTY
      ) {
        board[y][x].blockType = BoardBlockType.EMPTY;
      } else if (blockType == BoardBlockType.HOVERED_BREAK_FILLED) {
        board[y][x].blockType = BoardBlockType.FILLED;
      }
    }
  }
  return board;
}

export function placePieceOntoBoard(
  board: Board,
  piece: PieceData,
  dropX: number,
  dropY: number,
  blockType: BoardBlockType,
) {
  "worklet";
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[0].length; x++) {
      if (piece.matrix[y][x] == 1) {
        board[dropY + y][dropX + x].blockType = blockType;
        board[dropY + y][dropX + x].color = piece.color;
      }
    }
  }
}

export function updateHoveredBreaks(
  board: Board,
  piece: PieceData,
  dropX: number,
  dropY: number,
) {
  "worklet";
  const boardLength = board.length;
  const tempBoard = [...board];
  placePieceOntoBoard(tempBoard, piece, dropX, dropY, BoardBlockType.HOVERED);

  const rowsToClear = new Set<number>();
  const colsToClear = new Set<number>();

  for (let row = 0; row < boardLength; row++) {
    if (
      tempBoard[row].every(
        (cell) =>
          cell.blockType == BoardBlockType.FILLED ||
          cell.blockType == BoardBlockType.HOVERED,
      )
    ) {
      rowsToClear.add(row);
    }
  }

  for (let col = 0; col < boardLength; col++) {
    if (
      tempBoard.every(
        (row) =>
          row[col].blockType == BoardBlockType.FILLED ||
          row[col].blockType == BoardBlockType.HOVERED,
      )
    ) {
      colsToClear.add(col);
    }
  }

  const count = rowsToClear.size + colsToClear.size;

  if (count > 0) {
    rowsToClear.forEach((row) => {
      for (let col = 0; col < boardLength; col++) {
        if (board[row][col].blockType == BoardBlockType.FILLED) {
          board[row][col].blockType = BoardBlockType.HOVERED_BREAK_FILLED;
          board[row][col].hoveredBreakColor = piece.color;
        } else {
          board[row][col].blockType = BoardBlockType.HOVERED_BREAK_EMPTY;
        }
      }
    });

    colsToClear.forEach((col) => {
      for (let row = 0; row < boardLength; row++) {
        if (board[row][col].blockType == BoardBlockType.FILLED) {
          board[row][col].blockType = BoardBlockType.HOVERED_BREAK_FILLED;
          board[row][col].hoveredBreakColor = piece.color;
        } else {
          board[row][col].blockType = BoardBlockType.HOVERED_BREAK_EMPTY;
        }
      }
    });
  }
}

// Check if two colors match (with small tolerance for floating point)
function colorsMatch(color1: Color, color2: Color): boolean {
  "worklet";
  return (
    Math.abs(color1.r - color2.r) < 1 &&
    Math.abs(color1.g - color2.g) < 1 &&
    Math.abs(color1.b - color2.b) < 1
  );
}

// Find all connected blocks of the same color using flood-fill
function findColorGroup(
  board: Board,
  startX: number,
  startY: number,
  targetColor: Color,
  visited: boolean[][],
  boardLength: number
): { x: number; y: number }[] {
  "worklet";
  const group: { x: number; y: number }[] = [];
  const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    
    // Check bounds
    if (x < 0 || x >= boardLength || y < 0 || y >= boardLength) continue;
    if (visited[y][x]) continue;
    
    const block = board[y][x];
    // Must be filled and match the target color
    if (block.blockType !== BoardBlockType.FILLED) continue;
    if (!colorsMatch(block.color, targetColor)) continue;

    visited[y][x] = true;
    group.push({ x, y });

    // Check all 4 adjacent neighbors
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  return group;
}

// Break color matches - removes groups of 3+ same-colored blocks
// Only checks groups that include the newly placed piece blocks
export function breakColorMatches(board: Board, placedBlocks?: { x: number; y: number }[]): number {
  "worklet";
  const boardLength = board.length;
  const visited: boolean[][] = [];
  const groupsToRemove: { x: number; y: number }[][] = [];
  const blocksToCheck = new Set<string>();

  // Initialize visited array
  for (let y = 0; y < boardLength; y++) {
    visited[y] = [];
    for (let x = 0; x < boardLength; x++) {
      visited[y][x] = false;
    }
  }

  // If we have placed blocks, only check groups that include them
  // Otherwise, check all blocks (for initial board state)
  if (placedBlocks && placedBlocks.length > 0) {
    // Only check color groups that include the newly placed blocks
    placedBlocks.forEach(({ x, y }) => {
      if (x < 0 || x >= boardLength || y < 0 || y >= boardLength) return;
      const block = board[y][x];
      if (block.blockType !== BoardBlockType.FILLED) return;
      
      // Check this block and its neighbors for color matches
      const positionsToCheck = [
        { x, y },
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      ];
      
      positionsToCheck.forEach(({ x: checkX, y: checkY }) => {
        if (checkX < 0 || checkX >= boardLength || checkY < 0 || checkY >= boardLength) return;
        blocksToCheck.add(`${checkX},${checkY}`);
      });
    });
  }

  // Find all color groups (either from placed blocks or entire board)
  const placedBlocksSet = new Set<string>();
  if (placedBlocks && placedBlocks.length > 0) {
    placedBlocks.forEach(({ x, y }) => {
      placedBlocksSet.add(`${x},${y}`);
    });
  }

  for (let y = 0; y < boardLength; y++) {
    for (let x = 0; x < boardLength; x++) {
      if (visited[y][x]) continue;
      const block = board[y][x];
      if (block.blockType !== BoardBlockType.FILLED) continue;
      
      // If we're only checking placed blocks, skip if this block isn't in our check set
      if (placedBlocks && placedBlocks.length > 0) {
        if (!blocksToCheck.has(`${x},${y}`)) continue;
      }

      const group = findColorGroup(board, x, y, block.color, visited, boardLength);
      // Only remove groups of 3 or more
      // AND only if the group contains at least one of the newly placed blocks
      if (group.length >= 3) {
        // If we have placed blocks, ensure this group contains at least one of them
        if (placedBlocks && placedBlocks.length > 0) {
          const containsPlacedBlock = group.some(({ x: gx, y: gy }) => 
            placedBlocksSet.has(`${gx},${gy}`)
          );
          if (containsPlacedBlock) {
            // Only remove if the group contains BOTH placed blocks AND existing blocks
            // This prevents a newly placed piece from disappearing unless it connects to existing blocks
            const placedBlocksInGroup = group.filter(({ x: gx, y: gy }) => 
              placedBlocksSet.has(`${gx},${gy}`)
            );
            const existingBlocksInGroup = group.length - placedBlocksInGroup.length;
            
            // Only remove if there are existing blocks in the group (the placed piece connected to something)
            // This ensures newly placed pieces don't disappear unless they connect to existing blocks
            if (existingBlocksInGroup > 0) {
              groupsToRemove.push(group);
            }
          }
        } else {
          // No placed blocks specified, so check all groups (shouldn't happen in normal gameplay)
          groupsToRemove.push(group);
        }
      }
    }
  }

  // Remove all groups
  let totalBlocksRemoved = 0;
  groupsToRemove.forEach((group) => {
    group.forEach(({ x, y }) => {
      board[y][x].blockType = BoardBlockType.EMPTY;
      totalBlocksRemoved++;
    });
  });

  return totalBlocksRemoved;
}

export function breakLines(board: Board): number {
  "worklet";
  const boardLength = board.length;
  const rowsToClear = new Set<number>();
  const colsToClear = new Set<number>();

  for (let row = 0; row < boardLength; row++) {
    if (board[row].every((cell) => cell.blockType == BoardBlockType.FILLED)) {
      rowsToClear.add(row);
    }
  }

  for (let col = 0; col < boardLength; col++) {
    if (board.every((row) => row[col].blockType == BoardBlockType.FILLED)) {
      colsToClear.add(col);
    }
  }

  const count = rowsToClear.size + colsToClear.size;

  if (count > 0) {
    rowsToClear.forEach((row) => {
      for (let col = 0; col < boardLength; col++) {
        board[row][col].blockType = BoardBlockType.EMPTY;
      }
    });

    colsToClear.forEach((col) => {
      for (let row = 0; row < boardLength; row++) {
        board[row][col].blockType = BoardBlockType.EMPTY;
      }
    });
  }

  return count;
}

export function forEachBoardBlock(board: Board, each: ((block: BoardBlock, x: number, y: number) => boolean) | ((block: BoardBlock, x: number, y: number) => void)) {
  const length = board.length;
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < length; x++) {
      each(board[y][x], x, y);
    }
  }
}