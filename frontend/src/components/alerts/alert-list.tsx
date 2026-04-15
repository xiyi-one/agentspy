import { AlertTriangle } from "lucide-react";
import { AlertCard } from "@/components/alerts/alert-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { AlertItem } from "@/types/domain";

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Alert queue</CardTitle>
            <CardDescription>Severity-aware stored alert records created by rule matches.</CardDescription>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{alerts.length} records</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <EmptyState title="No alerts" description="Rule matches will appear here as stored alert records." icon={<AlertTriangle className="h-5 w-5" />} />
        ) : null}
        {alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
      </CardContent>
    </Card>
  );
}
