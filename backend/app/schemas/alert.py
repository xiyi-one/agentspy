from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel

AlertSeverity = Literal["info", "low", "medium", "high", "critical"]
AlertStatus = Literal["open", "resolved"]


class AlertRead(BaseModel):
    id: int
    workspace_id: str
    agent_id: str
    run_id: str | None = None
    event_id: str | None = None
    rule_id: int | None = None
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: str
    evidence: dict[str, Any] | None = None
    created_at: datetime
    resolved_at: datetime | None = None
