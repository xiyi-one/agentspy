import type { AlertItem, CostDailyResponse, CostSummary, EventsResponse, RuleItem } from "@/types/domain";

const fallbackBaseUrl = "http://127.0.0.1:8000";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl).replace(/\/$/, "");

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, apiBaseUrl);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function getJson<T>(path: string, params?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listEvents(params: { workspace_id: string; agent_id?: string; run_id?: string; limit?: number; offset?: number }) {
  return getJson<EventsResponse>("/api/v1/events", params);
}

export function listAlerts(params: { workspace_id?: string; agent_id?: string; run_id?: string; severity?: string; status?: string; limit?: number }) {
  return getJson<AlertItem[]>("/api/v1/alerts", params);
}

export function listRules(params: { workspace_id?: string }) {
  return getJson<RuleItem[]>("/api/v1/rules", params);
}

export function getCostSummary(params: { workspace_id: string; agent_id?: string; period?: "today" | "week" | "month"; start_date?: string; end_date?: string }) {
  return getJson<CostSummary>("/api/v1/cost/summary", params);
}

export function getDailyCosts(params: { workspace_id: string; agent_id?: string; start_date?: string; end_date?: string; limit?: number }) {
  return getJson<CostDailyResponse>("/api/v1/cost/daily", params);
}
