import { AlertTriangle, CheckCircle2, CircleDollarSign, ExternalLink, FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/types/domain";

const icons = {
  browser: ExternalLink,
  file: FileText,
  email: Mail,
  llm: CircleDollarSign,
  task: CheckCircle2,
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function EventTimelineItem({ event, isLast = false }: { event: EventItem; isLast?: boolean }) {
  const Icon = icons[event.category as keyof typeof icons] ?? CheckCircle2;
  const isRisky = event.risky ?? (event.category === "file" && event.action === "read" && event.target.value.includes(".env"));

  return (
    <article className="relative grid gap-4 md:grid-cols-[5.5rem_1fr]">
      <div className="hidden md:block">
        <div className="text-right text-sm font-semibold text-slate-500">{formatTime(event.timestamp)}</div>
        {!isLast ? <div className="ml-auto mr-5 mt-3 h-full w-px bg-gradient-to-b from-slate-200 to-transparent" /> : null}
      </div>
      <div
        className={cn(
          "rounded-3xl p-4 transition-all duration-200",
          isRisky ? "border border-rose-200/80 bg-rose-50/60 shadow-inset" : "hairline-panel hover:bg-white/90",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{event.summary_text}</p>
                {isRisky ? <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> risky</Badge> : null}
                {event.cost ? <Badge variant="success">{event.cost.currency} {event.cost.amount.toFixed(4)}</Badge> : null}
                {event.status ? <StatusBadge status={event.status} /> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{event.category}.{event.action}</p>
              <p className="mt-3 break-all rounded-2xl border border-slate-200/70 bg-white/60 px-3 py-2 text-xs font-medium text-slate-500">
                {event.target.type}: {event.target.value}
              </p>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-500 md:hidden">{formatTime(event.timestamp)}</div>
        </div>
      </div>
    </article>
  );
}
