import { ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { RuleItem } from "@/types/domain";

export function describeRule(rule: RuleItem) {
  if (rule.condition_target_contains) {
    return `${label(rule.condition_category)} ${label(rule.condition_action)} where target contains ${rule.condition_target_contains}`;
  }
  if (rule.condition_cost_threshold) {
    return `${label(rule.condition_category)} event with cost above $${rule.condition_cost_threshold.toFixed(3)}`;
  }
  if (rule.condition_category && rule.condition_action) {
    return `${label(rule.condition_category)} ${label(rule.condition_action)} event`;
  }
  return "Stateless event match";
}

function label(value?: string | null) {
  if (!value) return "Any";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function RuleList({ rules }: { rules: RuleItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Rule definitions</CardTitle>
            <CardDescription>MVP-style stateless rules translated into readable conditions.</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Sparkles className="h-3.5 w-3.5" />
            Create rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {rules.length === 0 ? (
          <EmptyState title="No rules configured" description="Create stateless rule definitions to detect risky agent behavior." />
        ) : null}
        {rules.map((rule) => (
          <article key={rule.id} className="hairline-panel rounded-3xl p-5 transition-all hover:bg-white/90">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant={rule.enabled ? "success" : "neutral"}>{rule.enabled ? "enabled" : "disabled"}</Badge>
                <SeverityBadge severity={rule.severity} />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-slate-950">{rule.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{describeRule(rule)}</p>
            <div className="mt-5 grid gap-2 rounded-2xl border border-slate-200/80 bg-white/60 p-3 shadow-inset">
              <RuleField label="Category" value={rule.condition_category ?? "Any"} />
              <RuleField label="Action" value={rule.condition_action ?? "Any"} />
              <RuleField label="Target" value={rule.condition_target_contains ? `contains ${rule.condition_target_contains}` : "Any"} />
              <RuleField label="Cost" value={rule.condition_cost_threshold ? `above $${rule.condition_cost_threshold.toFixed(3)}` : "Any"} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Actions</span>
              {rule.actions.map((action) => <Badge key={action.type} variant="default">{action.type}</Badge>)}
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

function RuleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
