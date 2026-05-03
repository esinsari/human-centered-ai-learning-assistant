"""
SQLAlchemy ORM models for StriveAI.

Tables:
  problems        — predefined academic problems (served as JSON)
  learning_sessions — one session per student/problem attempt
  attempts        — each answer submission within a session
  reflections     — student reflection text submitted before assistance
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class GuidanceLevel(str, enum.Enum):
    minimal = "minimal"
    moderate = "moderate"
    high = "high"


class ScaffoldStage(str, enum.Enum):
    none = "none"
    strategy_cue = "strategy_cue"
    partial_hint = "partial_hint"
    full_solution = "full_solution"


class Problem(Base):
    __tablename__ = "problems"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(255), nullable=False)
    subject      = Column(String(100), nullable=False)          # e.g. "algebra", "physics"
    difficulty   = Column(String(50), nullable=False)           # easy / medium / hard
    statement    = Column(Text, nullable=False)                  # problem text shown to student
    correct_answer = Column(String(500), nullable=True)         # legacy text field
    correct_option = Column(String(1), nullable=True)           # A/B/C/D for auto-grading
    option_a       = Column(String(500), nullable=True)
    option_b       = Column(String(500), nullable=True)
    option_c       = Column(String(500), nullable=True)
    option_d       = Column(String(500), nullable=True)
    hint_strategy  = Column(Text, nullable=True)                # strategy cue text
    hint_partial   = Column(Text, nullable=True)                # partial hint text
    solution       = Column(Text, nullable=True)                # full solution (never shown first)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("LearningSession", back_populates="problem")


class LearningSession(Base):
    """
    One session = one student working through one problem.
    Tracks cumulative state: attempt count, scaffold stage, guidance level.
    """
    __tablename__ = "learning_sessions"

    id              = Column(Integer, primary_key=True, index=True)
    session_token   = Column(String(64), unique=True, index=True)   # anonymous token
    problem_id      = Column(Integer, ForeignKey("problems.id"), nullable=False)
    guidance_level  = Column(Enum(GuidanceLevel), default=GuidanceLevel.moderate)
    scaffold_stage  = Column(Enum(ScaffoldStage), default=ScaffoldStage.none)
    attempt_count   = Column(Integer, default=0)
    reflection_done = Column(Boolean, default=False)
    completed       = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    problem  = relationship("Problem", back_populates="sessions")
    attempts = relationship("Attempt", back_populates="session", order_by="Attempt.id")
    reflections = relationship("Reflection", back_populates="session")


class Attempt(Base):
    """Student answer submission — each one increments attempt_count on the session."""
    __tablename__ = "attempts"

    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(Integer, ForeignKey("learning_sessions.id"), nullable=False)
    answer_text  = Column(Text, nullable=False)
    is_correct   = Column(Boolean, nullable=True)       # None = not auto-graded
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("LearningSession", back_populates="attempts")


class Reflection(Base):
    """Required reflection text before AI assistance is unlocked."""
    __tablename__ = "reflections"

    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(Integer, ForeignKey("learning_sessions.id"), nullable=False)
    prompt_text  = Column(Text, nullable=False)         # the reflective question shown
    response_text = Column(Text, nullable=False)        # student's written response
    stage        = Column(Enum(ScaffoldStage), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("LearningSession", back_populates="reflections")
