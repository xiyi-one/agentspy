# AGENTS.md

## Project
AgentSpy is an open-source, local-first auditing and alerting layer for AI agents.

It ingests lightweight HTTP events from different agent frameworks, normalizes them into a standard event model, evaluates rules, stores audit records, aggregates cost data, and exposes query APIs for a web dashboard.

## Product goals
- 5-minute integration for developers
- Human-readable event timeline
- Rules-based security and cost alerts
- Local-first and self-hostable architecture
- Clear separation between ingest, processing, storage, and notifications

## Non-goals for v1
- No AI-generated summaries
- No vector database
- No complex RBAC
- No distributed microservices
- No hard dependency on Redis/Timescale in the first implementation
- No over-engineering

## Monorepo structure
- `backend`: FastAPI backend
- `frontend`: React frontend
- `docs`: architecture and product docs
- future shared packages may be added later only if needed

## Tech stack
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic
- Frontend: React, TypeScript, Vite
- Database: SQLite for local dev, PostgreSQL-compatible design for production
- Queue: abstract interface first; do not lock implementation too early

## Core domain objects
- Workspace
- APIKey
- Agent
- Run
- Event
- Rule
- Alert
- NotificationChannel

## System principles
- Keep the ingest path fast and simple
- Prefer explicit interfaces over hidden magic
- Normalize external events into a stable internal schema
- Keep raw payload and normalized event separate
- Prefer small, reviewable changes
- Prefer document-first development for new subsystems

## Rules for Codex
- Always propose a short implementation plan before changing files
- Make minimal, high-confidence changes
- Do not introduce major dependencies unless explicitly asked
- Do not implement multiple subsystems in one step
- Do not silently refactor unrelated files
- If architecture is unclear, update docs before implementing code
- Prefer stubs and interfaces over speculative full implementations

## Coding constraints
- Keep code readable and modular
- Add type hints where applicable
- Avoid premature abstraction
- Do not add background jobs, Redis, or external services unless the current task requires them
- Do not build full authentication flows in early iterations

## Validation
For each task:
- explain what changed
- explain how to run it
- explain how to verify it
- include any limitations or TODOs

## Initial implementation order
1. repository skeleton
2. backend app skeleton
3. frontend app skeleton
4. standard event model
5. ingest API
6. event persistence
7. timeline query API
8. rule schema
9. basic alert flow
10. dashboard pages with mock data, then real API wiring

## Implementation priority

Backend development is the only priority in the current phase.

The system should be built in this strict order:

1. backend project structure
2. standard event model
3. ingest API
4. event persistence
5. timeline query API
6. rule schema (not execution yet)

Frontend must NOT be implemented at this stage.

## Frontend rules (important)

- Do NOT create React components
- Do NOT scaffold UI frameworks
- Do NOT add frontend dependencies
- Do NOT implement dashboard pages

The `frontend` directory may exist as a placeholder only, but must remain empty or minimal.

If a task requires UI, provide mock data or API responses instead.

## Repository structure (strict)

The repository must use this exact top-level structure:

- `backend`: FastAPI backend
- `frontend`: React dashboard placeholder
- `docs`: project documentation

Do NOT use:
- `apps/api`
- `apps/web`
- `packages/*`

unless explicitly requested later.

## Current phase priority

Only `backend` should be actively developed now.

`frontend` must remain placeholder-only in the current phase.

## Python environment (strict)

The backend must use `uv` for dependency management and virtual environments.

Rules:
- Always use `uv` for installing and running dependencies
- Do NOT use pip directly
- Do NOT create requirements.txt
- Do NOT introduce poetry or pipenv
- Use `pyproject.toml` as the single source of truth

All run instructions must use uv commands.