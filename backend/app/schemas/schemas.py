"""
Pydantic schemas — request bodies and response shapes for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.models import GuidanceLevel, ScaffoldStage


# ─── Problem ────────────────────────────────────────────────────────────────

class ProblemBase(BaseModel):
    title: str
    subject: str
    difficulty: str
    statement: str


class ProblemCreate(ProblemBase):
    correct_answer: Optional[str] = None
    correct_option: Optional[str] = None   # A/B/C/D
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    hint_strategy: Optional[str] = None
    hint_partial: Optional[str] = None
    solution: Optional[str] = None


class ProblemOut(ProblemBase):
    id: int
    correct_option: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Session ────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    problem_id: int
    guidance_level: GuidanceLevel = GuidanceLevel.moderate


class SessionOut(BaseModel):
    id: int
    session_token: str
    problem_id: int
    guidance_level: GuidanceLevel
    scaffold_stage: ScaffoldStage
    attempt_count: int
    reflection_done: bool
    confidence_rating: Optional[float]
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    guidance_level: Optional[GuidanceLevel] = None
    confidence_rating: Optional[float] = Field(None, ge=0.0, le=1.0)


# ─── Attempt ─────────────────────────────────────────────────────────────────

class AttemptCreate(BaseModel):
    answer_text: str


class AttemptOut(BaseModel):
    id: int
    session_id: int
    answer_text: str
    is_correct: Optional[bool]
    submitted_at: datetime

    class Config:
        from_attributes = True


class AttemptResponse(BaseModel):
    """Returned to client after submitting an answer."""
    attempt: AttemptOut
    session: SessionOut
    feedback: str                   # "correct" | "incorrect" | "needs_reflection"
    next_action: str                # what the UI should prompt next
    solution: Optional[str] = None  # included when feedback == "correct"


# ─── Reflection ──────────────────────────────────────────────────────────────

class ReflectionCreate(BaseModel):
    prompt_text: str
    response_text: str
    stage: ScaffoldStage


class ReflectionOut(BaseModel):
    id: int
    session_id: int
    prompt_text: str
    response_text: str
    stage: ScaffoldStage
    submitted_at: datetime

    class Config:
        from_attributes = True


class ReflectionResponse(BaseModel):
    """Returned after submitting a reflection — includes AI quality evaluation."""
    accepted: bool
    nudge: Optional[str] = None
    reflection: Optional[ReflectionOut] = None


# ─── Guidance ────────────────────────────────────────────────────────────────

class GuidanceRequest(BaseModel):
    """Client asks for the next guidance stage."""
    session_token: str


class GuidanceResponse(BaseModel):
    stage: ScaffoldStage
    content: str                    # AI-generated hint / cue / solution text
    reflection_required: bool       # true if student must reflect before seeing this
    reflection_prompt: Optional[str] = None
    effort_gate: bool = False       # true if attempt threshold not yet met
    timer_seconds: Optional[int] = None  # set when stage == full_solution


# ─── Transparency ─────────────────────────────────────────────────────────────

class AlternativeExplanationRequest(BaseModel):
    session_token: str
    original_solution: str


class AlternativeExplanationResponse(BaseModel):
    explanation: str
    disclaimer: str = "This is a suggested solution. Compare it with your reasoning."
