# Architecture Rules

## Layering
- `app/` (Server & Client Components, Route Handlers) → `lib/` (Auth, Rate Limit, DB connection, Utils) → `models/` (Mongoose Schemas & Models) → MongoDB
- Dependencies point in one direction only: Route Handlers and Server Actions call service/lib functions and models. Models never import from `app/`.
- Business logic, key hashing, JWT verification, and input validation live in server-side libraries/handlers (`lib/`, route handlers), never in React Client Components and never in the database layer.

## What requires an ADR before implementation
Write a short ADR (`docs/adr/`, use `0000-template.md`) *before* coding when
a task involves any of:
- A new external dependency (library, service, SaaS integration).
- A new architectural pattern not already used elsewhere in the codebase
  (new state management approach, new caching strategy, new messaging
  pattern, etc.).
- A change to a public API contract or database schema that other
  consumers depend on.
- Introducing a new cross-cutting concern (auth strategy, logging strategy,
  error-handling strategy).

If unsure whether something crosses this bar, write the ADR anyway — it's a
few minutes and it's cheap insurance against inconsistent patterns
accumulating across sessions/agents.

## Consistency over novelty
If two ways of solving a problem are roughly equivalent, use the pattern
already established elsewhere in this codebase, even if a different pattern
is marginally more elegant in isolation. Introducing a second way to do the
same thing is a cost, not a stylistic choice — flag it in the Task List
artifact if you think the existing pattern should change, don't just
diverge from it silently.

## Forbidden patterns
- No plaintext group keys stored or transmitted in responses.
- No direct database operations or secret usage inside Client Components (`"use client"`).
- No unvalidated user input sent directly to Mongoose queries (avoid NoSQL injection).
- No unbounded text/file uploads (enforce 200KB code size cap and title length limits server-side).
- No un-sanitized HTML rendering of user code or descriptions without XSS protection.
