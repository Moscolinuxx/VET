import datetime as dt
from typing import Optional, List, Dict, Literal

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Dog ----------
class DogCreate(BaseModel):
    name: str
    breed: str
    sex: Literal["Male", "Female"]
    age_months: int = Field(ge=0, le=300)
    weight_kg: float = Field(gt=0, le=120)
    vaccination_status: str = "Not Vaccinated"
    deworming_status: str = "Unknown"
    photo_url: Optional[str] = None


class DogOut(DogCreate):
    id: str
    owner_id: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


# ---------- Screening ----------
# Mirrors best_model_artifact.joblib -> feature_columns exactly.
class ScreeningInput(BaseModel):
    dog_id: str

    # Clinical / symptom fields (categorical Yes/No or levels)
    Vomiting: Literal["Yes", "No"]
    Diarrhea: Literal["Yes", "No"]
    Bloody_Stool: Literal["Yes", "No"]
    Eye_Discharge: Literal["Yes", "No"]
    Weakness: Literal["Yes", "No"]
    Fever: Literal["Yes", "No"]
    Skin_Lesions: Literal["Yes", "No"]
    Hair_Loss: Literal["Yes", "No"]
    Excessive_Salivation: Literal["Yes", "No"]
    Aggression_Level: Literal["Low", "Moderate", "High"]
    Mucous_Membrane_State: Literal["Normal Pink", "Pale", "Congested", "Dry"]
    Physical_Condition: Literal["Healthy", "Fair", "Weak", "Critical"]
    General_Appearance: Literal["Active", "Lethargic", "Depressed", "Aggressive"]
    Parasite_Presence: Literal["Yes", "No"]
    Tick_Infestation: Literal["Yes", "No"]
    Flea_Infestation: Literal["Yes", "No"]

    # Vitals (numerical)
    Body_Temperature_C: float = Field(ge=30, le=45)
    Heart_Rate_bpm: float = Field(ge=30, le=250)
    Respiratory_Rate_bpm: float = Field(ge=5, le=100)

    # Human exposure check - NOT sent to the model, used for the referral banner
    human_bite_or_scratch: bool = False
    human_saliva_contact: bool = False
    human_shared_food_or_licking: bool = False
    caregiver_immunocompromised_or_child_or_pregnant: bool = False


class ScreeningOut(BaseModel):
    id: str
    dog_id: str
    predicted_disease: str
    confidence: float
    probabilities: Dict[str, float]
    risk_level: str
    model_name: str
    recommendation: str
    human_exposure_flag: bool
    human_exposure_message: Optional[str] = None
    created_at: dt.datetime

    class Config:
        from_attributes = True


# ---------- Reminder ----------
class ReminderCreate(BaseModel):
    dog_id: str
    title: str
    category: str = "General"
    due_date: dt.date
    notes: Optional[str] = None


class ReminderOut(BaseModel):
    id: str
    dog_id: str
    title: str
    category: str
    due_date: dt.datetime
    is_completed: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class ReminderUpdate(BaseModel):
    is_completed: Optional[bool] = None
    title: Optional[str] = None
    due_date: Optional[dt.date] = None
    notes: Optional[str] = None


# ---------- Disease Library ----------
class Disease(BaseModel):
    key: str
    name: str
    pathogen_type: str
    transmission: str
    dog_signs: List[str]
    human_risk: str
    prevention: List[str]
    urgency: Literal["Low", "Moderate", "High", "Emergency"]
