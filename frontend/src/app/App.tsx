import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useDashboardUrlSync } from "@/hooks/useDashboardUrlSync";
import { AlertsPage, CostPage, EventsPage, OverviewPage, RulesPage } from "@/pages";
import { useDashboardStore } from "@/store/useDashboardStore";

const pages = {
  overview: <OverviewPage />,
  events: <EventsPage />,
  alerts: <AlertsPage />,
  rules: <RulesPage />,
  cost: <CostPage />,
};

export function App() {
  useDashboardUrlSync();
  const selectedSection = useDashboardStore((state) => state.selectedSection);

  return <DashboardShell>{pages[selectedSection]}</DashboardShell>;
}
