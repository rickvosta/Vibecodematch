"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@vibecode/shared");
const matchDetection_1 = require("./matchDetection");
function makeCell(candyType, isActive = true) {
    return { candyType, isActive, specialType: shared_1.SpecialType.None };
}
function makeBoard(width, height, types) {
    return { width, height, cells: types.map((t) => makeCell(t)) };
}
const R = shared_1.CandyType.Red;
const O = shared_1.CandyType.Orange;
const Y = shared_1.CandyType.Yellow;
const G = shared_1.CandyType.Green;
describe("findMatchGroups", () => {
    it("detects a horizontal run of 3", () => {
        // R R R O O O
        const board = makeBoard(6, 1, [R, R, R, O, O, O]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups).toHaveLength(2);
        expect(groups[0].indices).toEqual([0, 1, 2]);
        expect(groups[0].candyType).toBe(R);
        expect(groups[1].indices).toEqual([3, 4, 5]);
    });
    it("detects a vertical run of 3", () => {
        // Column of R R R
        const board = makeBoard(1, 3, [R, R, R]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups).toHaveLength(1);
        expect(groups[0].indices).toEqual([0, 1, 2]);
        expect(groups[0].candyType).toBe(R);
    });
    it("does not match a run of 2", () => {
        const board = makeBoard(3, 1, [R, R, O]);
        expect((0, matchDetection_1.findMatchGroups)(board)).toHaveLength(0);
    });
    it("does not include inactive cells in a match", () => {
        // Inactive middle cell breaks the run
        const cells = [
            makeCell(R),
            { candyType: R, isActive: false, specialType: shared_1.SpecialType.None },
            makeCell(R),
        ];
        const board = { width: 3, height: 1, cells };
        expect((0, matchDetection_1.findMatchGroups)(board)).toHaveLength(0);
    });
    it("does not match empty cells", () => {
        const board = makeBoard(3, 1, ["", "", ""]);
        expect((0, matchDetection_1.findMatchGroups)(board)).toHaveLength(0);
    });
    it("marks a run of 4 as Striped special", () => {
        const board = makeBoard(4, 1, [R, R, R, R]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups[0].specialCreated).toBe(shared_1.SpecialType.Striped);
    });
    it("marks a run of 5 as ColorBomb special", () => {
        const board = makeBoard(5, 1, [R, R, R, R, R]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups[0].specialCreated).toBe(shared_1.SpecialType.ColorBomb);
    });
    it("marks a run of 3 as None special", () => {
        const board = makeBoard(3, 1, [R, R, R]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups[0].specialCreated).toBe(shared_1.SpecialType.None);
    });
    it("detects both horizontal and vertical matches on the same board", () => {
        // 3x3:
        //  R R R
        //  O G O
        //  O B O
        // col 0 has R O O (no match), col 2 has R O O (no match)
        // row 0 has R R R (match!)
        const board = makeBoard(3, 3, [R, R, R, O, G, O, O, Y, O]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        // Only 1 horizontal match
        expect(groups.some((g) => g.indices[0] === 0)).toBe(true);
    });
});
describe("getMatchedIndices", () => {
    it("returns all indices from all groups deduplicated", () => {
        const groups = [
            { indices: [0, 1, 2], candyType: R, specialCreated: shared_1.SpecialType.None },
            { indices: [2, 5, 8], candyType: R, specialCreated: shared_1.SpecialType.None },
        ];
        const set = (0, matchDetection_1.getMatchedIndices)(groups);
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
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        const wrapped = (0, matchDetection_1.findWrappedCandyIndices)(groups, 3);
        // Index 0 appears in both horizontal (row 0) and vertical (col 0)
        expect(wrapped).toContain(0);
    });
});
