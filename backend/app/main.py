from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.routers import problems, sessions, guidance, transparency

# Create DB tables on startup (use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StriveAI API",
    description="Human-Centered AI Learning Assistant — preserves cognitive effort through staged guidance",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(problems.router,     prefix="/api/problems",     tags=["Problems"])
app.include_router(sessions.router,     prefix="/api/sessions",     tags=["Sessions"])
app.include_router(guidance.router,     prefix="/api/guidance",     tags=["Guidance"])
app.include_router(transparency.router, prefix="/api/transparency", tags=["Transparency"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
