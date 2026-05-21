# AI-Assisted Development Setup

This repository uses a two-layer approach to AI-assisted development:

- **Generic layer** — reusable agents, skills, and standards that apply to any project
- **Project layer** — a thin playbook and project-specific docs that apply to this repo only

---

## How It Works

```text
$AI/agents/       ← role-specific agent definitions (Planner, Architect, Reviewer, etc.)
$AI/skills/       ← reusable workflow checklists (implement-and-verify, debug, refactor, etc.)
$AI/standards/    ← engineering standards (architecture, security, testing, time, etc.)

this-repo/
  CLAUDE.md       ← thin project playbook (points to $AI, defines project rules)
  CODEX.md        ← same, for Codex
  docs/           ← all project-specific documentation
```

The generic layer is shared across projects and never contains project-specific content. The project layer is thin by design — it sets the `$AI` path, states non-negotiable project rules, and points agents at `docs/` for everything else.

AI agents read `CLAUDE.md` first, then `docs/`, then pull in the relevant generic standards and agent definitions from `$AI`.

---

## Setting Up For A New Project

### 1. Copy the structure

Copy `CLAUDE.md`, `CODEX.md`, and the `docs/` folder into your project root.

### 2. Set the `$AI` path

Open `CLAUDE.md` and update the path at the top to wherever your shared AI assets live:

```
$AI = ~/ai
```

All references in the file use `$AI`, so this is the only line you need to change.

Do the same in `CODEX.md`.

### 3. Replace the project docs

The `docs/` folder contains sample content for a sports intelligence platform. Replace each file with content relevant to your project:

| File | What to put in it |
|---|---|
| `docs/architecture.md` | Your stack, layer rules, folder structure, technology-specific constraints |
| `docs/coding-standards.md` | Project-specific naming conventions, complexity rules, patterns to enforce |
| `docs/testing-strategy.md` | Regression areas, critical flows, any golden-example fixtures |
| `docs/frontend.md` | Your frontend stack, component conventions, project-specific UI rules |
| `docs/security/advanced-security-spec.md` | Project-specific security requirements beyond the generic standard |
| `docs/agents.md` | Project-specific review focus; keep the Claude/Codex guidance if relevant |
| `docs/work-instructions.md` | Start fresh — this is your decision and work log |

Each doc already references the relevant generic standard at the top. Only add what is project-specific. Do not repeat what the generic standards already cover.

### 4. Update the project playbook

In `CLAUDE.md`, update:

- **Project Summary** — describe your system and its core data architecture
- **Non-Negotiable Project Rules** — your hard constraints (classification models, canonical fields, etc.)
- **Time Helpers** — your project's time utility functions and their locations, or remove this section if not applicable

---

## Using With Claude (Claude Code)

Claude reads `CLAUDE.md` automatically when it is present at the project root.

**Setup:**
- Place `CLAUDE.md` at the root of your repository
- Ensure `$AI` points to the correct location of your shared agents/skills/standards

**How to invoke agents:**

Reference agents by role in your prompt. Claude will apply the relevant agent definition from `$AI/agents/`:

```
Use the Architect agent to review this change.
Use the Security Reviewer agent before we merge this.
Use the Planner agent to break this task down.
```

**How to invoke skills:**

Name the skill in your prompt and Claude will follow its workflow:

```
Apply the investigate-and-debug skill.
Run the architecture-boundary-review skill on these changes.
Use implement-and-verify for this change.
```

**Tip:** For complex tasks, start with the Planner agent. It will decompose the work, select the right agents, and enforce architecture and standards throughout.

---

## Using With Codex (OpenAI Codex CLI)

Codex reads `CODEX.md` when present at the project root.

**Setup:**
- Place `CODEX.md` at the root of your repository
- `CODEX.md` points to `CLAUDE.md` as the primary playbook and to `$AI` for shared assets
- Ensure `$AI` resolves correctly in the environment where Codex runs

**How to invoke agents and skills:**

Codex responds to the same prompting style as Claude. Reference agent roles and skill names directly:

```
Use the Implementer agent to apply this plan.
Follow the api-or-data-model-change skill for this migration.
```

**Recommended flow:**

Use Claude for design, review, and architecture decisions. Use Codex for implementation, multi-file changes, and mechanical refactors:

```text
Claude (Planner / Architect) → designs and reviews
Codex (Implementer)          → executes the plan
Claude (Reviewer)            → reviews the output
```

---

## Using With GitHub Copilot CLI

Copilot CLI does not read a playbook file automatically, but you can guide it effectively by providing context inline.

**Setup:**

Point Copilot at your playbook and docs at the start of a session:

```bash
gh copilot suggest -t shell "Read CLAUDE.md and docs/ for project context, then help me implement X"
```

Or use `gh copilot explain` for understanding and `gh copilot suggest` for generation.

**How to apply agents and skills:**

Reference them explicitly in your prompt:

```bash
gh copilot suggest "Following the implement-and-verify skill from ~/ai/skills/, implement this change and add tests"
gh copilot suggest "Apply the architecture-boundary-review skill: check that this change does not leak provider logic into the domain layer"
```

**Recommended workflow:**

Because Copilot CLI does not persist context across commands, keep prompts self-contained and include the relevant rule or constraint inline. Use it primarily for focused implementation tasks, not for architecture or planning.

---

## Generic Assets Reference

| Location | Contents |
|---|---|
| `$AI/agents/planner.md` | Orchestrator — decomposes work, delegates, enforces standards |
| `$AI/agents/architect.md` | Reviews and designs structural changes |
| `$AI/agents/implementer.md` | Executes approved plans as code |
| `$AI/agents/reviewer.md` | Final quality gate before completion |
| `$AI/agents/tester.md` | TDD enforcement and test design |
| `$AI/agents/debugger.md` | Root cause analysis |
| `$AI/agents/refactorer.md` | Readability and maintainability improvements |
| `$AI/agents/security-reviewer.md` | Auth, secrets, injection, cross-user access |
| `$AI/agents/frontend-agent.md` | Frontend implementation and review |
| `$AI/agents/documentation.md` | Keeps docs accurate and concise |
| `$AI/skills/clarify-requirements-first.md` | Before coding: resolve ambiguity |
| `$AI/skills/implement-and-verify.md` | Safe implementation with test verification |
| `$AI/skills/architecture-boundary-review.md` | Check dependency direction and layer violations |
| `$AI/skills/api-or-data-model-change.md` | Backward compatibility and migration discipline |
| `$AI/skills/frontend-product-change.md` | UI changes using backend truth |
| `$AI/skills/refactor-for-maintainability.md` | Structure improvements without behavior change |
| `$AI/skills/investigate-and-debug.md` | Reproduce, trace, fix, regression test |
| `$AI/skills/security-and-risk-review.md` | Security checklist for sensitive changes |
| `$AI/skills/performance-and-scale-check.md` | Hot loops, N+1, heavy payloads |
| `$AI/standards/clean-architecture.md` | Layer rules, dependency direction, ports/adapters |
| `$AI/standards/code-quality.md` | Naming, function design, complexity, comments |
| `$AI/standards/testing.md` | Test levels, quality rules, regression discipline |
| `$AI/standards/security.md` | Auth, authz, secrets, input/output safety |
| `$AI/standards/documentation.md` | What to document, how, maintenance rules |
| `$AI/standards/time-and-timezones.md` | Calendar dates vs instants, timezone discipline |
