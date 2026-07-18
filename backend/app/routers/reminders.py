from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.routers.dogs import _get_owned_dog

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.post("", response_model=schemas.ReminderOut, status_code=201)
def create_reminder(
    payload: schemas.ReminderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    _get_owned_dog(payload.dog_id, db, current_user)  # authorization check
    reminder = models.Reminder(
        dog_id=payload.dog_id,
        owner_id=current_user.id,
        title=payload.title,
        category=payload.category,
        due_date=payload.due_date,
        notes=payload.notes,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("", response_model=List[schemas.ReminderOut])
def list_reminders(
    dog_id: str = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    import datetime as dt

    q = db.query(models.Reminder).filter(models.Reminder.owner_id == current_user.id)
    if dog_id:
        q = q.filter(models.Reminder.dog_id == dog_id)
    if upcoming_only:
        q = q.filter(models.Reminder.is_completed == False, models.Reminder.due_date >= dt.datetime.utcnow())
    return q.order_by(models.Reminder.due_date.asc()).all()


@router.patch("/{reminder_id}", response_model=schemas.ReminderOut)
def update_reminder(
    reminder_id: str,
    payload: schemas.ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(reminder, k, v)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(reminder)
    db.commit()
    return None
