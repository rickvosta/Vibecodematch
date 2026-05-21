import { Board } from "../domain/types";
import { CandyType } from "@vibecode/shared";
import { hasValidMoves, shuffleBoard } from "../domain/board/boardUtils";

/**
 * Ensures the board has at least one valid move.
 * If not, shuffles it until a valid configuration is found.
 *
 * Called after any state transition where the board may become deadlocked.
 */
export function ensureBoardHasValidMoves(
  board: Board,
  candyTypes: CandyType[],
): Board {
  if (hasValidMoves(board)) return board;
  return shuffleBoard(board, candyTypes);
}
