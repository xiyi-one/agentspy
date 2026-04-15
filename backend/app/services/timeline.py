from sqlalchemy import Select, func, select

from app.core.database import SessionLocal
from app.models.event import Event
from app.schemas.timeline import TimelineEvent, TimelineEventList
from app.timeline.summarizer import build_summary


def list_events(
    workspace_id: str,
    agent_id: str | None = None,
    run_id: str | None = None,
    limit: int | None = None,
    offset: int | None = None,
) -> TimelineEventList:
    filters = [Event.workspace_id == workspace_id]
    if agent_id:
        filters.append(Event.agent_id == agent_id)
    if run_id:
        filters.append(Event.run_id == run_id)

    count_statement = select(func.count()).select_from(Event).where(*filters)
    statement: Select[tuple[Event]] = (
        select(Event)
        .where(*filters)
        .order_by(Event.timestamp.desc())
    )
    if offset is not None:
        statement = statement.offset(offset)
    if limit is not None:
        statement = statement.limit(limit)

    with SessionLocal() as session:
        total = session.scalar(count_statement) or 0
        events = session.scalars(statement).all()

    return TimelineEventList(
        events=[
            TimelineEvent(
                id=event.id,
                workspace_id=event.workspace_id,
                agent_id=event.agent_id,
                run_id=event.run_id,
                event_id=event.event_id,
                timestamp=event.timestamp,
                category=event.category,
                action=event.action,
                target=event.target,
                status=event.status,
                cost=event.cost,
                metadata=event.metadata_json,
                summary_text=build_summary(event.category, event.action, event.target),
            )
            for event in events
        ],
        total=total,
    )
