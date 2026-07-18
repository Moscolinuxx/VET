# Setup Guide

## Prerequisites
- Python 3.10+ (project was verified against scikit-learn 1.2.2 - see note below)
- Node.js 18+ and npm
- Git

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the env file and adjust if needed:
```bash
cp .env.example .env
```

Create the database tables and a default admin account:
```bash
python -m app.seed_admin
```
This prints: `Created admin account -> email: admin@vetguard.ai / password: Admin123!`
**Change this password before any real deployment.**

Run the API:
```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` to confirm it's running and try endpoints
directly via Swagger.

### ⚠️ scikit-learn version pin
`best_model_artifact.joblib` was trained and saved with **scikit-learn
1.2.2**. `requirements.txt` pins this exact version. If `pip install`
resolves a different version (e.g. due to a conflicting existing
environment), model loading will fail with an `AttributeError` inside
`SimpleImputer`/`ColumnTransformer` - this is a real, documented scikit-learn
internal breaking change between versions, not a bug in this code. Always
install into a **fresh virtual environment** using the pinned
`requirements.txt`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Confirm `.env.local` points at your running backend:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dev server:
```bash
npm run dev
```

Visit `http://localhost:3000`.

## 3. First-time walkthrough

1. Go to `/register`, create a dog-owner account.
2. Go to **My Dogs** → **Add Dog**, fill in a profile.
3. Go to **New Screening**, select the dog, walk through symptoms → vitals →
   human exposure → AI result.
4. Check **Screening History** and **Reports** (printable/PDF-able via
   browser print).
5. Log out, log back in as `admin@vetguard.ai` / `Admin123!` to view `/admin`.

## 4. Production deployment notes

- **Database**: swap `DATABASE_URL` in `backend/.env` to a Postgres connection
  string (e.g. `postgresql://user:pass@host:5432/vetguard`) - SQLAlchemy
  handles the rest; no code changes needed.
- **CORS**: `backend/app/main.py` currently allows `*` origins for local dev.
  Restrict `allow_origins` to your deployed frontend's URL before going live.
- **JWT_SECRET**: set a long random value in production; never reuse the dev
  default.
- **Frontend hosting**: works well on Vercel (see project's Vercel screenshot
  discussed earlier) - just set `NEXT_PUBLIC_API_URL` as an environment
  variable in the Vercel project settings pointing at your deployed backend
  URL (e.g. Railway, Render, Fly.io for the FastAPI service).
- **Backend hosting**: any host that can run a Python/Uvicorn process and
  persist a SQLite file (or better, a managed Postgres) works - Railway and
  Render both support this with minimal config.

## 5. Retraining / swapping the model later

1. Train a new model, saving an artifact dict with these exact keys:
   `model_name, model, feature_columns, categorical_features,
   numerical_features, category_values, numeric_defaults, classes,
   test_metrics`.
2. Replace `backend/model/best_model_artifact.joblib`.
3. Update `scikit-learn` version pin in `requirements.txt` to match whatever
   version you trained with.
4. No other code changes needed - `ml_engine.py` reads all of this
   dynamically.
