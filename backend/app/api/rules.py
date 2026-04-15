from fastapi import APIRouter

from app.schemas.rule import RuleCreate, RuleRead
from app.services.rules import create_rule, list_rules

router = APIRouter(prefix="/api/v1")


@router.get("/rules", response_model=list[RuleRead])
async def get_rules(workspace_id: str | None = None) -> list[RuleRead]:
    return list_rules(workspace_id=workspace_id)


@router.post("/rules", response_model=RuleRead)
async def post_rule(rule: RuleCreate) -> RuleRead:
    return create_rule(rule)
