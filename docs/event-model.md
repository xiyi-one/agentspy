# Standard Event Model

AgentSpy stores external agent framework events as a normalized event plus the original raw payload. The normalized fields provide a stable query and rules surface; the raw payload preserves source-specific details for auditability.

This model is internal to AgentSpy. API routes, database persistence, queues, workers, rules execution, and notifications are intentionally out of scope for this phase.

## Schema

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `workspace_id` | Yes | string | Workspace that owns the event. |
| `agent_id` | Yes | string | Agent that produced the event. |
| `run_id` | No | string or null | Logical run or trace identifier when the source provides one. |
| `event_id` | No | string or null | Stable event identifier when provided or generated later. |
| `timestamp` | Yes | datetime | Event occurrence time in ISO 8601 format. |
| `category` | Yes | string | Broad event category, such as `tool`, `model`, `file`, or `network`. |
| `action` | Yes | string | Specific action within the category, such as `call`, `read`, or `request`. |
| `target` | Yes | string | Resource or object the action operated on. |
| `status` | No | string or null | Optional result state, such as `success`, `error`, or `skipped`. |
| `cost` | No | object or null | Optional cost data for billable model or tool usage. |
| `metadata` | No | object or null | Optional normalized context that does not belong in first-class fields. |
| `raw_payload` | Yes | object | Original source payload before normalization. |

## Cost

`cost` is optional. When present, it should use stable normalized keys:

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `amount` | Yes | number | Numeric cost amount. |
| `currency` | Yes | string | Currency code, such as `USD`. |

Additional cost details should start in `metadata` or `raw_payload` until a stable cross-provider field is justified.

## Required Fields

The required top-level fields are:

- `workspace_id`
- `agent_id`
- `timestamp`
- `category`
- `action`
- `target`
- `raw_payload`

## Optional Fields

The optional top-level fields are:

- `run_id`
- `event_id`
- `status`
- `cost`
- `metadata`

## Separation Rules

- Normalized fields should be stable across agent frameworks.
- `raw_payload` must preserve the original inbound event shape.
- Source-specific fields should stay in `raw_payload` unless they are promoted into the normalized schema.
- `metadata` is for normalized auxiliary data only, not a copy of the raw payload.

## Examples

### Browser Navigate

```json
{
  "workspace_id": "workspace_local",
  "agent_id": "agent_browser",
  "run_id": "run_001",
  "event_id": "evt_001",
  "timestamp": "2026-04-14T09:15:00Z",
  "category": "browser",
  "action": "navigate",
  "target": "https://example.com",
  "status": "success",
  "metadata": {
    "method": "GET"
  },
  "raw_payload": {
    "type": "page.goto",
    "url": "https://example.com",
    "status": 200
  }
}
```

### File Read

```json
{
  "workspace_id": "workspace_local",
  "agent_id": "agent_coder",
  "run_id": "run_001",
  "timestamp": "2026-04-14T09:16:00Z",
  "category": "file",
  "action": "read",
  "target": "README.md",
  "status": "success",
  "metadata": {
    "bytes": 2048
  },
  "raw_payload": {
    "tool": "read_file",
    "path": "README.md",
    "byte_count": 2048
  }
}
```

### Email Send

```json
{
  "workspace_id": "workspace_local",
  "agent_id": "agent_support",
  "timestamp": "2026-04-14T09:17:00Z",
  "category": "email",
  "action": "send",
  "target": "user@example.com",
  "status": "success",
  "metadata": {
    "subject": "Follow up"
  },
  "raw_payload": {
    "provider": "smtp",
    "to": "user@example.com",
    "subject": "Follow up",
    "message_id": "msg_123"
  }
}
```

### LLM Completion

```json
{
  "workspace_id": "workspace_local",
  "agent_id": "agent_research",
  "run_id": "run_002",
  "timestamp": "2026-04-14T09:18:00Z",
  "category": "llm",
  "action": "completion",
  "target": "gpt-5.4",
  "status": "success",
  "cost": {
    "amount": 0.012,
    "currency": "USD"
  },
  "metadata": {
    "input_tokens": 1200,
    "output_tokens": 300
  },
  "raw_payload": {
    "model": "gpt-5.4",
    "usage": {
      "prompt_tokens": 1200,
      "completion_tokens": 300
    }
  }
}
```

### Task Finish

```json
{
  "workspace_id": "workspace_local",
  "agent_id": "agent_coder",
  "run_id": "run_003",
  "timestamp": "2026-04-14T09:19:00Z",
  "category": "task",
  "action": "finish",
  "target": "standard_event_model",
  "status": "success",
  "metadata": {
    "duration_ms": 42000
  },
  "raw_payload": {
    "event": "task.completed",
    "task": "standard_event_model",
    "duration_ms": 42000
  }
}
```
