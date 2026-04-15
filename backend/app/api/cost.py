from datetime import date
from typing import Literal

from fastapi import APIRouter

from app.schemas.cost import CostSummary, DailyCostSummary
from app.services.cost import get_cost_summary, get_daily_costs

router = APIRouter(prefix="/api/v1")


@router.get("/cost/summary", response_model=CostSummary)
async def cost_summary(
    workspace_id: str,
    agent_id: str | None = None,
    period: Literal["today", "week", "month"] = "today",
    start_date: date | None = None,
    end_date: date | None = None,
) -> CostSummary:
    return get_cost_summary(
        workspace_id=workspace_id,
        agent_id=agent_id,
        period=period,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/cost/daily", response_model=DailyCostSummary)
async def daily_costs(
    workspace_id: str,
    agent_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int | None = None,
) -> DailyCostSummary:
    return get_daily_costs(
        workspace_id=workspace_id,
        agent_id=agent_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
    )
