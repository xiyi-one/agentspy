import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { SeverityBadge, StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { AlertItem } from "@/types/domain";

export function AlertCard({ alert }: { alert: AlertItem }) {
  const isOpen = alert.status === "open";

  return (
    <article
      className={cn(
        "rounded-3xl border p-5 shadow-inset transition-all duration-200",
        isOpen ? "border-rose-200/80 bg-rose-50/60" : "border-slate-200/80 bg-white/68",
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-lg", isOpen ? "bg-rose-600 shadow-rose-500/20" : "bg-emerald-600 shadow-emerald-500/20")}>
            {isOpen ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-slate-950">{alert.title}</h3>
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{alert.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <ExternalLink className="h-3.5 w-3.5" /> Event {alert.event_id ?? "unlinked"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Agent {alert.agent_id}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/60 px-3 py-2 text-right shadow-inset">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Rule</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{alert.rule_id ? `#${alert.rule_id}` : "Manual"}</p>
        </div>
      </div>
    </article>
  );
}
