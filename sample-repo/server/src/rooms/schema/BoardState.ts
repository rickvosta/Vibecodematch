import { Schema, type, ArraySchema } from "@colyseus/schema";
import { CellState } from "./CellState";

export class BoardState extends Schema {
  @type("number") width: number = 0;
  @type("number") height: number = 0;
  @type([CellState]) cells = new ArraySchema<CellState>();
}
