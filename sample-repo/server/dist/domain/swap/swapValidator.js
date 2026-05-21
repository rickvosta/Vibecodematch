"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdjacent = isAdjacent;
exports.isValidSwap = isValidSwap;
const boardUtils_1 = require("../board/boardUtils");
const matchDetection_1 = require("../board/matchDetection");
/**
 * Returns true if the two indices are horizontally or vertically adjacent.
 */
function isAdjacent(fromIndex, toIndex, boardWidth) {
    const fromRow = Math.floor(fromIndex / boardWidth);
    const toRow = Math.floor(toIndex / boardWidth);
    const fromCol = fromIndex % boardWidth;
    const toCol = toIndex % boardWidth;
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}
/**
 * Returns true if the swap at the given indices is legal:
 *  1. Both indices are in bounds.
 *  2. Both cells are active.
 *  3. The cells are adjacent.
 *  4. The swap would result in at least one match.
 */
function isValidSwap(board, fromIndex, toIndex) {
    const size = board.cells.length;
    if (fromIndex < 0 || fromIndex >= size || toIndex < 0 || toIndex >= size)
        return false;
    if (!board.cells[fromIndex].isActive || !board.cells[toIndex].isActive)
        return false;
    if (!isAdjacent(fromIndex, toIndex, board.width))
        return false;
    const testBoard = (0, boardUtils_1.applySwap)(board, fromIndex, toIndex);
    return (0, matchDetection_1.findMatchGroups)(testBoard).length > 0;
}
