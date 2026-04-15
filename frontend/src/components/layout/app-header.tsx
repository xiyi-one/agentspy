import { Activity, CircleDot, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_WORKSPACE_ID, DEMO_WORKSPACE_LABEL } from "@/lib/demo";
import { useDashboardStore, type TimeRangeOption } from "@/store/useDashboardStore";

const titles = {
  overview: "Operational overview",
  events: "Event timeline",
  alerts: "Alert inbox",
  rules: "Rule controls",
  cost: "Cost intelligence",
};

const timeRangeOptions: Array<{ value: TimeRangeOption; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const workspaceOptions = [
  { value: DEMO_WORKSPACE_ID, label: DEMO_WORKSPACE_LABEL },
  { value: "workspace_local", label: "Local Workspace" },
];

export function AppHeader() {
  const selectedSection = useDashboardStore((state) => state.selectedSection);
  const currentWorkspaceId = useDashboardStore((state) => state.currentWorkspaceId);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedRunId = useDashboardStore((state) => state.selectedRunId);
  const selectedTimeRange = useDashboardStore((state) => state.selectedTimeRange);
  const setWorkspaceId = useDashboardStore((state) => state.setWorkspaceId);
  const setAgentId = useDashboardStore((state) => state.setAgentId);
  const setRunId = useDashboardStore((state) => state.setRunId);
  const setTimeRange = useDashboardStore((state) => state.setTimeRange);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const enterDemoWorkspace = useDashboardStore((state) => state.enterDemoWorkspace);
  const isDemoWorkspace = currentWorkspaceId === DEMO_WORKSPACE_ID;

  return (
    <header className="sticky top-0 z-10 -mx-4 border-b border-white/50 bg-background/70 px-4 py-5 backdrop-blur-2xl md:-mx-8 md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            <CircleDot className="h-3.5 w-3.5 fill-emerald-400 text-emerald-500" />
            Workspace {currentWorkspaceId}
            {isDemoWorkspace ? <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] text-white">Demo</span> : null}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.045em] text-slate-950 md:text-4xl">
            {titles[selectedSection]}
          </h1>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Button variant={isDemoWorkspace ? "default" : "outline"} size="sm" onClick={enterDemoWorkspace} className="rounded-full">
            <Play className="h-3.5 w-3.5" />
            View Demo
          </Button>
          <div className="hairline-panel hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 sm:flex">
            <Activity className="h-4 w-4 text-emerald-500" />
            In-process MVP
          </div>
          <div className="hairline-panel grid gap-2 rounded-[1.5rem] p-2 sm:grid-cols-2 lg:grid-cols-[10rem_8rem_11rem_11rem_auto]">
            <ContextSelect label="Workspace" value={currentWorkspaceId} onChange={setWorkspaceId} options={workspaceOptions} />
            <label className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-inset">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Range</span>
              <select
                value={selectedTimeRange}
                onChange={(event) => setTimeRange(event.target.value as TimeRangeOption)}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
              >
                {timeRangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <ContextInput label="Agent" value={selectedAgentId ?? ""} placeholder="All agents" onChange={setAgentId} />
            <ContextInput label="Run" value={selectedRunId ?? ""} placeholder="All runs" onChange={setRunId} />
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-full justify-center rounded-2xl">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ContextSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-inset">
      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ContextInput({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string | null) => void }) {
  return (
    <label className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-inset">
      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
