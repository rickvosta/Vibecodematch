import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import cors from "cors";
import http from "http";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT ?? 2567);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("GameRoom", GameRoom, { maxClients: 50 });

httpServer.listen(port, () => {
  console.log(`Vibecode Match server running on port ${port}`);
});
