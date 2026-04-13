"""
Basic tests for StriveAI backend.
Run: pytest
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_problems_empty():
    response = client.get("/api/problems/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_get_problem():
    payload = {
        "title": "Test Problem",
        "subject": "algebra",
        "difficulty": "easy",
        "statement": "Solve: x + 1 = 2",
    }
    create_resp = client.post("/api/problems/", json=payload)
    assert create_resp.status_code == 201
    problem_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/problems/{problem_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Test Problem"


def test_create_session():
    # Create a problem first
    problem = client.post("/api/problems/", json={
        "title": "Session Test Problem",
        "subject": "math",
        "difficulty": "easy",
        "statement": "2 + 2 = ?",
    }).json()

    resp = client.post("/api/sessions/", json={
        "problem_id": problem["id"],
        "guidance_level": "moderate",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "session_token" in data
    assert data["attempt_count"] == 0
    assert data["scaffold_stage"] == "none"


def test_submit_attempt_increments_count():
    problem = client.post("/api/problems/", json={
        "title": "Attempt Test",
        "subject": "math",
        "difficulty": "easy",
        "statement": "1 + 1 = ?",
    }).json()
    session = client.post("/api/sessions/", json={
        "problem_id": problem["id"],
    }).json()
    token = session["session_token"]

    resp = client.post(f"/api/sessions/{token}/attempts", json={"answer_text": "2"})
    assert resp.status_code == 201
    assert resp.json()["session"]["attempt_count"] == 1


def test_transparency_info():
    resp = client.get("/api/transparency/info")
    assert resp.status_code == 200
    assert "caveats" in resp.json()
