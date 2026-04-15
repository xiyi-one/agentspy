import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.95),transparent_26%),radial-gradient(circle_at_85%_0%,rgba(203,213,225,0.55),transparent_28%),linear-gradient(135deg,#f7f3ec_0%,#edf0f3_52%,#f7f7f4_100%)]">
      <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
      <AppSidebar />
      <main className="relative px-4 pb-10 md:px-8 lg:pl-[21rem]">
        <AppHeader />
        <div className="mx-auto max-w-7xl pt-8">{children}</div>
      </main>
    </div>
  );
}
