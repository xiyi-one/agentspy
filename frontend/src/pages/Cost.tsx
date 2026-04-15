import { Bot, CircleDollarSign, Database, Landmark } from "lucide-react";
import { CostBreakdownPanel } from "@/components/cost/cost-breakdown-panel";
import { MetricCard } from "@/components/cost/cost-summary-card";
import { CostTrendPanel } from "@/components/cost/cost-trend-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/resource-state";
import { useApiResource } from "@/hooks/useApiResource";
import { getCostSummary, getDailyCosts } from "@/lib/api";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { CostBreakdownItem } from "@/types/domain";

function formatMoney(value: number, currency = "USD") {
  return `${currency === "USD" ? "$" : `${currency} `}${value.toFixed(4)}`;
}

function displayLabel(item?: CostBreakdownItem) {
  if (!item) return "None";
  return item.label ?? item.key;
}

export function CostPage() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedTimeRange = useDashboardStore((state) => state.selectedTimeRange);
  const dailyLimit = selectedTimeRange === "month" ? 30 : 7;
  const summaryResource = useApiResource(
    () => getCostSummary({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, period: selectedTimeRange }),
    [currentWorkspaceId, selectedAgentId, selectedTimeRange],
  );
  const dailyResource = useApiResource(
    () => getDailyCosts({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, limit: dailyLimit }),
    [currentWorkspaceId, selectedAgentId, selectedTimeRange, dailyLimit],
  );

  const summary = summaryResource.data;
  const daily = dailyResource.data?.items ?? [];
  const weekTotal = daily.reduce((total, item) => total + item.total_amount, 0);
  const topProvider = summary?.provider_breakdown?.[0];
  const topAgent = summary?.agent_breakdown?.[0];
  const isLoading = summaryResource.isLoading || dailyResource.isLoading;
  const error = summaryResource.error ?? dailyResource.error;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spend visibility"
        title="Cost tracking that stays tied to agent behavior."
        description="Simple, trustworthy spend views based on persisted event cost data. No pre-aggregation tables or external pricing lookups are implied."
        meta={<span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-inset">USD · {selectedTimeRange}</span>}
      />

      {isLoading ? <LoadingState title="Loading cost data" description="Reading query-time cost summaries from persisted events." /> : null}
      {error ? <ErrorState description={error} /> : null}

      {!isLoading && !error && summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Selected range" value={formatMoney(summary.total_amount, summary.currency)} detail="Current workspace total" icon={<CircleDollarSign className="h-5 w-5" />} />
            <MetricCard label="Recent daily total" value={formatMoney(weekTotal, summary.currency)} detail="Sum of returned daily buckets" icon={<Landmark className="h-5 w-5" />} />
            <MetricCard label="Top provider" value={displayLabel(topProvider)} detail={topProvider ? formatMoney(topProvider.total_amount, topProvider.currency) : "No cost events"} icon={<Database className="h-5 w-5" />} />
            <MetricCard label="Top agent" value={displayLabel(topAgent)} detail={topAgent ? formatMoney(topAgent.total_amount, topAgent.currency) : "No cost events"} icon={<Bot className="h-5 w-5" />} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <CostTrendPanel daily={daily} />
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Cost source</p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.04em] text-slate-950">Computed from persisted events.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The backend reads normalized event records where `cost` is present and aggregates them at query time for workspace {summary.workspace_id}.
                </p>
                <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-inset">
                  <p className="text-sm font-semibold text-slate-700">Current range</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{summary.start_date} to {summary.end_date}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <CostBreakdownPanel title="Provider breakdown" description="Cost-bearing events grouped by normalized provider metadata." items={summary.provider_breakdown ?? []} />
            <CostBreakdownPanel title="Agent breakdown" description="Spend attribution by agent identity in the current workspace." items={summary.agent_breakdown ?? []} />
          </div>
        </>
      ) : null}
    </div>
  );
}
