"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBoardHasValidMoves = ensureBoardHasValidMoves;
const boardUtils_1 = require("../domain/board/boardUtils");
/**
 * Ensures the board has at least one valid move.
 * If not, shuffles it until a valid configuration is found.
 *
 * Called after any state transition where the board may become deadlocked.
 */
function ensureBoardHasValidMoves(board, candyTypes) {
    if ((0, boardUtils_1.hasValidMoves)(board))
        return board;
    return (0, boardUtils_1.shuffleBoard)(board, candyTypes);
}
