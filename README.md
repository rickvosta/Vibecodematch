# AI Agents, Skills, and Standards

A reusable, project-agnostic toolkit for AI-assisted software development.

Works with Claude (Claude Code), OpenAI Codex CLI, and GitHub Copilot CLI.

---

## What Is This

This repository contains the generic layer of a two-layer approach to AI-assisted development:

- **This repo** — shared agents, skills, and standards that apply to any project and any technology stack
- **Your project repo** — a thin playbook (`CLAUDE.md`) and project-specific docs that point here

The idea is that the hard-won engineering discipline — how to review code, how to debug, how to maintain architecture boundaries, how to handle security — is written once and reused across all projects. Each project only documents what is unique to it.

---

## Repository Structure

```text
shared/
  agents/       ← role-specific agent definitions
  skills/       ← reusable workflow checklists
  standards/    ← engineering standards

sample-repo/    ← a working example of how to wire a project to this repo
```

---

## shared/agents

Agent definitions give an AI model a specific role, a clear purpose, a workflow, and hard stops.

| Agent | Purpose |
|---|---|
| `planner.md` | Orchestrates work, decomposes tasks, enforces standards, owns the quality gate |
| `architect.md` | Designs and reviews structural changes, data models, and provider boundaries |
| `implementer.md` | Executes approved plans as focused, tested, maintainable code |
| `reviewer.md` | Final quality gate — architecture, security, tests, maintainability |
| `tester.md` | TDD enforcement, test design, regression coverage |
| `debugger.md` | Root cause analysis — traces evidence, proposes smallest safe fix |
| `refactorer.md` | Improves readability and structure without changing behavior |
| `security-reviewer.md` | Auth, secrets, injection, cross-user access, destructive actions |
| `frontend-agent.md` | Frontend implementation and review — UI, API integration, accessibility |
| `documentation.md` | Keeps architecture docs, decisions, and agent instructions accurate |

---

## shared/skills

Skills are short, focused checklists that guide a specific type of task. They are meant to be referenced inline during work, not read upfront.

| Skill | When to use it |
|---|---|
| `clarify-requirements-first` | Before starting any non-trivial task |
| `implement-and-verify` | When implementing a change — safe scope, tests, verification |
| `architecture-boundary-review` | When touching layer boundaries or dependencies |
| `api-or-data-model-change` | When changing a contract, schema, or migration |
| `frontend-product-change` | When making UI or API integration changes |
| `refactor-for-maintainability` | When improving structure without changing behavior |
| `investigate-and-debug` | When diagnosing unexpected behavior |
| `security-and-risk-review` | Before shipping auth, data access, or destructive changes |
| `performance-and-scale-check` | When changes touch hot paths, queries, or data volume |

---

## shared/standards

Standards define the non-negotiable engineering baseline. Agents and skills reference them. Projects inherit them without repeating them.

| Standard | Covers |
|---|---|
| `clean-architecture.md` | Layer rules, dependency direction, ports and adapters, provider boundaries |
| `code-quality.md` | Naming, function design, complexity, comments, agent-generated code bar |
| `testing.md` | Test levels, quality rules, regression discipline, time-sensitive tests |
| `security.md` | Auth, authz, secrets, input/output safety, destructive actions |
| `documentation.md` | What to document, how to structure it, maintenance rules |
| `time-and-timezones.md` | Calendar dates vs instants, timezone discipline, boundary rules |

---

## sample-repo

A working example showing how to wire a project to this repo.

```text
sample-repo/
  CLAUDE.md              ← thin project playbook for Claude Code
  CODEX.md               ← thin project playbook for Codex
  README.md              ← explains the setup and how to adapt it to a new project
  docs/
    architecture.md      ← project stack, folder structure, technology constraints
    coding-standards.md  ← project-specific naming, patterns, quality bar
    testing-strategy.md  ← regression areas, golden examples, critical flows
    frontend.md          ← project frontend stack and conventions
    agents.md            ← agent/skill usage and project review focus
    work-instructions.md ← decision and work log
    security/
      advanced-security-spec.md
```

See `sample-repo/README.md` for setup instructions and how to use this with Claude, Codex, and Copilot CLI.

---

## How To Use This In Your Project

1. Clone or fork this repository (or copy `shared/` to a stable location on your machine)
2. Copy `sample-repo/` into your project as a starting point
3. Set `$AI` in `CLAUDE.md` to point to where `shared/` lives
4. Replace the contents of `docs/` with your project-specific documentation
5. Update the project summary and non-negotiable rules in `CLAUDE.md`

The `sample-repo/README.md` walks through each step in detail.
