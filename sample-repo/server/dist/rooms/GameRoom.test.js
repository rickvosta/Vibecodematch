"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@colyseus/testing");
const core_1 = require("@colyseus/core");
const ws_transport_1 = require("@colyseus/ws-transport");
const http_1 = __importDefault(require("http"));
const shared_1 = require("@vibecode/shared");
const shared_2 = require("@vibecode/shared");
const GameRoom_1 = require("./GameRoom");
/**
 * Minimal app config for the test server.
 * @colyseus/testing requires a room definition map.
 */
async function createTestServer() {
    const httpServer = http_1.default.createServer();
    const gameServer = new core_1.Server({
        transport: new ws_transport_1.WebSocketTransport({ server: httpServer }),
    });
    gameServer.define("GameRoom", GameRoom_1.GameRoom);
    return (0, testing_1.boot)(gameServer);
}
describe("GameRoom", () => {
    let colyseus;
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
        expect(client1.state.levelStatus).toBe(shared_1.LevelStatus.Playing);
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
        let response;
        client1.onMessage("swapResult", (data) => {
            response = data;
        });
        client1.send(shared_2.MESSAGE_SWAP, { bad: "data" });
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
