"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@colyseus/core");
const ws_transport_1 = require("@colyseus/ws-transport");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const GameRoom_1 = require("./rooms/GameRoom");
const port = Number(process.env.PORT ?? 2567);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
const httpServer = http_1.default.createServer(app);
const gameServer = new core_1.Server({
    transport: new ws_transport_1.WebSocketTransport({ server: httpServer }),
});
gameServer.define("GameRoom", GameRoom_1.GameRoom, { maxClients: 50 });
httpServer.listen(port, () => {
    console.log(`Vibecode Match server running on port ${port}`);
});
