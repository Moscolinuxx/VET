"""
VetGuard AI - FastAPI backend entrypoint.

Run locally:
    uvicorn app.main:app --reload --port 8000

Docs available at /docs (Swagger) once running.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa: F401 - ensures models are registered before create_all
from app.routers import auth, dogs, screenings, diseases, reminders, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VetGuard AI API",
    description=(
        "Backend API for VetGuard AI - a machine learning-based preliminary "
        "screening system for zoonotic diseases in dogs (rabies, leptospirosis, "
        "ringworm, scabies, helminthosis). For preliminary screening and "
        "veterinary referral only; not a replacement for veterinary diagnosis."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your deployed frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dogs.router)
app.include_router(screenings.router)
app.include_router(diseases.router)
app.include_router(reminders.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "service": "VetGuard AI API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
