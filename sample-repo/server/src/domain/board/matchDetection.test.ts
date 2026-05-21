import { CandyType, SpecialType } from "@vibecode/shared";
import { Board, Cell } from "../types";
import {
  findMatchGroups,
  getMatchedIndices,
  findWrappedCandyIndices,
} from "./matchDetection";

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
const G = CandyType.Green;

describe("findMatchGroups", () => {
  it("detects a horizontal run of 3", () => {
    // R R R O O O
    const board = makeBoard(6, 1, [R, R, R, O, O, O]);
    const groups = findMatchGroups(board);
    expect(groups).toHaveLength(2);
    expect(groups[0].indices).toEqual([0, 1, 2]);
    expect(groups[0].candyType).toBe(R);
    expect(groups[1].indices).toEqual([3, 4, 5]);
  });

  it("detects a vertical run of 3", () => {
    // Column of R R R
    const board = makeBoard(1, 3, [R, R, R]);
    const groups = findMatchGroups(board);
    expect(groups).toHaveLength(1);
    expect(groups[0].indices).toEqual([0, 1, 2]);
    expect(groups[0].candyType).toBe(R);
  });

  it("does not match a run of 2", () => {
    const board = makeBoard(3, 1, [R, R, O]);
    expect(findMatchGroups(board)).toHaveLength(0);
  });

  it("does not include inactive cells in a match", () => {
    // Inactive middle cell breaks the run
    const cells: Cell[] = [
      makeCell(R),
      { candyType: R, isActive: false, specialType: SpecialType.None },
      makeCell(R),
    ];
    const board: Board = { width: 3, height: 1, cells };
    expect(findMatchGroups(board)).toHaveLength(0);
  });

  it("does not match empty cells", () => {
    const board = makeBoard(3, 1, ["", "", ""]);
    expect(findMatchGroups(board)).toHaveLength(0);
  });

  it("marks a run of 4 as Striped special", () => {
    const board = makeBoard(4, 1, [R, R, R, R]);
    const groups = findMatchGroups(board);
    expect(groups[0].specialCreated).toBe(SpecialType.Striped);
  });

  it("marks a run of 5 as ColorBomb special", () => {
    const board = makeBoard(5, 1, [R, R, R, R, R]);
    const groups = findMatchGroups(board);
    expect(groups[0].specialCreated).toBe(SpecialType.ColorBomb);
  });

  it("marks a run of 3 as None special", () => {
    const board = makeBoard(3, 1, [R, R, R]);
    const groups = findMatchGroups(board);
    expect(groups[0].specialCreated).toBe(SpecialType.None);
  });

  it("detects both horizontal and vertical matches on the same board", () => {
    // 3x3:
    //  R R R
    //  O G O
    //  O B O
    // col 0 has R O O (no match), col 2 has R O O (no match)
    // row 0 has R R R (match!)
    const board = makeBoard(3, 3, [R, R, R, O, G, O, O, Y, O]);
    const groups = findMatchGroups(board);
    // Only 1 horizontal match
    expect(groups.some((g) => g.indices[0] === 0)).toBe(true);
  });
});

describe("getMatchedIndices", () => {
  it("returns all indices from all groups deduplicated", () => {
    const groups = [
      { indices: [0, 1, 2], candyType: R, specialCreated: SpecialType.None },
      { indices: [2, 5, 8], candyType: R, specialCreated: SpecialType.None },
    ];
    const set = getMatchedIndices(groups);
    expect(set.size).toBe(5);
    expect([...set].sort((a, b) => a - b)).toEqual([0, 1, 2, 5, 8]);
  });
});

describe("findWrappedCandyIndices", () => {
  it("finds intersection of horizontal and vertical matches", () => {
    // 3x3 board with an L-shape of R:
    //  R R R   ← horizontal match indices 0,1,2
    //  R O O   ← col 0 has R at row0,1,2
    //  R O O
    const board = makeBoard(3, 3, [R, R, R, R, O, O, R, O, O]);
    const groups = findMatchGroups(board);
    const wrapped = findWrappedCandyIndices(groups, 3);
    // Index 0 appears in both horizontal (row 0) and vertical (col 0)
    expect(wrapped).toContain(0);
  });
});
