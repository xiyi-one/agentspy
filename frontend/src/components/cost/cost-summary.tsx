import { CostSummaryCard } from "@/components/cost/cost-summary-card";
import { CostTrendPanel } from "@/components/cost/cost-trend-panel";
import type { CostDailyItem, CostSummary } from "@/types/domain";

export function CostSummaryPanel({ summary, daily }: { summary: CostSummary; daily: CostDailyItem[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <CostSummaryCard summary={summary} />
      <CostTrendPanel daily={daily} />
    </div>
  );
}
