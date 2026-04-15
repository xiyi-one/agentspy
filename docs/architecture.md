# Architecture

## Core pipeline
ingest -> normalize -> enqueue/process -> rule evaluation -> persistence -> query -> notification

Current backend mode: ingest uses an in-process pipeline boundary. Events are submitted through a queue-ready interface, then processed immediately in the same process.

Current API mode: ingest returns `202 Accepted` with queued-style response semantics, even though processing still completes synchronously in the MVP.

Current auth mode: ingest requires `X-API-Key` and resolves workspace ownership from an in-memory key map. Database-backed hashed API keys are deferred.

Future backend mode: the same boundary can be backed by a queue and worker without changing the API route layer.

Current cost mode: cost summaries are computed at query time from persisted event rows that include normalized `cost` data.

Future cost mode: pre-aggregated cost tables or async workers may be added if scale requires them.

Current events API mode: `GET /api/v1/events` is the canonical read API for persisted audit events. It returns timeline-friendly event items with `summary_text` plus a `total` count for the applied filters.

## Main subsystems
- Ingest API
- Event normalization
- Rule engine
- Event storage
- Cost aggregation
- Alert generation
- Notification routing
- Dashboard query layer

## Key principles
- fast ingest path
- async-friendly design
- stable standard event schema
- raw payload preserved separately
- workspace isolation
- deterministic rule evaluation

## Storage strategy
- raw audit events
- aggregate cost buckets
- alert records
- rule definitions

## Frontend views
- Timeline
- Alerts
- Rules
- Costs
