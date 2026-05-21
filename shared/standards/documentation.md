# Documentation Standard

## Purpose

Documentation should make the system easier to understand, change, and review.

## Core Principles

- Keep docs accurate.
- Keep docs concise.
- Document decisions and boundaries.
- Prefer actionable rules over long prose.
- Avoid duplication.
- Update docs when architecture or behavior changes.
- Optimize for humans and AI agents.

## What To Document

Document:
- architecture and boundaries
- data flows
- public API contracts
- domain concepts
- non-obvious decisions
- security-sensitive behavior
- operational procedures
- testing strategy
- migration/backfill procedures

Do not document:
- obvious implementation details
- temporary thoughts without decision value
- duplicated content from code unless it explains intent

## Documentation Types

### Architecture Docs

Should answer:
- what are the layers?
- what depends on what?
- where does each responsibility live?
- what is prohibited?

### Decision Records

Should answer:
- what was decided?
- why?
- alternatives considered?
- consequences?

### Testing Docs

Should answer:
- what must be tested?
- how?
- which regression areas matter?

### Domain Docs

Should answer:
- what concepts exist?
- what do they mean?
- how are they calculated or interpreted?
- what are known limitations?

## Style

Prefer:
- short sections
- bullets for rules
- examples for tricky ideas
- explicit “do / do not” lists

Avoid:
- long essays
- duplicated instructions across many files
- stale diagrams
- ambiguous “should probably” language for hard rules

## Maintenance Rules

When changing architecture:
- update architecture docs
- update decision logs if a decision changed
- update testing docs if test expectations changed
- update agent/project playbooks if workflow changed

## Anti-Patterns

Reject:
- docs that contradict code without noting intended direction
- docs that hide hard rules in paragraphs
- huge files that agents cannot quickly parse
- documenting aspirational architecture without migration notes
