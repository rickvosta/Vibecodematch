# Code Standards

## Purpose

This document defines project-specific coding standards for Vibecode Match. Follow the shared `code-quality.md` standard as a baseline. This document narrows and extends it for the Phaser + Colyseus + TypeScript stack.

---

## Language

- All code is **TypeScript with strict mode** (`"strict": true`).
- No `any`. Use `unknown` and narrow it, or define a proper type.
- No `// @ts-ignore` or `// @ts-nocheck`. If the types are wrong, fix them.
- Use `const` by default. Use `let` only when reassignment is necessary.
- Prefer `for...of` over `forEach` for imperative loops.
- Async/await over raw `.then()` chains.

---

## Naming

### General

| Kind                | Convention                                          | Example                                 |
| ------------------- | --------------------------------------------------- | --------------------------------------- |
| Variable / function | camelCase                                           | `movesRemaining`, `applySwap`           |
| Class               | PascalCase                                          | `GameRoom`, `BoardUtils`                |
| Interface           | PascalCase, no `I` prefix                           | `LevelConfig`, `SwapResult`             |
| Enum                | PascalCase                                          | `CandyType`, `LevelStatus`              |
| Enum member         | PascalCase                                          | `CandyType.Red`, `LevelStatus.Complete` |
| File                | kebab-case                                          | `board-utils.ts`, `game-client.ts`      |
| Test file           | same as source + `.test`                            | `board-utils.test.ts`                   |
| Constant            | SCREAMING_SNAKE_CASE only for true global constants | `MAX_GRID_SIZE = 20`                    |

### Domain-Specific Naming

Use the domain vocabulary from `game-domain.md`. Avoid generic names that hide intent.

Prefer:

- `candyType` over `type` or `value`
- `cellIndex` over `index` or `id`
- `movesRemaining` over `moves` or `count`
- `scoreThreshold` over `target` or `goal`
- `applySwap` over `doSwap` or `handleSwap`
- `findMatches` over `checkBoard` or `scan`
- `isValidSwap` over `checkSwap` or `canSwap`

---

## Project Structure Rules

### Backend

- Domain logic files go in `server/domain/`. Never import Colyseus or Phaser here.
- Room files go in `server/rooms/`. Only here may Colyseus types be imported.
- Application use cases go in `server/application/`. No Colyseus schema types here; use plain objects.
- A file in `domain/` that imports from `rooms/` is an architecture violation.

### Frontend

- The Colyseus client SDK is imported only in `client/game/`.
- Phaser types are imported only in `client/scenes/`.
- Shared types between frontend and backend live in `shared/` (monorepo root or a `packages/shared` package).
- No game logic in scenes. If you find yourself writing match detection in a scene, it belongs on the server.

### Shared

- Shared types are plain TypeScript interfaces and enums — no classes, no runtime logic, no framework imports.

---

## Functions and Classes

- Keep functions small. A function doing more than one thing should be split.
- Prefer pure functions in the domain layer (same input → same output, no side effects).
- A class that only has static methods should be a module with exported functions instead.
- Avoid constructors with large numbers of parameters. Use a config object.
- Side effects (schema mutations, event emissions) belong at the boundary (room layer, game client layer) — not buried in domain logic.

---

## Colyseus-Specific

- Schema classes are data containers only. Never add business logic to a Schema class.
- Do not mutate `GameState` outside of the `GameRoom` class and its delegated use case calls.
- All incoming client messages are validated before processing. Use a type guard or Zod schema.
- Message type strings are defined as constants or an enum, not raw inline strings.

```typescript
// Good
const MESSAGE_SWAP = "swap" as const;
room.onMessage(MESSAGE_SWAP, (client, data) => { ... });

// Bad
room.onMessage("swap", (client, data) => { ... });
```

---

## Phaser-Specific

- Each scene has a single named export that extends `Phaser.Scene`.
- Scene keys are defined in a shared `SceneKey` enum.
- Do not store game state in scene properties beyond what is needed for rendering (e.g. tweens, selected tile reference).
- Destroy tweens and listeners in the scene's `shutdown` / `destroy` lifecycle hooks to prevent memory leaks.
- Asset keys are defined in a shared `AssetKey` enum or constant object — never inline strings.

```typescript
// Good
this.add.image(0, 0, AssetKey.CandyRed);

// Bad
this.add.image(0, 0, "candy_red");
```

---

## Error Handling

- Validate at system boundaries: incoming WebSocket messages, environment variable parsing.
- Domain functions throw domain exceptions for invariant violations. Room handlers catch these and send rejection messages to the client.
- Never swallow errors silently. Either handle them or let them propagate.
- Unrecoverable server errors should log and crash the process (let Docker / Node restart it) rather than masking corruption.

---

## Comments

- Comments explain **why**, not **what**.
- Complex match-cascade logic and scoring formulas warrant a comment.
- Phaser lifecycle quirks (e.g. "must call after scene is active") warrant a comment.
- Colyseus schema limitation workarounds must be commented with the limitation.
- Do not comment out dead code. Delete it (git remembers).

---

## Linting and Formatting

- ESLint with `@typescript-eslint` rules.
- Prettier for formatting.
- Both run in CI. No warnings or errors are acceptable in committed code.
- Formatting is not a code review concern — autoformat on save.
