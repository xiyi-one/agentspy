import { AlertTriangle, CircleDollarSign, ListTree, ShieldCheck } from "lucide-react";
import { AlertList } from "@/components/alerts/alert-list";
import { CostSummaryPanel } from "@/components/cost/cost-summary";
import { EventTimelineList } from "@/components/events/event-timeline-list";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { StatCard } from "@/components/overview/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/resource-state";
import { useApiResource } from "@/hooks/useApiResource";
import { getCostSummary, getDailyCosts, listAlerts, listEvents, listRules } from "@/lib/api";
import { DEMO_WORKSPACE_ID } from "@/lib/demo";
import { useDashboardStore } from "@/store/useDashboardStore";

function formatMoney(value?: number, currency = "USD") {
  if (value === undefined) return "...";
  return `${currency === "USD" ? "$" : `${currency} `}${value.toFixed(4)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function OverviewPage() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedRunId = useDashboardStore((state) => state.selectedRunId);
  const selectedTimeRange = useDashboardStore((state) => state.selectedTimeRange);
  const dailyLimit = selectedTimeRange === "month" ? 30 : 5;
  const eventsResource = useApiResource(
    () => listEvents({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, run_id: selectedRunId ?? undefined, limit: 6, offset: 0 }),
    [currentWorkspaceId, selectedAgentId, selectedRunId],
  );
  const alertsResource = useApiResource(
    () => listAlerts({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, run_id: selectedRunId ?? undefined, limit: 5 }),
    [currentWorkspaceId, selectedAgentId, selectedRunId],
  );
  const rulesResource = useApiResource(() => listRules({ workspace_id: currentWorkspaceId }), [currentWorkspaceId]);
  const summaryResource = useApiResource(
    () => getCostSummary({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, period: selectedTimeRange }),
    [currentWorkspaceId, selectedAgentId, selectedTimeRange],
  );
  const dailyResource = useApiResource(
    () => getDailyCosts({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, limit: dailyLimit }),
    [currentWorkspaceId, selectedAgentId, dailyLimit],
  );

  const isDemoWorkspace = currentWorkspaceId === DEMO_WORKSPACE_ID;
  const events = eventsResource.data?.events ?? [];
  const alerts = alertsResource.data ?? [];
  const rules = rulesResource.data ?? [];
  const costSummary = summaryResource.data;
  const dailyCosts = dailyResource.data?.items ?? [];
  const openAlerts = alerts.filter((alert) => alert.status === "open");
  const enabledRules = rules.filter((rule) => rule.enabled);
  const recentEvents = events.slice(0, 3);
  const today = todayKey();
  const eventsToday = events.filter((event) => event.timestamp.slice(0, 10) === today).length || events.length;
  const riskyEvent = events.find((event) => event.category === "file" && event.action === "read" && event.target.value.includes(".env"));
  const routineEvent = events.find((event) => event.category === "browser" || event.category === "email");
  const costEvent = events.find((event) => event.cost);
  const hasDemoData = events.length > 0 || alerts.length > 0 || rules.length > 0 || Boolean(costSummary?.total_amount);
  const mostRecentEvent = events[0];
  const currentRun = selectedRunId ?? mostRecentEvent?.run_id ?? "No active run yet";
  const currentAgent = selectedAgentId ?? mostRecentEvent?.agent_id ?? "Waiting for agent events";
  const hasAnyError = eventsResource.error || alertsResource.error || rulesResource.error || summaryResource.error || dailyResource.error;
  const isLoadingCore = eventsResource.isLoading || alertsResource.isLoading || rulesResource.isLoading || summaryResource.isLoading;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="relative grid gap-8 p-7 lg:grid-cols-[1.16fr_0.84fr] lg:items-center">
          <div className="pointer-events-none absolute right-10 top-8 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
          <PageHeader
            eyebrow={currentAgent}
            title="Behavior audit, anomaly triage, and spend visibility in one calm surface."
            description={isDemoWorkspace ? "A real backend-backed demo workspace for the customer support agent story: routine activity, sensitive file access, rule-driven alerts, and LLM cost in one view." : "A live workspace overview showing what agents are doing, what looks risky, and what is costing money using the current backend audit APIs."}
          />
          <div className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/70 p-5 shadow-inset">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <span className="text-sm font-semibold text-slate-600">Workspace context</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{isDemoWorkspace ? "Demo Workspace" : currentWorkspaceId}</span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/80 px-4 py-3">
                <span className="text-sm text-muted-foreground">Current run</span>
                <span className="truncate text-sm font-semibold text-slate-800">{isLoadingCore ? "Loading..." : currentRun}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="font-display text-2xl font-bold">{eventsResource.isLoading ? "..." : eventsResource.data?.total ?? events.length}</p><p className="text-xs text-muted-foreground">Events</p></div>
                <div><p className="font-display text-2xl font-bold text-rose-600">{alertsResource.isLoading ? "..." : openAlerts.length}</p><p className="text-xs text-muted-foreground">Open alert</p></div>
                <div><p className="font-display text-2xl font-bold">{formatMoney(costSummary?.total_amount, costSummary?.currency)}</p><p className="text-xs text-muted-foreground">Cost</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDemoWorkspace ? (
        <Card>
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <StoryPoint label="Routine activity" value={routineEvent?.summary_text ?? "Waiting for browser/email activity"} />
            <StoryPoint label="Risk signal" value={riskyEvent?.summary_text ?? openAlerts[0]?.title ?? "Waiting for a rule-triggered alert"} tone="danger" />
            <StoryPoint label="Cost signal" value={costEvent?.cost ? `${costEvent.cost.currency} ${costEvent.cost.amount.toFixed(4)} from ${costEvent.summary_text}` : "Waiting for cost-bearing LLM usage"} />
          </CardContent>
        </Card>
      ) : null}

      {hasAnyError ? (
        <ErrorState title="Some overview data is unavailable" description={isDemoWorkspace ? "The demo workspace uses real backend data. Start the backend and seed the demo scenario, then return to the Demo Workspace." : "One or more backend summary requests failed. Detail pages can still be checked individually once the backend is reachable."} />
      ) : null}

      {isDemoWorkspace && !isLoadingCore && !hasAnyError && !hasDemoData ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Demo data required</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-slate-950">Demo Workspace is selected, but no backend demo records are available yet.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">AgentSpy is not falling back to mock data here. Start the backend and run the local demo seed/walkthrough so events, rules, alerts, and cost records are returned by the real APIs.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Events in view" value={eventsResource.isLoading ? "..." : String(eventsToday)} detail={selectedRunId ? `Run ${selectedRunId}` : "Recent backend audit events"} icon={<ListTree className="h-5 w-5" />} />
        <StatCard label="Open alerts" value={alertsResource.isLoading ? "..." : String(openAlerts.length)} detail={openAlerts[0]?.title ?? "No open alert records"} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <StatCard label="Rules enabled" value={rulesResource.isLoading ? "..." : String(enabledRules.length)} detail="Stateless MVP checks" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Cost in range" value={formatMoney(costSummary?.total_amount, costSummary?.currency)} detail="From normalized event cost" icon={<CircleDollarSign className="h-5 w-5" />} tone="success" />
      </div>

      <SectionHeader eyebrow="Priority" title="What needs attention" description="High-signal previews keep the landing page operational without turning it into a noisy security wall." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {alertsResource.isLoading ? <LoadingState title="Loading alert preview" description="Reading recent stored alerts for this workspace." /> : <AlertList alerts={openAlerts.length ? openAlerts : alerts.slice(0, 2)} />}
        {eventsResource.isLoading ? <LoadingState title="Loading event preview" description="Reading recent audit events for this workspace." /> : <EventTimelineList events={recentEvents} />}
      </div>
      {summaryResource.isLoading || dailyResource.isLoading ? (
        <LoadingState title="Loading cost preview" description="Reading query-time cost totals and daily buckets." />
      ) : costSummary ? (
        <CostSummaryPanel summary={costSummary} daily={dailyCosts} />
      ) : null}
    </div>
  );
}


function StoryPoint({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "danger" }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-inset">
      <p className={tone === "danger" ? "text-xs font-bold uppercase tracking-[0.2em] text-rose-500" : "text-xs font-bold uppercase tracking-[0.2em] text-slate-400"}>{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </div>
  );
}
