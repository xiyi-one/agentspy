export type EventCategory = "browser" | "file" | "email" | "llm" | "task" | string;
export type EventStatus = "success" | "error" | "skipped" | string;
export type AlertSeverity = "info" | "low" | "medium" | "high" | "critical" | string;
export type AlertStatus = "open" | "resolved" | string;
export type RuleSeverity = AlertSeverity;

export interface EventTarget {
  type: string;
  value: string;
}

export interface CostValue {
  amount: number;
  currency: string;
}

export interface EventItem {
  id: number;
  event_id: string | null;
  workspace_id: string;
  agent_id: string;
  run_id: string | null;
  timestamp: string;
  category: EventCategory;
  action: string;
  target: EventTarget;
  status: EventStatus | null;
  cost: CostValue | null;
  metadata: Record<string, unknown> | null;
  summary_text: string;
  risky?: boolean;
}

export interface EventsResponse {
  events: EventItem[];
  total: number;
}

export interface AlertItem {
  id: number;
  workspace_id: string;
  agent_id: string;
  run_id: string | null;
  event_id: string | null;
  rule_id: number | null;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  evidence?: Record<string, unknown> | null;
  created_at: string;
  resolved_at?: string | null;
}

export interface RuleActionItem {
  type: "create_alert" | "mark_severity" | string;
  params?: Record<string, unknown> | null;
}

export interface RuleConditionItem {
  field: string;
  operator: "eq" | "contains" | "gt" | string;
  value: unknown;
}

export interface RuleItem {
  id: number;
  workspace_id: string;
  name: string;
  enabled: boolean;
  severity: RuleSeverity;
  rule_type: "stateless" | string;
  condition_category?: string | null;
  condition_action?: string | null;
  condition_target_contains?: string | null;
  condition_cost_threshold?: number | null;
  conditions?: RuleConditionItem[] | null;
  actions: RuleActionItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CostBreakdownItem {
  key: string;
  label?: string;
  total_amount: number;
  currency: string;
  event_count?: number;
}

export interface CostSummary {
  workspace_id: string;
  agent_id: string | null;
  start_date: string;
  end_date: string;
  total_amount: number;
  currency: string;
  provider_breakdown?: CostBreakdownItem[];
  agent_breakdown?: CostBreakdownItem[];
}

export interface CostDailyItem {
  date: string;
  total_amount: number;
  currency: string;
}

export interface CostDailyResponse {
  workspace_id: string;
  agent_id: string | null;
  start_date: string;
  end_date: string;
  items: CostDailyItem[];
}
