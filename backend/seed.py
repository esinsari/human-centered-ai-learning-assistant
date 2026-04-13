"""
Seed script — populates the DB with sample multiple-choice problems.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.models.models import Problem

Base.metadata.create_all(bind=engine)

PROBLEMS = [
    {
        "title":      "Problem 1: Algebra",
        "subject":    "algebra",
        "difficulty": "medium",
        "statement":  "Factor: x² + 16x + 64",
        "option_a":   "(x+4)^2",
        "option_b":   "(x+8)^2",
        "option_c":   "(x - 8)(x + 8)",
        "option_d":   "(x + 8)(x + 2)",
        "correct_option": "B",
        "correct_answer": "(x+8)^2",
        "hint_strategy": "Look for a perfect square trinomial pattern: a² + 2ab + b².",
        "hint_partial":  "Notice 64 = 8². Check if the middle term fits 2·8·x = 16x.",
        "solution": "x² + 16x + 64 is a perfect square trinomial.\n\nNotice that 64 = 8² and the middle term 16x = 2·8·x.\n\nThis matches the pattern a² + 2ab + b² = (a+b)², so the factored form is (x + 8)².",
    },
    {
        "title":      "Problem 2: Algebra",
        "subject":    "algebra",
        "difficulty": "medium",
        "statement":  "Solve for x: 3x + 7 = 22",
        "option_a":   "x = 3",
        "option_b":   "x = 4",
        "option_c":   "x = 5",
        "option_d":   "x = 6",
        "correct_option": "C",
        "correct_answer": "x = 5",
        "hint_strategy": "Isolate the variable by moving constants to the other side first.",
        "hint_partial":  "Subtract 7 from both sides to get 3x = 15.",
        "solution": "Step 1: Subtract 7 from both sides\n3x + 7 - 7 = 22 - 7\n3x = 15\n\nStep 2: Divide both sides by 3\nx = 15 ÷ 3 = 5",
    },
    {
        "title":      "Problem 3: Physics",
        "subject":    "physics",
        "difficulty": "medium",
        "statement":  "A 5 kg object accelerates at 3 m/s². What is the net force acting on it?",
        "option_a":   "5 N",
        "option_b":   "10 N",
        "option_c":   "15 N",
        "option_d":   "20 N",
        "correct_option": "C",
        "correct_answer": "15 N",
        "hint_strategy": "Think about Newton's Second Law relating force, mass, and acceleration.",
        "hint_partial":  "Recall F = m × a. Substitute the known values.",
        "solution": "Using Newton's Second Law: F = m × a\n\nF = 5 kg × 3 m/s²\nF = 15 N",
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Problem).count()
        if existing > 0:
            print(f"DB already has {existing} problems — skipping seed.")
            return
        for p in PROBLEMS:
            db.add(Problem(**p))
        db.commit()
        print(f"Seeded {len(PROBLEMS)} problems.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
