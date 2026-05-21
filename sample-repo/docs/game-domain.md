# Game Domain

## Purpose

This document defines the game rules, domain model, and invariants for Vibecode Match. It is the authoritative reference for implementing game logic on the server.

All logic described here lives exclusively in `server/domain/`. It is pure TypeScript with no framework dependencies.

---

## Game Overview

Vibecode Match is a cooperative multiplayer match-3 game. All connected players share a single game board and work together to complete levels.

---

## Levels

- The game has **20 levels** in total.
- Levels are played sequentially: level 1, 2, … 20.
- A level is **completed** when the current score reaches or exceeds the level's score threshold before all moves are exhausted.
- If the moves run out before the threshold is reached, **the entire game resets to level 1** for all players.
- Once all 20 levels are completed, **the game resets to level 1** for all players.
- Level unlock is implicit: all players always play the same current level. There is no per-player progression.

### Level Configuration

Each level defines:

| Property         | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `levelNumber`    | 1–20                                                                      |
| `gridWidth`      | Number of columns (1–20)                                                  |
| `gridHeight`     | Number of rows (1–20)                                                     |
| `gridShape`      | Optional mask defining which cells are active (for non-rectangular grids) |
| `scoreThreshold` | Score required to complete the level                                      |
| `moveLimit`      | Maximum number of moves before the game resets                            |
| `candyTypes`     | Set of candy types available for this level (subset of all candy types)   |

Level configurations are static data defined in `server/domain/levels/levelConfig.ts`. They are not stored in a database.

---

## The Board

### Grid

- The board is a grid of `gridWidth × gridHeight` cells.
- Each cell is either **active** (can contain a candy) or **inactive** (hole/gap in the board shape).
- All cells in a rectangular grid are active by default.
- Inactive cells are never filled, matched, or interacted with.

### Candy Types

The following base candy types exist (at minimum):

- Red candy
- Orange candy
- Yellow candy
- Green candy
- Blue candy
- Purple candy

Each level's config specifies which subset is in play. Using fewer types makes matches more frequent (easier levels); more types make it harder.

### Special Candies

Special candies are created when a match of 4 or more is made:

| Match size                       | Special candy created                                  |
| -------------------------------- | ------------------------------------------------------ |
| 4 in a row/column                | Striped candy (clears a row or column when matched)    |
| 5 in a row/column                | Color bomb (matches all candies of the triggered type) |
| L-shape or T-shape (2×3 overlap) | Wrapped candy (explodes a 3×3 area when matched)       |

Special candy creation and triggering is authoritative on the server.

---

## Matching Rules

### Basic Match

A **match** is 3 or more candies of the same type in a consecutive horizontal or consecutive vertical line on the board.

### Match Detection

After every swap or board refill, the server scans the entire board for matches:

1. Scan each row left-to-right for runs of 3+ of the same type.
2. Scan each column top-to-bottom for runs of 3+ of the same type.
3. All matched cells are collected (overlapping matches are merged).
4. All matched cells are cleared simultaneously.
5. Gravity is applied: candies above cleared cells fall down.
6. New random candies fill empty cells at the top.
7. Repeat detection until no new matches are found (cascade).

### Score

- Each matched candy awards points.
- Cascade multipliers increase score for matches triggered by falling candies (not by a direct swap).
- Score per candy and cascade multiplier are defined per-level in `levelConfig`.

---

## Swap Rules

### Valid Swap

A swap is valid when:

1. The two cells are **adjacent** (horizontal or vertical — no diagonal).
2. Both cells are **active**.
3. The swap would create **at least one match** of 3+ on the resulting board.

### Invalid Swap

An invalid swap is rejected by the server. The client receives a rejection message and no state changes.

### Move Cost

Each **valid** swap deducts 1 from the remaining move count. Invalid swaps do not cost a move.

---

## No Valid Moves — Board Shuffle

When no valid swap exists on the board (no possible move would create a match), the server automatically shuffles the board:

1. Collect all active candy values.
2. Redistribute them randomly across active cells.
3. Ensure the shuffled board has at least one valid move.
4. Repeat until a valid board is found.
5. Broadcast the new board state to all clients.

A shuffle does **not** cost a move and does **not** change the score.

---

## Level Completion

When a player's swap causes the score to reach or exceed `scoreThreshold`:

1. The server marks the level as complete.
2. All players are moved to the next level.
3. The board is reset with the new level's configuration.
4. Move count and score reset to the new level's values.

---

## Game Reset

A game reset occurs when:

- Moves run out before the score threshold is reached, **or**
- All 20 levels are completed.

On reset:

1. Level resets to 1.
2. Score resets to 0.
3. Moves reset to level 1's move limit.
4. A new board is generated for level 1.
5. All connected clients receive the reset state.

---

## Domain Invariants

These must always hold. If any code would violate them, the operation must be rejected.

- A cell cannot contain two candies.
- Inactive cells are always empty.
- The move count never goes below 0.
- The score never decreases.
- The level number is always between 1 and 20 (inclusive).
- A swap can only be applied if it results in at least one match.
- The board always has at least one valid move after initialization or shuffle.
