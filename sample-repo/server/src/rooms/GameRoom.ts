import { Room, Client } from "@colyseus/core";
import { LevelStatus } from "@vibecode/shared";
import {
  MESSAGE_SWAP,
  MESSAGE_SWAP_RESULT,
  SwapMessage,
  SwapResultMessage,
} from "@vibecode/shared";
import { GameState } from "./schema/GameState";
import { CellState } from "./schema/CellState";
import { PlayerState } from "./schema/PlayerState";
import { getLevelConfig } from "../domain/levels/levelConfig";
import { generateBoard } from "../domain/board/boardUtils";
import { processSwap } from "../application/ProcessSwapUseCase";
import { Board } from "../domain/types";

/** Delay in ms between level complete/fail notification and the next state loading. */
const TRANSITION_DELAY_MS = 2500;
const MAX_LEVELS = 20;

export class GameRoom extends Room<GameState> {
  maxClients = 50;

  onCreate(_options: unknown): void {
    this.setState(new GameState());
    this.initLevel(1);
    this.registerMessageHandlers();
  }

  onJoin(client: Client, _options: unknown): void {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.displayName = `Player ${this.state.players.size + 1}`;
    this.state.players.set(client.sessionId, player);
    console.log(
      `${client.sessionId} joined. Players: ${this.state.players.size}`,
    );
  }

  onLeave(client: Client, _consented: boolean): void {
    this.state.players.delete(client.sessionId);
    console.log(
      `${client.sessionId} left. Players: ${this.state.players.size}`,
    );
  }

  onDispose(): void {
    console.log("GameRoom disposing.");
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private registerMessageHandlers(): void {
    this.onMessage(MESSAGE_SWAP, (client: Client, data: unknown) => {
      this.handleSwap(client, data);
    });
  }

  private handleSwap(client: Client, data: unknown): void {
    // Ignore swaps while a level transition is in progress
    if (this.state.levelStatus !== LevelStatus.Playing) return;

    if (!isSwapMessage(data)) {
      const result: SwapResultMessage = {
        success: false,
        reason: "Malformed swap message",
      };
      this.send(client, MESSAGE_SWAP_RESULT, result);
      return;
    }

    const { fromIndex, toIndex } = data;
    const levelConfig = getLevelConfig(this.state.currentLevel);
    const domainBoard = schemaBoardToDomain(this.state.board);

    const swapResult = processSwap(
      domainBoard,
      fromIndex,
      toIndex,
      this.state.score,
      this.state.movesRemaining,
      levelConfig,
    );

    if (!swapResult.valid) {
      const result: SwapResultMessage = {
        success: false,
        reason: swapResult.reason,
      };
      this.send(client, MESSAGE_SWAP_RESULT, result);
      return;
    }

    // Apply board changes to schema
    applyDomainBoardToSchema(swapResult.board, this.state.board);
    this.state.score += swapResult.scoreGained;
    this.state.movesRemaining -= 1;

    this.send(client, MESSAGE_SWAP_RESULT, { success: true });

    if (swapResult.levelComplete) {
      this.state.levelStatus = LevelStatus.Complete;
      this.clock.setTimeout(() => {
        this.advanceOrResetGame(this.state.currentLevel + 1);
      }, TRANSITION_DELAY_MS);
      return;
    }

    if (swapResult.gameOver) {
      this.state.levelStatus = LevelStatus.Failed;
      this.clock.setTimeout(() => {
        this.initLevel(1);
      }, TRANSITION_DELAY_MS);
    }
  }

  private advanceOrResetGame(nextLevel: number): void {
    if (nextLevel > MAX_LEVELS) {
      // All 20 levels completed — reset
      this.initLevel(1);
    } else {
      this.initLevel(nextLevel);
    }
  }

  private initLevel(levelNumber: number): void {
    const config = getLevelConfig(levelNumber);
    const board = generateBoard(
      config.gridWidth,
      config.gridHeight,
      config.candyTypes,
      config.gridShape,
    );

    this.state.currentLevel = levelNumber;
    this.state.score = 0;
    this.state.requiredScore = config.scoreThreshold;
    this.state.movesRemaining = config.moveLimit;
    this.state.levelStatus = LevelStatus.Playing;
    this.state.board.width = board.width;
    this.state.board.height = board.height;

    // Replace all cells in the ArraySchema
    this.state.board.cells.splice(0, this.state.board.cells.length);
    for (const cell of board.cells) {
      const cellState = new CellState();
      cellState.candyType = cell.candyType;
      cellState.isActive = cell.isActive;
      cellState.specialType = cell.specialType;
      this.state.board.cells.push(cellState);
    }
  }
}

// ── Schema ↔ Domain converters ────────────────────────────────────────────────

function schemaBoardToDomain(schemaBoard: GameState["board"]): Board {
  return {
    width: schemaBoard.width,
    height: schemaBoard.height,
    cells: schemaBoard.cells.toArray().map((c) => ({
      candyType: c.candyType as Board["cells"][number]["candyType"],
      isActive: c.isActive,
      specialType: c.specialType as Board["cells"][number]["specialType"],
    })),
  };
}

function applyDomainBoardToSchema(
  domainBoard: Board,
  schemaBoard: GameState["board"],
): void {
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

function isSwapMessage(data: unknown): data is SwapMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).fromIndex === "number" &&
    typeof (data as Record<string, unknown>).toIndex === "number"
  );
}
