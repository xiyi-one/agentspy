import type { ReactNode } from "react";
import { CircleDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CostSummary } from "@/types/domain";

export function CostSummaryCard({ summary }: { summary: CostSummary }) {
  return (
    <MetricCard
      label="Cost today"
      value={`$${summary.total_amount.toFixed(4)}`}
      detail={`${summary.currency} from normalized event cost data`}
      icon={<CircleDollarSign className="h-5 w-5" />}
    />
  );
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-4 font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
