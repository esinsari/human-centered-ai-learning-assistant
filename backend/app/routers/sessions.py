import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from app.db.database import get_db
from app.models.models import LearningSession, Attempt, Reflection, Problem
from app.schemas.schemas import (
    SessionCreate, SessionOut, SessionUpdate,
    AttemptCreate, AttemptResponse, AttemptOut,
    ReflectionCreate, ReflectionOut, ReflectionResponse,
)
from app.services.openai_service import evaluate_reflection

router = APIRouter()


def _get_session_or_404(token: str, db: DBSession) -> LearningSession:
    session = db.query(LearningSession).filter(LearningSession.session_token == token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/", response_model=SessionOut, status_code=201)
def create_session(data: SessionCreate, db: DBSession = Depends(get_db)):
    """Start a new learning session for a problem."""
    session = LearningSession(
        session_token=secrets.token_urlsafe(32),
        problem_id=data.problem_id,
        guidance_level=data.guidance_level,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{token}", response_model=SessionOut)
def get_session(token: str, db: DBSession = Depends(get_db)):
    return _get_session_or_404(token, db)


@router.patch("/{token}", response_model=SessionOut)
def update_session(token: str, data: SessionUpdate, db: DBSession = Depends(get_db)):
    """Update guidance level."""
    session = _get_session_or_404(token, db)
    if data.guidance_level is not None:
        session.guidance_level = data.guidance_level
    db.commit()
    db.refresh(session)
    return session


@router.post("/{token}/attempts", response_model=AttemptResponse, status_code=201)
def submit_attempt(token: str, data: AttemptCreate, db: DBSession = Depends(get_db)):
    """
    Submit a student answer.
    - Increments attempt_count on session
    - Returns next_action: 'reflect' | 'request_guidance' | 'correct'
    """
    session = _get_session_or_404(token, db)

    # Auto-grade if problem has a correct_option
    problem = db.query(Problem).filter(Problem.id == session.problem_id).first()
    is_correct = None
    if problem and problem.correct_option:
        is_correct = data.answer_text.strip().upper() == problem.correct_option.strip().upper()

    attempt = Attempt(
        session_id=session.id,
        answer_text=data.answer_text,
        is_correct=is_correct,
    )
    db.add(attempt)
    session.attempt_count += 1
    db.commit()
    db.refresh(attempt)
    db.refresh(session)

    # Determine next action for the frontend
    if attempt.is_correct is True:
        next_action = "correct"
        feedback = "correct"
    elif not session.reflection_done:
        next_action = "reflect"
        feedback = "incorrect"
    else:
        next_action = "request_guidance"
        feedback = "incorrect"

    return AttemptResponse(
        attempt=AttemptOut.model_validate(attempt),
        session=SessionOut.model_validate(session),
        feedback=feedback,
        next_action=next_action,
        solution=problem.solution if attempt.is_correct is True else None,
    )


@router.post("/{token}/reflections", response_model=ReflectionResponse, status_code=201)
def submit_reflection(token: str, data: ReflectionCreate, db: DBSession = Depends(get_db)):
    """
    Submit a required reflection before guidance is unlocked.
    Runs AI quality evaluation — only sets reflection_done=True if accepted.
    """
    session = _get_session_or_404(token, db)
    problem = db.query(Problem).filter(Problem.id == session.problem_id).first()

    eval_result = evaluate_reflection(
        problem_statement=problem.statement if problem else "",
        reflection_prompt=data.prompt_text,
        response_text=data.response_text,
    )

    if not eval_result["accepted"]:
        return ReflectionResponse(accepted=False, nudge=eval_result["nudge"])

    reflection = Reflection(
        session_id=session.id,
        prompt_text=data.prompt_text,
        response_text=data.response_text,
        stage=data.stage,
    )
    db.add(reflection)
    session.reflection_done = True
    db.commit()
    db.refresh(reflection)
    return ReflectionResponse(
        accepted=True,
        reflection=ReflectionOut.model_validate(reflection),
    )
