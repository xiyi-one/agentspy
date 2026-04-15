# Rules

Rules define deterministic, stateless checks that future rule evaluation can apply to normalized events.

The preferred MVP rule shape uses first-class condition fields:

- `workspace_id`
- `name`
- `enabled`
- `severity`
- `rule_type`, currently `stateless`
- `condition_category`
- `condition_action`
- `condition_target_contains`
- `condition_cost_threshold`
- declarative `actions`

Generic structured `conditions` are still available as an optional extension path, but MVP rules should prefer the explicit `condition_*` fields.

MVP field behavior:

- `condition_category` matches `event.category`
- `condition_action` matches `event.action`
- `condition_target_contains` checks whether `event.target.value` contains a substring
- `condition_cost_threshold` checks whether `event.cost.amount` is greater than the threshold

Actions are declarative future intents such as `create_alert` and `mark_severity`.

Only stateless rules are supported in v1. All conditions in a rule must match for the rule to match an event.

Example: file read on `.env` target.

```json
{
  "workspace_id": "ws_demo",
  "name": "Detect .env file read",
  "enabled": true,
  "severity": "high",
  "rule_type": "stateless",
  "condition_category": "file",
  "condition_action": "read",
  "condition_target_contains": ".env",
  "actions": [
    {
      "type": "create_alert"
    }
  ]
}
```

Example: high LLM cost.

```json
{
  "workspace_id": "ws_demo",
  "name": "High LLM cost",
  "enabled": true,
  "severity": "medium",
  "rule_type": "stateless",
  "condition_category": "llm",
  "condition_cost_threshold": 1.0,
  "actions": [
    {
      "type": "create_alert"
    }
  ]
}
```

Not implemented yet:

- rule versioning
- background evaluation
- queue integration
- notifications
- alert dispatching
