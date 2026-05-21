"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSwap = processSwap;
const swapValidator_1 = require("../domain/swap/swapValidator");
const boardUtils_1 = require("../domain/board/boardUtils");
/**
 * Processes a swap request from a player.
 *
 * Validates the swap, applies match/cascade logic, updates move count and score,
 * and checks for level completion or game over.
 *
 * This function is pure — it takes current state as input and returns a result object.
 * The caller (GameRoom) is responsible for writing results back to the schema.
 */
function processSwap(board, fromIndex, toIndex, currentScore, movesRemaining, levelConfig) {
    if (!(0, swapValidator_1.isValidSwap)(board, fromIndex, toIndex)) {
        return {
            valid: false,
            reason: "Invalid swap: not adjacent, not active, or creates no match",
            board,
            scoreGained: 0,
            levelComplete: false,
            gameOver: false,
            shuffled: false,
        };
    }
    const swappedBoard = (0, boardUtils_1.applySwap)(board, fromIndex, toIndex);
    const { board: cascadedBoard, totalScore } = (0, boardUtils_1.applyCascade)(swappedBoard, levelConfig.candyTypes, levelConfig.pointsPerCandy, levelConfig.cascadeMultiplier);
    const newScore = currentScore + totalScore;
    const newMovesRemaining = movesRemaining - 1;
    const levelComplete = newScore >= levelConfig.scoreThreshold;
    const gameOver = !levelComplete && newMovesRemaining <= 0;
    let finalBoard = cascadedBoard;
    let shuffled = false;
    if (!levelComplete && !gameOver && !(0, boardUtils_1.hasValidMoves)(finalBoard)) {
        finalBoard = (0, boardUtils_1.shuffleBoard)(finalBoard, levelConfig.candyTypes);
        shuffled = true;
    }
    return {
        valid: true,
        board: finalBoard,
        scoreGained: totalScore,
        levelComplete,
        gameOver,
        shuffled,
    };
}
