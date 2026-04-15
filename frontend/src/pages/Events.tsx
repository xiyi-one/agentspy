import { EventTimelineList } from "@/components/events/event-timeline-list";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { ErrorState, LoadingState } from "@/components/ui/resource-state";
import { useApiResource } from "@/hooks/useApiResource";
import { listEvents } from "@/lib/api";
import { useDashboardStore } from "@/store/useDashboardStore";

export function EventsPage() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedRunId = useDashboardStore((state) => state.selectedRunId);
  const searchText = useDashboardStore((state) => state.searchText);
  const setSearchText = useDashboardStore((state) => state.setSearchText);
  const eventsResource = useApiResource(
    () => listEvents({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, run_id: selectedRunId ?? undefined, limit: 50, offset: 0 }),
    [currentWorkspaceId, selectedAgentId, selectedRunId],
  );

  const events = eventsResource.data?.events ?? [];
  const visibleEvents = events.filter((event) => {
    const haystack = `${event.summary_text} ${event.category} ${event.action} ${event.target.value} ${event.agent_id}`.toLowerCase();
    return haystack.includes(searchText.toLowerCase());
  });
  const flaggedCount = events.filter((event) => event.risky ?? (event.category === "file" && event.action === "read" && event.target.value.includes(".env"))).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit trail"
        title="Every agent action, ordered into a readable timeline."
        description="A dense but calm event view for browsing behavior, external actions, sensitive file reads, and LLM spend context."
        meta={<span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-inset">Newest first</span>}
      />
      <FilterBar
        searchValue={searchText}
        onSearchChange={setSearchText}
        chips={[`workspace: ${currentWorkspaceId}`, selectedAgentId ? `agent: ${selectedAgentId}` : "agent: all", selectedRunId ? `run: ${selectedRunId}` : "run: all", "limit: 50"]}
      />
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Events</p>
            <p className="mt-2 font-semibold text-slate-950">{visibleEvents.length} visible</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total matches</p>
            <p className="mt-2 font-semibold text-slate-950">{eventsResource.data?.total ?? 0} stored</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Risk marker</p>
            <p className="mt-2 font-semibold text-slate-950">{flaggedCount} flagged</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 font-semibold text-slate-950">Backend connected</p>
          </div>
        </CardContent>
      </Card>
      {eventsResource.isLoading ? <LoadingState title="Loading events" description="Reading persisted audit events from the backend." /> : null}
      {eventsResource.error ? <ErrorState description={eventsResource.error} /> : null}
      {!eventsResource.isLoading && !eventsResource.error ? <EventTimelineList events={visibleEvents} /> : null}
    </div>
  );
}
