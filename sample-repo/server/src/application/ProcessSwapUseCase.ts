import { Board, LevelConfig, ProcessSwapResult } from "../domain/types";
import { isValidSwap } from "../domain/swap/swapValidator";
import {
  applySwap,
  applyCascade,
  hasValidMoves,
  shuffleBoard,
} from "../domain/board/boardUtils";

/**
 * Processes a swap request from a player.
 *
 * Validates the swap, applies match/cascade logic, updates move count and score,
 * and checks for level completion or game over.
 *
 * This function is pure — it takes current state as input and returns a result object.
 * The caller (GameRoom) is responsible for writing results back to the schema.
 */
export function processSwap(
  board: Board,
  fromIndex: number,
  toIndex: number,
  currentScore: number,
  movesRemaining: number,
  levelConfig: LevelConfig,
): ProcessSwapResult {
  if (!isValidSwap(board, fromIndex, toIndex)) {
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

  const swappedBoard = applySwap(board, fromIndex, toIndex);

  const { board: cascadedBoard, totalScore } = applyCascade(
    swappedBoard,
    levelConfig.candyTypes,
    levelConfig.pointsPerCandy,
    levelConfig.cascadeMultiplier,
  );

  const newScore = currentScore + totalScore;
  const newMovesRemaining = movesRemaining - 1;

  const levelComplete = newScore >= levelConfig.scoreThreshold;
  const gameOver = !levelComplete && newMovesRemaining <= 0;

  let finalBoard = cascadedBoard;
  let shuffled = false;

  if (!levelComplete && !gameOver && !hasValidMoves(finalBoard)) {
    finalBoard = shuffleBoard(finalBoard, levelConfig.candyTypes);
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
