import { Schema, type, MapSchema } from "@colyseus/schema";
import { BoardState } from "./BoardState";
import { PlayerState } from "./PlayerState";
import { LevelStatus } from "@vibecode/shared";

export class GameState extends Schema {
  @type("number") currentLevel: number = 1;
  @type("number") score: number = 0;
  @type("number") movesRemaining: number = 0;
  @type("string") levelStatus: string = LevelStatus.Playing;
  @type(BoardState) board = new BoardState();
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
