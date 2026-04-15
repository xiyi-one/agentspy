from fastapi import APIRouter

from app.schemas.alert import AlertRead, AlertSeverity, AlertStatus
from app.services.alerts import list_alerts

router = APIRouter(prefix="/api/v1")


@router.get("/alerts", response_model=list[AlertRead])
async def get_alerts(
    workspace_id: str | None = None,
    agent_id: str | None = None,
    run_id: str | None = None,
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    limit: int | None = None,
) -> list[AlertRead]:
    return list_alerts(
        workspace_id=workspace_id,
        agent_id=agent_id,
        run_id=run_id,
        severity=severity,
        status=status,
        limit=limit,
    )
