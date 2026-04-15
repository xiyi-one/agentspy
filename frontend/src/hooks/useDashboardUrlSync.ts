import { useEffect } from "react";
import { readDashboardUrlState, replaceDashboardUrlState } from "@/lib/urlState";
import { useDashboardStore } from "@/store/useDashboardStore";

export function useDashboardUrlSync() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedRunId = useDashboardStore((state) => state.selectedRunId);
  const selectedTimeRange = useDashboardStore((state) => state.selectedTimeRange);
  const searchText = useDashboardStore((state) => state.searchText);
  const hydrateFromUrl = useDashboardStore((state) => state.hydrateFromUrl);

  useEffect(() => {
    const handlePopState = () => hydrateFromUrl(readDashboardUrlState());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hydrateFromUrl]);

  useEffect(() => {
    replaceDashboardUrlState({
      workspaceId: currentWorkspaceId,
      agentId: selectedAgentId,
      runId: selectedRunId,
      period: selectedTimeRange,
      searchText,
    });
  }, [currentWorkspaceId, selectedAgentId, selectedRunId, selectedTimeRange, searchText]);
}
