# AgentSpy

AgentSpy is an open-source, local-first audit and alerting tool for AI agents.

## What it does
- Receives agent events through a simple HTTP ingest API
- Normalizes heterogeneous framework events into a standard event model
- Evaluates deterministic rules for risk and cost anomalies
- Stores audit events and exposes timeline and alert views
- Sends notifications through channels such as Slack, Lark, Telegram, or email

## What it is not
- Not an agent runtime
- Not a general-purpose logging platform
- Not a vector search system
- Not an AI summarization layer

## Current status
This repository is in early architecture-first development.

## Planned apps
- `backend`: FastAPI backend
- `frontend`: React dashboard

## Repository structure
- `backend`: FastAPI backend
- `frontend`: React dashboard
- `docs`: architecture, product, and roadmap documents

## Development philosophy
- minimal viable architecture first
- document first
- small steps
- no over-engineering