import type { EventItem, AlertItem, CostBreakdownItem, CostDailyItem, CostSummary, RuleItem } from "@/types/domain";

export const mockEvents: EventItem[] = [
  {
    id: 4,
    event_id: "demo_evt_004_llm_completion",
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260415-0930",
    timestamp: "2026-04-15T09:33:00Z",
    category: "llm",
    action: "completion",
    target: { type: "model", value: "gpt-5.4-mini" },
    status: "success",
    cost: { amount: 0.0185, currency: "USD" },
    metadata: { provider: "openai", input_tokens: 1800, output_tokens: 420 },
    summary_text: "llm.completion",
  },
  {
    id: 3,
    event_id: "demo_evt_003_email_send",
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260415-0930",
    timestamp: "2026-04-15T09:32:00Z",
    category: "email",
    action: "send",
    target: { type: "email_address", value: "customer1842@example.com" },
    status: "success",
    cost: null,
    metadata: { provider: "smtp", subject: "Follow-up on your support request" },
    summary_text: "Sent email to customer1842@example.com",
  },
  {
    id: 2,
    event_id: "demo_evt_002_env_read",
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260415-0930",
    timestamp: "2026-04-15T09:31:00Z",
    category: "file",
    action: "read",
    target: { type: "file_path", value: "/srv/customer-support/.env" },
    status: "success",
    cost: null,
    metadata: { bytes: 512, reason: "inspect runtime configuration" },
    summary_text: "Read file /srv/customer-support/.env",
    risky: true,
  },
  {
    id: 1,
    event_id: "demo_evt_001_admin_open",
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260415-0930",
    timestamp: "2026-04-15T09:30:00Z",
    category: "browser",
    action: "navigate",
    target: { type: "url", value: "https://admin.example.local/customers/1842" },
    status: "success",
    cost: null,
    metadata: { page: "customer_profile", customer_id: "1842" },
    summary_text: "Opened https://admin.example.local/customers/1842",
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 1,
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260415-0930",
    event_id: "demo_evt_002_env_read",
    rule_id: 1,
    severity: "high",
    status: "open",
    title: "Sensitive .env file read",
    description: "Event demo_evt_002_env_read matched rule Sensitive .env file read.",
    created_at: "2026-04-15T09:31:01Z",
  },
  {
    id: 2,
    workspace_id: "ws_demo",
    agent_id: "customer-support-agent",
    run_id: "support-run-20260414-1710",
    event_id: "demo_evt_prev_cost_review",
    rule_id: 2,
    severity: "medium",
    status: "resolved",
    title: "LLM cost threshold reviewed",
    description: "Previous run exceeded the review threshold and was marked resolved after inspection.",
    created_at: "2026-04-14T17:11:00Z",
  },
];

export const mockRules: RuleItem[] = [
  {
    id: 1,
    workspace_id: "ws_demo",
    name: "Sensitive .env file read",
    enabled: true,
    severity: "high",
    rule_type: "stateless",
    condition_category: "file",
    condition_action: "read",
    condition_target_contains: ".env",
    actions: [{ type: "create_alert", params: null }],
  },
  {
    id: 2,
    workspace_id: "ws_demo",
    name: "High LLM cost",
    enabled: true,
    severity: "medium",
    rule_type: "stateless",
    condition_category: "llm",
    condition_cost_threshold: 0.015,
    actions: [{ type: "create_alert", params: null }],
  },
];

export const mockCostSummary: CostSummary = {
  workspace_id: "ws_demo",
  agent_id: null,
  start_date: "2026-04-15",
  end_date: "2026-04-15",
  total_amount: 0.0185,
  currency: "USD",
  provider_breakdown: [
    { key: "openai", label: "OpenAI", total_amount: 0.0185, currency: "USD", event_count: 1 },
  ],
  agent_breakdown: [
    { key: "customer-support-agent", label: "Customer Support Agent", total_amount: 0.0185, currency: "USD", event_count: 1 },
  ],
};

export const mockDailyCosts: CostDailyItem[] = [
  { date: "2026-04-11", total_amount: 0.0042, currency: "USD" },
  { date: "2026-04-12", total_amount: 0.0078, currency: "USD" },
  { date: "2026-04-13", total_amount: 0.0061, currency: "USD" },
  { date: "2026-04-14", total_amount: 0.0112, currency: "USD" },
  { date: "2026-04-15", total_amount: 0.0185, currency: "USD" },
];


export const mockProviderCosts: CostBreakdownItem[] = [
  { key: "openai", label: "OpenAI", total_amount: 0.0185, currency: "USD", event_count: 1 },
  { key: "smtp", label: "SMTP side effects", total_amount: 0, currency: "USD", event_count: 1 },
];

export const mockAgentCosts: CostBreakdownItem[] = [
  { key: "customer-support-agent", label: "Customer Support Agent", total_amount: 0.0185, currency: "USD", event_count: 1 },
  { key: "support-audit-helper", label: "Support Audit Helper", total_amount: 0.0068, currency: "USD", event_count: 2 },
];
