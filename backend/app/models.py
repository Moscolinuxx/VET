"""
SQLAlchemy models for VetGuard AI.

Entities: User (dog owner or admin), Dog, Screening (one ML-assisted screening
event with its captured inputs + prediction), Reminder.
"""
import datetime as dt
import enum
import uuid

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, JSON
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.owner, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    dogs = relationship("Dog", back_populates="owner", cascade="all, delete-orphan")


class Dog(Base):
    __tablename__ = "dogs"

    id = Column(String, primary_key=True, default=gen_id)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    breed = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    age_months = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    vaccination_status = Column(String, default="Unknown")
    deworming_status = Column(String, default="Unknown")
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    owner = relationship("User", back_populates="dogs")
    screenings = relationship("Screening", back_populates="dog", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="dog", cascade="all, delete-orphan")


class Screening(Base):
    __tablename__ = "screenings"

    id = Column(String, primary_key=True, default=gen_id)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Raw feature payload exactly as sent to the model (for audit / re-run)
    input_features = Column(JSON, nullable=False)

    # Human exposure check (separate from the ML model - drives the referral banner)
    human_exposure = Column(JSON, nullable=True)

    predicted_disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities = Column(JSON, nullable=False)  # {disease: probability}
    risk_level = Column(String, nullable=False)   # Low / Moderate / High
    model_name = Column(String, nullable=False)
    model_version = Column(String, default="1.0")

    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    dog = relationship("Dog", back_populates="screenings")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, default=gen_id)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="General")  # Vaccination, Deworming, Vet Visit, General
    due_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    dog = relationship("Dog", back_populates="reminders")
