# AgentSpy Product Development Document v1.1

## 1. Project Overview

### 1.1 Product Definition
**AgentSpy** is an open-source, local-first, lightweight observability tool designed specifically for AI Agents. It provides **behavior auditing, cost tracking, and real-time security alerting** through a minimal HTTP API.

### 1.2 Core Value Proposition
| Pillar | Description |
|--------|-------------|
| **Minimal Integration** | Send HTTP requests only. No heavy SDK required. |
| **Privacy First** | All data stays on your infrastructure. No cloud dependencies. |
| **Security Focused** | Rule engine detects anomalous behavior (file access, cost spikes, sensitive data). |

### 1.3 Target Audience
- Developers using **AutoGPT, Browser-Use, CrewAI, OpenAI Agent SDK**.
- Teams needing to **audit Agent actions** and **track costs**.
- Enterprises with **strict data residency** requirements.

### 1.4 Competitive Positioning (Context for AI)
| Competitor | AgentSpy Difference |
|------------|----------------------|
| Langfuse | LLM debugging (prompt eval); AgentSpy → **Agent behavioral security**. |
| AgentOps | Multi-agent visualization with SDK lock-in; AgentSpy → **framework-agnostic HTTP ingestion**. |
| OpenLIT | OpenTelemetry data collection; AgentSpy can act as a **security/compliance layer** on top. |

---

## 2. Technical Architecture

### 2.1 High-Level Data Flow
```
┌─────────────┐     POST /ingest      ┌─────────────┐     Redis Queue     ┌─────────────┐
│  User Agent │ ────────────────────▶ │   FastAPI   │ ─────────────────▶  │   Worker    │
└─────────────┘                       └─────────────┘                     └──────┬──────┘
                                                                                  │
                                                               ┌──────────────────┼──────────────────┐
                                                               ▼                  ▼                  ▼
                                                         Rule Matching      Cost Aggregation    PostgreSQL
                                                               │                  │            (TimescaleDB)
                                                               ▼                  ▼                  │
                                                         Alert Triggers    cost_daily table       │
                                                               │                  │                  │
                                                               └──────────────────┴──────────────────┘
                                                                                  │
                                                                                  ▼
                                                                          ┌─────────────┐
                                                                          │   React     │
                                                                          │  Dashboard  │
                                                                          └─────────────┘
```

### 2.2 Technology Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Backend API | FastAPI (Python) | Python 3.11+ |
| Database | PostgreSQL + TimescaleDB | pg15 + timescaledb 2.x |
| Message Queue | Redis | 7.x |
| Frontend | React + TypeScript + Vite | Node 20+ |
| Charts | recharts | 2.x |
| Deployment | Docker Compose | 3.8+ |

### 2.3 Monorepo Structure
```
agentspy/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── ingest.py
│   │   │   ├── events.py
│   │   │   ├── cost.py
│   │   │   └── rules.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── pricing.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── crud.py
│   │   ├── schemas/
│   │   │   └── event.py
│   │   └── worker/
│   │       ├── worker.py
│   │       └── rule_engine.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── components/
│   │   │   ├── EventTimeline.tsx
│   │   │   ├── CostCard.tsx
│   │   │   ├── RuleManager.tsx
│   │   │   └── Layout.tsx
│   │   └── hooks/
│   │       ├── useEvents.ts
│   │       └── useCost.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Data Models

### 3.1 Event Schema (Pydantic)
This is the canonical format for all ingested events.

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class EventCategory(str, Enum):
    BROWSER = "browser"
    API = "api"
    FILE = "file"
    EMAIL = "email"
    LLM = "llm"
    SHELL = "shell"

class Target(BaseModel):
    type: str = Field(..., description="url | file_path | api_endpoint | email_address")
    value: str

class Cost(BaseModel):
    amount: float
    currency: str = "USD"
    provider: str = Field(..., description="openai | anthropic | stripe | aws")

class AgentEvent(BaseModel):
    id: Optional[str] = None          # Public UUID (will be generated if missing)
    timestamp: datetime
    workspace_id: Optional[str] = None
    agent_id: str
    category: EventCategory
    action: str
    target: Optional[Target] = None
    status: str = "success"
    error_message: Optional[str] = None
    cost: Optional[Cost] = None
    sensitive_flags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('timestamp')
    def ensure_tz(cls, v):
        if v.tzinfo is None:
            raise ValueError('timestamp must be timezone-aware')
        return v
```

### 3.2 Database Tables (PostgreSQL + TimescaleDB)

**Events Table**
```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_value TEXT,
    status TEXT,
    error_message TEXT,
    cost_amount DECIMAL(10,6),
    cost_provider TEXT,
    sensitive_flags TEXT[],
    metadata JSONB
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('events', 'timestamp');
-- Auto-drop data older than 30 days
SELECT add_retention_policy('events', INTERVAL '30 days');
```

**Rules Table**
```sql
CREATE TABLE rules (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    condition_category TEXT,
    condition_action TEXT,
    condition_target_contains TEXT,
    condition_cost_threshold DECIMAL(10,6),
    actions JSONB NOT NULL,   -- {"flag": true, "alert": true, "severity": "high"}
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Cost Daily Aggregation Table**
```sql
CREATE TABLE cost_daily (
    id BIGSERIAL PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    date DATE NOT NULL,
    agent_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    total_amount DECIMAL(10,6) NOT NULL,
    event_count INT NOT NULL,
    UNIQUE (workspace_id, date, agent_id, provider)
);
```

### 3.3 API Key Management (MVP)
- Header: `X-API-Key`
- In-memory mapping for MVP: `{"test_key_123": "ws_demo"}`
- Future: store in database with hashed keys.

---

## 4. API Endpoints

### 4.1 POST /api/v1/ingest
**Description**: Ingests a batch of events from an Agent.

**Headers**:
```
X-API-Key: <API_KEY>
Content-Type: application/json
```

**Request Body** (array of AgentEvent objects):
```json
[
  {
    "timestamp": "2026-04-14T10:30:00Z",
    "agent_id": "shopping-bot",
    "category": "llm",
    "action": "completion",
    "cost": { "amount": 0.003, "provider": "openai" },
    "metadata": {
      "model": "gpt-4o-mini",
      "usage": { "input_tokens": 1000, "output_tokens": 500 }
    }
  }
]
```

**Response**:
```json
{ "received": 1, "status": "queued" }
```
**HTTP Status**: `202 Accepted`

**Implementation Steps**:
1. Validate `X-API-Key` → resolve `workspace_id`.
2. For each event:
   - Generate `public_id` UUID if not provided.
   - Set `workspace_id`.
3. Serialize event to JSON and `RPUSH` to Redis list `event_queue`.
4. Return 202 immediately.

---

### 4.2 GET /api/v1/events
**Description**: Retrieve paginated events.

**Query Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| `workspace_id` | Yes | Workspace identifier |
| `agent_id` | No | Filter by specific agent |
| `limit` | No | Default 100 |
| `offset` | No | Default 0 |

**Response**:
```json
{
  "events": [
    {
      "public_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-04-14T10:30:00Z",
      "agent_id": "shopping-bot",
      "category": "llm",
      "action": "completion",
      "cost_amount": 0.003,
      "sensitive_flags": []
    }
  ],
  "total": 42
}
```

---

### 4.3 GET /api/v1/cost/summary
**Description**: Get total cost for a period.

**Query Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| `workspace_id` | Yes | Workspace identifier |
| `period` | No | `today` or `week` (default: `today`) |

**Response**:
```json
{ "total": 0.47, "currency": "USD" }
```

---

### 4.4 Rules CRUD Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/rules` | List all rules for workspace |
| POST | `/api/v1/rules` | Create a new rule |
| PUT | `/api/v1/rules/{public_id}` | Update an existing rule |
| DELETE | `/api/v1/rules/{public_id}` | Delete a rule |

**Rule Object (Create/Update)**:
```json
{
  "name": "Detect password file access",
  "enabled": true,
  "condition_category": "file",
  "condition_action": "read",
  "condition_target_contains": ".env",
  "actions": { "flag": true, "alert": true, "severity": "high" }
}
```

---

## 5. Worker & Rule Engine

### 5.1 Worker Main Loop (Pseudocode)
```python
async def worker():
    r = redis.from_url(settings.REDIS_URL)
    while True:
        _, event_json = await r.blpop("event_queue")
        event_dict = json.loads(event_json)

        # Cost calculation for LLM events
        if event_dict.get("category") == "llm":
            calc_and_attach_cost(event_dict)

        # Insert into database
        async with db_session() as sess:
            event = Event(**event_dict)
            sess.add(event)
            await sess.commit()
            await sess.refresh(event)
            event_id = event.id
            event_public_id = event.public_id

        # Rule matching
        await match_rules(event_dict, event_id)

        # Update daily cost aggregate
        if event_dict.get("cost_amount"):
            await update_cost_daily(event_dict)
```

### 5.2 Cost Calculation
```python
# backend/app/core/pricing.py
PRICING = {
    "openai": {
        "gpt-4o": {"input": 2.5e-6, "output": 1e-5},
        "gpt-4o-mini": {"input": 1.5e-7, "output": 6e-7},
    }
}

def calc_and_attach_cost(event_dict):
    meta = event_dict.get("metadata", {})
    if "usage" in meta and "model" in meta:
        usage = meta["usage"]
        model = meta["model"]
        provider = "openai"  # Extendable
        p = PRICING.get(provider, {}).get(model, {})
        if p:
            cost = (usage.get("input_tokens", 0) * p.get("input", 0) +
                    usage.get("output_tokens", 0) * p.get("output", 0))
            event_dict["cost"] = {"amount": cost, "provider": provider, "currency": "USD"}
            event_dict["cost_amount"] = cost
```

### 5.3 Rule Matching Engine
```python
# backend/app/worker/rule_engine.py
async def match_rules(event_dict, event_internal_id):
    workspace_id = event_dict["workspace_id"]
    async with db_session() as sess:
        result = await sess.execute(
            select(Rule).where(Rule.workspace_id == workspace_id, Rule.enabled == True)
        )
        rules = result.scalars().all()

        for rule in rules:
            if rule_matches(rule, event_dict):
                # Flag the event
                await add_sensitive_flag(event_internal_id, rule.name)
                # Trigger alert if configured
                if rule.actions.get("alert"):
                    await trigger_alert(rule, event_dict)

def rule_matches(rule, event):
    if rule.condition_category and event.get("category") != rule.condition_category:
        return False
    if rule.condition_action and event.get("action") != rule.condition_action:
        return False
    if rule.condition_target_contains:
        target_val = event.get("target", {}).get("value", "")
        if rule.condition_target_contains not in target_val:
            return False
    if rule.condition_cost_threshold:
        cost = event.get("cost_amount", 0)
        if cost < rule.condition_cost_threshold:
            return False
    return True
```

### 5.4 Alerting (Slack Webhook MVP)
```python
async def trigger_alert(rule, event):
    webhook_url = get_workspace_slack_webhook(event["workspace_id"])
    if not webhook_url:
        return
    message = f"🚨 *AgentSpy Alert: {rule.name}*\n" \
              f"Agent: `{event['agent_id']}`\n" \
              f"Action: {event['category']}.{event['action']}\n" \
              f"Time: {event['timestamp']}"
    await httpx.post(webhook_url, json={"text": message})
```

---

## 6. Frontend Specification

### 6.1 Technology
- **React 18** + TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **recharts** for cost visualizations
- **Axios** for API calls

### 6.2 Key Components
| Component | Purpose |
|-----------|---------|
| `EventTimeline` | Virtualized list of events with real-time updates |
| `CostCard` | Displays today/week cost, with breakdown chart |
| `RuleManager` | Table with CRUD operations for rules |
| `Layout` | Navigation sidebar with Workspace selector |

### 6.3 API Client Setup
```typescript
// frontend/src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'X-API-Key': 'test_key_123' } // MVP hardcoded
});
```

### 6.4 Environment Variables
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 7. Deployment Configuration

### 7.1 docker-compose.yml (Root Directory)
```yaml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_USER: agentspy
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: agentspy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://agentspy:devpass@postgres:5432/agentspy
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app  # For development hot-reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 7.2 Backend Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 7.3 Frontend Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## 8. Development Task Breakdown (For AI Execution)

### Phase 1: Foundation
- [ ] Initialize monorepo with `backend/` and `frontend/` directories.
- [ ] Create `docker-compose.yml` with PostgreSQL and Redis.
- [ ] Write minimal FastAPI app with `/health` endpoint.
- [ ] Write minimal React app with Vite and Tailwind.

### Phase 2: Event Ingestion & Storage
- [ ] Define Pydantic `AgentEvent` schema.
- [ ] Implement `POST /api/v1/ingest` (API key validation, Redis enqueue).
- [ ] Create `events` table with TimescaleDB hypertable.
- [ ] Implement Worker that consumes from Redis and inserts into DB.
- [ ] Implement cost calculation logic in Worker.

### Phase 3: Query API & Frontend Integration
- [ ] Implement `GET /api/v1/events` with pagination.
- [ ] Implement `GET /api/v1/cost/summary`.
- [ ] Build `EventTimeline` component (virtualized list).
- [ ] Build `CostCard` component with recharts.
- [ ] Connect frontend to backend APIs.

### Phase 4: Rule Engine & Alerting
- [ ] Create `rules` table and CRUD APIs.
- [ ] Implement rule matching logic in Worker.
- [ ] Add `sensitive_flags` column update.
- [ ] Implement Slack webhook alerting.
- [ ] Build `RuleManager` UI component.

### Phase 5: Polish & Documentation
- [ ] Add filters to EventTimeline (by agent, category).
- [ ] Write `README.md` with quickstart and API examples.
- [ ] Record a demo GIF.
- [ ] Ensure `docker-compose up` works out-of-the-box.

---

## 9. Extension Roadmap (Post-MVP)
- [ ] Support for Telegram, Email, Discord alerts.
- [ ] Python decorator `@track_agent` for easy integration.
- [ ] Multi-user authentication (GitHub OAuth).
- [ ] PDF/CSV audit report export.
- [ ] Integration with OpenLIT as a data source.

---

**Document Version**: v1.1  
**Last Updated**: 2026-04-15  
**Intended Audience**: AI coding agents (GPT-4, Claude, Devin, etc.)