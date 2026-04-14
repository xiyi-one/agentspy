from fastapi import APIRouter

from app.core.database import SessionLocal
from app.models.event import Event
from app.schemas.event import IngestResponse, NormalizedEvent

router = APIRouter(prefix="/api/v1")


@router.post("/ingest", response_model=IngestResponse)
async def ingest_events(events: NormalizedEvent | list[NormalizedEvent]) -> IngestResponse:
    normalized_events = events if isinstance(events, list) else [events]
    event_ids = [event.event_id for event in normalized_events if event.event_id]

    with SessionLocal() as session:
        for event in normalized_events:
            session.add(
                Event(
                    workspace_id=event.workspace_id,
                    agent_id=event.agent_id,
                    run_id=event.run_id,
                    event_id=event.event_id,
                    timestamp=event.timestamp,
                    category=event.category,
                    action=event.action,
                    target=event.target.model_dump(),
                    status=event.status,
                    cost=event.cost.model_dump() if event.cost else None,
                    metadata_json=event.metadata,
                    raw_payload=event.raw_payload,
                )
            )
        session.commit()

    return IngestResponse(
        success=True,
        accepted=len(normalized_events),
        event_ids=event_ids or None,
    )
