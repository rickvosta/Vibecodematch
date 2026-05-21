import { CandyType, SpecialType } from "@vibecode/shared";
import { Board, MatchGroup } from "../types";

/**
 * Finds all match groups on the board (horizontal and vertical runs of 3+ same candy type).
 * Each group tracks which special candy it would create, if any.
 */
export function findMatchGroups(board: Board): MatchGroup[] {
  const groups: MatchGroup[] = [];
  const { width, height, cells } = board;

  // Scan each row left-to-right
  for (let row = 0; row < height; row++) {
    let runStart = 0;
    for (let col = 1; col <= width; col++) {
      const prevIdx = row * width + (col - 1);
      const currIdx = row * width + col;
      const prevCell = cells[prevIdx];
      const currCell = col < width ? cells[currIdx] : null;

      const runContinues =
        currCell !== null &&
        currCell.isActive &&
        prevCell.isActive &&
        prevCell.candyType !== "" &&
        currCell.candyType === prevCell.candyType;

      if (!runContinues) {
        const runLength = col - runStart;
        const startCell = cells[row * width + runStart];

        if (
          runLength >= 3 &&
          startCell.isActive &&
          startCell.candyType !== ""
        ) {
          const indices: number[] = [];
          for (let i = runStart; i < col; i++) {
            indices.push(row * width + i);
          }
          groups.push({
            indices,
            candyType: startCell.candyType as CandyType,
            specialCreated: determineSpecialForRun(runLength),
          });
        }
        runStart = col;
      }
    }
  }

  // Scan each column top-to-bottom
  for (let col = 0; col < width; col++) {
    let runStart = 0;
    for (let row = 1; row <= height; row++) {
      const prevIdx = (row - 1) * width + col;
      const currIdx = row * width + col;
      const prevCell = cells[prevIdx];
      const currCell = row < height ? cells[currIdx] : null;

      const runContinues =
        currCell !== null &&
        currCell.isActive &&
        prevCell.isActive &&
        prevCell.candyType !== "" &&
        currCell.candyType === prevCell.candyType;

      if (!runContinues) {
        const runLength = row - runStart;
        const startCell = cells[runStart * width + col];

        if (
          runLength >= 3 &&
          startCell.isActive &&
          startCell.candyType !== ""
        ) {
          const indices: number[] = [];
          for (let i = runStart; i < row; i++) {
            indices.push(i * width + col);
          }
          groups.push({
            indices,
            candyType: startCell.candyType as CandyType,
            specialCreated: determineSpecialForRun(runLength),
          });
        }
        runStart = row;
      }
    }
  }

  return groups;
}

/**
 * Returns the deduplicated set of all cell indices matched across all groups.
 */
export function getMatchedIndices(groups: MatchGroup[]): Set<number> {
  const indices = new Set<number>();
  for (const group of groups) {
    for (const idx of group.indices) {
      indices.add(idx);
    }
  }
  return indices;
}

/**
 * Determines whether a match creates a special candy based on run length.
 * L/T shapes are handled in processSpecialCreation.
 */
function determineSpecialForRun(runLength: number): SpecialType {
  if (runLength >= 5) return SpecialType.ColorBomb;
  if (runLength === 4) return SpecialType.Striped;
  return SpecialType.None;
}

/**
 * Returns indices that appear in both a horizontal and a vertical match group.
 * These intersection cells become wrapped candies (L/T shapes).
 */
export function findWrappedCandyIndices(
  groups: MatchGroup[],
  boardWidth: number,
): number[] {
  const horizontalIndices = new Set<number>();
  const verticalIndices = new Set<number>();

  for (const group of groups) {
    if (group.indices.length < 2) continue;
    // Horizontal: consecutive indices differ by 1
    const isHorizontal = group.indices[1] - group.indices[0] === 1;
    if (isHorizontal) {
      group.indices.forEach((i) => horizontalIndices.add(i));
    } else {
      group.indices.forEach((i) => verticalIndices.add(i));
    }
  }

  return [...horizontalIndices].filter((i) => verticalIndices.has(i));
}
