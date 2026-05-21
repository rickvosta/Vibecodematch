import { Board } from "../types";
import { applySwap } from "../board/boardUtils";
import { findMatchGroups } from "../board/matchDetection";

/**
 * Returns true if the two indices are horizontally or vertically adjacent.
 */
export function isAdjacent(
  fromIndex: number,
  toIndex: number,
  boardWidth: number,
): boolean {
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
export function isValidSwap(
  board: Board,
  fromIndex: number,
  toIndex: number,
): boolean {
  const size = board.cells.length;
  if (fromIndex < 0 || fromIndex >= size || toIndex < 0 || toIndex >= size)
    return false;
  if (!board.cells[fromIndex].isActive || !board.cells[toIndex].isActive)
    return false;
  if (!isAdjacent(fromIndex, toIndex, board.width)) return false;

  const testBoard = applySwap(board, fromIndex, toIndex);
  return findMatchGroups(testBoard).length > 0;
}
