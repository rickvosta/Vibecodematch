# Testing Strategy

## Purpose

This document defines what to test, how to test it, and what tooling to use for Vibecode Match.

Follow the shared `testing.md` standard. This document adds project-specific detail.

---

## Guiding Principle

Because all game logic is authoritative on the server and the domain layer is pure TypeScript, the vast majority of meaningful tests are backend unit tests. Frontend tests are limited to thin integration checks around the Colyseus connection and scene transitions.

---

## Test Stack

| Layer                    | Tooling                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| Backend unit tests       | Jest + ts-jest                                                     |
| Backend room integration | `@colyseus/testing`                                                |
| Frontend unit tests      | Vitest (runs in Node; no browser required for non-rendering logic) |
| Frontend E2E (optional)  | Playwright                                                         |

---

## Backend Tests

### 1. Domain Unit Tests (`server/domain/**/*.test.ts`)

These are the most important tests. They cover all pure game logic.

**Match detection**

- A horizontal run of 3 of the same type is detected as a match.
- A vertical run of 3 of the same type is detected as a match.
- A run of 4 creates a striped candy.
- A run of 5 creates a color bomb.
- An L-shape / T-shape overlap creates a wrapped candy.
- Adjacent cells of different types are not matched.
- Inactive cells are never included in matches.
- Overlapping horizontal and vertical matches at a shared cell are merged (cell removed once).

**Swap validation**

- A swap between two adjacent cells that creates a match is valid.
- A swap between two adjacent cells that creates no match is invalid.
- A swap between non-adjacent cells is invalid.
- A swap involving an inactive cell is invalid.
- A swap with an out-of-bounds index is invalid.

**Board fill / gravity**

- After clearing matched cells, candies above fall down correctly.
- Empty cells at the top are filled with new random candies.
- Inactive cells remain empty after a fill.

**Cascade**

- A refill that creates new matches triggers another round of matching.
- The cascade continues until no new matches exist.

**Score**

- Each cleared candy awards the correct points.
- A cascade multiplier increases the score correctly.
- Score never decreases.

**Move counter**

- A valid swap decrements the move count by 1.
- An invalid swap does not change the move count.
- The move count does not go below 0.

**Level config**

- `getLevelConfig(n)` returns the correct config for levels 1–20.
- Accessing level 0 or 21 throws or returns a clear error.

**Board shuffle**

- After shuffle, the board contains the same multiset of candy types.
- After shuffle, at least one valid move exists.

**No-valid-moves detection**

- A board with no possible matches after any swap is correctly identified as having no valid moves.
- A board with at least one valid swap is not flagged.

### 2. Room Integration Tests (`server/rooms/**/*.test.ts`)

Use `@colyseus/testing` (`ColyseusTestServer`) to test the full room behaviour with real schema sync.

**Join behaviour**

- A player joining an empty room creates a new game at level 1.
- A second player joining receives the current board and score.
- Player count in `GameState.players` is correct after joins.

**Swap message handling**

- Sending a valid `"swap"` message updates the board schema.
- Sending an invalid `"swap"` message returns a rejection; state is unchanged.
- A swap that completes the level triggers a `levelStatus = "complete"` state change.
- A swap that exhausts moves triggers a `levelStatus = "failed"` then reset.

**Leave behaviour**

- A player leaving removes their entry from `GameState.players`.
- The game continues; board state is unaffected.

**Level progression**

- After level completion, `currentLevel` increments and a new board is generated.
- After completing level 20, the game resets to level 1.

---

## Frontend Tests

Frontend game logic is intentionally minimal (the server owns all logic), so frontend tests focus on the Colyseus client wrapper and scene state handling.

### 1. Game Client Unit Tests (`client/game/**/*.test.ts`)

- Connecting to the server emits a `"connected"` event.
- Receiving a state update emits the correct local event with the mapped data.
- Sending a `"swap"` message calls the correct Colyseus room method with the correct payload.
- Disconnecting emits a `"disconnected"` event.

Use a mock Colyseus `Room` object (manual mock or `jest.fn()`) — do not spin up a real server for these tests.

### 2. Scene Logic Tests (optional, only where logic exists)

Scenes should have no logic to test. If any pure helper functions are extracted from scenes (e.g. index-to-grid-coordinate conversion, animation config builders), test those in isolation with Vitest.

---

## What Not To Test

- Phaser rendering output (canvas pixels, animation frames) — not testable in Jest/Vitest without a browser.
- Colyseus internal sync mechanism — that is the framework's concern.
- Static level config data — no logic, no test needed.
- CSS layout and visual styling.

---

## Required Coverage Per Change

When implementing a meaningful change, the following must be covered:

| Change type              | Required tests                                                |
| ------------------------ | ------------------------------------------------------------- |
| New domain rule          | Unit tests for happy path, invalid input, and boundary values |
| New room message handler | Room integration test for success and failure paths           |
| Bug fix                  | Regression test that fails before the fix and passes after    |
| New use case             | Application-level test with mocked domain and room            |
| Schema field added       | Room integration test that asserts the new field is synced    |

---

## Test File Location

```
server/
├── domain/
│   └── board/
│       ├── boardUtils.ts
│       └── boardUtils.test.ts     ← co-located with implementation
├── rooms/
│   └── GameRoom.test.ts

client/
└── game/
    ├── GameClient.ts
    └── GameClient.test.ts
```

Co-locate test files with the file they test. Use the `.test.ts` suffix.

---

## Running Tests

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

Both run in CI. All tests must pass before a feature is considered done.
