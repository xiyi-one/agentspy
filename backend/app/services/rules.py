from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.rule import Rule
from app.schemas.rule import RuleCreate, RuleRead


def create_rule(rule: RuleCreate) -> RuleRead:
    db_rule = Rule(
        id=rule.id,
        workspace_id=rule.workspace_id,
        name=rule.name,
        enabled=rule.enabled,
        severity=rule.severity,
        rule_type=rule.rule_type,
        condition_category=rule.condition_category,
        condition_action=rule.condition_action,
        condition_target_contains=rule.condition_target_contains,
        condition_cost_threshold=rule.condition_cost_threshold,
        conditions=(
            [condition.model_dump() for condition in rule.conditions]
            if rule.conditions
            else None
        ),
        actions=[action.model_dump() for action in rule.actions],
    )

    with SessionLocal() as session:
        session.add(db_rule)
        session.commit()
        session.refresh(db_rule)
        return _to_rule_read(db_rule)


def list_rules(workspace_id: str | None = None) -> list[RuleRead]:
    statement = select(Rule).order_by(Rule.created_at.desc())

    if workspace_id:
        statement = statement.where(Rule.workspace_id == workspace_id)

    with SessionLocal() as session:
        rules = session.scalars(statement).all()

    return [_to_rule_read(rule) for rule in rules]


def list_active_rules(workspace_id: str) -> list[RuleRead]:
    statement = (
        select(Rule)
        .where(Rule.workspace_id == workspace_id)
        .where(Rule.enabled.is_(True))
        .order_by(Rule.created_at.desc())
    )

    with SessionLocal() as session:
        rules = session.scalars(statement).all()

    return [_to_rule_read(rule) for rule in rules]


def _to_rule_read(rule: Rule) -> RuleRead:
    return RuleRead(
        id=rule.id,
        workspace_id=rule.workspace_id,
        name=rule.name,
        enabled=rule.enabled,
        severity=rule.severity,
        rule_type=rule.rule_type,
        condition_category=rule.condition_category,
        condition_action=rule.condition_action,
        condition_target_contains=rule.condition_target_contains,
        condition_cost_threshold=rule.condition_cost_threshold,
        conditions=rule.conditions,
        actions=rule.actions,
        created_at=rule.created_at,
        updated_at=rule.updated_at,
    )
