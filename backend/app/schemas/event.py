from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EventCost(BaseModel):
    amount: float
    currency: str


class EventTarget(BaseModel):
    type: str
    value: str


class NormalizedEvent(BaseModel):
    workspace_id: str
    agent_id: str
    run_id: str | None = None
    event_id: str | None = None
    timestamp: datetime
    category: str
    action: str
    target: EventTarget
    status: str | None = None
    cost: EventCost | None = None
    metadata: dict[str, Any] | None = None
    raw_payload: dict[str, Any] = Field(
        description="Original source payload before normalization."
    )


class IngestResponse(BaseModel):
    success: bool
    accepted: int
    event_ids: list[str] | None = None