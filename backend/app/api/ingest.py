from fastapi import APIRouter, Header, HTTPException, status

from app.core.auth import resolve_workspace_id
from app.schemas.event import IngestEvent, IngestResponse, NormalizedEvent
from app.services.ingest import ingest_events as ingest_event_list

router = APIRouter(prefix="/api/v1")


@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def ingest_events(
    events: IngestEvent | list[IngestEvent],
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> IngestResponse:
    workspace_id = resolve_workspace_id(x_api_key)
    normalized_events = events if isinstance(events, list) else [events]
    return ingest_event_list(
        [_resolve_event_workspace(event, workspace_id) for event in normalized_events]
    )


def _resolve_event_workspace(event: IngestEvent, workspace_id: str) -> NormalizedEvent:
    if event.workspace_id and event.workspace_id != workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event workspace_id conflicts with X-API-Key workspace.",
        )

    event_data = event.model_dump()
    event_data["workspace_id"] = workspace_id
    return NormalizedEvent(**event_data)
