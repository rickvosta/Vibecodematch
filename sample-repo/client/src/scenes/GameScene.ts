import Phaser from "phaser";
import type { IGameState, ICellState } from "@vibecode/shared";
import { gameClient } from "../game/GameClient";
import type { Unsubscribe } from "../game/GameClient";
import { CANDY_TYPE_TO_ASSET } from "../constants/AssetKey";
import { SceneKey } from "../constants/SceneKey";

const LEVEL_STATUS_COMPLETE = "complete";
const LEVEL_STATUS_FAILED = "failed";

type CellRenderRef = {
  bg: Phaser.GameObjects.Image;
  candy?: Phaser.GameObjects.Image;
  selection?: Phaser.GameObjects.Image;
};

export class GameScene extends Phaser.Scene {
  private state: IGameState | null = null;
  private selectedIndex: number | null = null;
  private pendingSwap: { from: number; to: number } | null = null;
  private gridLayer!: Phaser.GameObjects.Container;
  private previousBoardCells: ICellState[] | null = null;
  private hudLevel!: Phaser.GameObjects.Text;
  private hudScore!: Phaser.GameObjects.Text;
  private hudRequiredScore!: Phaser.GameObjects.Text;
  private hudMoves!: Phaser.GameObjects.Text;
  private hudPlayers!: Phaser.GameObjects.Text;
  private scoreGainText: Phaser.GameObjects.Text | null = null;
  private lastSyncedScore: number | null = null;
  private lastSyncedLevel: number | null = null;

  private cells: CellRenderRef[] = [];
  private boardOriginX = 0;
  private boardOriginY = 0;
  private cellSize = 48;
  private unsubscribers: Unsubscribe[] = [];

  constructor() {
    super({ key: SceneKey.Game });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x120724);

    this.hudLevel = this.add.text(24, 16, "Level: -", {
      fontSize: "28px",
      color: "#f9c74f",
      fontStyle: "bold",
    });

    this.hudScore = this.add.text(24, 50, "Score: -", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.hudRequiredScore = this.add.text(24, 80, "Next level at: -", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.hudMoves = this.add.text(24, 110, "Moves: -", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.hudPlayers = this.add.text(24, 140, "Players: -", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.gridLayer = this.add.container(0, 0);

    const unsubscribeState = gameClient.onStateChange((state) => {
      this.state = this.toPlainState(state);
      this.syncStateToView();
    });

    const unsubscribeSwapResult = gameClient.onSwapResult((result) => {
      if (!result.success) {
        this.flashInvalidMove(result.reason ?? "Invalid move");
      }
    });

    this.unsubscribers.push(unsubscribeState, unsubscribeSwapResult);

    const initialState = gameClient.getState();
    if (initialState) {
      this.state = this.toPlainState(initialState);
      this.syncStateToView();
    }

    const onResize = () => {
      if (this.state) this.renderBoard(this.state, false);
    };
    this.scale.on("resize", onResize);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const unsubscribe of this.unsubscribers) {
        unsubscribe();
      }
      this.unsubscribers = [];
      this.previousBoardCells = null;
      this.scoreGainText?.destroy();
      this.scoreGainText = null;
      this.lastSyncedScore = null;
      this.lastSyncedLevel = null;
      this.scale.off("resize", onResize);
    });
  }

  private syncStateToView(): void {
    if (!this.state) return;

    if (
      this.lastSyncedLevel !== null &&
      this.lastSyncedScore !== null &&
      this.lastSyncedLevel === this.state.currentLevel
    ) {
      const gained = this.state.score - this.lastSyncedScore;
      if (gained > 0) {
        this.showScoreGain(gained);
      }
    }

    this.lastSyncedScore = this.state.score;
    this.lastSyncedLevel = this.state.currentLevel;

    this.hudLevel.setText(`Level: ${this.state.currentLevel}`);
    this.hudScore.setText(`Score: ${this.state.score}`);
    this.hudRequiredScore.setText(`Next level at: ${this.state.requiredScore}`);
    this.hudMoves.setText(`Moves: ${this.state.movesRemaining}`);
    this.hudPlayers.setText(`Players: ${this.state.players.size}`);

    this.renderBoard(this.state, true);

    if (this.state.levelStatus === LEVEL_STATUS_COMPLETE) {
      this.scene.start(SceneKey.LevelComplete);
      return;
    }

    if (this.state.levelStatus === LEVEL_STATUS_FAILED) {
      this.scene.start(SceneKey.GameOver);
    }
  }

  private renderBoard(state: IGameState, animate: boolean): void {
    const board = state.board;
    const boardCells = this.extractBoardCells(board);
    if (!board || boardCells.length === 0) return;

    const previousCells = this.previousBoardCells;

    const { width: viewportW, height: viewportH } = this.scale;
    const maxBoardWidth = viewportW * 0.82;
    const maxBoardHeight = viewportH * 0.72;

    this.cellSize = Math.floor(
      Math.min(maxBoardWidth / board.width, maxBoardHeight / board.height, 72),
    );

    const boardPixelW = board.width * this.cellSize;
    const boardPixelH = board.height * this.cellSize;

    this.boardOriginX = (viewportW - boardPixelW) / 2;
    this.boardOriginY = (viewportH - boardPixelH) / 2 + 80;

    if (this.cells.length !== boardCells.length) {
      this.rebuildBoardObjects(board.width, board.height, boardCells);
    }

    for (let i = 0; i < boardCells.length; i++) {
      this.updateCellRender(i, board.width, boardCells[i]);
    }

    if (animate && previousCells && previousCells.length === boardCells.length) {
      this.animateBoardTransition(previousCells, boardCells, board.width);
    }

    this.previousBoardCells = boardCells.map((cell) => ({ ...cell }));
  }

  private rebuildBoardObjects(
    boardWidth: number,
    boardHeight: number,
    cellStates: ICellState[],
  ): void {
    this.gridLayer.removeAll(true);
    this.cells = [];
    this.selectedIndex = null;

    for (let index = 0; index < boardWidth * boardHeight; index++) {
      const row = Math.floor(index / boardWidth);
      const col = index % boardWidth;

      const x = this.boardOriginX + col * this.cellSize + this.cellSize / 2;
      const y = this.boardOriginY + row * this.cellSize + this.cellSize / 2;

      const bg = this.add
        .image(x, y, "cell_bg")
        .setDisplaySize(this.cellSize - 2, this.cellSize - 2)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.handleCellClick(index));

      const cellRef: CellRenderRef = { bg };
      this.cells.push(cellRef);
      this.gridLayer.add(bg);

      const cell = cellStates[index];
      if (cell && cell.isActive && cell.candyType) {
        const candy = this.add
          .image(x, y, CANDY_TYPE_TO_ASSET[cell.candyType] ?? "candy_red")
          .setDisplaySize(this.cellSize - 8, this.cellSize - 8);
        cellRef.candy = candy;
        this.gridLayer.add(candy);
      }
    }
  }

  private updateCellRender(
    index: number,
    boardWidth: number,
    cell: ICellState,
  ): void {
    const row = Math.floor(index / boardWidth);
    const col = index % boardWidth;

    const x = this.boardOriginX + col * this.cellSize + this.cellSize / 2;
    const y = this.boardOriginY + row * this.cellSize + this.cellSize / 2;

    const cellRef = this.cells[index];

    cellRef.bg
      .setPosition(x, y)
      .setDisplaySize(this.cellSize - 2, this.cellSize - 2);

    cellRef.candy?.destroy();
    cellRef.candy = undefined;

    if (cell && cell.isActive && cell.candyType) {
      const textureKey = CANDY_TYPE_TO_ASSET[cell.candyType] ?? "candy_red";
      cellRef.candy = this.add
        .image(x, y, textureKey)
        .setDisplaySize(this.cellSize - 8, this.cellSize - 8);
      this.gridLayer.add(cellRef.candy);
    }

    if (this.selectedIndex === index) {
      this.ensureSelectionOverlay(index, x, y);
    } else {
      cellRef.selection?.destroy();
      cellRef.selection = undefined;
    }
  }

  private handleCellClick(index: number): void {
    if (!this.state) return;

    const board = this.state.board;
    const boardCells = this.extractBoardCells(board);
    const currentCell = boardCells[index];
    if (!currentCell?.isActive) return;

    if (this.selectedIndex === null) {
      this.selectedIndex = index;
      this.renderBoard(this.state, false);
      return;
    }

    if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.renderBoard(this.state, false);
      return;
    }

    if (this.areAdjacent(this.selectedIndex, index, board.width)) {
      this.pendingSwap = { from: this.selectedIndex, to: index };
      gameClient.sendSwap(this.selectedIndex, index);
      this.selectedIndex = null;
      this.renderBoard(this.state, false);
      return;
    }

    this.selectedIndex = index;
    this.renderBoard(this.state, false);
  }

  private animateBoardTransition(
    previousCells: ICellState[],
    nextCells: ICellState[],
    boardWidth: number
  ): void {
    const boardHeight = Math.floor(nextCells.length / boardWidth);
    const animatedTargets = new Set<number>();

    this.animatePendingSwap(previousCells, nextCells, boardWidth, animatedTargets);
    this.animateColumnFalls(previousCells, nextCells, boardWidth, boardHeight, animatedTargets);
  }

  private animatePendingSwap(
    previousCells: ICellState[],
    nextCells: ICellState[],
    boardWidth: number,
    animatedTargets: Set<number>
  ): void {
    if (!this.pendingSwap) return;

    const { from, to } = this.pendingSwap;
    this.pendingSwap = null;

    if (!this.areAdjacent(from, to, boardWidth)) return;

    const previousFrom = previousCells[from];
    const previousTo = previousCells[to];
    const nextFrom = nextCells[from];
    const nextTo = nextCells[to];

    if (!previousFrom || !previousTo || !nextFrom || !nextTo) return;
    if (!nextFrom.isActive || !nextTo.isActive) return;
    if (!nextFrom.candyType || !nextTo.candyType) return;

    const looksLikeSwap =
      nextFrom.candyType === previousTo.candyType &&
      nextTo.candyType === previousFrom.candyType;

    if (!looksLikeSwap) return;

    this.animateCandyMove(from, to, nextTo.candyType, boardWidth, 140);
    this.animateCandyMove(to, from, nextFrom.candyType, boardWidth, 140);
    animatedTargets.add(from);
    animatedTargets.add(to);
  }

  private animateColumnFalls(
    previousCells: ICellState[],
    nextCells: ICellState[],
    boardWidth: number,
    boardHeight: number,
    animatedTargets: Set<number>
  ): void {
    for (let col = 0; col < boardWidth; col++) {
      const previousColumn: Array<{ index: number; candyType: string; row: number }> = [];
      const nextColumn: Array<{ index: number; candyType: string; row: number }> = [];

      for (let row = 0; row < boardHeight; row++) {
        const index = row * boardWidth + col;
        const prev = previousCells[index];
        const next = nextCells[index];

        if (prev?.isActive && prev.candyType) {
          previousColumn.push({ index, candyType: prev.candyType, row });
        }

        if (next?.isActive && next.candyType && !animatedTargets.has(index)) {
          nextColumn.push({ index, candyType: next.candyType, row });
        }
      }

      const usedPreviousIndices = new Set<number>();

      // First preserve unchanged candies in-place so they never get animated.
      for (const target of nextColumn) {
        const prevAtSameIndex = previousCells[target.index];
        if (
          prevAtSameIndex?.isActive &&
          prevAtSameIndex.candyType === target.candyType
        ) {
          usedPreviousIndices.add(target.index);
        }
      }

      for (let nextPtr = nextColumn.length - 1; nextPtr >= 0; nextPtr--) {
        const target = nextColumn[nextPtr];

        if (usedPreviousIndices.has(target.index)) {
          continue;
        }

        let sourceIndex = -1;
        let bestSourceRow = -1;
        for (let prevPtr = previousColumn.length - 1; prevPtr >= 0; prevPtr--) {
          const candidate = previousColumn[prevPtr];

          // Existing candies can only stay put or fall downward, never move up.
          if (
            candidate.candyType === target.candyType &&
            candidate.row <= target.row &&
            !usedPreviousIndices.has(candidate.index) &&
            candidate.row > bestSourceRow
          ) {
            sourceIndex = candidate.index;
            bestSourceRow = candidate.row;
          }
        }

        if (sourceIndex === target.index) {
          usedPreviousIndices.add(sourceIndex);
          continue;
        }

        if (sourceIndex >= 0) {
          usedPreviousIndices.add(sourceIndex);
          this.animateCandyMove(sourceIndex, target.index, target.candyType, boardWidth, 180);
          continue;
        }

        // Newly spawned candy enters from above the board in the same column.
        this.animateCandySpawnFromTop(col, target.index, target.candyType, boardWidth, 220);
      }
    }
  }

  private animateCandyMove(
    sourceIndex: number,
    targetIndex: number,
    candyType: string,
    boardWidth: number,
    duration: number
  ): void {
    const targetSprite = this.cells[targetIndex]?.candy;
    if (!targetSprite) return;

    const textureKey = CANDY_TYPE_TO_ASSET[candyType] ?? "candy_red";
    const sourcePos = this.getCellCenter(sourceIndex, boardWidth);
    const targetPos = this.getCellCenter(targetIndex, boardWidth);

    targetSprite.setAlpha(0);

    const ghost = this.add
      .image(sourcePos.x, sourcePos.y, textureKey)
      .setDisplaySize(this.cellSize - 8, this.cellSize - 8)
      .setDepth(5);
    this.gridLayer.add(ghost);

    this.tweens.add({
      targets: ghost,
      x: targetPos.x,
      y: targetPos.y,
      duration,
      ease: "Cubic.Out",
      onComplete: () => {
        ghost.destroy();
        if (targetSprite.active) {
          targetSprite.setAlpha(1);
        }
      },
    });
  }

  private animateCandySpawnFromTop(
    column: number,
    targetIndex: number,
    candyType: string,
    boardWidth: number,
    duration: number
  ): void {
    const targetSprite = this.cells[targetIndex]?.candy;
    if (!targetSprite) return;

    const textureKey = CANDY_TYPE_TO_ASSET[candyType] ?? "candy_red";
    const targetPos = this.getCellCenter(targetIndex, boardWidth);
    const spawnY = this.boardOriginY - this.cellSize;
    const spawnX = this.boardOriginX + column * this.cellSize + this.cellSize / 2;

    targetSprite.setAlpha(0);

    const ghost = this.add
      .image(spawnX, spawnY, textureKey)
      .setDisplaySize(this.cellSize - 8, this.cellSize - 8)
      .setDepth(5);
    this.gridLayer.add(ghost);

    this.tweens.add({
      targets: ghost,
      x: targetPos.x,
      y: targetPos.y,
      duration,
      ease: "Quad.Out",
      onComplete: () => {
        ghost.destroy();
        if (targetSprite.active) {
          targetSprite.setAlpha(1);
        }
      },
    });
  }

  private getCellCenter(index: number, boardWidth: number): { x: number; y: number } {
    const row = Math.floor(index / boardWidth);
    const col = index % boardWidth;

    return {
      x: this.boardOriginX + col * this.cellSize + this.cellSize / 2,
      y: this.boardOriginY + row * this.cellSize + this.cellSize / 2,
    };
  }

  private areAdjacent(a: number, b: number, width: number): boolean {
    const aRow = Math.floor(a / width);
    const aCol = a % width;
    const bRow = Math.floor(b / width);
    const bCol = b % width;

    return Math.abs(aRow - bRow) + Math.abs(aCol - bCol) === 1;
  }

  private ensureSelectionOverlay(index: number, x: number, y: number): void {
    const ref = this.cells[index];
    if (!ref.selection) {
      ref.selection = this.add
        .image(x, y, "cell_selected")
        .setDisplaySize(this.cellSize - 2, this.cellSize - 2);
      this.gridLayer.add(ref.selection);
    } else {
      ref.selection
        .setPosition(x, y)
        .setDisplaySize(this.cellSize - 2, this.cellSize - 2);
    }
  }

  private flashInvalidMove(reason: string): void {
    const { width } = this.scale;
    const text = this.add
      .text(width / 2, 120, reason, {
        fontSize: "20px",
        color: "#ff6b6b",
        backgroundColor: "#2b0f0f",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1300,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  private showScoreGain(gained: number): void {
    const { width } = this.scale;

    this.scoreGainText?.destroy();
    this.scoreGainText = this.add
      .text(width / 2, 32, `+${gained}`, {
        fontSize: "36px",
        fontStyle: "bold",
        color: "#7CFC8A",
        stroke: "#103018",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: this.scoreGainText,
      y: 12,
      alpha: 0,
      duration: 900,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.scoreGainText?.destroy();
        this.scoreGainText = null;
      },
    });
  }

  private toPlainState(state: IGameState): IGameState {
    const stateRecord = state as unknown as Record<string, unknown>;
    const boardRecord = (stateRecord.board ?? {}) as Record<string, unknown>;
    const players = this.toPlainPlayers(stateRecord.players);

    return {
      currentLevel: Number(stateRecord.currentLevel ?? 1),
      score: Number(stateRecord.score ?? 0),
      requiredScore: Number(stateRecord.requiredScore ?? 0),
      movesRemaining: Number(stateRecord.movesRemaining ?? 0),
      levelStatus: String(stateRecord.levelStatus ?? "playing"),
      board: {
        width: Number(boardRecord.width ?? 0),
        height: Number(boardRecord.height ?? 0),
        cells: this.extractBoardCells(boardRecord),
      },
      players,
    };
  }

  private toPlainPlayers(players: unknown): Map<string, { sessionId: string; displayName: string }> {
    const plainPlayers = new Map<string, { sessionId: string; displayName: string }>();

    const addPlayer = (key: string, value: unknown): void => {
      if (!value || typeof value !== "object") {
        return;
      }

      const playerRecord = value as Record<string, unknown>;
      const sessionId = String(playerRecord.sessionId ?? key);
      const displayName = String(playerRecord.displayName ?? "Player");
      plainPlayers.set(key, { sessionId, displayName });
    };

    if (players instanceof Map) {
      players.forEach((value, key) => addPlayer(String(key), value));
      return plainPlayers;
    }

    if (
      players &&
      typeof players === "object" &&
      "forEach" in (players as Record<string, unknown>) &&
      typeof (players as { forEach: unknown }).forEach === "function"
    ) {
      (players as {
        forEach: (cb: (value: unknown, key: string) => void) => void;
      }).forEach((value, key) => addPlayer(String(key), value));
      return plainPlayers;
    }

    if (players && typeof players === "object") {
      Object.entries(players as Record<string, unknown>).forEach(([key, value]) => {
        addPlayer(key, value);
      });
    }

    return plainPlayers;
  }

  private extractBoardCells(board: unknown): ICellState[] {
    if (!board || typeof board !== "object") {
      return [];
    }

    const boardRecord = board as Record<string, unknown>;
    const rawCells = boardRecord.cells as unknown;

    if (Array.isArray(rawCells)) {
      return rawCells as ICellState[];
    }

    if (
      rawCells &&
      typeof rawCells === "object" &&
      "toArray" in (rawCells as Record<string, unknown>) &&
      typeof (rawCells as { toArray: () => unknown[] }).toArray === "function"
    ) {
      return (rawCells as { toArray: () => ICellState[] }).toArray();
    }

    return [];
  }
}
