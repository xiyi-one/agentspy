# AgentSpy Backend

## 1. Project Overview

AgentSpy backend is the MVP FastAPI service for ingesting agent events, storing audit records, evaluating stateless rules, creating stored alerts, exposing cost summaries, and returning timeline-friendly event data. The current implementation is queue-ready in API shape, but processing still runs synchronously in-process.

## 2. Tech Stack

- FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- uv

## 3. Setup & Run

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
uv run uvicorn app.main:app --reload
```

Verify imports and syntax:

```bash
cd backend
uv run python -m compileall app
```

The SQLite database file is created at `backend/agentspy.db` when the app starts.

## 4. API Overview

- `POST /api/v1/ingest`: accept one event or a list of events for ingestion.
- `GET /api/v1/events`: list persisted audit events with timeline summaries.
- `GET /api/v1/alerts`: list stored alerts.
- `GET /api/v1/rules`: list stateless rule definitions.
- `POST /api/v1/rules`: create a stateless rule definition.
- `GET /api/v1/cost/summary`: return total cost for a workspace over a time range.
- `GET /api/v1/cost/daily`: return daily cost buckets for a workspace.

## 5. Ingest API

`POST /api/v1/ingest` requires `X-API-Key`.

Current in-memory API key mapping:

```text
test_key_123 -> ws_demo
```

The API resolves `workspace_id` from the API key. If the request body omits `workspace_id`, the backend fills it with the resolved workspace. If the request body includes a conflicting `workspace_id`, the request fails.

Successful ingest returns `202 Accepted` with queued-style semantics:

```json
{
  "received": 1,
  "status": "queued",
  "message": "Events accepted for processing.",
  "event_ids": ["evt_001"]
}
```

The response is queue-ready, but events are still processed synchronously in-process: persisted to SQLite, evaluated against enabled rules, and used to create stored alerts when rules match.

### Success Example

```bash
curl -i -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'X-API-Key: test_key_123' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "agent_browser",
    "event_id": "evt_001",
    "timestamp": "2026-04-15T03:00:00Z",
    "category": "browser",
    "action": "navigate",
    "target": {
      "type": "url",
      "value": "https://example.com"
    },
    "status": "success",
    "raw_payload": {
      "type": "page.goto",
      "url": "https://example.com"
    }
  }'
```

Expected status: `202 Accepted`.

### Missing API Key Example

```bash
curl -i -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "agent_browser",
    "timestamp": "2026-04-15T03:00:00Z",
    "category": "browser",
    "action": "navigate",
    "target": {
      "type": "url",
      "value": "https://example.com"
    },
    "raw_payload": {
      "type": "page.goto"
    }
  }'
```

Expected status: `401 Unauthorized`.

Expected response:

```json
{
  "detail": "Missing X-API-Key header."
}
```

## 6. Events API

`GET /api/v1/events` returns persisted audit events in reverse chronological order.

Supported query parameters:

- `workspace_id`: required
- `agent_id`: optional
- `run_id`: optional
- `limit`: optional
- `offset`: optional

Response shape:

```json
{
  "events": [
    {
      "id": 1,
      "workspace_id": "ws_demo",
      "agent_id": "agent_browser",
      "run_id": null,
      "event_id": "evt_001",
      "timestamp": "2026-04-15T03:00:00",
      "category": "browser",
      "action": "navigate",
      "target": {
        "type": "url",
        "value": "https://example.com"
      },
      "status": "success",
      "cost": null,
      "metadata": null,
      "summary_text": "Opened https://example.com"
    }
  ],
  "total": 1
}
```

`total` is the count of all matching events before `limit` and `offset` are applied.

Example:

```bash
curl 'http://127.0.0.1:8000/api/v1/events?workspace_id=ws_demo&limit=10&offset=0'
```

## 7. Rules API

Rules are deterministic, stateless checks evaluated against normalized events during ingest.

`GET /api/v1/rules` supports optional `workspace_id` filtering.

```bash
curl 'http://127.0.0.1:8000/api/v1/rules?workspace_id=ws_demo'
```

`POST /api/v1/rules` creates an MVP-style stateless rule. The preferred condition fields are:

- `condition_category`: exact match against `event.category`
- `condition_action`: exact match against `event.action`
- `condition_target_contains`: substring match against `event.target.value`
- `condition_cost_threshold`: numeric greater-than match against `event.cost.amount`

Example file-read rule:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/rules \
  -H 'Content-Type: application/json' \
  -d '{
    "workspace_id": "ws_demo",
    "name": "Detect .env file read",
    "enabled": true,
    "severity": "high",
    "rule_type": "stateless",
    "condition_category": "file",
    "condition_action": "read",
    "condition_target_contains": ".env",
    "actions": [
      {
        "type": "create_alert"
      }
    ]
  }'
```

Example high-cost rule:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/rules \
  -H 'Content-Type: application/json' \
  -d '{
    "workspace_id": "ws_demo",
    "name": "High LLM cost",
    "enabled": true,
    "severity": "medium",
    "rule_type": "stateless",
    "condition_category": "llm",
    "condition_cost_threshold": 1.0,
    "actions": [
      {
        "type": "create_alert"
      }
    ]
  }'
```

Current matching is limited to stateless `eq`, `contains`, and `gt` equivalent behavior. Generic structured `conditions` also exist for future extensibility, but the explicit `condition_*` fields are the preferred MVP format.

## 8. Alerts API

`GET /api/v1/alerts` lists stored alerts in reverse chronological order.

Supported query parameters:

- `workspace_id`: optional
- `agent_id`: optional
- `run_id`: optional
- `severity`: optional
- `status`: optional
- `limit`: optional

Example:

```bash
curl 'http://127.0.0.1:8000/api/v1/alerts?workspace_id=ws_demo&limit=10'
```

Alerts are created when ingest evaluates enabled rules and an event matches. Alert notification dispatch, deduplication, escalation, and resolve/update endpoints are not implemented yet.

## 9. Cost API

Cost APIs compute values from persisted events that include normalized `cost` data. There are no cost aggregation tables yet.

### Cost Summary

`GET /api/v1/cost/summary` supports:

- `workspace_id`: required
- `agent_id`: optional
- `period`: optional, one of `today`, `week`, or `month`; default is `today`
- `start_date`: optional, `YYYY-MM-DD`
- `end_date`: optional, `YYYY-MM-DD`

If `start_date` or `end_date` is provided, explicit dates override `period`.

Example:

```bash
curl 'http://127.0.0.1:8000/api/v1/cost/summary?workspace_id=ws_demo&period=today'
```

Current response shape:

```json
{
  "workspace_id": "ws_demo",
  "agent_id": null,
  "start_date": "2026-04-15",
  "end_date": "2026-04-15",
  "total_amount": 0.012,
  "currency": "USD",
  "provider_breakdown": [],
  "agent_breakdown": [
    {
      "key": "agent_research",
      "total_amount": 0.012,
      "currency": "USD"
    }
  ]
}
```

### Daily Cost

`GET /api/v1/cost/daily` supports:

- `workspace_id`: required
- `agent_id`: optional
- `start_date`: optional, `YYYY-MM-DD`
- `end_date`: optional, `YYYY-MM-DD`
- `limit`: optional

Example:

```bash
curl 'http://127.0.0.1:8000/api/v1/cost/daily?workspace_id=ws_demo&start_date=2026-04-15&end_date=2026-04-15'
```

Current response shape:

```json
{
  "workspace_id": "ws_demo",
  "agent_id": null,
  "start_date": "2026-04-15",
  "end_date": "2026-04-15",
  "items": [
    {
      "date": "2026-04-15",
      "total_amount": 0.012,
      "currency": "USD"
    }
  ]
}
```

## 10. Current Architecture (MVP)

Current execution uses a synchronous in-process pipeline:

- API receives and validates events.
- Ingest service submits events to an internal pipeline boundary.
- The in-process pipeline persists events immediately.
- Enabled rules for the event workspace are evaluated immediately.
- Matching rules create stored alert records immediately.

Future architecture may replace the in-process pipeline with a queue and worker. The API is queue-ready, but execution is synchronous in the current MVP.

## 11. Limitations

- No Redis or external queue yet.
- No async workers.
- No alert notifications.
- No alert deduplication or escalation.
- No rule DSL, regex, sequence rules, or windowed rules.
- No advanced rule operators beyond current stateless matching.
- No cost pre-aggregation tables.
- No TimescaleDB-specific features.
- API keys are stored in an in-memory mapping.
- No database-backed API key management.
- No frontend implementation in the current backend phase.

## 12. Development Notes

- Follow `AGENTS.md` for Codex tasks.
- Keep changes minimal and incremental.
- Do not introduce heavy abstractions without a specific implementation need.
- Do not describe future features as implemented.
- Keep backend behavior and documentation aligned after API changes.
