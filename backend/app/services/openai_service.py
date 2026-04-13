"""
OpenAI service — all prompt templates and API calls live here.
Uses GPT-4.1-mini as specified in the proposal.
"""

from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)
MODEL = "gpt-4.1-mini"


# ─── Prompt Templates ────────────────────────────────────────────────────────

STRATEGY_CUE_PROMPT = """You are a Socratic learning assistant. Your role is to guide, NOT to solve.
The student is working on this problem:
{problem_statement}

Their attempt so far: {student_answer}

Generate a brief STRATEGY CUE (1-2 sentences) that nudges them toward the right approach 
WITHOUT giving away the answer. Focus on what general strategy or concept applies.
Examples: "Consider isolating the variable before substituting values." 
          "Think about which theorem applies when two parallel lines are cut by a transversal."
"""

PARTIAL_HINT_PROMPT = """You are a Socratic learning assistant. 
Problem: {problem_statement}
Student's attempts: {attempts_summary}
Student's reflection: {reflection_text}

Generate a PARTIAL HINT — a concrete first step they can take, but stop before revealing the solution.
Keep it to 1-2 sentences. Do NOT solve the problem.
Example: "Start by subtracting 3 from both sides to isolate the variable term."
"""

FULL_SOLUTION_PROMPT = """You are a helpful tutor. 
Problem: {problem_statement}
Student has made {attempt_count} attempts and completed a reflection.

Provide a clear, step-by-step solution. After the solution, add one sentence 
encouraging the student to compare this with their own reasoning.
End with: "Compare this explanation with your own reasoning — what did you do differently?"
"""

ALTERNATIVE_EXPLANATION_PROMPT = """You are a creative tutor. 
Problem: {problem_statement}
Original solution given: {original_solution}

Generate an ALTERNATIVE explanation using a completely different approach, analogy, or 
reasoning emphasis. This reduces authority bias by showing multiple valid paths.
Do not repeat the original explanation's structure or phrasing.
"""

REFLECTION_PROMPT_TEMPLATES = [
    "What strategy are you currently using to approach this problem?",
    "Which concept or formula do you think applies here?",
    "What have you tried so far, and why do you think it didn't work?",
    "What information from the problem statement feels most important to you?",
]


# ─── Service Functions ───────────────────────────────────────────────────────

def generate_strategy_cue(problem_statement: str, student_answer: str) -> str:
    """Stage 1: gentle nudge toward strategy, no answer given."""
    prompt = STRATEGY_CUE_PROMPT.format(
        problem_statement=problem_statement,
        student_answer=student_answer,
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()


def generate_partial_hint(
    problem_statement: str,
    attempts_summary: str,
    reflection_text: str,
) -> str:
    """Stage 2: concrete first step, still no full solution."""
    prompt = PARTIAL_HINT_PROMPT.format(
        problem_statement=problem_statement,
        attempts_summary=attempts_summary,
        reflection_text=reflection_text,
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def generate_full_solution(problem_statement: str, attempt_count: int) -> str:
    """Stage 3: full solution — only after effort threshold and reflection."""
    prompt = FULL_SOLUTION_PROMPT.format(
        problem_statement=problem_statement,
        attempt_count=attempt_count,
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def generate_alternative_explanation(
    problem_statement: str,
    original_solution: str,
) -> str:
    """Transparency feature: second explanation with different framing."""
    prompt = ALTERNATIVE_EXPLANATION_PROMPT.format(
        problem_statement=problem_statement,
        original_solution=original_solution,
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def get_reflection_prompt(stage_index: int = 0) -> str:
    """Returns a reflective question to show the student before assistance."""
    return REFLECTION_PROMPT_TEMPLATES[stage_index % len(REFLECTION_PROMPT_TEMPLATES)]
