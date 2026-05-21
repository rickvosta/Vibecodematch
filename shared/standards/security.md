# Security Standard

## Purpose

Security must be considered in all changes that touch data, users, authentication, authorization, external inputs, or destructive actions.

## Core Rules

- Never expose secrets.
- Authenticate users before protected actions.
- Authorize access to user-owned or tenant-owned resources.
- Validate external input.
- Treat client data as untrusted.
- Avoid unsafe defaults.
- Log safely.
- Fail closed when possible.

## Authentication

Check:
- password handling
- session/token expiry
- token storage
- reset flows
- account enumeration risks
- multi-factor/passkey implications where relevant

## Authorization

Every resource access must answer:

- who is the user?
- what resource are they accessing?
- do they own it or have permission?
- is this enforced server-side?

Reject:
- frontend-only authorization
- IDOR risks
- cross-user data leakage
- broad queries without ownership filters

## Secrets

Never:
- commit secrets
- log secrets
- send secrets to frontend
- expose tokens in error messages

Use:
- environment variables
- secret stores
- redaction in logs

## Input And Output Safety

Check:
- injection
- XSS
- unsafe deserialization
- path traversal
- unsafe redirects
- file upload handling
- HTML rendering
- markdown rendering
- CORS/cookie settings where relevant

## Destructive Actions

Destructive actions require:
- authentication
- authorization
- scoped target
- clear validation
- audit/logging if appropriate
- confirmation for high-risk operations

## Logging

Logs must not contain:
- passwords
- tokens
- secrets
- sensitive personal data unless explicitly required and protected

## Review Checklist

Before shipping security-sensitive changes, verify:
- tests exist for allowed and denied access
- invalid input is handled
- error messages are safe
- data ownership is enforced
- secrets are not exposed
- destructive actions are scoped

## Hard Blocks

Block release for:
- broken authorization
- token exposure
- plaintext secret handling
- injection vulnerability
- XSS vulnerability
- cross-user access
- unsafe destructive mutation
