# Time And Timezone Standard

## Purpose

Time bugs are common and expensive. Software must distinguish between calendar dates and instants.

## Two Concepts

### 1. Calendar Dates

Calendar dates represent user-facing day values.

Examples:
- today
- tomorrow
- this week
- billing date
- agenda date
- reporting day
- date-based sync window

Calendar dates must be evaluated in the intended application/user/business timezone, not accidentally in host/container local time.

### 2. Instants / Timestamps

Instants represent exact points in time.

Examples:
- created_at
- updated_at
- synced_at
- calculated_at
- recorded_at
- event timestamp

Persisted instants should be timezone-aware UTC.

## Rules

- Do not mix calendar-date logic with timestamp logic.
- Do not use implicit local timezone behavior.
- Do not persist naive datetimes.
- Do not use naive UTC in new code.
- Normalize legacy naive timestamps at boundaries.
- Serialize timestamps with timezone information.

## Calendar Date Rules

Use a project-approved helper or injected clock for “today”.

Avoid:
- direct system-local date calls
- hidden timezone assumptions
- date grouping based on server/container locale

## Timestamp Rules

Use timezone-aware UTC for persisted instants.

Avoid:
- naive UTC constructors that discard timezone information
- system-local time calls without explicit timezone argument
- stripping timezone info
- comparing timezone-naive and timezone-aware values

## Boundary Rules

Timezone normalization belongs at boundaries:

- time helper layer defines policy
- repositories normalize DB reads/writes
- application code consumes normalized values
- API serializes aware timestamps
- frontend renders according to product/user needs

## Legacy Compatibility

If old rows contain naive timestamps:
- treat them according to documented project policy
- normalize them before exposing to application/domain/API
- do not let naive values propagate

## Testing

Tests should cover:
- calendar date behavior in configured timezone
- persisted timestamps are aware UTC
- legacy naive timestamps normalize safely
- no naive/aware comparison errors
- age/staleness/window calculations

## Anti-Patterns

Reject:
- implicit local timezone assumptions
- naive persisted timestamps
- direct wall-clock calls in domain logic
- silent timezone stripping
- parsing ISO timestamps inconsistently across the codebase
