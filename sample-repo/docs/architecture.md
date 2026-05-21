# Architecture

## Purpose

This document defines the layered architecture for Vibecode Match and how the Phaser frontend and Colyseus backend are structured, independently and in relation to each other.

Follow the shared `clean-architecture.md` standard. This document narrows it to this project's specific context.

---

## High-Level Overview

```
┌─────────────────────────────────┐      WebSocket (Colyseus)
│       Client Container          │ ◄──────────────────────► ┌────────────────────────────────┐
│   Phaser 3 + Vite + nginx       │                           │     Server Container           │
│                                 │                           │   Colyseus + Node.js           │
│  Scenes (UI / rendering)        │                           │                                │
│  Game Client (Colyseus.js)      │                           │  GameRoom (room logic)         │
│  State Mirror (read-only)       │                           │  GameState (Schema)            │
│                                 │                           │  Domain (board, match, level)  │
└─────────────────────────────────┘                           └────────────────────────────────┘
```

---

## Backend Architecture

### Layers

```
server/
├── rooms/          ← Delivery layer (Colyseus room handlers)
├── application/    ← Use cases / orchestration
├── domain/         ← Pure game logic (no framework dependencies)
└── infrastructure/ ← Nothing yet; reserved for future I/O adapters
```

#### Domain Layer (`domain/`)

Contains pure, framework-independent game logic.

Responsibilities:

- Board representation (grid, cell contents, valid positions)
- Match detection (find groups of 3+ in rows and columns)
- Swap validation (only adjacent cells, swap must create a match)
- Board refill after matches (gravity / new candy generation)
- Move counter logic
- Score calculation
- Level configuration (score threshold, move limit, grid shape per level)
- Shuffle detection (no valid moves remaining)

Rules:

- Zero Colyseus imports.
- Zero Phaser imports.
- Pure TypeScript classes and functions.
- All domain functions are unit-testable without any server setup.

#### Application Layer (`application/`)

Orchestrates domain logic in response to player actions.

Responsibilities:

- `ProcessSwapUseCase` — validate swap, apply match logic, update board, deduct moves, check level completion
- `JoinGameUseCase` — handle a player joining the current active room
- `ShuffleBoardUseCase` — triggered when no valid moves exist

Rules:

- Calls domain functions.
- Does not know about HTTP, WebSockets, or Colyseus schemas.
- Returns plain result objects; the room handler maps them to schema updates.

#### Rooms Layer (`rooms/`)

Colyseus room handlers. This is the delivery layer.

Responsibilities:

- Define `GameRoom` extending `Room<GameState>`
- Receive player messages, call application use cases
- Map use-case results onto the `GameState` schema (which Colyseus auto-syncs)
- Handle `onJoin` / `onLeave` player bookkeeping

Rules:

- No raw game logic here — it all delegates to the application layer.
- Only this layer imports Colyseus types.

#### State Schema (`rooms/schema/`)

Colyseus `Schema` classes that define the synced game state.

Key classes:

- `GameState` — top-level room state
- `BoardState` — grid dimensions, cell contents
- `CellState` — candy type, special flags
- `LevelState` — current level number, score, moves remaining
- `PlayerState` — per-player info (id, display name)

Rules:

- Schema classes are plain data containers. No logic.
- All game truth flows through schema sync; clients never compute canonical state.

---

## Frontend Architecture

### Layers

```
client/
├── scenes/         ← Phaser Scenes (delivery / rendering)
├── ui/             ← Reusable non-game UI components (HTML overlay menus)
├── game/           ← Game client: Colyseus connection, state mirror, input dispatch
└── assets/         ← Sprites, sounds, fonts (no logic)
```

#### Scenes (`scenes/`)

Each screen is a Phaser Scene.

| Scene                | Responsibility                                       |
| -------------------- | ---------------------------------------------------- |
| `PreloadScene`       | Load all assets                                      |
| `MainMenuScene`      | Display "Vibecode Match" title, "Join Game" button   |
| `GameScene`          | Render the grid, handle local input, animate matches |
| `LevelCompleteScene` | Show level complete overlay                          |
| `GameOverScene`      | Show game over / reset overlay                       |

Rules:

- Scenes render state. They do not own game logic.
- State changes come from the Colyseus state mirror only.
- Input (swap attempt) is dispatched to the server; the scene waits for the state update to animate.

#### Game Client (`game/`)

Manages the Colyseus connection lifecycle.

Responsibilities:

- Connect/disconnect to the Colyseus server
- Join or create the shared `GameRoom`
- Listen to schema state changes and emit local events for scenes to react
- Send typed player messages to the server

Rules:

- This is the only place Colyseus client SDK is imported.
- Scenes communicate with this layer through a typed event bus or injected interface.
- No rendering logic here.

---

## Key Architectural Rules

1. **Authoritative server.** The server owns all game state. The client only renders.
2. **No client-side game logic.** Match detection, scoring, level progression all run on the server.
3. **Schema = single source of truth.** All clients receive the same schema state from Colyseus.
4. **Domain is framework-free.** Domain functions can be tested with plain `jest` with no Colyseus or Phaser setup.
5. **Scenes are passive.** They listen to state events and render. They do not decide outcomes.
6. **Shared types.** Message payload types and enums shared between client and server live in `shared/`.
