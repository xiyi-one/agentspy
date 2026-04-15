# Alerts

Alerts are records created when ingest evaluates a stateless rule and the normalized event matches all rule conditions.

The initial alert shape includes:

- workspace, agent, run, event, and optional rule references
- `severity`
- `status`
- `title`
- `description`
- optional structured `evidence`
- creation and resolution timestamps

Not implemented yet:

- notification dispatch
- notification channel linkage
- deduplication
- escalation logic
- dispatch state tracking
