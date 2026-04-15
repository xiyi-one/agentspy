from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class EvidenceItem:
    field: str
    operator: str
    expected: Any
    actual: Any | None = None


@dataclass(frozen=True)
class MatchResult:
    rule_id: int | None
    matched: bool
    evidence: list[EvidenceItem] = field(default_factory=list)


@dataclass(frozen=True)
class CompiledRule:
    rule_id: int | None
    workspace_id: str
    name: str
    severity: str
    rule_type: str
    condition_category: str | None
    condition_action: str | None
    condition_target_contains: str | None
    condition_cost_threshold: float | None
    conditions: list[dict[str, Any]] | None
    actions: list[dict[str, Any]]
