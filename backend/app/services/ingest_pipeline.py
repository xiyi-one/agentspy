from app.core.database import SessionLocal
from app.models.event import Event
from app.rule_engine.compiler import compile_rules
from app.rule_engine.evaluator import evaluate_event
from app.schemas.event import NormalizedEvent
from app.services.alerts import create_alert_for_match
from app.services.rules import list_active_rules


class InProcessIngestPipeline:
    """Queue-ready ingest boundary that currently processes events immediately."""

    def submit_events(self, events: list[NormalizedEvent]) -> None:
        self.process_events(events)

    def process_events(self, events: list[NormalizedEvent]) -> None:
        _persist_events(events)
        _evaluate_rules(events)


def submit_events(events: list[NormalizedEvent]) -> None:
    InProcessIngestPipeline().submit_events(events)


def process_events(events: list[NormalizedEvent]) -> None:
    InProcessIngestPipeline().process_events(events)


def _persist_events(events: list[NormalizedEvent]) -> None:
    with SessionLocal() as session:
        for event in events:
            session.add(
                Event(
                    workspace_id=event.workspace_id,
                    agent_id=event.agent_id,
                    run_id=event.run_id,
                    event_id=event.event_id,
                    timestamp=event.timestamp,
                    category=event.category,
                    action=event.action,
                    target=event.target.model_dump(),
                    status=event.status,
                    cost=event.cost.model_dump() if event.cost else None,
                    metadata_json=event.metadata,
                    raw_payload=event.raw_payload,
                )
            )
        session.commit()


def _evaluate_rules(events: list[NormalizedEvent]) -> None:
    for event in events:
        active_rules = list_active_rules(workspace_id=event.workspace_id)
        compiled_rules = compile_rules(active_rules)
        matches = evaluate_event(event, compiled_rules)
        rules_by_id = {rule.id: rule for rule in active_rules}

        for match in matches:
            if match.rule_id is not None and match.rule_id in rules_by_id:
                create_alert_for_match(event, rules_by_id[match.rule_id], match)
