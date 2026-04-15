import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CostDailyItem } from "@/types/domain";

export function CostTrendPanel({ daily }: { daily: CostDailyItem[] }) {
  const max = Math.max(...daily.map((item) => item.total_amount), 0.001);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily trend</CardTitle>
        <CardDescription>Simple query-time buckets shown without a charting dependency.</CardDescription>
      </CardHeader>
      <CardContent>
        {daily.length === 0 ? (
          <EmptyState title="No cost buckets" description="Cost-bearing events will create daily buckets here." />
        ) : (
        <div className="flex h-48 items-end gap-3 rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-inset">
          {daily.map((item) => (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-slate-950 to-slate-500 shadow-lg shadow-slate-900/10 transition-all duration-200 hover:from-slate-800"
                style={{ height: `${Math.max(12, (item.total_amount / max) * 144)}px` }}
                title={`${item.currency} ${item.total_amount.toFixed(4)}`}
              />
              <span className="text-[11px] font-semibold text-slate-400">{item.date.slice(5)}</span>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
