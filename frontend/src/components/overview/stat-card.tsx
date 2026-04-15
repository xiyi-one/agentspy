import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "neutral" | "danger" | "success";
}

export function StatCard({ label, value, detail, icon, tone = "neutral" }: StatCardProps) {
  const tones = {
    neutral: "from-slate-950 to-slate-700 text-white",
    danger: "from-rose-600 to-orange-500 text-white",
    success: "from-emerald-600 to-teal-500 text-white",
  };

  return (
    <section className="glass-panel rounded-[2rem] p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br shadow-lg", tones[tone])}>{icon}</div>
      </div>
    </section>
  );
}
