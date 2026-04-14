# AgentSpy Backend

Minimal FastAPI backend skeleton.

## Run

```bash
cd backend
uv run uvicorn app.main:app --reload
```

## Verify

```bash
cd backend
uv run python -m compileall app
```

## Test Ingest

Start the server:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Send a single event:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "workspace_id": "workspace_local",
    "agent_id": "agent_browser",
    "event_id": "evt_001",
    "timestamp": "2026-04-14T09:15:00Z",
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

Expected response:

```json
{
  "success": true,
  "accepted": 1,
  "event_ids": ["evt_001"]
}
```

## Persistence

The backend uses a local SQLite database file at `backend/agentspy.db`.
Tables are created on application startup.

Query stored events manually:

```bash
cd backend
sqlite3 agentspy.db 'select id, workspace_id, agent_id, category, action, target from events;'
```

## Current scope

- FastAPI application shell
- Minimal ingest endpoint
- Minimal SQLite event persistence
- No queue, workers, or notifications
