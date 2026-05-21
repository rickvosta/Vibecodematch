import { ColyseusTestServer, boot } from "@colyseus/testing";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import http from "http";
import { LevelStatus } from "@vibecode/shared";
import { MESSAGE_SWAP } from "@vibecode/shared";
import { GameRoom } from "./GameRoom";

/**
 * Minimal app config for the test server.
 * @colyseus/testing requires a room definition map.
 */
async function createTestServer(): Promise<ColyseusTestServer> {
  const httpServer = http.createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });
  gameServer.define("GameRoom", GameRoom);
  return boot(gameServer);
}

describe("GameRoom", () => {
  let colyseus: ColyseusTestServer;

  beforeAll(async () => {
    colyseus = await createTestServer();
  });

  afterAll(async () => {
    await colyseus.shutdown();
  });

  afterEach(async () => {
    await colyseus.cleanup();
  });

  // ── Join behaviour ──────────────────────────────────────────────────────────

  it("starts at level 1 when the first player joins", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    expect(client1.state.currentLevel).toBe(1);
    expect(client1.state.levelStatus).toBe(LevelStatus.Playing);
    expect(client1.state.score).toBe(0);
    expect(client1.state.movesRemaining).toBeGreaterThan(0);

    client1.leave();
  });

  it("adds the player to the players map on join", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    expect(client1.state.players.size).toBe(1);

    client1.leave();
  });

  it("increments player count when a second player joins", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    expect(client1.state.players.size).toBe(2);

    client1.leave();
    client2.leave();
  });

  // ── Leave behaviour ─────────────────────────────────────────────────────────

  it("removes the player from players map on leave", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    client1.leave();
    await room.waitForNextPatch();

    expect(client2.state.players.size).toBe(1);

    client2.leave();
  });

  // ── Swap message handling ───────────────────────────────────────────────────

  it("rejects a malformed swap message", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    let response: { success: boolean; reason?: string } | undefined;
    client1.onMessage("swapResult", (data) => {
      response = data as { success: boolean; reason?: string };
    });

    client1.send(MESSAGE_SWAP, { bad: "data" });
    await new Promise((r) => setTimeout(r, 100));

    expect(response?.success).toBe(false);

    client1.leave();
  });

  it("syncs board dimensions with level 1 config", async () => {
    const room = await colyseus.createRoom("GameRoom");
    const client1 = await colyseus.connectTo(room);
    await room.waitForNextPatch();

    // Level 1 is 6x6
    expect(client1.state.board.width).toBe(6);
    expect(client1.state.board.height).toBe(6);
    expect(client1.state.board.cells.length).toBe(36);

    client1.leave();
  });
});
