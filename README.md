# StriveAI — Human-Centered AI Learning Assistant

A lightweight web-based learning assistant that preserves cognitive effort through structured scaffolding and beneficial AI guidance.

## Project Structure

```
striveai/
├── frontend/          # React app (Vite + TypeScript)
├── backend/           # FastAPI Python backend
└── shared/            # Shared types/constants
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Add your OpenAI API key
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # Set VITE_API_URL
npm run dev
```

## Architecture Overview

- **Frontend**: React + TypeScript + Vite, Tailwind CSS
- **Backend**: FastAPI (Python), SQLite (dev) / PostgreSQL (prod)
- **AI**: OpenAI GPT-4.1-mini via structured prompts
- **Deployment**: AWS (backend on EC2/Lambda, frontend on S3+CloudFront)

## Key Features (from proposal)
- Staged guidance: Strategy Cue → Partial Hint → Full Solution
- Reflection-before-assistance enforcement
- Effort threshold tracking (min 2 attempts OR reflection submitted)
- 5-second reflection timer before full solution reveal
- Transparency panel + alternative explanations
- Adjustable guidance levels (minimal / moderate / high)
- Confidence rating slider
