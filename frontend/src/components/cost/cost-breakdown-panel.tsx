import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CostBreakdownItem } from "@/types/domain";

export function CostBreakdownPanel({ title, description, items }: { title: string; description: string; items: CostBreakdownItem[] }) {
  const max = Math.max(...items.map((item) => item.total_amount), 0.001);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? <EmptyState title="No cost data" description="Cost-bearing events will appear here once ingested." /> : null}
        {items.map((item) => (
          <div key={item.key} className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-inset">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{item.label ?? item.key}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{item.event_count ?? "Query-time"} cost-bearing events</p>
              </div>
              <p className="font-display text-xl font-bold tracking-[-0.04em] text-slate-950">${item.total_amount.toFixed(4)}</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-slate-950" style={{ width: `${Math.max(4, (item.total_amount / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
