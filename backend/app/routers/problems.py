from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Problem
from app.schemas.schemas import ProblemOut, ProblemCreate

router = APIRouter()


@router.get("/", response_model=List[ProblemOut])
def list_problems(subject: str = None, difficulty: str = None, db: Session = Depends(get_db)):
    """List all available problems, optionally filtered by subject or difficulty."""
    query = db.query(Problem)
    if subject:
        query = query.filter(Problem.subject == subject)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    return query.all()


@router.get("/{problem_id}", response_model=ProblemOut)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    """Fetch a single problem. Note: solution is NOT included in this response."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.post("/", response_model=ProblemOut, status_code=201)
def create_problem(data: ProblemCreate, db: Session = Depends(get_db)):
    """Create a new problem (admin / seed use)."""
    problem = Problem(**data.model_dump())
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem
