import datetime as dt
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, auth, ml_engine

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    total_users = db.query(models.User).filter(models.User.role == models.UserRole.owner).count()
    total_dogs = db.query(models.Dog).count()
    total_screenings = db.query(models.Screening).count()

    screenings = db.query(models.Screening).all()
    disease_counts = Counter(s.predicted_disease for s in screenings)
    risk_counts = Counter(s.risk_level for s in screenings)

    thirty_days_ago = dt.datetime.utcnow() - dt.timedelta(days=30)
    recent_screenings = [s for s in screenings if s.created_at >= thirty_days_ago]

    # Screenings per day for the last 14 days (for a trend chart)
    daily_counts = Counter()
    for s in screenings:
        if s.created_at >= dt.datetime.utcnow() - dt.timedelta(days=14):
            daily_counts[s.created_at.strftime("%Y-%m-%d")] += 1

    avg_confidence = (
        round(sum(s.confidence for s in screenings) / len(screenings), 4) if screenings else 0
    )

    high_risk_screenings = [s for s in screenings if s.risk_level == "High"]

    return {
        "total_owners": total_users,
        "total_dogs": total_dogs,
        "total_screenings": total_screenings,
        "screenings_last_30_days": len(recent_screenings),
        "disease_distribution": dict(disease_counts),
        "risk_distribution": dict(risk_counts),
        "daily_screenings_last_14_days": dict(sorted(daily_counts.items())),
        "average_model_confidence": avg_confidence,
        "high_risk_screening_count": len(high_risk_screenings),
        "model_info": ml_engine.get_model_metadata()["test_metrics"],
    }


@router.get("/model-info")
def get_model_info(current_user: models.User = Depends(auth.require_admin)):
    meta = ml_engine.get_model_metadata()
    return {
        "model_name": meta["model_name"],
        "classes": meta["classes"],
        "feature_columns": meta["feature_columns"],
        "test_metrics": meta["test_metrics"],
    }


@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "dog_count": len(u.dogs),
            "created_at": u.created_at,
        }
        for u in users
    ]
