import { AlertCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function LoadingState({ title = "Loading data", description = "Fetching the latest records from the AgentSpy backend." }: { title?: string; description?: string }) {
  return (
    <div className="hairline-panel rounded-[2rem] p-8">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-100/80" />
        <div className="h-14 animate-pulse rounded-2xl bg-slate-100/70" />
        <div className="h-14 animate-pulse rounded-2xl bg-slate-100/60" />
      </div>
    </div>
  );
}

export function ErrorState({ title = "Backend data unavailable", description }: { title?: string; description?: string }) {
  return (
    <EmptyState
      title={title}
      description={description ?? "Check that the backend is running and VITE_API_BASE_URL points to it."}
      icon={<AlertCircle className="h-5 w-5" />}
      className="border-rose-200/80 bg-rose-50/50"
    />
  );
}
