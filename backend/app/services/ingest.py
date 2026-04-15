from app.schemas.event import IngestResponse
from app.schemas.event import NormalizedEvent
from app.services.ingest_pipeline import submit_events


def ingest_events(events: list[NormalizedEvent]) -> IngestResponse:
    submit_events(events)
    event_ids = [event.event_id for event in events if event.event_id]

    return IngestResponse(
        received=len(events),
        status="queued",
        message="Events accepted for processing.",
        event_ids=event_ids or None,
    )
