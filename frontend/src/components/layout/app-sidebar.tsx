import { Bell, Coins, Gauge, ListTree, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore, type NavigationSection } from "@/store/useDashboardStore";

const items: Array<{ id: NavigationSection; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "events", label: "Events", icon: ListTree },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "rules", label: "Rules", icon: ShieldCheck },
  { id: "cost", label: "Cost", icon: Coins },
];

export function AppSidebar() {
  const selectedSection = useDashboardStore((state) => state.selectedSection);
  const setSelectedSection = useDashboardStore((state) => state.setSelectedSection);

  return (
    <aside className="glass-panel fixed inset-y-4 left-4 z-20 hidden w-72 rounded-[2rem] p-4 lg:block">
      <div className="flex h-full flex-col">
        <div className="mb-7 flex items-center gap-3 px-3 pt-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.03em]">AgentSpy</p>
            <p className="text-xs font-medium text-muted-foreground">Local audit console</p>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = selectedSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">MVP Mode</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">Backend reads</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Shared workspace and filter context across dashboard pages.</p>
        </div>
      </div>
    </aside>
  );
}
