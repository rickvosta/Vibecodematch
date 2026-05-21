# Clean Architecture And Strict Layering Standard

## Purpose

This standard defines a reusable strict layering approach for maintainable software systems.

The goal is to keep business logic independent from frameworks, vendors, databases, and delivery mechanisms.

## Core Principle

Dependencies point inward.

Outer layers may depend on inner layers. Inner layers must not depend on outer layers.

Typical layers:

```text
Interfaces / Delivery
Infrastructure / Adapters
Application / Use Cases
Domain
```

## Domain Layer

The domain layer contains core business concepts and rules.

May contain:
- entities
- value objects
- domain services
- domain events
- domain exceptions
- invariants

Must not depend on:
- web frameworks
- databases
- ORM models
- message brokers
- vendor SDKs
- HTTP schemas
- UI code
- environment/config loading

Domain code should be framework-independent and easy to test.

## Application Layer

The application layer orchestrates use cases.

May contain:
- use cases
- commands/queries
- DTOs
- application services
- ports/interfaces
- transaction boundaries where appropriate

Responsibilities:
- coordinate domain objects
- call ports
- enforce workflow/application rules
- translate use-case-level errors

Must not contain:
- HTTP route code
- SQL queries
- vendor SDK calls
- framework-specific request/response handling

## Infrastructure Layer

The infrastructure layer implements technical details.

May contain:
- database repositories
- ORM models/mappers
- external provider adapters
- email/SMS/payment clients
- message broker publishers/consumers
- filesystem/cloud storage adapters
- config loading
- clock/time provider implementation

Responsibilities:
- implement application ports
- map external/provider data to internal models
- isolate vendor quirks

Infrastructure may depend on application/domain. Application/domain must not depend on infrastructure.

## Interfaces / Delivery Layer

The interface layer handles communication with the outside world.

May contain:
- HTTP routes/controllers
- request/response schemas
- CLI commands
- UI-specific API adapters
- webhook handlers
- queue consumers as delivery mechanisms

Responsibilities:
- validate/parse external input
- call application use cases
- map results/errors to delivery format
- remain thin

Must not contain:
- business logic
- direct database access
- provider SDK calls
- complex orchestration that belongs in use cases

Rules for coded domain values:
  - External/provider/UI strings must be normalized at the boundary into canonical internal values.
  - Application/domain logic should use canonical enums/value objects/constants, not raw delivery-layer strings.
  - User-facing labels and translations belong in interface/UI layers, not in core business logic.


## Ports And Adapters

Use ports to abstract external dependencies.

Example:
- application defines `EmailSenderPort`
- infrastructure implements `SmtpEmailSender`

Use ports for:
- persistence
- messaging
- external APIs
- file storage
- authentication providers
- payment providers
- time/clock behavior if testability matters

## Provider / Vendor Boundary

For systems with external providers:

```text
Provider-specific adapter
→ Normalized internal model
→ Application/domain logic
→ API/UI
```

Rules:
- provider-specific names stay in adapter/infrastructure
- normalized models are the internal contract
- domain/application uses provider-neutral concepts
- UI may show provider/source metadata only when intentional

## Dependency Rules

Allowed:
- Interfaces → Application
- Infrastructure → Application / Domain
- Application → Domain
- Domain → nothing external

Not allowed:
- Domain → Infrastructure
- Domain → Framework
- Application → Vendor SDK
- Application → ORM model
- Interface → Repository directly, unless explicitly architectural and documented
- Frontend/UI → Domain database or provider payload

## Testing By Layer

- Domain tests: pure and fast
- Application tests: use fake ports
- Infrastructure tests: verify adapters/mappers
- Interface tests: verify request/response and wiring

## Common Violations

Reject:
- business logic in controllers
- SQL in route handlers
- ORM models returned from use cases as domain objects by accident
- vendor payloads passed into domain logic
- framework decorators in domain/application
- frontend recomputing canonical backend/domain rules
- “temporary” cross-layer imports without removal plan

## Refactoring Guidance

When code touches multiple concerns, split it.

Ask:
- Is this a business rule?
- Is this workflow orchestration?
- Is this technical integration?
- Is this delivery/presentation?

Place code accordingly.

## Review Checklist

Before accepting changes:

- Does dependency direction point inward?
- Are external vendors behind adapters?
- Are routes/controllers thin?
- Is persistence isolated?
- Is the domain framework-free?
- Are use cases testable with fake ports?
- Are normalized models used across provider boundaries?
