import { Badge } from "@/components/ui/badge";
import type { AlertSeverity, AlertStatus, EventStatus } from "@/types/domain";

export function StatusBadge({ status }: { status: EventStatus | AlertStatus }) {
  const variant = status === "success" || status === "resolved" ? "success" : status === "open" ? "warning" : "neutral";
  return <Badge variant={variant}>{status}</Badge>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const variant = severity === "critical" || severity === "high" ? "danger" : severity === "medium" ? "warning" : "neutral";
  return <Badge variant={variant}>{severity}</Badge>;
}
