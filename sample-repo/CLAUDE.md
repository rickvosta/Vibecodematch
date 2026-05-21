# Project AI Playbook

This is the thin project entrypoint for Claude, Codex, and other coding agents.

## Shared AI Assets Location

```
$AI = C:/Users/rvanosta/Documents/personal/AI_CandyCrush/shared
```

All `$AI` references below resolve to this path.
Update this single line if the shared assets are moved.

Generic reusable assets live at `$AI`:

```text
$AI/agents/
$AI/skills/
$AI/standards/
```

Project-specific rules live in `docs/`.

## Required Reading

Before planning or implementing non-trivial work, read all files in `docs/`.

This folder contains all project-specific documentation — architecture, domain rules, coding standards, testing strategy, security specs, and decision history. Every file is relevant. Do not skip files because their name seems unrelated to the current task.

Use generic standards from:

- `$AI/standards/clean-architecture.md`
- `$AI/standards/code-quality.md`
- `$AI/standards/testing.md`
- `$AI/standards/documentation.md`
- `$AI/standards/security.md`
- `$AI/standards/time-and-timezones.md`

Use reusable workflows from `$AI/skills/`.
Use role guidance from `$AI/agents/`.

## Project Summary

The project is called "Vibecode Match". This is a web based Candy Crush clone. It runs in docker containers and it hosts a website and a Colyseus back-end that contains a game. The game has a starting menu with a big image that says "Vibecode Match". The main menu has a button that says "Join game". When a new room is made, the game starts at level 1 but the game has 20 levels total. The levels only unlock after completing the previous one. When the user clicks "Join game", the game switches to the playing field where a grid is layed out, where other users are playing too. The grid can be a maximum of 20 by 20, and can have all sorts of shapes and sizes (as long as it's a grid). It contains different candy related objects that can be matched, like every match-three game has. It randomizes the board every time there are no valid moves. If the players reach the score treshold before the set amount of moves are up, the level is completed. All players move on to the next level, so the back-end just has a state where all clients listen to. The goal is to complete all 20 levels. Once the 20 levels are completed, the whole game resets.

Very important: The game is multiplayer. If anyone else opens the game too, their website also shows the level that the game is currently on. Everyone can make moves whenever they want, and if the moves are up, the whole game resets to level 1 and everyone has to start over.

## Non-Negotiable Project Rules

- Always ask clarifying questions when the instructions are ambiguous, or when multipe implementation options are available
- Preserve clean architecture and strict layering.
- Provider-specific logic stays in infrastructure/provider adapters.
- Frontend renders backend-calculated product truth; it does not compute canonical metrics.
- Persisted timestamps are timezone-aware UTC.
- Calendar date logic uses the configured application timezone.
- Tests are required for meaningful behavior changes.
- Do not commit or push unless the user explicitly asks.

## Documentation Rule

When making structural or architectural changes, update the relevant files in `docs/`.

Keep `docs/` accurate and current. If behavior, architecture, or decisions change, the corresponding documentation must reflect it.

## Definition Of Done

A task is complete only if:

- architecture boundaries are respected
- code is readable and maintainable
- relevant tests are added/updated and pass
- security impact is considered
- docs are updated when needed
- remaining risks are clearly stated
