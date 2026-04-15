import { create } from "zustand";
import { DEMO_WORKSPACE_ID } from "@/lib/demo";
import { defaultDashboardUrlState, readDashboardUrlState, type DashboardUrlState } from "@/lib/urlState";

export type NavigationSection = "overview" | "events" | "alerts" | "rules" | "cost";
export type TimeRangeOption = "today" | "week" | "month";

interface DashboardState {
  currentWorkspaceId: string;
  selectedAgentId: string | null;
  selectedRunId: string | null;
  selectedTimeRange: TimeRangeOption;
  selectedSection: NavigationSection;
  searchText: string;
  setWorkspaceId: (workspaceId: string) => void;
  setAgentId: (agentId: string | null) => void;
  setRunId: (runId: string | null) => void;
  setTimeRange: (timeRange: TimeRangeOption) => void;
  setSelectedSection: (section: NavigationSection) => void;
  setSearchText: (value: string) => void;
  hydrateFromUrl: (urlState: DashboardUrlState) => void;
  enterDemoWorkspace: () => void;
  resetFilters: () => void;
}

function cleanFilter(value: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

const initialUrlState = readDashboardUrlState();

export const useDashboardStore = create<DashboardState>()((set) => ({
  currentWorkspaceId: initialUrlState.workspaceId,
  selectedAgentId: initialUrlState.agentId,
  selectedRunId: initialUrlState.runId,
  selectedTimeRange: initialUrlState.period,
  selectedSection: "overview",
  searchText: initialUrlState.searchText,
  setWorkspaceId: (workspaceId) => set({ currentWorkspaceId: workspaceId.trim() || defaultDashboardUrlState.workspaceId }),
  setAgentId: (agentId) => set({ selectedAgentId: cleanFilter(agentId) }),
  setRunId: (runId) => set({ selectedRunId: cleanFilter(runId) }),
  setTimeRange: (timeRange) => set({ selectedTimeRange: timeRange }),
  setSelectedSection: (section) => set({ selectedSection: section }),
  setSearchText: (value) => set({ searchText: value }),
  hydrateFromUrl: (urlState) => set({
    currentWorkspaceId: urlState.workspaceId,
    selectedAgentId: urlState.agentId,
    selectedRunId: urlState.runId,
    selectedTimeRange: urlState.period,
    searchText: urlState.searchText,
  }),
  enterDemoWorkspace: () => set({
    currentWorkspaceId: DEMO_WORKSPACE_ID,
    selectedAgentId: null,
    selectedRunId: null,
    selectedTimeRange: "today",
    selectedSection: "overview",
    searchText: "",
  }),
  resetFilters: () => set({ selectedAgentId: null, selectedRunId: null, selectedTimeRange: "today", searchText: "" }),
}));
