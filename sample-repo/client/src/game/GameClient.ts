import { Client, Room } from "colyseus.js";
import type {
  SwapMessage,
  SwapResultMessage,
  IGameState,
} from "@vibecode/shared";

const MESSAGE_SWAP = "swap" as const;
const MESSAGE_SWAP_RESULT = "swapResult" as const;

export type GameStateChangeCallback = (state: IGameState) => void;
export type SwapResultCallback = (result: SwapResultMessage) => void;
export type ConnectionCallback = () => void;
export type Unsubscribe = () => void;

/**
 * Manages the Colyseus client connection lifecycle.
 *
 * This is the only module that imports colyseus.js.
 * Scenes communicate with this class through typed callbacks.
 */
export class GameClient {
  private client: Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private room: Room<any> | null = null;

  private onStateChangeCallbacks = new Set<GameStateChangeCallback>();
  private onSwapResultCallbacks = new Set<SwapResultCallback>();
  private onConnectedCallbacks = new Set<ConnectionCallback>();
  private onDisconnectedCallbacks = new Set<ConnectionCallback>();

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  async joinGame(): Promise<void> {
    this.room = await this.client.joinOrCreate("GameRoom");

    this.room.onStateChange((state: IGameState) => {
      for (const cb of this.onStateChangeCallbacks) {
        try {
          cb(state);
        } catch (error) {
          console.error("onStateChange callback error", error);
        }
      }
    });

    this.room.onMessage(MESSAGE_SWAP_RESULT, (data: SwapResultMessage) => {
      for (const cb of this.onSwapResultCallbacks) {
        try {
          cb(data);
        } catch (error) {
          console.error("onSwapResult callback error", error);
        }
      }
    });

    this.room.onLeave(() => {
      for (const cb of this.onDisconnectedCallbacks) {
        try {
          cb();
        } catch (error) {
          console.error("onDisconnected callback error", error);
        }
      }
    });

    for (const cb of this.onConnectedCallbacks) {
      try {
        cb();
      } catch (error) {
        console.error("onConnected callback error", error);
      }
    }
  }

  sendSwap(fromIndex: number, toIndex: number): void {
    if (!this.room) return;
    const msg: SwapMessage = { fromIndex, toIndex };
    this.room.send(MESSAGE_SWAP, msg);
  }

  leave(): void {
    this.room?.leave();
    this.room = null;
  }

  /** Returns the current state snapshot (read-only). */
  getState(): IGameState | null {
    return this.room?.state ?? null;
  }

  onStateChange(cb: GameStateChangeCallback): Unsubscribe {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  onSwapResult(cb: SwapResultCallback): Unsubscribe {
    this.onSwapResultCallbacks.add(cb);
    return () => this.onSwapResultCallbacks.delete(cb);
  }

  onConnected(cb: ConnectionCallback): Unsubscribe {
    this.onConnectedCallbacks.add(cb);
    return () => this.onConnectedCallbacks.delete(cb);
  }

  onDisconnected(cb: ConnectionCallback): Unsubscribe {
    this.onDisconnectedCallbacks.add(cb);
    return () => this.onDisconnectedCallbacks.delete(cb);
  }
}

const COLYSEUS_URL =
  import.meta.env.VITE_COLYSEUS_URL ?? "ws://vibecodematch.onrender.com";

/** Singleton GameClient instance shared across all scenes. */
export const gameClient = new GameClient(COLYSEUS_URL);
