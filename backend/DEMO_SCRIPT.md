# AgentSpy End-to-End Demo Script

## 1. Demo Introduction

This demo shows AgentSpy tracking a realistic Customer Support Agent session end to end. The agent browses an internal admin panel, accidentally reads a sensitive `.env` file, sends a customer email, and uses an LLM to generate a response. AgentSpy records the behavior timeline, detects the sensitive file access through a stateless rule, creates a stored alert, and reports LLM cost from the ingested event data.

Talk track:

- "AgentSpy is a lightweight HTTP auditing layer for AI agents."
- "In this walkthrough, every agent action is sent as a simple event."
- "We will see normal behavior, a sensitive action, alert creation, and cost tracking."
- "The current MVP returns queue-style ingest responses, but processing is synchronous in-process."

## 2. System Setup

Start the backend:

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
uv run uvicorn app.main:app --reload
```

For a clean screen recording, use a fresh SQLite database before starting the server:

```bash
cd backend
rm -f agentspy.db
uv run uvicorn app.main:app --reload
```

MVP API key used in this demo:

```text
test_key_123 -> ws_demo
```

The ingest API resolves `workspace_id` from `X-API-Key`, so the event payloads below intentionally omit `workspace_id`.

## 3. Demo Dataset

### Event 1: Normal Browser Navigation

Talk track:

- "First, the Customer Support Agent opens the internal admin panel."
- "This is normal behavior, so we expect an audit event but no alert."

```json
{
  "agent_id": "customer-support-agent",
  "run_id": "support-run-20260415-0930",
  "event_id": "demo_evt_001_admin_open",
  "timestamp": "2026-04-15T09:30:00Z",
  "category": "browser",
  "action": "navigate",
  "target": {
    "type": "url",
    "value": "https://admin.example.local/customers/1842"
  },
  "status": "success",
  "metadata": {
    "page": "customer_profile",
    "customer_id": "1842"
  },
  "raw_payload": {
    "source": "browser-use",
    "event": "page.goto",
    "url": "https://admin.example.local/customers/1842"
  }
}
```

### Event 2: Sensitive File Read

Talk track:

- "Next, the agent reads a local `.env` file while trying to inspect configuration."
- "This is the anomaly we want AgentSpy to catch."
- "The rule we create will match `file.read` events where the target contains `.env`."

```json
{
  "agent_id": "customer-support-agent",
  "run_id": "support-run-20260415-0930",
  "event_id": "demo_evt_002_env_read",
  "timestamp": "2026-04-15T09:31:00Z",
  "category": "file",
  "action": "read",
  "target": {
    "type": "file_path",
    "value": "/srv/customer-support/.env"
  },
  "status": "success",
  "metadata": {
    "bytes": 512,
    "reason": "inspect runtime configuration"
  },
  "raw_payload": {
    "source": "agent-toolkit",
    "tool": "read_file",
    "path": "/srv/customer-support/.env",
    "byte_count": 512
  }
}
```

### Event 3: External Email Send

Talk track:

- "The agent then sends a support email to the customer."
- "This is an external action we want in the audit trail, even though it is not suspicious in this scenario."

```json
{
  "agent_id": "customer-support-agent",
  "run_id": "support-run-20260415-0930",
  "event_id": "demo_evt_003_email_send",
  "timestamp": "2026-04-15T09:32:00Z",
  "category": "email",
  "action": "send",
  "target": {
    "type": "email_address",
    "value": "customer1842@example.com"
  },
  "status": "success",
  "metadata": {
    "subject": "Follow-up on your support request",
    "provider": "smtp"
  },
  "raw_payload": {
    "source": "support-agent",
    "provider": "smtp",
    "to": "customer1842@example.com",
    "subject": "Follow-up on your support request",
    "message_id": "msg_demo_1842"
  }
}
```

### Event 4: LLM Completion With Cost

Talk track:

- "Finally, the agent asks an LLM to generate the response text."
- "AgentSpy does not calculate pricing yet; it stores normalized cost sent by the caller and reports it through cost APIs."

```json
{
  "agent_id": "customer-support-agent",
  "run_id": "support-run-20260415-0930",
  "event_id": "demo_evt_004_llm_completion",
  "timestamp": "2026-04-15T09:33:00Z",
  "category": "llm",
  "action": "completion",
  "target": {
    "type": "model",
    "value": "gpt-5.4-mini"
  },
  "status": "success",
  "cost": {
    "amount": 0.0185,
    "currency": "USD"
  },
  "metadata": {
    "provider": "openai",
    "model": "gpt-5.4-mini",
    "input_tokens": 1800,
    "output_tokens": 420
  },
  "raw_payload": {
    "source": "llm-client",
    "model": "gpt-5.4-mini",
    "usage": {
      "input_tokens": 1800,
      "output_tokens": 420
    }
  }
}
```

## 4. Step-by-Step Walkthrough

### Step 1: Create the Sensitive File Rule

Talk track:

- "Before ingesting events, we create a simple stateless rule."
- "The rule says: if an event is `file.read` and the target contains `.env`, create a high-severity alert."
- "This is declarative matching, not a scripting DSL."

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/rules \
  -H 'Content-Type: application/json' \
  -d '{
    "workspace_id": "ws_demo",
    "name": "Sensitive .env file read",
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

Expected response shape:

```json
{
  "id": 1,
  "workspace_id": "ws_demo",
  "name": "Sensitive .env file read",
  "enabled": true,
  "severity": "high",
  "rule_type": "stateless",
  "condition_category": "file",
  "condition_action": "read",
  "condition_target_contains": ".env",
  "condition_cost_threshold": null,
  "conditions": null,
  "actions": [
    {
      "type": "create_alert",
      "params": null
    }
  ],
  "created_at": "<generated timestamp>",
  "updated_at": "<generated timestamp>"
}
```

### Step 2: Ingest Event 1, Normal Navigation

Talk track:

- "Now we simulate normal browser activity."
- "The event is accepted and persisted, but it should not match the sensitive file rule."

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'X-API-Key: test_key_123' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "customer-support-agent",
    "run_id": "support-run-20260415-0930",
    "event_id": "demo_evt_001_admin_open",
    "timestamp": "2026-04-15T09:30:00Z",
    "category": "browser",
    "action": "navigate",
    "target": {
      "type": "url",
      "value": "https://admin.example.local/customers/1842"
    },
    "status": "success",
    "metadata": {
      "page": "customer_profile",
      "customer_id": "1842"
    },
    "raw_payload": {
      "source": "browser-use",
      "event": "page.goto",
      "url": "https://admin.example.local/customers/1842"
    }
  }'
```

Expected response:

```json
{
  "received": 1,
  "status": "queued",
  "message": "Events accepted for processing.",
  "event_ids": ["demo_evt_001_admin_open"]
}
```

### Step 3: Ingest Event 2, Sensitive `.env` Read

Talk track:

- "Now we simulate the sensitive action."
- "The event is still accepted like any other audit event."
- "Internally, the rule engine matches it and creates a stored alert."

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'X-API-Key: test_key_123' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "customer-support-agent",
    "run_id": "support-run-20260415-0930",
    "event_id": "demo_evt_002_env_read",
    "timestamp": "2026-04-15T09:31:00Z",
    "category": "file",
    "action": "read",
    "target": {
      "type": "file_path",
      "value": "/srv/customer-support/.env"
    },
    "status": "success",
    "metadata": {
      "bytes": 512,
      "reason": "inspect runtime configuration"
    },
    "raw_payload": {
      "source": "agent-toolkit",
      "tool": "read_file",
      "path": "/srv/customer-support/.env",
      "byte_count": 512
    }
  }'
```

Expected response:

```json
{
  "received": 1,
  "status": "queued",
  "message": "Events accepted for processing.",
  "event_ids": ["demo_evt_002_env_read"]
}
```

### Step 4: Ingest Event 3, Email Send

Talk track:

- "The next action is an email send."
- "This shows AgentSpy can capture external side effects, not just browser or LLM events."

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'X-API-Key: test_key_123' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "customer-support-agent",
    "run_id": "support-run-20260415-0930",
    "event_id": "demo_evt_003_email_send",
    "timestamp": "2026-04-15T09:32:00Z",
    "category": "email",
    "action": "send",
    "target": {
      "type": "email_address",
      "value": "customer1842@example.com"
    },
    "status": "success",
    "metadata": {
      "subject": "Follow-up on your support request",
      "provider": "smtp"
    },
    "raw_payload": {
      "source": "support-agent",
      "provider": "smtp",
      "to": "customer1842@example.com",
      "subject": "Follow-up on your support request",
      "message_id": "msg_demo_1842"
    }
  }'
```

Expected response:

```json
{
  "received": 1,
  "status": "queued",
  "message": "Events accepted for processing.",
  "event_ids": ["demo_evt_003_email_send"]
}
```

### Step 5: Ingest Event 4, LLM Completion With Cost

Talk track:

- "Finally, the agent uses an LLM to draft the customer response."
- "The event includes normalized cost, so AgentSpy can report spend without a pricing integration."

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/ingest \
  -H 'X-API-Key: test_key_123' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "customer-support-agent",
    "run_id": "support-run-20260415-0930",
    "event_id": "demo_evt_004_llm_completion",
    "timestamp": "2026-04-15T09:33:00Z",
    "category": "llm",
    "action": "completion",
    "target": {
      "type": "model",
      "value": "gpt-5.4-mini"
    },
    "status": "success",
    "cost": {
      "amount": 0.0185,
      "currency": "USD"
    },
    "metadata": {
      "provider": "openai",
      "model": "gpt-5.4-mini",
      "input_tokens": 1800,
      "output_tokens": 420
    },
    "raw_payload": {
      "source": "llm-client",
      "model": "gpt-5.4-mini",
      "usage": {
        "input_tokens": 1800,
        "output_tokens": 420
      }
    }
  }'
```

Expected response:

```json
{
  "received": 1,
  "status": "queued",
  "message": "Events accepted for processing.",
  "event_ids": ["demo_evt_004_llm_completion"]
}
```

## 5. Query the Demo Results

### Query Events

Talk track:

- "Now we inspect the audit timeline."
- "The API returns canonical persisted events plus `summary_text`, which is useful for timeline-style display."
- "Events are ordered newest first."

```bash
curl -s 'http://127.0.0.1:8000/api/v1/events?workspace_id=ws_demo&run_id=support-run-20260415-0930&limit=10&offset=0'
```

Expected response shape:

```json
{
  "events": [
    {
      "id": 4,
      "workspace_id": "ws_demo",
      "agent_id": "customer-support-agent",
      "run_id": "support-run-20260415-0930",
      "event_id": "demo_evt_004_llm_completion",
      "timestamp": "2026-04-15T09:33:00",
      "category": "llm",
      "action": "completion",
      "target": {
        "type": "model",
        "value": "gpt-5.4-mini"
      },
      "status": "success",
      "cost": {
        "amount": 0.0185,
        "currency": "USD"
      },
      "metadata": {
        "provider": "openai",
        "model": "gpt-5.4-mini",
        "input_tokens": 1800,
        "output_tokens": 420
      },
      "summary_text": "llm.completion"
    }
  ],
  "total": 4
}
```

Notes:

- The response contains all four events; the snippet above shows the newest event.
- Database `id` values may differ if the database is not fresh.
- Browser, file, and email events get more specific summaries from the current summarizer.

### Query Alerts

Talk track:

- "Now we query alerts."
- "Only the `.env` file read should have created an alert."
- "There is no notification dispatch in the MVP; alerts are stored records."

```bash
curl -s 'http://127.0.0.1:8000/api/v1/alerts?workspace_id=ws_demo&run_id=support-run-20260415-0930&limit=10'
```

Expected response shape:

```json
[
  {
    "id": 1,
    "workspace_id": "ws_demo",
    "agent_id": "customer-support-agent",
    "run_id": "support-run-20260415-0930",
    "event_id": "demo_evt_002_env_read",
    "rule_id": 1,
    "severity": "high",
    "status": "open",
    "title": "Sensitive .env file read",
    "description": "Event demo_evt_002_env_read matched rule Sensitive .env file read.",
    "evidence": {
      "conditions": [
        {
          "field": "category",
          "operator": "eq",
          "expected": "file",
          "actual": "file"
        },
        {
          "field": "action",
          "operator": "eq",
          "expected": "read",
          "actual": "read"
        },
        {
          "field": "target.value",
          "operator": "contains",
          "expected": ".env",
          "actual": "/srv/customer-support/.env"
        }
      ]
    },
    "created_at": "<generated timestamp>",
    "resolved_at": null
  }
]
```

### Query Cost Summary

Talk track:

- "Now we inspect cost transparency."
- "AgentSpy sums normalized cost data directly from persisted events."
- "There are no aggregation tables in the current MVP."

```bash
curl -s 'http://127.0.0.1:8000/api/v1/cost/summary?workspace_id=ws_demo&agent_id=customer-support-agent&start_date=2026-04-15&end_date=2026-04-15'
```

Expected response shape:

```json
{
  "workspace_id": "ws_demo",
  "agent_id": "customer-support-agent",
  "start_date": "2026-04-15",
  "end_date": "2026-04-15",
  "total_amount": 0.0185,
  "currency": "USD",
  "provider_breakdown": [
    {
      "key": "openai",
      "total_amount": 0.0185,
      "currency": "USD"
    }
  ],
  "agent_breakdown": [
    {
      "key": "customer-support-agent",
      "total_amount": 0.0185,
      "currency": "USD"
    }
  ]
}
```

### Query Daily Cost

Talk track:

- "The daily cost endpoint gives a simple bucketed view for reporting."
- "This is query-time aggregation from events, not a background cost pipeline."

```bash
curl -s 'http://127.0.0.1:8000/api/v1/cost/daily?workspace_id=ws_demo&agent_id=customer-support-agent&start_date=2026-04-15&end_date=2026-04-15'
```

Expected response shape:

```json
{
  "workspace_id": "ws_demo",
  "agent_id": "customer-support-agent",
  "start_date": "2026-04-15",
  "end_date": "2026-04-15",
  "items": [
    {
      "date": "2026-04-15",
      "total_amount": 0.0185,
      "currency": "USD"
    }
  ]
}
```

## 6. Timeline-Style Output

For narration, the resulting timeline can be described as:

```text
09:30 Opened https://admin.example.local/customers/1842
09:31 Read file /srv/customer-support/.env  [alert: high]
09:32 Sent email to customer1842@example.com
09:33 llm.completion  [$0.0185]
```

Talk track:

- "This timeline gives developers and operators a readable audit trail for agent behavior."
- "The sensitive file read is visible in context, not as an isolated alert."
- "The LLM event keeps cost attached to the behavior that caused it."

## 7. Demo Highlights

- Full agent visibility: browser, file, email, and LLM events are captured through one HTTP ingest API.
- Anomaly detection: a stateless rule detects the `.env` file read and creates a stored alert.
- Cost transparency: LLM cost is persisted on the event and summarized by the cost APIs.
- Simple integration: the agent only needs to send normalized HTTP events with `X-API-Key`.
- Local-first MVP: data is stored in local SQLite, with no cloud service required.

## 8. What This Demo Does Not Show

- No frontend UI is included in this backend-only demo.
- No Redis or external queue is running.
- No async worker is running.
- No alert notifications are sent.
- No alert deduplication or escalation is implemented.
- No pricing lookup is performed; cost is read from the ingested event payload.

## 9. Recording Checklist

1. Start from a clean database if you want deterministic counts.
2. Start the backend with `uv run uvicorn app.main:app --reload`.
3. Create the `.env` file-read rule.
4. Ingest the four Customer Support Agent events in order.
5. Query events to show the audit timeline.
6. Query alerts to show the stored high-severity alert.
7. Query cost summary and daily cost to show spend visibility.
8. Close by emphasizing HTTP-only integration and local-first storage.
