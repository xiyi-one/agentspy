from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, JSON, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workspace_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    agent_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    run_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    event_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    rule_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="open")
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    evidence: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
