from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, JSON, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Rule(Base):
    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workspace_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    rule_type: Mapped[str] = mapped_column(String, nullable=False, default="stateless")
    condition_category: Mapped[str | None] = mapped_column(String, nullable=True)
    condition_action: Mapped[str | None] = mapped_column(String, nullable=True)
    condition_target_contains: Mapped[str | None] = mapped_column(String, nullable=True)
    condition_cost_threshold: Mapped[float | None] = mapped_column(nullable=True)
    conditions: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    actions: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
