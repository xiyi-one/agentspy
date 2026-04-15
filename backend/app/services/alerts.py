from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.alert import Alert
from app.schemas.alert import AlertRead, AlertSeverity, AlertStatus
from app.rule_engine.types import MatchResult
from app.schemas.event import NormalizedEvent
from app.schemas.rule import RuleRead


def create_alert_for_match(event: NormalizedEvent, rule: RuleRead, match: MatchResult) -> AlertRead:
    evidence = {
        "conditions": [
            {
                "field": item.field,
                "operator": item.operator,
                "expected": item.expected,
                "actual": item.actual,
            }
            for item in match.evidence
        ]
    }

    db_alert = Alert(
        workspace_id=event.workspace_id,
        agent_id=event.agent_id,
        run_id=event.run_id,
        event_id=event.event_id,
        rule_id=rule.id,
        severity=rule.severity,
        status="open",
        title=rule.name,
        description=f"Event {event.event_id or 'without event_id'} matched rule {rule.name}.",
        evidence=evidence,
    )

    with SessionLocal() as session:
        session.add(db_alert)
        session.commit()
        session.refresh(db_alert)
        return _to_alert_read(db_alert)


def list_alerts(
    workspace_id: str | None = None,
    agent_id: str | None = None,
    run_id: str | None = None,
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    limit: int | None = None,
) -> list[AlertRead]:
    statement = select(Alert).order_by(Alert.created_at.desc())

    if workspace_id:
        statement = statement.where(Alert.workspace_id == workspace_id)
    if agent_id:
        statement = statement.where(Alert.agent_id == agent_id)
    if run_id:
        statement = statement.where(Alert.run_id == run_id)
    if severity:
        statement = statement.where(Alert.severity == severity)
    if status:
        statement = statement.where(Alert.status == status)
    if limit is not None:
        statement = statement.limit(limit)

    with SessionLocal() as session:
        alerts = session.scalars(statement).all()

    return [_to_alert_read(alert) for alert in alerts]


def _to_alert_read(alert: Alert) -> AlertRead:
    return AlertRead(
        id=alert.id,
        workspace_id=alert.workspace_id,
        agent_id=alert.agent_id,
        run_id=alert.run_id,
        event_id=alert.event_id,
        rule_id=alert.rule_id,
        severity=alert.severity,
        status=alert.status,
        title=alert.title,
        description=alert.description,
        evidence=alert.evidence,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
    )
