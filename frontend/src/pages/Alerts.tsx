import { AlertList } from "@/components/alerts/alert-list";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/resource-state";
import { useApiResource } from "@/hooks/useApiResource";
import { listAlerts } from "@/lib/api";
import { useDashboardStore } from "@/store/useDashboardStore";

export function AlertsPage() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedRunId = useDashboardStore((state) => state.selectedRunId);
  const alertsResource = useApiResource(
    () => listAlerts({ workspace_id: currentWorkspaceId, agent_id: selectedAgentId ?? undefined, run_id: selectedRunId ?? undefined, limit: 50 }),
    [currentWorkspaceId, selectedAgentId, selectedRunId],
  );
  const alerts = alertsResource.data ?? [];
  const openCount = alerts.filter((alert) => alert.status === "open").length;
  const resolvedCount = alerts.filter((alert) => alert.status === "resolved").length;
  const highestSeverity = alerts.find((alert) => alert.status === "open")?.severity ?? alerts[0]?.severity ?? "none";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Anomaly detection"
        title="Triage risky behavior without turning the console into an alarm wall."
        description="Severity, status, rule linkage, and event context are visible at scan speed. Notifications are intentionally outside the MVP UI."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Open</p>
            <p className="mt-3 font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">{openCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Requires operator review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Resolved</p>
            <p className="mt-3 font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">{resolvedCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Stored alerts marked resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Highest severity</p>
            <p className="mt-3 font-display text-4xl font-bold tracking-[-0.06em] text-rose-600 capitalize">{highestSeverity}</p>
            <p className="mt-1 text-sm text-muted-foreground">From current backend results</p>
          </CardContent>
        </Card>
      </div>
      {alertsResource.isLoading ? <LoadingState title="Loading alerts" description="Reading stored alert records from the backend." /> : null}
      {alertsResource.error ? <ErrorState description={alertsResource.error} /> : null}
      {!alertsResource.isLoading && !alertsResource.error ? <AlertList alerts={alerts} /> : null}
    </div>
  );
}
