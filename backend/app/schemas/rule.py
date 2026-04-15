from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, model_validator

RuleOperator = Literal["eq", "contains", "gt"]
RuleActionType = Literal["create_alert", "mark_severity"]
RuleSeverity = Literal["info", "low", "medium", "high", "critical"]
RuleType = Literal["stateless"]


class RuleCondition(BaseModel):
    field: str
    operator: RuleOperator
    value: Any


class RuleAction(BaseModel):
    type: RuleActionType
    params: dict[str, Any] | None = None


class RuleCreate(BaseModel):
    id: int | None = None
    workspace_id: str
    name: str
    enabled: bool = True
    severity: RuleSeverity
    rule_type: RuleType = "stateless"
    condition_category: str | None = None
    condition_action: str | None = None
    condition_target_contains: str | None = None
    condition_cost_threshold: float | None = None
    conditions: list[RuleCondition] | None = None
    actions: list[RuleAction]

    @model_validator(mode="after")
    def require_condition(self) -> "RuleCreate":
        has_mvp_condition = any(
            [
                self.condition_category,
                self.condition_action,
                self.condition_target_contains,
                self.condition_cost_threshold is not None,
            ]
        )
        has_generic_condition = bool(self.conditions)

        if not has_mvp_condition and not has_generic_condition:
            raise ValueError("At least one rule condition is required.")

        return self


class RuleRead(RuleCreate):
    id: int
    created_at: datetime
    updated_at: datetime
