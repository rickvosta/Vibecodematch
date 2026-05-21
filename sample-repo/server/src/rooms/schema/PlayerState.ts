import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") sessionId: string = "";
  @type("string") displayName: string = "Player";
}
