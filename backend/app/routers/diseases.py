from typing import List

from fastapi import APIRouter, HTTPException

from app import schemas
from app.seed_data import DISEASES

router = APIRouter(prefix="/api/diseases", tags=["diseases"])


@router.get("", response_model=List[schemas.Disease])
def list_diseases():
    return DISEASES


@router.get("/{key}", response_model=schemas.Disease)
def get_disease(key: str):
    for d in DISEASES:
        if d["key"] == key:
            return d
    raise HTTPException(status_code=404, detail="Disease not found")
