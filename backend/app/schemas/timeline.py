from datetime import datetime
from typing import Any

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    id: int
    workspace_id: str
    agent_id: str
    run_id: str | None
    event_id: str | None
    timestamp: datetime
    category: str
    action: str
    target: dict[str, Any]
    status: str | None
    cost: dict[str, Any] | None
    metadata: dict[str, Any] | None
    summary_text: str


class TimelineEventList(BaseModel):
    events: list[TimelineEvent]
    total: int
