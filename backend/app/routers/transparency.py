from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from app.db.database import get_db
from app.models.models import LearningSession, Problem
from app.schemas.schemas import AlternativeExplanationRequest, AlternativeExplanationResponse
from app.services.openai_service import generate_alternative_explanation
from fastapi import HTTPException

router = APIRouter()

DISCLAIMER = "This is a suggested solution. Compare it with your reasoning."

AI_TRANSPARENCY_INFO = {
    "disclaimer": DISCLAIMER,
    "caveats": [
        "AI responses are probabilistic and may contain inaccuracies.",
        "Always verify information independently.",
        "This assistant is a guide, not an authority.",
    ],
}


@router.get("/info")
def get_transparency_info():
    """Returns the transparency panel content shown in the collapsible UI component."""
    return AI_TRANSPARENCY_INFO


@router.post("/alternative-explanation", response_model=AlternativeExplanationResponse)
def get_alternative_explanation(
    data: AlternativeExplanationRequest,
    db: DBSession = Depends(get_db),
):
    """
    Generate a second explanation with different phrasing or reasoning emphasis.
    Reduces authority bias by showing multiple valid paths to a solution.
    """
    session = db.query(LearningSession).filter(
        LearningSession.session_token == data.session_token
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    problem = db.query(Problem).filter(Problem.id == session.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    explanation = generate_alternative_explanation(
        problem_statement=problem.statement,
        original_solution=data.original_solution,
    )

    return AlternativeExplanationResponse(
        explanation=explanation,
        disclaimer=DISCLAIMER,
    )
