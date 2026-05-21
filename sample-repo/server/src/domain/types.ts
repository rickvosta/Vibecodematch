import { CandyType, SpecialType } from "@vibecode/shared";

export interface Cell {
  /** Candy type, or empty string when the cell has been cleared and not yet refilled. */
  candyType: CandyType | "";
  isActive: boolean;
  specialType: SpecialType;
}

export interface Board {
  width: number;
  height: number;
  cells: Cell[];
}

export interface LevelConfig {
  levelNumber: number;
  gridWidth: number;
  gridHeight: number;
  /** Optional activity mask (length = gridWidth * gridHeight). true = active cell. */
  gridShape?: boolean[];
  scoreThreshold: number;
  moveLimit: number;
  candyTypes: CandyType[];
  pointsPerCandy: number;
  /** Multiplier applied per cascade level (1.0 = no multiplier). */
  cascadeMultiplier: number;
}

export interface MatchGroup {
  indices: number[];
  candyType: CandyType;
  specialCreated: SpecialType;
}

export interface ProcessSwapResult {
  valid: boolean;
  reason?: string;
  board: Board;
  scoreGained: number;
  levelComplete: boolean;
  gameOver: boolean;
  shuffled: boolean;
}
