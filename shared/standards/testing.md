# Testing Standard

## Purpose

Tests should protect behavior, enable safe change, and document expectations.

## Core Principles

- Test behavior, not implementation.
- Prefer small focused tests.
- Add regression tests for bugs.
- Keep tests deterministic.
- Avoid unnecessary mocking.
- Use the right test level for the risk.
- Tests should make failures easy to understand.

## Test Levels

### Unit Tests

Use for:
- pure logic
- calculations
- validation
- mapping
- domain rules

Should be:
- fast
- deterministic
- independent of infrastructure

### Application / Use Case Tests

Use for:
- orchestration
- business workflows
- port interactions
- error handling

Use fakes/mocks for external dependencies.

### Integration Tests

Use for:
- database mappings
- repositories
- API contracts
- external adapter behavior when practical

### End-to-End / UI Tests

Use sparingly for:
- critical user journeys
- important integration flows
- smoke coverage

## Required Cases

For meaningful changes, test:

- happy path
- failure path
- missing data
- invalid data
- boundary values
- permissions/security where relevant
- regression case if fixing a bug

## Regression Tests

Every bug fix should include a test that fails before the fix and passes after the fix, unless impossible. If impossible, document why.

## Test Quality

Good tests:
- are readable
- have clear setup
- assert meaningful behavior
- avoid testing private implementation details
- do not depend on execution order
- do not require wall-clock timing unless controlled

Avoid:
- brittle snapshots
- broad tests with unclear failure cause
- excessive mocking of the unit under test
- tests that only assert that code runs
- assertions tied to incidental implementation details

## Time-Sensitive Tests

When testing time:
- freeze or inject time when possible
- avoid system-local assumptions
- avoid real sleeping/waiting
- assert timezone behavior explicitly when relevant

## Test Output Standard

When reporting tests, include:
- command run
- result
- failures if any
- untested areas or known gaps
