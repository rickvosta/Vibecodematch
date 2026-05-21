"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const core_1 = require("@colyseus/core");
const shared_1 = require("@vibecode/shared");
const shared_2 = require("@vibecode/shared");
const GameState_1 = require("./schema/GameState");
const CellState_1 = require("./schema/CellState");
const PlayerState_1 = require("./schema/PlayerState");
const levelConfig_1 = require("../domain/levels/levelConfig");
const boardUtils_1 = require("../domain/board/boardUtils");
const ProcessSwapUseCase_1 = require("../application/ProcessSwapUseCase");
/** Delay in ms between level complete/fail notification and the next state loading. */
const TRANSITION_DELAY_MS = 2500;
const MAX_LEVELS = 20;
class GameRoom extends core_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 50;
    }
    onCreate(_options) {
        this.setState(new GameState_1.GameState());
        this.initLevel(1);
        this.registerMessageHandlers();
    }
    onJoin(client, _options) {
        const player = new PlayerState_1.PlayerState();
        player.sessionId = client.sessionId;
        player.displayName = `Player ${this.state.players.size + 1}`;
        this.state.players.set(client.sessionId, player);
        console.log(`${client.sessionId} joined. Players: ${this.state.players.size}`);
    }
    onLeave(client, _consented) {
        this.state.players.delete(client.sessionId);
        console.log(`${client.sessionId} left. Players: ${this.state.players.size}`);
    }
    onDispose() {
        console.log("GameRoom disposing.");
    }
    // ── Private ──────────────────────────────────────────────────────────────
    registerMessageHandlers() {
        this.onMessage(shared_2.MESSAGE_SWAP, (client, data) => {
            this.handleSwap(client, data);
        });
    }
    handleSwap(client, data) {
        // Ignore swaps while a level transition is in progress
        if (this.state.levelStatus !== shared_1.LevelStatus.Playing)
            return;
        if (!isSwapMessage(data)) {
            const result = { success: false, reason: "Malformed swap message" };
            this.send(client, shared_2.MESSAGE_SWAP_RESULT, result);
            return;
        }
        const { fromIndex, toIndex } = data;
        const levelConfig = (0, levelConfig_1.getLevelConfig)(this.state.currentLevel);
        const domainBoard = schemaBoardToDomain(this.state.board);
        const swapResult = (0, ProcessSwapUseCase_1.processSwap)(domainBoard, fromIndex, toIndex, this.state.score, this.state.movesRemaining, levelConfig);
        if (!swapResult.valid) {
            const result = { success: false, reason: swapResult.reason };
            this.send(client, shared_2.MESSAGE_SWAP_RESULT, result);
            return;
        }
        // Apply board changes to schema
        applyDomainBoardToSchema(swapResult.board, this.state.board);
        this.state.score += swapResult.scoreGained;
        this.state.movesRemaining -= 1;
        this.send(client, shared_2.MESSAGE_SWAP_RESULT, { success: true });
        if (swapResult.levelComplete) {
            this.state.levelStatus = shared_1.LevelStatus.Complete;
            this.clock.setTimeout(() => {
                this.advanceOrResetGame(this.state.currentLevel + 1);
            }, TRANSITION_DELAY_MS);
            return;
        }
        if (swapResult.gameOver) {
            this.state.levelStatus = shared_1.LevelStatus.Failed;
            this.clock.setTimeout(() => {
                this.initLevel(1);
            }, TRANSITION_DELAY_MS);
        }
    }
    advanceOrResetGame(nextLevel) {
        if (nextLevel > MAX_LEVELS) {
            // All 20 levels completed — reset
            this.initLevel(1);
        }
        else {
            this.initLevel(nextLevel);
        }
    }
    initLevel(levelNumber) {
        const config = (0, levelConfig_1.getLevelConfig)(levelNumber);
        const board = (0, boardUtils_1.generateBoard)(config.gridWidth, config.gridHeight, config.candyTypes, config.gridShape);
        this.state.currentLevel = levelNumber;
        this.state.score = 0;
        this.state.movesRemaining = config.moveLimit;
        this.state.levelStatus = shared_1.LevelStatus.Playing;
        this.state.board.width = board.width;
        this.state.board.height = board.height;
        // Replace all cells in the ArraySchema
        this.state.board.cells.splice(0, this.state.board.cells.length);
        for (const cell of board.cells) {
            const cellState = new CellState_1.CellState();
            cellState.candyType = cell.candyType;
            cellState.isActive = cell.isActive;
            cellState.specialType = cell.specialType;
            this.state.board.cells.push(cellState);
        }
    }
}
exports.GameRoom = GameRoom;
// ── Schema ↔ Domain converters ────────────────────────────────────────────────
function schemaBoardToDomain(schemaBoard) {
    return {
        width: schemaBoard.width,
        height: schemaBoard.height,
        cells: schemaBoard.cells.toArray().map((c) => ({
            candyType: c.candyType,
            isActive: c.isActive,
            specialType: c.specialType,
        })),
    };
}
function applyDomainBoardToSchema(domainBoard, schemaBoard) {
    domainBoard.cells.forEach((cell, i) => {
        const schemaCell = schemaBoard.cells[i];
        if (!schemaCell) {
            return;
        }
        schemaCell.candyType = cell.candyType;
        schemaCell.isActive = cell.isActive;
        schemaCell.specialType = cell.specialType;
    });
}
// ── Type guard ────────────────────────────────────────────────────────────────
function isSwapMessage(data) {
    return (typeof data === "object" &&
        data !== null &&
        typeof data.fromIndex === "number" &&
        typeof data.toIndex === "number");
}
