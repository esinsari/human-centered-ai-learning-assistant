from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from app.db.database import get_db
from app.models.models import LearningSession, Problem
from app.schemas.schemas import GuidanceRequest, GuidanceResponse
from app.services import guidance_service

router = APIRouter()


@router.post("/next", response_model=GuidanceResponse)
def request_guidance(data: GuidanceRequest, db: DBSession = Depends(get_db)):
    """
    Request the next guidance stage.
    Returns either:
      - reflection_required=True  → frontend shows reflection form first
      - effort_gate=True          → frontend tells student they need more attempts
      - content with stage        → frontend shows hint/cue/solution
    """
    session = db.query(LearningSession).filter(
        LearningSession.session_token == data.session_token
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    problem = db.query(Problem).filter(Problem.id == session.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    try:
        return guidance_service.get_next_guidance(db, session, problem.statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Guidance generation failed: {str(e)}")


@router.post("/advance", response_model=dict)
def advance_stage(data: GuidanceRequest, db: DBSession = Depends(get_db)):
    """
    Called after the student completes required reflection or confirms they want the solution.
    Advances the session to the next scaffold stage.
    """
    session = db.query(LearningSession).filter(
        LearningSession.session_token == data.session_token
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        updated = guidance_service.advance_stage(db, session)
        return {"stage": updated.scaffold_stage}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stage advance failed: {str(e)}")
