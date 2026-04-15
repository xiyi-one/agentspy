from datetime import date

from pydantic import BaseModel


class CostBreakdownItem(BaseModel):
    key: str
    total_amount: float
    currency: str


class CostSummary(BaseModel):
    workspace_id: str
    agent_id: str | None = None
    start_date: date
    end_date: date
    total_amount: float
    currency: str
    provider_breakdown: list[CostBreakdownItem] = []
    agent_breakdown: list[CostBreakdownItem] = []


class DailyCostItem(BaseModel):
    date: date
    total_amount: float
    currency: str


class DailyCostSummary(BaseModel):
    workspace_id: str
    agent_id: str | None = None
    start_date: date
    end_date: date
    items: list[DailyCostItem]
