from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
raw_db_url = os.getenv("DATABASE_URL", "").strip()

if not raw_db_url:
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'lms.db')}"
else:
    DATABASE_URL = raw_db_url

# Fix legacy postgres:// dialect prefix used by Render, Heroku, Railway for SQLAlchemy >= 1.4
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Only SQLite supports/requires check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
