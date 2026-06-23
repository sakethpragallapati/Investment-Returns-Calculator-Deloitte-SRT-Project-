"""
UPEMP 2020 Capital Subsidy Calculator — Database Layer
Uses SQLAlchemy with PostgreSQL (Neon DB compatible).
"""

import os
import ssl
from dotenv import load_dotenv
from datetime import datetime, timezone
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import sessionmaker, relationship, DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/upemp2020"
)

# Neon DB requires SSL; create engine with appropriate connect_args
connect_args = {}
if "neon.tech" in DATABASE_URL:
    connect_args["sslmode"] = "require"

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    contact_number = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    calculations = relationship("Calculation", back_populates="lead")


class Calculation(Base):
    __tablename__ = "calculations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)

    # Raw Inputs
    raw_land = Column(Float, nullable=False, default=0)
    raw_building = Column(Float, nullable=False, default=0)
    raw_new_machinery = Column(Float, nullable=False)
    raw_refurb_machinery = Column(Float, nullable=False, default=0)
    is_goi_evaluated = Column(Boolean, nullable=False, default=False)
    is_rented_building = Column(Boolean, nullable=False, default=False)
    employment_count = Column(Integer, nullable=False, default=0)
    is_focus_area = Column(Boolean, nullable=False, default=False)
    focus_area_type = Column(String(50), nullable=True)
    anchor_units = Column(String(50), nullable=True)

    # Computed Values
    building_included = Column(Float, nullable=False)
    refurb_included = Column(Float, nullable=False)
    calc_fci = Column(Float, nullable=False)
    base_subsidy = Column(Float, nullable=False)
    mega_bonus = Column(Float, nullable=False, default=0)
    core_subsidy_capped = Column(Float, nullable=False)
    multiplier_bonus = Column(Float, nullable=False, default=0)
    total_subsidy = Column(Float, nullable=False)
    disbursement_years = Column(Integer, nullable=False)
    disbursement_per_year = Column(Float, nullable=False)

    # Metadata
    policy_version = Column(String(20), nullable=False, default="UPEMP2020")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    lead = relationship("Lead", back_populates="calculations")


def get_db():
    """Dependency for FastAPI — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
