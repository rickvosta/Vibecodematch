import { Schema, type } from "@colyseus/schema";

export class CellState extends Schema {
  @type("string") candyType: string = "";
  @type("boolean") isActive: boolean = true;
  @type("string") specialType: string = "none";
}
