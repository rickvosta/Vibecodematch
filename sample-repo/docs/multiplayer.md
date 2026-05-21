# Multiplayer Design

## Purpose

This document defines how the real-time multiplayer layer works in Vibecode Match using Colyseus, and the rules that govern room lifecycle, state sync, and concurrent player actions.

---

## Core Principle

**The server is the single source of truth.**

All players connected to the same room see exactly the same game state. No player has a privileged view or private state (beyond their own client ID). The Colyseus schema sync mechanism ensures all clients receive the same state changes automatically.

---

## Room Design

### One Shared Room

There is exactly **one active `GameRoom`** at any time.

- When a player clicks "Join Game", the client calls `client.joinOrCreate("GameRoom")`.
- All players end up in the same room instance.
- If the room does not exist yet, the first player creates it and the game starts at level 1.
- If the room already exists (other players are already playing), the new player joins mid-game at whatever level and state is current.

There is no lobby. There is no matchmaking. There is no private room.

### Room Lifecycle

| Hook        | Responsibility                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| `onCreate`  | Initialise game state for level 1, generate the board                         |
| `onJoin`    | Add player to `GameState.players`, send current state (auto via schema)       |
| `onLeave`   | Remove player from `GameState.players`; game continues with remaining players |
| `onDispose` | Clean up if the room is closed (all players left)                             |

The room is never manually disposed mid-game. If all players leave, the room disposes naturally. The next player to connect will create a fresh room starting at level 1.

---

## Game State Schema

The `GameState` schema is the contract between server and all clients. Colyseus automatically patches and syncs it.

```
GameState
├── currentLevel: number
├── score: number
├── movesRemaining: number
├── levelStatus: "playing" | "complete" | "failed" | "reset"
├── board: BoardState
│   ├── width: number
│   ├── height: number
│   └── cells: ArraySchema<CellState>   ← flattened row-major array
│       └── CellState
│           ├── candyType: string       ← candy identifier or "" for inactive/empty
│           ├── isActive: boolean
│           └── isSpecial: boolean
└── players: MapSchema<PlayerState>
    └── PlayerState
        ├── sessionId: string
        └── displayName: string
```

Clients read state changes by listening to Colyseus `onStateChange` and per-field `onChange` callbacks — never by maintaining a local copy of game logic.

---

## Client Messages (Player → Server)

All messages are typed. The server validates every message before acting on it.

| Message type | Payload                                  | Description                                                       |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| `"swap"`     | `{ fromIndex: number, toIndex: number }` | Player requests a swap of two adjacent cells (flat array indices) |

The server:

1. Validates the message shape (both indices present, numeric, in range).
2. Validates the swap is legal (adjacent, both active, would create a match).
3. If valid: applies the swap, runs match/cascade logic, updates schema, decrements moves.
4. If invalid: sends an error message back to that player only; no state change.

### Sending Result Messages Back

Use `room.send(client, "swapResult", { success: boolean, reason?: string })` for per-client feedback (e.g. "invalid swap"). Global state changes are communicated through schema sync, not direct messages.

---

## Concurrency

Multiple players can send `"swap"` messages simultaneously. Colyseus processes room messages sequentially in a single-threaded event loop — no locking is required. Each swap is processed fully before the next begins.

This means:

- Two players cannot swap at the exact same time from the server's perspective.
- The first received swap is processed; the second sees the updated board.
- A move that was valid when sent may be invalid by the time it is processed (race condition). The server simply rejects it cleanly.

---

## Level Transitions

Level transitions are global and affect all players simultaneously.

When the score threshold is reached:

1. Server sets `levelStatus = "complete"`.
2. After a brief delay (configurable, e.g. 2 seconds), server advances `currentLevel`, resets `score`, `movesRemaining`, and generates a new board.
3. Sets `levelStatus = "playing"`.
4. All clients observe these schema changes and transition their scenes accordingly.

When moves run out (game over / reset):

1. Server sets `levelStatus = "failed"`.
2. After a brief delay, server resets to level 1 (full game reset).
3. Sets `levelStatus = "playing"`.

---

## Late Join Behaviour

A player joining mid-game immediately receives the full current `GameState` via Colyseus's initial state sync. No special handling is needed. The client renders whatever state it receives.

---

## Security Rules

- The server **never trusts** cell contents or scores sent by the client. All game logic runs server-side.
- All incoming message payloads are validated for type and range before use.
- A player cannot trigger more than one swap per message. Batch actions are not supported.
- There is no admin/cheat endpoint.

---

## Reconnection

Colyseus's built-in reconnection (`allowReconnection`) is optional for this project. The simplest approach:

- If a player disconnects and reconnects, they re-join the room as a new player.
- Their previous `PlayerState` entry is removed on disconnect (`onLeave`).
- On rejoin, a new entry is created.
- The game state is not affected by individual player disconnects.
