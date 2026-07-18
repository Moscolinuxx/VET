from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/dogs", tags=["dogs"])


@router.post("", response_model=schemas.DogOut, status_code=201)
def create_dog(
    payload: schemas.DogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dog = models.Dog(owner_id=current_user.id, **payload.model_dump())
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return dog


@router.get("", response_model=List[schemas.DogOut])
def list_dogs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Dog).filter(models.Dog.owner_id == current_user.id).all()


def _get_owned_dog(dog_id: str, db: Session, current_user: models.User) -> models.Dog:
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    if dog.owner_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this dog")
    return dog


@router.get("/{dog_id}", response_model=schemas.DogOut)
def get_dog(
    dog_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return _get_owned_dog(dog_id, db, current_user)


@router.put("/{dog_id}", response_model=schemas.DogOut)
def update_dog(
    dog_id: str,
    payload: schemas.DogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dog = _get_owned_dog(dog_id, db, current_user)
    for k, v in payload.model_dump().items():
        setattr(dog, k, v)
    db.commit()
    db.refresh(dog)
    return dog


@router.delete("/{dog_id}", status_code=204)
def delete_dog(
    dog_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dog = _get_owned_dog(dog_id, db, current_user)
    db.delete(dog)
    db.commit()
    return None
