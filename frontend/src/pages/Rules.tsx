import { AlertTriangle, PauseCircle, ShieldCheck, ToggleRight } from "lucide-react";
import { MetricCard } from "@/components/cost/cost-summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { RuleList } from "@/components/rules/rule-list";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/resource-state";
import { useApiResource } from "@/hooks/useApiResource";
import { listRules } from "@/lib/api";
import { useDashboardStore } from "@/store/useDashboardStore";

export function RulesPage() {
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const rulesResource = useApiResource(() => listRules({ workspace_id: currentWorkspaceId }), [currentWorkspaceId]);
  const rules = rulesResource.data ?? [];
  const enabled = rules.filter((rule) => rule.enabled).length;
  const disabled = rules.length - enabled;
  const highSeverity = rules.filter((rule) => rule.severity === "high" || rule.severity === "critical").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Policy surface"
        title="Rules that read like operational intent, not raw JSON."
        description="MVP stateless rules are expressed as explicit conditions and declarative actions, backed by the current Rules API."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total rules" value={String(rules.length)} detail="Stateless definitions" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Enabled" value={String(enabled)} detail="Evaluated during ingest" icon={<ToggleRight className="h-5 w-5" />} />
        <MetricCard label="Disabled" value={String(disabled)} detail="Stored but inactive" icon={<PauseCircle className="h-5 w-5" />} />
        <MetricCard label="High severity" value={String(highSeverity)} detail="High or critical rules" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_0.75fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Create rule placeholder</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-slate-950">Rule creation stays API-first for this migration step.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">The page now reads real backend rule definitions. The visual create affordance remains a placeholder until a dedicated form is introduced.</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-inset">
            <p className="text-sm font-semibold text-slate-700">Preferred MVP format</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Category + action + target contains + optional cost threshold.</p>
          </div>
        </CardContent>
      </Card>
      {rulesResource.isLoading ? <LoadingState title="Loading rules" description="Reading stateless rule definitions from the backend." /> : null}
      {rulesResource.error ? <ErrorState description={rulesResource.error} /> : null}
      {!rulesResource.isLoading && !rulesResource.error ? <RuleList rules={rules} /> : null}
    </div>
  );
}
