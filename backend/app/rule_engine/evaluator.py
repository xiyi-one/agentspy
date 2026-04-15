from app.rule_engine.operators import matches_operator
from app.rule_engine.types import CompiledRule, EvidenceItem, MatchResult
from app.schemas.event import NormalizedEvent

MISSING = object()


def evaluate_event(
    event: NormalizedEvent,
    compiled_rules: list[CompiledRule],
) -> list[MatchResult]:
    """Evaluate one normalized event against compiled rules.

    The evaluator returns match results only. Alert creation, persistence,
    notifications, and queue dispatch belong outside this module.
    """
    event_data = event.model_dump()
    matches: list[MatchResult] = []

    for rule in compiled_rules:
        if rule.rule_type != "stateless":
            continue

        evidence = _evaluate_mvp_conditions(event_data, rule)
        if evidence is not None and rule.conditions:
            generic_evidence = _evaluate_conditions(event_data, rule.conditions)
            if generic_evidence is None:
                evidence = None
            else:
                evidence.extend(generic_evidence)

        if evidence is not None:
            matches.append(
                MatchResult(
                    rule_id=rule.rule_id,
                    matched=True,
                    evidence=evidence,
                )
            )

    return matches


def _evaluate_mvp_conditions(
    event_data: dict[str, object],
    rule: CompiledRule,
) -> list[EvidenceItem] | None:
    evidence: list[EvidenceItem] = []

    checks = [
        ("category", "eq", rule.condition_category),
        ("action", "eq", rule.condition_action),
        ("target.value", "contains", rule.condition_target_contains),
        ("cost.amount", "gt", rule.condition_cost_threshold),
    ]

    for field, operator, expected in checks:
        if expected is None:
            continue

        actual = _get_path(event_data, field)
        if actual is MISSING or not matches_operator(operator, actual, expected):
            return None

        evidence.append(
            EvidenceItem(
                field=field,
                operator=operator,
                expected=expected,
                actual=actual,
            )
        )

    return evidence


def _evaluate_conditions(
    event_data: dict[str, object],
    conditions: list[dict[str, object]],
) -> list[EvidenceItem] | None:
    evidence: list[EvidenceItem] = []

    for condition in conditions:
        field = condition.get("field")
        operator = condition.get("operator")
        expected = condition.get("value")

        if not isinstance(field, str) or not isinstance(operator, str):
            return None

        actual = _get_path(event_data, field)
        if actual is MISSING or not matches_operator(operator, actual, expected):
            return None

        evidence.append(
            EvidenceItem(
                field=field,
                operator=operator,
                expected=expected,
                actual=actual,
            )
        )

    return evidence


def _get_path(data: dict[str, object], path: str) -> object:
    current: object = data

    for part in path.split("."):
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return MISSING

    return current
