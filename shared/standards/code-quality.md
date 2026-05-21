# Code Quality Standard

## Purpose

This standard defines reusable expectations for readable, maintainable software across projects.

## Priorities

1. Correctness
2. Readability
3. Maintainability
4. Testability
5. Performance
6. Cleverness, only when justified

## Core Rules

- Prefer simple, explicit code.
- Use clear names that reveal intent.
- Keep functions small and focused.
- Keep modules/classes cohesive.
- Avoid hidden side effects.
- Avoid large “god” services.
- Avoid speculative abstractions.
- Prefer composition over deep inheritance.
- Remove duplication when it clarifies behavior.
- Keep public interfaces stable and intentional.

## Naming

Good names describe domain intent.

Prefer:
- `customer_invoice`
- `normalized_activity`
- `calculate_threshold`
- `build_response`

Avoid:
- `data`
- `payload`
- `res`
- `obj`
- `handle_stuff`
- `process`

Generic names are acceptable only in tiny local scopes.

## Comments And Documentation

Comments should explain **why**, not restate **what**.

Use comments/docstrings for:
- non-obvious rules
- business constraints
- tradeoffs
- formulas
- edge cases
- compatibility behavior

Avoid:
- comments that mirror code
- outdated comments
- large blocks of prose inside simple functions

## Function Design

A good function:
- has one clear responsibility
- has a descriptive name
- accepts explicit inputs
- returns explicit outputs
- is easy to test
- avoids mutating hidden state

Refactor when a function:
- has deeply nested branches
- mixes validation, transformation, persistence, and presentation
- needs many unrelated parameters
- is hard to name clearly

## Complexity

Complexity is allowed only when the domain requires it.

When complexity is necessary:
- isolate it
- name it clearly
- document the reason
- test it directly

## Anti-Patterns

Reject:
- clever code that future maintainers cannot understand
- broad refactors mixed with behavior changes
- duplicated mapping logic spread across files
- silent fallbacks that hide errors
- feature work without tests
- large services with unclear boundaries


 ## Canonical Domain Vocabulary

  Do not spread domain control flow across raw string literals.

  Prefer:
  - enums, value objects, or centralized typed constants for domain-coded values
  - one canonical vocabulary module per domain area when values are reused across files
  - parsing/normalization at the system boundary
  - internal canonical values in application/domain logic
  - separate user-facing labels from internal values

  Rules:
  - Normalize legacy or external string inputs at the boundary.
  - Do not let raw request/provider/UI strings leak deep into business logic.
  - Do not duplicate the same mapping sets across multiple files.
  - Do not use display text as business logic keys.
  - Frontend forms should use shared option/config definitions rather than inline repeated literals.
  - If localization is possible later, keep internal codes stable and keep labels/translations separate.

  Refactor when:
  - the same string values are compared in multiple modules
  - business logic depends on UI labels
  - old and new values are mapped ad hoc in many places
  - explanation text is acting as a logic contract

## Service Documentation

Non-trivial services and modules should document:

- what they are responsible for
- what layer they belong to
- what inputs they consume
- what outputs they produce
- what they must not do
- any non-obvious rules, formulas, or tradeoffs

This matters most for services with complex logic, multiple callers, or unclear boundaries. Without it, future maintainers — human or AI — cannot safely change the code.

## Agent-Generated Code Quality Bar

Code produced by AI agents must meet the same quality bar as hand-written code.

Reject agent-generated code that is:

- undocumented and complex
- difficult to trace or follow
- full of generic variable names
- missing tests for meaningful behavior
- hiding architectural coupling
- adding abstractions without a clear current need
- silently swallowing errors
- using raw strings instead of typed constants or enums for domain values
- exceeding a cyclomatic complexity of 15 in modified or newly created functions

When agent-generated code works but is hard to maintain, apply the `refactor-for-maintainability` skill before accepting it.