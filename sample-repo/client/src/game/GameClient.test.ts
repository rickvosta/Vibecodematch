import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameClient } from "./GameClient";

// Mock colyseus.js so tests run in Node without a real WebSocket
vi.mock("colyseus.js", () => {
  const onStateChangeCbs: ((s: unknown) => void)[] = [];
  const onMessageCbs: Map<string, ((d: unknown) => void)[]> = new Map();
  const onLeaveCbs: (() => void)[] = [];

  const mockRoom = {
    onStateChange: (cb: (s: unknown) => void) => onStateChangeCbs.push(cb),
    onMessage: (type: string, cb: (d: unknown) => void) => {
      if (!onMessageCbs.has(type)) onMessageCbs.set(type, []);
      onMessageCbs.get(type)!.push(cb);
    },
    onLeave: (cb: () => void) => onLeaveCbs.push(cb),
    send: vi.fn(),
    leave: vi.fn(),
    state: {
      currentLevel: 1,
      score: 0,
      movesRemaining: 20,
      levelStatus: "playing",
    },
    _triggerStateChange: (s: unknown) =>
      onStateChangeCbs.forEach((cb) => cb(s)),
    _triggerMessage: (type: string, d: unknown) =>
      onMessageCbs.get(type)?.forEach((cb) => cb(d)),
    _triggerLeave: () => onLeaveCbs.forEach((cb) => cb()),
  };

  return {
    Client: vi.fn(() => ({
      joinOrCreate: vi.fn(async () => mockRoom),
    })),
    _mockRoom: mockRoom,
  };
});

describe("GameClient", () => {
  let client: GameClient;

  beforeEach(() => {
    client = new GameClient("ws://localhost:2567");
  });

  it("calls onConnected callbacks after joinGame resolves", async () => {
    const connected = vi.fn();
    client.onConnected(connected);
    await client.joinGame();
    expect(connected).toHaveBeenCalledOnce();
  });

  it("calls onStateChange callback when room state changes", async () => {
    await client.joinGame();
    const { _mockRoom } = (await import("colyseus.js")) as unknown as {
      _mockRoom: { _triggerStateChange: (s: unknown) => void };
    };

    const stateChanged = vi.fn();
    client.onStateChange(stateChanged);
    _mockRoom._triggerStateChange({ currentLevel: 2, score: 500 });
    expect(stateChanged).toHaveBeenCalledWith({ currentLevel: 2, score: 500 });
  });

  it("calls onSwapResult callback when a swapResult message arrives", async () => {
    await client.joinGame();
    const { _mockRoom } = (await import("colyseus.js")) as unknown as {
      _mockRoom: { _triggerMessage: (t: string, d: unknown) => void };
    };

    const swapResult = vi.fn();
    client.onSwapResult(swapResult);
    _mockRoom._triggerMessage("swapResult", { success: true });
    expect(swapResult).toHaveBeenCalledWith({ success: true });
  });

  it("calls onDisconnected when room leaves", async () => {
    await client.joinGame();
    const { _mockRoom } = (await import("colyseus.js")) as unknown as {
      _mockRoom: { _triggerLeave: () => void };
    };

    const disconnected = vi.fn();
    client.onDisconnected(disconnected);
    _mockRoom._triggerLeave();
    expect(disconnected).toHaveBeenCalledOnce();
  });

  it("sends a swap message with correct payload", async () => {
    await client.joinGame();
    const { _mockRoom } = (await import("colyseus.js")) as unknown as {
      _mockRoom: { send: ReturnType<typeof vi.fn> };
    };

    client.sendSwap(3, 4);
    expect(_mockRoom.send).toHaveBeenCalledWith("swap", {
      fromIndex: 3,
      toIndex: 4,
    });
  });
});
