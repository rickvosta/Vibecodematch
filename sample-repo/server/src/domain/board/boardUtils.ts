import { CandyType, SpecialType } from "@vibecode/shared";
import { Board, Cell } from "../types";
import { findMatchGroups, getMatchedIndices } from "./matchDetection";

/**
 * Creates a deep copy of the board.
 */
export function cloneBoard(board: Board): Board {
  return {
    width: board.width,
    height: board.height,
    cells: board.cells.map((c) => ({ ...c })),
  };
}

/**
 * Generates the initial board for a level.
 * Active cells are filled with random candies ensuring no initial matches exist.
 */
export function generateBoard(
  width: number,
  height: number,
  candyTypes: CandyType[],
  gridShape?: boolean[],
): Board {
  const size = width * height;
  const cells: Cell[] = Array.from({ length: size }, (_, i) => {
    const isActive = gridShape ? gridShape[i] : true;
    return { candyType: "", isActive, specialType: SpecialType.None };
  });

  // Fill active cells while preventing immediate 3-in-a-row matches
  for (let i = 0; i < size; i++) {
    if (!cells[i].isActive) continue;

    const row = Math.floor(i / width);
    const col = i % width;
    const forbidden = new Set<string>();

    // Two same candies to the left would create a horizontal match
    if (col >= 2) {
      const left1 = cells[i - 1];
      const left2 = cells[i - 2];
      if (
        left1.isActive &&
        left2.isActive &&
        left1.candyType !== "" &&
        left1.candyType === left2.candyType
      ) {
        forbidden.add(left1.candyType);
      }
    }

    // Two same candies above would create a vertical match
    if (row >= 2) {
      const up1 = cells[i - width];
      const up2 = cells[i - 2 * width];
      if (
        up1.isActive &&
        up2.isActive &&
        up1.candyType !== "" &&
        up1.candyType === up2.candyType
      ) {
        forbidden.add(up1.candyType);
      }
    }

    const available = candyTypes.filter((t) => !forbidden.has(t));
    const pool = available.length > 0 ? available : candyTypes;
    cells[i] = {
      candyType: pool[Math.floor(Math.random() * pool.length)],
      isActive: true,
      specialType: SpecialType.None,
    };
  }

  const board = { width, height, cells };

  // Ensure at least one valid move exists
  if (!hasValidMoves(board)) {
    return shuffleBoard(board, candyTypes);
  }

  return board;
}

/**
 * Applies gravity: candies fall down within each column.
 * Empty active cells rise to the top.
 */
export function applyGravity(board: Board): Board {
  const cells = board.cells.map((c) => ({ ...c }));
  const { width, height } = board;

  for (let col = 0; col < width; col++) {
    // Collect non-empty active cells top-to-bottom
    const falling: Cell[] = [];
    for (let row = 0; row < height; row++) {
      const idx = row * width + col;
      if (cells[idx].isActive && cells[idx].candyType !== "") {
        falling.push({ ...cells[idx] });
      }
    }

    // Place them back from the bottom up; remaining active cells at top become empty
    let fallingIdx = falling.length - 1;
    for (let row = height - 1; row >= 0; row--) {
      const idx = row * width + col;
      if (cells[idx].isActive) {
        if (fallingIdx >= 0) {
          cells[idx] = falling[fallingIdx--];
        } else {
          cells[idx] = {
            isActive: true,
            candyType: "",
            specialType: SpecialType.None,
          };
        }
      }
    }
  }

  return { ...board, cells };
}

/**
 * Fills every empty active cell with a random candy from the given pool.
 */
export function fillEmptyCells(board: Board, candyTypes: CandyType[]): Board {
  const cells = board.cells.map((c) => {
    if (c.isActive && c.candyType === "") {
      return {
        ...c,
        candyType: candyTypes[Math.floor(Math.random() * candyTypes.length)],
      };
    }
    return { ...c };
  });
  return { ...board, cells };
}

/**
 * Applies a swap between two cell indices (no validation — use swapValidator first).
 */
export function applySwap(
  board: Board,
  fromIndex: number,
  toIndex: number,
): Board {
  const cells = board.cells.map((c) => ({ ...c }));
  const temp = { ...cells[fromIndex] };
  cells[fromIndex] = { ...cells[toIndex] };
  cells[toIndex] = temp;
  return { ...board, cells };
}

/**
 * Applies one full cascade pass: clear all matches, apply gravity, fill.
 * Returns the new board and the score gained.
 * Keeps cascading until no more matches are found.
 */
export function applyCascade(
  board: Board,
  candyTypes: CandyType[],
  pointsPerCandy: number,
  cascadeMultiplier: number,
): { board: Board; totalScore: number } {
  let current = cloneBoard(board);
  let totalScore = 0;
  let cascadeLevel = 0;

  while (true) {
    const groups = findMatchGroups(current);
    if (groups.length === 0) break;

    const matchedIndices = getMatchedIndices(groups);
    const multiplier = Math.pow(cascadeMultiplier, cascadeLevel);
    totalScore += Math.round(matchedIndices.size * pointsPerCandy * multiplier);

    // Clear matched cells
    const cells = current.cells.map((c, i) =>
      matchedIndices.has(i)
        ? { ...c, candyType: "" as const, specialType: SpecialType.None }
        : { ...c },
    );
    current = { ...current, cells };
    current = applyGravity(current);
    current = fillEmptyCells(current, candyTypes);
    cascadeLevel++;
  }

  return { board: current, totalScore };
}

/**
 * Returns true if there is at least one valid swap on the board
 * (a swap that would create a match of 3+).
 */
export function hasValidMoves(board: Board): boolean {
  const { width, height, cells } = board;

  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].isActive || cells[i].candyType === "") continue;

    const col = i % width;
    const row = Math.floor(i / width);

    // Try swapping right
    if (col < width - 1 && cells[i + 1].isActive) {
      if (swapCreatesMatch(board, i, i + 1)) return true;
    }

    // Try swapping down
    if (row < height - 1 && cells[i + width].isActive) {
      if (swapCreatesMatch(board, i, i + width)) return true;
    }
  }

  return false;
}

/**
 * Checks if swapping two cells would result in at least one match.
 */
function swapCreatesMatch(board: Board, a: number, b: number): boolean {
  const testBoard = applySwap(board, a, b);
  return findMatchGroups(testBoard).length > 0;
}

/**
 * Shuffles all active candy values randomly until the board has at least one valid move.
 * Does not change scores or move counts.
 * Invariant: the same multiset of candy types is preserved.
 */
export function shuffleBoard(board: Board, candyTypes: CandyType[]): Board {
  const activeCandies: CandyType[] = board.cells
    .filter((c) => c.isActive && c.candyType !== "")
    .map((c) => c.candyType as CandyType);

  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  while (attempts < MAX_ATTEMPTS) {
    // Fisher-Yates shuffle
    const shuffled = [...activeCandies];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let shuffleIdx = 0;
    const newCells = board.cells.map((c) => {
      if (c.isActive && c.candyType !== "") {
        return { ...c, candyType: shuffled[shuffleIdx++] };
      }
      return { ...c };
    });

    const newBoard = { ...board, cells: newCells };
    if (hasValidMoves(newBoard)) return newBoard;
    attempts++;
  }

  // Fallback for unsatisfiable boards (e.g. tiny grids like 2x2 where 3-match is impossible).
  // Returning the current board avoids recursive regeneration loops.
  return cloneBoard(board);
}
