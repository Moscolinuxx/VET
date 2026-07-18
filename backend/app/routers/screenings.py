from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth, ml_engine
from app.routers.dogs import _get_owned_dog

router = APIRouter(prefix="/api/screenings", tags=["screenings"])


HUMAN_EXPOSURE_MESSAGE = (
    "Based on your answers, there is a possible human exposure pathway (bite/scratch, "
    "saliva contact, or shared food/licking). Please wash the exposed area thoroughly and "
    "consult a healthcare provider promptly, especially if a child, pregnant person, or "
    "immunocompromised individual was involved."
)


def _build_recommendation(base_recommendation: str, exposure_flag: bool) -> str:
    if exposure_flag:
        return base_recommendation + " " + HUMAN_EXPOSURE_MESSAGE
    return base_recommendation


@router.post("", response_model=schemas.ScreeningOut, status_code=201)
def run_screening(
    payload: schemas.ScreeningInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dog = _get_owned_dog(payload.dog_id, db, current_user)

    # Merge dog profile fields with the submitted symptom/vital fields to match
    # the model's exact feature_columns (Breed, Sex, Age, Weight, Vaccination,
    # Deworming come from the dog record; the rest come from this screening).
    data = payload.model_dump()
    human_fields = {
        "human_bite_or_scratch": data.pop("human_bite_or_scratch"),
        "human_saliva_contact": data.pop("human_saliva_contact"),
        "human_shared_food_or_licking": data.pop("human_shared_food_or_licking"),
        "caregiver_immunocompromised_or_child_or_pregnant": data.pop(
            "caregiver_immunocompromised_or_child_or_pregnant"
        ),
    }
    data.pop("dog_id")

    features = {
        "Breed": dog.breed,
        "Sex": dog.sex,
        "Age_Months": dog.age_months,
        "Weight_kg": dog.weight_kg,
        "Vaccination_Status": dog.vaccination_status,
        "Deworming_Status": dog.deworming_status,
        **data,
    }
    # Derived field the model expects
    features["Cardio_Respiratory_Index"] = round(
        features["Heart_Rate_bpm"] / max(features["Respiratory_Rate_bpm"], 1), 2
    )

    try:
        result = ml_engine.predict(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {e}")

    exposure_flag = any(human_fields.values())
    recommendation = _build_recommendation(result["recommendation"], exposure_flag)

    screening = models.Screening(
        dog_id=dog.id,
        owner_id=current_user.id,
        input_features=features,
        human_exposure=human_fields,
        predicted_disease=result["predicted_disease"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        risk_level=result["risk_level"],
        model_name=result["model_name"],
        recommendation=recommendation,
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)

    return schemas.ScreeningOut(
        id=screening.id,
        dog_id=screening.dog_id,
        predicted_disease=screening.predicted_disease,
        confidence=screening.confidence,
        probabilities=screening.probabilities,
        risk_level=screening.risk_level,
        model_name=screening.model_name,
        recommendation=screening.recommendation,
        human_exposure_flag=exposure_flag,
        human_exposure_message=HUMAN_EXPOSURE_MESSAGE if exposure_flag else None,
        created_at=screening.created_at,
    )


@router.get("", response_model=List[schemas.ScreeningOut])
def list_screenings(
    dog_id: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    q = db.query(models.Screening).filter(models.Screening.owner_id == current_user.id)
    if dog_id:
        q = q.filter(models.Screening.dog_id == dog_id)
    rows = q.order_by(models.Screening.created_at.desc()).all()

    out = []
    for s in rows:
        exposure_flag = any((s.human_exposure or {}).values())
        out.append(
            schemas.ScreeningOut(
                id=s.id,
                dog_id=s.dog_id,
                predicted_disease=s.predicted_disease,
                confidence=s.confidence,
                probabilities=s.probabilities,
                risk_level=s.risk_level,
                model_name=s.model_name,
                recommendation=s.recommendation,
                human_exposure_flag=exposure_flag,
                human_exposure_message=HUMAN_EXPOSURE_MESSAGE if exposure_flag else None,
                created_at=s.created_at,
            )
        )
    return out


@router.get("/{screening_id}", response_model=schemas.ScreeningOut)
def get_screening(
    screening_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    s = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Screening not found")
    if s.owner_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    exposure_flag = any((s.human_exposure or {}).values())
    return schemas.ScreeningOut(
        id=s.id,
        dog_id=s.dog_id,
        predicted_disease=s.predicted_disease,
        confidence=s.confidence,
        probabilities=s.probabilities,
        risk_level=s.risk_level,
        model_name=s.model_name,
        recommendation=s.recommendation,
        human_exposure_flag=exposure_flag,
        human_exposure_message=HUMAN_EXPOSURE_MESSAGE if exposure_flag else None,
        created_at=s.created_at,
    )
