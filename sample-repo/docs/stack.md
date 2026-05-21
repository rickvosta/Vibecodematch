# Technology Stack

## Purpose

This document defines the canonical technology choices for Vibecode Match. All implementation decisions must align with these choices. Do not introduce alternative frameworks or libraries without updating this document.

---

## Frontend — Phaser 3 Client

| Concern            | Choice                                          |
| ------------------ | ----------------------------------------------- |
| Game engine        | Phaser 3                                        |
| Language           | TypeScript                                      |
| Bundler            | Vite                                            |
| Multiplayer client | Colyseus.js client SDK                          |
| Styling            | Phaser native (canvas); HTML/CSS for menus only |
| Container          | Docker — nginx static file server               |

### Phaser Specifics

- Use Phaser 3's Scene system exclusively. Each screen (main menu, game board, level complete, etc.) is a separate Scene.
- Game objects (candy tiles, grid cells, effects) are Phaser `GameObjects` managed within their Scene.
- Do **not** compute game state on the client. The client renders what the Colyseus server broadcasts.
- Use Phaser's `EventEmitter` or scene `events` for intra-scene communication.
- Asset loading happens in a dedicated `PreloadScene`.
- Camera, tweens, and particle effects are permitted on the client for visual polish only.

### TypeScript Config

- Strict mode enabled (`"strict": true`).
- No `any` unless unavoidable and commented with reason.
- Path aliases configured in `tsconfig.json` (e.g. `@game/*`, `@ui/*`).

---

## Backend — Colyseus Game Server

| Concern               | Choice                          |
| --------------------- | ------------------------------- |
| Game server framework | Colyseus                        |
| Runtime               | Node.js (LTS)                   |
| Language              | TypeScript                      |
| HTTP server           | Express (bundled with Colyseus) |
| Container             | Docker — Node.js runtime        |

### Colyseus Specifics

- All game logic is authoritative on the server. The server owns the canonical game state.
- Game state is modelled using Colyseus `Schema` classes (`MapSchema`, `ArraySchema`, etc.).
- One `GameRoom` (or similar name) handles the full game lifecycle across all 20 levels.
- State changes are broadcast automatically through Colyseus schema sync.
- Use Colyseus room lifecycle hooks: `onCreate`, `onJoin`, `onLeave`, `onDispose`.
- Client-to-server actions are sent as Colyseus messages (typed, validated on receipt).
- Server messages to specific clients use `room.send()` or schema state sync.

---

## Shared

- Both frontend and backend are written in TypeScript.
- Shared types (e.g. message payloads, constants) live in a shared `packages/shared` or `shared/` directory and are imported by both sides.
- All environment-specific configuration is provided through environment variables — no hardcoded ports, URLs, or secrets.

---

## Infrastructure

| Concern                | Choice                    |
| ---------------------- | ------------------------- |
| Containerisation       | Docker                    |
| Orchestration (local)  | Docker Compose            |
| Reverse proxy / static | nginx (client container)  |
| WebSocket port         | 2567 (Colyseus default)   |
| HTTP port              | 80 / configurable via env |

---

## Not In Scope

The following are explicitly out of scope unless the project requirements change:

- Persistent database (no player accounts, no saved progress)
- Authentication / authorisation
- CDN or cloud deployment pipeline
- Native mobile builds
