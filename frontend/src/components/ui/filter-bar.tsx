import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  chips: string[];
  className?: string;
}

export function FilterBar({ searchValue = "", onSearchChange, chips, className }: FilterBarProps) {
  return (
    <div className={cn("glass-panel rounded-[2rem] p-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 shadow-inset">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search events, targets, agents"
            className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 shadow-inset">
              {chip}
            </span>
          ))}
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
