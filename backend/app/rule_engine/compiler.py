from typing import Iterable

from app.rule_engine.types import CompiledRule
from app.schemas.rule import RuleCreate, RuleRead


def compile_rule(rule: RuleCreate | RuleRead) -> CompiledRule:
    """Prepare one structured rule definition for future evaluation.

    The compiler is responsible for validation and preparation of rule data.
    It is not responsible for persistence, alert creation, or notifications.
    """
    return CompiledRule(
        rule_id=rule.id,
        workspace_id=rule.workspace_id,
        name=rule.name,
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


def compile_rules(rules: Iterable[RuleCreate | RuleRead]) -> list[CompiledRule]:
    """Prepare multiple structured rule definitions for future evaluation."""
    return [compile_rule(rule) for rule in rules]
