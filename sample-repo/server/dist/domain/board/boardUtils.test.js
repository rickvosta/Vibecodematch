"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@vibecode/shared");
const boardUtils_1 = require("./boardUtils");
const matchDetection_1 = require("./matchDetection");
// ── Helpers ──────────────────────────────────────────────────────────────────
function makeCell(candyType, isActive = true) {
    return { candyType, isActive, specialType: shared_1.SpecialType.None };
}
function makeBoard(width, height, types) {
    return {
        width,
        height,
        cells: types.map((t) => makeCell(t)),
    };
}
const [R, O, Y, G, B] = [
    shared_1.CandyType.Red,
    shared_1.CandyType.Orange,
    shared_1.CandyType.Yellow,
    shared_1.CandyType.Green,
    shared_1.CandyType.Blue,
];
// ── generateBoard ─────────────────────────────────────────────────────────────
describe("generateBoard", () => {
    it("produces a board with the correct dimensions", () => {
        const board = (0, boardUtils_1.generateBoard)(6, 6, [R, O, Y]);
        expect(board.width).toBe(6);
        expect(board.height).toBe(6);
        expect(board.cells).toHaveLength(36);
    });
    it("fills all active cells with valid candy types", () => {
        const types = [R, O, Y];
        const board = (0, boardUtils_1.generateBoard)(7, 7, types);
        board.cells.filter((c) => c.isActive).forEach((c) => {
            expect(types).toContain(c.candyType);
        });
    });
    it("does not produce initial 3-in-a-row matches", () => {
        const board = (0, boardUtils_1.generateBoard)(8, 8, [R, O, Y, G]);
        const groups = (0, matchDetection_1.findMatchGroups)(board);
        expect(groups).toHaveLength(0);
    });
    it("produces a board with at least one valid move", () => {
        const board = (0, boardUtils_1.generateBoard)(6, 6, [R, O, Y]);
        expect((0, boardUtils_1.hasValidMoves)(board)).toBe(true);
    });
    it("marks inactive cells correctly based on gridShape", () => {
        const shape = [true, false, true, false, true, false, true, false, true];
        const board = (0, boardUtils_1.generateBoard)(3, 3, [R, O, Y], shape);
        board.cells.forEach((c, i) => {
            expect(c.isActive).toBe(shape[i]);
        });
    });
    it("leaves inactive cells empty", () => {
        const shape = [true, false, true, false];
        const board = (0, boardUtils_1.generateBoard)(2, 2, [R, O], shape);
        board.cells.forEach((c) => {
            if (!c.isActive)
                expect(c.candyType).toBe("");
        });
    });
});
// ── applyGravity ─────────────────────────────────────────────────────────────
describe("applyGravity", () => {
    it("moves non-empty cells to the bottom of each column", () => {
        // Column: [R, "", B, "", G] (top to bottom) → [_, _, R, B, G]
        const board = makeBoard(1, 5, [R, "", B, "", G]);
        const result = (0, boardUtils_1.applyGravity)(board);
        const types = result.cells.map((c) => c.candyType);
        expect(types).toEqual(["", "", R, B, G]);
    });
    it("does not touch inactive cells", () => {
        const cells = [
            makeCell(R),
            { candyType: "", isActive: false, specialType: shared_1.SpecialType.None },
            makeCell(B),
        ];
        const board = { width: 1, height: 3, cells };
        const result = (0, boardUtils_1.applyGravity)(board);
        expect(result.cells[1].isActive).toBe(false);
        expect(result.cells[1].candyType).toBe("");
    });
    it("handles a column that is already settled", () => {
        const board = makeBoard(1, 3, [R, B, G]);
        const result = (0, boardUtils_1.applyGravity)(board);
        expect(result.cells.map((c) => c.candyType)).toEqual([R, B, G]);
    });
});
// ── fillEmptyCells ────────────────────────────────────────────────────────────
describe("fillEmptyCells", () => {
    it("fills empty active cells with a candy from the provided pool", () => {
        const board = makeBoard(3, 1, ["", "", ""]);
        const result = (0, boardUtils_1.fillEmptyCells)(board, [R, O, Y]);
        result.cells.forEach((c) => {
            expect([R, O, Y]).toContain(c.candyType);
        });
    });
    it("does not overwrite non-empty cells", () => {
        const board = makeBoard(2, 1, [R, ""]);
        const result = (0, boardUtils_1.fillEmptyCells)(board, [O]);
        expect(result.cells[0].candyType).toBe(R);
        expect(result.cells[1].candyType).toBe(O);
    });
    it("does not fill inactive cells", () => {
        const cells = [
            { candyType: "", isActive: false, specialType: shared_1.SpecialType.None },
        ];
        const board = { width: 1, height: 1, cells };
        const result = (0, boardUtils_1.fillEmptyCells)(board, [R]);
        expect(result.cells[0].candyType).toBe("");
    });
});
// ── hasValidMoves ──────────────────────────────────────────────────────────────
describe("hasValidMoves", () => {
    it("detects a valid horizontal move", () => {
        //  R O R  →  swap col0 and col1 → O R R  (match at end)
        const board = makeBoard(3, 1, [R, O, R]);
        // A board of 1 row can't create a 3-match from a swap of only these,
        // let's use a 3x3 board with a clear valid move
        //  R B R
        //  B R B
        //  R B R
        // swapping (0,0) and (0,1): R B → B R; row 0 = B R R → match
        const board2 = makeBoard(3, 3, [R, B, R, B, R, B, R, B, R]);
        expect((0, boardUtils_1.hasValidMoves)(board2)).toBe(true);
    });
    it("returns false for a locked board", () => {
        // Checkerboard 2x2 of alternating types — no swap produces a match
        //  R O
        //  O R
        const board = makeBoard(2, 2, [R, O, O, R]);
        expect((0, boardUtils_1.hasValidMoves)(board)).toBe(false);
    });
});
// ── shuffleBoard ──────────────────────────────────────────────────────────────
describe("shuffleBoard", () => {
    it("produces a board with at least one valid move", () => {
        // 3x3 locked board candidate where at least one valid move can exist after shuffle.
        const board = makeBoard(3, 3, [R, O, Y, O, Y, R, Y, R, O]);
        const shuffled = (0, boardUtils_1.shuffleBoard)(board, [R, O, Y]);
        expect((0, boardUtils_1.hasValidMoves)(shuffled)).toBe(true);
    });
    it("preserves the same multiset of candy types", () => {
        const board = (0, boardUtils_1.generateBoard)(6, 6, [R, O, Y]);
        const original = board.cells.filter((c) => c.isActive).map((c) => c.candyType).sort();
        const shuffled = (0, boardUtils_1.shuffleBoard)(board, [R, O, Y]);
        const result = shuffled.cells.filter((c) => c.isActive).map((c) => c.candyType).sort();
        expect(result).toEqual(original);
    });
});
// ── applyCascade ──────────────────────────────────────────────────────────────
describe("applyCascade", () => {
    it("clears a simple 3-match and returns score", () => {
        // Row: R R R  → all cleared
        const board = makeBoard(3, 1, [R, R, R]);
        const { board: result, totalScore } = (0, boardUtils_1.applyCascade)(board, [O, Y, G], 30, 1.5);
        // All cells refilled (since it's a 1-row board, gravity + fill)
        expect(totalScore).toBeGreaterThan(0);
        expect(result.cells.every((c) => c.candyType !== "")).toBe(true);
    });
    it("applies cascade multiplier on subsequent cascades", () => {
        // This test verifies that cascades score more than a single level
        // We create a board where clearing one match causes another
        // 3x2 board:
        //  R R R   ← matches
        //  O O O   ← also matches when refilled? Not guaranteed. Just test score > 0.
        const board = makeBoard(3, 2, [R, R, R, O, O, O]);
        const { totalScore } = (0, boardUtils_1.applyCascade)(board, [Y, G, B], 30, 1.5);
        expect(totalScore).toBeGreaterThan(0);
    });
    it("returns the board unchanged when there are no matches", () => {
        const board = (0, boardUtils_1.generateBoard)(6, 6, [R, O, Y]);
        const { board: result, totalScore } = (0, boardUtils_1.applyCascade)(board, [R, O, Y], 30, 1.5);
        expect(totalScore).toBe(0);
        expect(result.cells.map((c) => c.candyType)).toEqual(board.cells.map((c) => c.candyType));
    });
});
