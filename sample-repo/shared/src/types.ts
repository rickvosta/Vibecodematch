export enum CandyType {
  Red = "red",
  Orange = "orange",
  Yellow = "yellow",
  Green = "green",
  Blue = "blue",
  Purple = "purple",
}

export enum SpecialType {
  None = "none",
  Striped = "striped",
  Wrapped = "wrapped",
  ColorBomb = "colorbomb",
}

export enum LevelStatus {
  Playing = "playing",
  Complete = "complete",
  Failed = "failed",
}

/** Client-side mirror of the GameState schema (plain interfaces, no Schema classes). */
export interface IPlayerState {
  sessionId: string;
  displayName: string;
}

export interface ICellState {
  candyType: string;
  isActive: boolean;
  specialType: string;
}

export interface IBoardState {
  width: number;
  height: number;
  cells: ICellState[];
}

export interface IGameState {
  currentLevel: number;
  score: number;
  requiredScore: number;
  movesRemaining: number;
  levelStatus: string;
  board: IBoardState;
  players: Map<string, IPlayerState>;
}
