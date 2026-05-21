import { CandyType, SpecialType } from "@vibecode/shared";
import { Board, Cell } from "../types";
import { isAdjacent, isValidSwap } from "./swapValidator";

function makeCell(candyType: CandyType | "", isActive = true): Cell {
  return { candyType, isActive, specialType: SpecialType.None };
}

function makeBoard(
  width: number,
  height: number,
  types: (CandyType | "")[],
): Board {
  return { width, height, cells: types.map((t) => makeCell(t)) };
}

const R = CandyType.Red;
const O = CandyType.Orange;
const Y = CandyType.Yellow;

describe("isAdjacent", () => {
  it("returns true for horizontal neighbors", () => {
    expect(isAdjacent(0, 1, 5)).toBe(true);
    expect(isAdjacent(3, 4, 5)).toBe(true);
  });

  it("returns true for vertical neighbors", () => {
    expect(isAdjacent(0, 5, 5)).toBe(true);
    expect(isAdjacent(5, 10, 5)).toBe(true);
  });

  it("returns false for diagonal neighbors", () => {
    expect(isAdjacent(0, 6, 5)).toBe(false);
    expect(isAdjacent(4, 5, 5)).toBe(false); // wraps row
  });

  it("returns false for non-neighbors", () => {
    expect(isAdjacent(0, 2, 5)).toBe(false);
    expect(isAdjacent(0, 10, 5)).toBe(false);
  });
});

describe("isValidSwap", () => {
  it("accepts a valid swap that creates a horizontal match", () => {
    // R O R R  — swapping index 1 (O) and index 0 (R) gives O R R R? No.
    // Let's use: R R O R — swapping 2(O) and 3(R) → R R R O ← match!
    const board = makeBoard(4, 1, [R, R, O, R]);
    expect(isValidSwap(board, 2, 3)).toBe(true);
  });

  it("rejects a swap that creates no match", () => {
    const board = makeBoard(3, 1, [R, O, Y]);
    expect(isValidSwap(board, 0, 1)).toBe(false);
  });

  it("rejects a swap between non-adjacent cells", () => {
    const board = makeBoard(4, 1, [R, R, R, O]);
    expect(isValidSwap(board, 0, 2)).toBe(false);
  });

  it("rejects a swap involving an inactive cell", () => {
    const cells: Cell[] = [
      makeCell(R),
      { candyType: O, isActive: false, specialType: SpecialType.None },
      makeCell(R),
    ];
    const board: Board = { width: 3, height: 1, cells };
    expect(isValidSwap(board, 0, 1)).toBe(false);
  });

  it("rejects an out-of-bounds index", () => {
    const board = makeBoard(3, 1, [R, O, Y]);
    expect(isValidSwap(board, -1, 0)).toBe(false);
    expect(isValidSwap(board, 0, 3)).toBe(false);
  });

  it("accepts a valid vertical swap", () => {
    // 1x4 column: R R O R — swapping index 2(O) and 3(R) → vertical match R R R O
    const board = makeBoard(1, 4, [R, R, O, R]);
    expect(isValidSwap(board, 2, 3)).toBe(true);
  });
});
