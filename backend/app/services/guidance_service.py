"""
Guidance service — core business logic for staged assistance.

Stage progression rules (from proposal Section 3.2):
  none          → strategy_cue  (on first guidance request, reflection required)
  strategy_cue  → partial_hint  (reflection required)
  partial_hint  → full_solution (effort gate: ≥2 attempts OR reflection done; + timer on frontend)
"""

from sqlalchemy.orm import Session
from app.models.models import LearningSession, ScaffoldStage, GuidanceLevel
from app.schemas.schemas import GuidanceResponse
from app.services import openai_service
from app.core.config import settings


def _effort_gate_passed(session: LearningSession) -> bool:
    """Full solution requires ≥2 attempts OR reflection completed."""
    return session.attempt_count >= settings.MIN_ATTEMPTS_BEFORE_FULL_SOLUTION or session.reflection_done


def _reflection_required_for_stage(stage: ScaffoldStage, guidance_level: GuidanceLevel) -> bool:
    """Minimal guidance skips reflection; moderate/high always require it."""
    if guidance_level == GuidanceLevel.minimal:
        return False
    return stage in (ScaffoldStage.strategy_cue, ScaffoldStage.partial_hint)


def get_next_guidance(db: Session, session: LearningSession, problem_statement: str) -> GuidanceResponse:
    """
    Determines the next scaffold stage and returns appropriate content.
    Does NOT advance the stage — call advance_stage() after frontend confirms reflection.
    """
    current = session.scaffold_stage
    
    # Determine what stage to show next
    stage_order = [
        ScaffoldStage.none,
        ScaffoldStage.strategy_cue,
        ScaffoldStage.partial_hint,
        ScaffoldStage.full_solution,
    ]
    current_idx = stage_order.index(current)
    next_stage = stage_order[min(current_idx + 1, len(stage_order) - 1)]

    # Effort gate check for full solution
    if next_stage == ScaffoldStage.full_solution and not _effort_gate_passed(session):
        return GuidanceResponse(
            stage=current,
            content="",
            reflection_required=False,
            effort_gate=True,
        )

    # Check if reflection is needed before proceeding
    needs_reflection = _reflection_required_for_stage(next_stage, session.guidance_level)
    if needs_reflection and not session.reflection_done and session.attempt_count > 0:
        prompt = openai_service.get_reflection_prompt(current_idx)
        return GuidanceResponse(
            stage=next_stage,
            content="",
            reflection_required=True,
            reflection_prompt=prompt,
        )

    # Generate AI content for the stage
    content = _generate_content(session, next_stage, problem_statement)

    timer = settings.REFLECTION_TIMER_SECONDS if next_stage == ScaffoldStage.full_solution else None

    return GuidanceResponse(
        stage=next_stage,
        content=content,
        reflection_required=False,
        timer_seconds=timer,
    )


def get_next_stage(session: LearningSession) -> ScaffoldStage:
    """Returns what the next scaffold stage would be without advancing."""
    stage_order = [ScaffoldStage.none, ScaffoldStage.strategy_cue, ScaffoldStage.partial_hint, ScaffoldStage.full_solution]
    current_idx = stage_order.index(session.scaffold_stage)
    return stage_order[min(current_idx + 1, len(stage_order) - 1)]


def advance_stage(db: Session, session: LearningSession) -> LearningSession:
    """Move session to the next scaffold stage after reflection/confirmation."""
    stage_order = [
        ScaffoldStage.none,
        ScaffoldStage.strategy_cue,
        ScaffoldStage.partial_hint,
        ScaffoldStage.full_solution,
    ]
    current_idx = stage_order.index(session.scaffold_stage)
    if current_idx < len(stage_order) - 1:
        session.scaffold_stage = stage_order[current_idx + 1]
    session.reflection_done = False  # reset for next stage
    db.commit()
    db.refresh(session)
    return session


def generate_content(session: LearningSession, stage: ScaffoldStage, problem_statement: str) -> str:
    return _generate_content(session, stage, problem_statement)


def _generate_content(session: LearningSession, stage: ScaffoldStage, problem_statement: str) -> str:
    attempts_summary = f"{session.attempt_count} attempt(s) made"

    if stage == ScaffoldStage.strategy_cue:
        last_attempt = session.attempts[-1].answer_text if session.attempts else ""
        return openai_service.generate_strategy_cue(problem_statement, last_attempt)

    elif stage == ScaffoldStage.partial_hint:
        reflection_text = ""
        if session.reflections:
            reflection_text = session.reflections[-1].response_text
        return openai_service.generate_partial_hint(problem_statement, attempts_summary, reflection_text)

    elif stage == ScaffoldStage.full_solution:
        return openai_service.generate_full_solution(problem_statement, session.attempt_count)

    return ""
