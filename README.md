# VetGuard AI

Machine learning-based system for preliminary screening of zoonotic diseases in dogs
(rabies, leptospirosis, ringworm, scabies, helminthosis), built as an academic project.

> ⚠️ **Academic prototype.** The trained model uses a simulated dataset. This system
> is intended to demonstrate design and implementation of an ML-assisted screening
> pipeline, and to support the project report/defense. It is **not** a diagnostic
> tool and does not replace veterinary examination or laboratory confirmation.

## Project structure

```
vetguard-ai/
├── backend/          FastAPI + SQLite API, wraps the trained model
│   ├── app/
│   │   ├── main.py           FastAPI app entrypoint
│   │   ├── models.py         SQLAlchemy ORM models
│   │   ├── schemas.py        Pydantic request/response schemas
│   │   ├── auth.py           JWT auth utilities
│   │   ├── database.py       DB engine/session
│   │   ├── ml_engine.py      Loads best_model_artifact.joblib, runs predictions
│   │   ├── seed_data.py      Disease library content
│   │   ├── seed_admin.py     Creates a default admin account
│   │   └── routers/          auth, dogs, screenings, diseases, reminders, admin
│   ├── model/
│   │   └── best_model_artifact.joblib
│   └── requirements.txt
├── frontend/          Next.js (App Router) + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx                     Landing page
│   │   ├── login/, register/            Auth pages
│   │   ├── dashboard/                   Dog owner dashboard + sub-pages
│   │   ├── admin/                       Admin dashboard
│   │   └── architecture/                System architecture page
│   ├── components/    Shared UI components
│   └── lib/            API client + auth context
└── docs/              Setup guide, API reference, architecture notes for your report
```

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed_admin        # creates admin@vetguard.ai / Admin123!
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App available at `http://localhost:3000`.

### 3. Log in

- Register a normal account through the UI to use the dog-owner flow.
- Use `admin@vetguard.ai` / `Admin123!` (created by `seed_admin.py`) to view `/admin`.

## Important: scikit-learn version

`best_model_artifact.joblib` was trained with **scikit-learn 1.2.2**. `requirements.txt`
pins this exact version deliberately — installing a newer scikit-learn will break
model loading (internal attribute names changed between versions). If you ever
retrain the model, update both the artifact and this pin together.

## Documentation

See `/docs` for:
- `API_REFERENCE.md` — every endpoint, request/response shape
- `ARCHITECTURE.md` — system design, data flow, mirrors your Chapter 3
- `SETUP_GUIDE.md` — detailed local + deployment setup
- `GITHUB_PUSH_GUIDE.md` — exact commands to push this to your repo
