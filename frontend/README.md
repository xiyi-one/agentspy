# AgentSpy Frontend

High-fidelity AgentSpy dashboard frontend built with React, Vite, TypeScript, Tailwind CSS, shadcn/ui-style primitives, and Zustand.

## Stack

- Vite
- React
- TypeScript
- pnpm
- Tailwind CSS
- shadcn/ui-style component setup
- Zustand

## Setup

```bash
cd frontend
pnpm install
```

## Environment

The frontend reads the backend base URL from a Vite environment variable:

```bash
cp .env.example .env.local
```

Default value:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Only `VITE_*` variables are exposed to the browser. Do not store secrets in frontend environment files.

## Run

Start the backend separately, then run the frontend:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

```bash
cd frontend
pnpm dev
```

The Vite dev server usually runs at `http://localhost:5173`.

## Build

```bash
cd frontend
pnpm build
```

## API Integration Scope

The frontend now uses real backend read APIs for these pages:

- Events: `GET /api/v1/events`
- Alerts: `GET /api/v1/alerts`
- Rules: `GET /api/v1/rules`
- Cost: `GET /api/v1/cost/summary` and `GET /api/v1/cost/daily`

The Overview page now uses a hybrid real-data composition from the same backend read APIs: recent events, recent alerts, enabled rules, cost summary, and daily cost buckets. Mock data still lives in `src/data/mock.ts` as design fallback/demo fixture data.

The frontend does not send `X-API-Key` because the current backend read endpoints do not require it. The ingest API still requires an API key, but ingest is not wired from the frontend in this step.

## UI Specification

The implementation-oriented visual system is documented in `frontend/UI_SPEC.md`.

## Current Pages

The app shell includes:

- sidebar navigation
- top workspace header
- high-fidelity Overview dashboard with backend-backed hero context, stat cards, alerts preview, events preview, and cost preview
- high-fidelity Events timeline connected to the backend events API
- high-fidelity Alerts triage view connected to the backend alerts API
- high-fidelity Rules view connected to the backend rules API
- high-fidelity Cost view connected to backend query-time cost APIs

Loading, empty, and error states are styled to match the dashboard visual system.


## Shared Dashboard Context

Workspace and lightweight filters are shared across the dashboard through `src/store/useDashboardStore.ts`.

Global state:

- current workspace
- selected agent filter
- selected run filter
- selected time range for cost-oriented views
- selected navigation section
- event search text

Fetched API datasets remain page-local. The frontend does not store server responses globally and does not use a server-state framework yet.



## Demo Workspace

Use the `View Demo` button in the header or select `Demo Workspace` from the workspace selector to switch the dashboard to `ws_demo`.

The demo workspace uses the same real backend read APIs as the rest of the app:

- `GET /api/v1/events` for routine and risky agent activity
- `GET /api/v1/alerts` for rule-triggered alerts
- `GET /api/v1/rules` for the rule definitions behind the story
- `GET /api/v1/cost/summary` and `GET /api/v1/cost/daily` for LLM cost visibility

The frontend does not inject fake demo records. If the demo workspace appears empty, start the backend and run the local backend demo seed/walkthrough first. In this repository, use the backend demo script document if present, or the backend README curl examples to create rules and ingest demo events.

## URL-Synced Filters

High-level dashboard context is synchronized to URL query parameters so refreshes and shared links preserve the active view.

Synced query parameters:

- `workspace_id` for non-default workspace selection
- `agent_id` for the optional agent filter
- `run_id` for the optional run filter
- `period` for `today`, `week`, or `month`
- `q` for non-empty event search text

Default or empty values are omitted to keep URLs concise. The URL sync layer lives in `src/lib/urlState.ts` and `src/hooks/useDashboardUrlSync.ts`.

## Development Notes

- Keep backend contracts unchanged from the frontend.
- Keep API calls in `src/lib/api.ts`.
- Keep lightweight fetch state in small hooks under `src/hooks/`.
- Use Zustand only for dashboard context and lightweight UI state. The shared store lives in `src/store/useDashboardStore.ts`.
- Do not add a full server-state framework until the API surface requires it.
