from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.event import Event
from app.schemas.cost import CostBreakdownItem, CostSummary, DailyCostItem, DailyCostSummary


def resolve_date_range(
    period: str | None = "today",
    start_date: date | None = None,
    end_date: date | None = None,
) -> tuple[date, date]:
    if start_date and end_date:
        return start_date, end_date

    today = datetime.now(timezone.utc).date()

    if period == "week":
        return today - timedelta(days=6), today
    if period == "month":
        return today.replace(day=1), today

    return today, today


def get_cost_summary(
    workspace_id: str,
    agent_id: str | None = None,
    period: str | None = "today",
    start_date: date | None = None,
    end_date: date | None = None,
) -> CostSummary:
    range_start, range_end = resolve_date_range(period, start_date, end_date)
    events = _load_cost_events(workspace_id, agent_id, range_start, range_end)

    currency = _select_currency(events)
    total = sum(_cost_amount(event.cost) for event in events)

    return CostSummary(
        workspace_id=workspace_id,
        agent_id=agent_id,
        start_date=range_start,
        end_date=range_end,
        total_amount=total,
        currency=currency,
        provider_breakdown=_provider_breakdown(events, currency),
        agent_breakdown=_agent_breakdown(events, currency),
    )


def get_daily_costs(
    workspace_id: str,
    agent_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int | None = None,
) -> DailyCostSummary:
    range_start, range_end = resolve_date_range(
        period="week",
        start_date=start_date,
        end_date=end_date,
    )
    events = _load_cost_events(workspace_id, agent_id, range_start, range_end)
    currency = _select_currency(events)
    totals: dict[date, float] = defaultdict(float)

    for event in events:
        totals[event.timestamp.date()] += _cost_amount(event.cost)

    items = [
        DailyCostItem(date=day, total_amount=amount, currency=currency)
        for day, amount in sorted(totals.items())
    ]

    if limit is not None:
        items = items[:limit]

    return DailyCostSummary(
        workspace_id=workspace_id,
        agent_id=agent_id,
        start_date=range_start,
        end_date=range_end,
        items=items,
    )


def _load_cost_events(
    workspace_id: str,
    agent_id: str | None,
    start_date: date,
    end_date: date,
) -> list[Event]:
    start_at = datetime.combine(start_date, time.min)
    end_at = datetime.combine(end_date, time.max)
    statement = (
        select(Event)
        .where(Event.workspace_id == workspace_id)
        .where(Event.timestamp >= start_at)
        .where(Event.timestamp <= end_at)
        .where(Event.cost.is_not(None))
    )

    if agent_id:
        statement = statement.where(Event.agent_id == agent_id)

    with SessionLocal() as session:
        return list(session.scalars(statement).all())


def _cost_amount(cost: dict[str, Any] | None) -> float:
    if not cost:
        return 0.0

    amount = cost.get("amount")
    if isinstance(amount, int | float):
        return float(amount)

    return 0.0


def _cost_currency(cost: dict[str, Any] | None) -> str | None:
    if not cost:
        return None

    currency = cost.get("currency")
    return currency if isinstance(currency, str) else None


def _select_currency(events: list[Event]) -> str:
    for event in events:
        currency = _cost_currency(event.cost)
        if currency:
            return currency
    return "USD"


def _provider_breakdown(events: list[Event], currency: str) -> list[CostBreakdownItem]:
    totals: dict[str, float] = defaultdict(float)

    for event in events:
        provider = _provider_key(event)
        totals[provider] += _cost_amount(event.cost)

    return [
        CostBreakdownItem(key=key, total_amount=amount, currency=currency)
        for key, amount in sorted(totals.items())
    ]


def _agent_breakdown(events: list[Event], currency: str) -> list[CostBreakdownItem]:
    totals: dict[str, float] = defaultdict(float)

    for event in events:
        totals[event.agent_id] += _cost_amount(event.cost)

    return [
        CostBreakdownItem(key=key, total_amount=amount, currency=currency)
        for key, amount in sorted(totals.items())
    ]


def _provider_key(event: Event) -> str:
    provider = event.metadata_json.get("provider") if event.metadata_json else None
    if isinstance(provider, str):
        return provider

    model = event.metadata_json.get("model") if event.metadata_json else None
    if isinstance(model, str):
        return model

    return event.category
