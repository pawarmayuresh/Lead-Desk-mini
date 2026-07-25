from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.database.connection import engine

# Session factory — one session per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.

    Usage:
        @router.get("/")
        def endpoint(db: Session = Depends(get_db)):
            ...

    Guarantees the session is always closed after the request,
    even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
