from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.api.alerts import router as alerts_router
from app.api.cost import router as cost_router
from app.api.ingest import router as ingest_router
from app.api.rules import router as rules_router
from app.api.timeline import router as timeline_router
from app.core.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    yield


app = FastAPI(title="AgentSpy API", lifespan=lifespan)
app.include_router(ingest_router)
app.include_router(timeline_router)
app.include_router(rules_router)
app.include_router(alerts_router)
app.include_router(cost_router)
