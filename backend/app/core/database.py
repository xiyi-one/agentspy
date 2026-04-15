from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "sqlite:///./agentspy.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def create_db_and_tables() -> None:
    import app.models.alert  # noqa: F401
    import app.models.event  # noqa: F401
    import app.models.rule  # noqa: F401

    Base.metadata.create_all(bind=engine)
