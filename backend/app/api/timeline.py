from fastapi import APIRouter

from app.schemas.timeline import TimelineEventList
from app.services.timeline import list_events

router = APIRouter(prefix="/api/v1")


@router.get("/events", response_model=TimelineEventList)
async def get_events(
    workspace_id: str,
    agent_id: str | None = None,
    run_id: str | None = None,
    limit: int | None = None,
    offset: int | None = None,
) -> TimelineEventList:
    return list_events(
        workspace_id=workspace_id,
        agent_id=agent_id,
        run_id=run_id,
        limit=limit,
        offset=offset,
    )
