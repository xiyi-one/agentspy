export type DashboardPeriod = "today" | "week" | "month";

export interface DashboardUrlState {
  workspaceId: string;
  agentId: string | null;
  runId: string | null;
  period: DashboardPeriod;
  searchText: string;
}

export const defaultDashboardUrlState: DashboardUrlState = {
  workspaceId: "ws_demo",
  agentId: null,
  runId: null,
  period: "today",
  searchText: "",
};

const allowedPeriods = new Set<DashboardPeriod>(["today", "week", "month"]);
const ownedParams = ["workspace_id", "agent_id", "run_id", "period", "q"];

function clean(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parsePeriod(value: string | null): DashboardPeriod {
  return value && allowedPeriods.has(value as DashboardPeriod) ? (value as DashboardPeriod) : defaultDashboardUrlState.period;
}

export function readDashboardUrlState(search = typeof window !== "undefined" ? window.location.search : ""): DashboardUrlState {
  const params = new URLSearchParams(search);

  return {
    workspaceId: clean(params.get("workspace_id")) ?? defaultDashboardUrlState.workspaceId,
    agentId: clean(params.get("agent_id")),
    runId: clean(params.get("run_id")),
    period: parsePeriod(params.get("period")),
    searchText: clean(params.get("q")) ?? defaultDashboardUrlState.searchText,
  };
}

export function buildDashboardSearch(state: DashboardUrlState, currentSearch = typeof window !== "undefined" ? window.location.search : "") {
  const params = new URLSearchParams(currentSearch);

  ownedParams.forEach((param) => params.delete(param));

  if (state.workspaceId && state.workspaceId !== defaultDashboardUrlState.workspaceId) {
    params.set("workspace_id", state.workspaceId);
  }
  if (state.agentId) params.set("agent_id", state.agentId);
  if (state.runId) params.set("run_id", state.runId);
  if (state.period !== defaultDashboardUrlState.period) params.set("period", state.period);
  if (state.searchText.trim()) params.set("q", state.searchText.trim());

  const nextSearch = params.toString();
  return nextSearch ? `?${nextSearch}` : "";
}

export function replaceDashboardUrlState(state: DashboardUrlState) {
  if (typeof window === "undefined") return;

  const nextSearch = buildDashboardSearch(state);
  const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}
