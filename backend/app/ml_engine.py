"""
Transparent AI risk engine.

Loads best_model_artifact.joblib (Tuned Logistic Regression, 5-class multiclass
classifier: Helminthosis, Leptospirosis, Rabies, Ringworm, Scabies) and exposes
a single `predict()` function used by the screening endpoint.

Design note (per project brief): this module is intentionally isolated behind
one function so the model can later be swapped for a different trained
artifact (e.g. Random Forest / Gradient Boosting) without touching the API
layer - only this file and the artifact path would change.
"""
import os
import warnings
from pathlib import Path
from typing import Dict

import joblib
import pandas as pd

warnings.filterwarnings("ignore")  # suppress sklearn version-mismatch noise in dev

MODEL_PATH = Path(os.getenv("MODEL_PATH", Path(__file__).resolve().parent.parent / "model" / "best_model_artifact.joblib"))

_artifact = None


def _load_artifact():
    global _artifact
    if _artifact is None:
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def get_model_metadata() -> dict:
    a = _load_artifact()
    return {
        "model_name": a["model_name"],
        "classes": a["classes"],
        "feature_columns": a["feature_columns"],
        "categorical_features": a["categorical_features"],
        "numerical_features": a["numerical_features"],
        "category_values": a["category_values"],
        "numeric_defaults": a["numeric_defaults"],
        "test_metrics": a["test_metrics"],
    }


# Risk-level thresholds applied to the model's top-class probability.
# These are a transparent, documented heuristic layered on top of the raw
# classifier output - not part of the trained model itself.
def _risk_level_from_confidence(confidence: float, predicted_disease: str) -> str:
    if predicted_disease == "Rabies":
        # Rabies is treated as elevated risk regardless of model confidence,
        # given its near-100% fatality once symptomatic (see Chapter 2 review).
        return "High" if confidence >= 0.4 else "Moderate"
    if confidence >= 0.70:
        return "High"
    if confidence >= 0.45:
        return "Moderate"
    return "Low"


RECOMMENDATIONS = {
    "Rabies": "Seek urgent veterinary and medical attention immediately. Do not handle the dog's saliva. Isolate the dog safely and contact a rabies-response veterinary service.",
    "Leptospirosis": "Consult a veterinarian promptly for laboratory testing (e.g. serology/PCR). Avoid contact with the dog's urine and wash hands thoroughly after any contact.",
    "Ringworm": "Consult a veterinarian for confirmation and antifungal treatment. Limit skin contact and wash hands after handling; disinfect bedding.",
    "Scabies": "Consult a veterinarian for skin scraping confirmation and mite treatment. Avoid prolonged skin contact until treated.",
    "Helminthosis": "Consult a veterinarian for a faecal exam and deworming plan. Practice hand hygiene and prompt disposal of faeces.",
}


def predict(features: Dict) -> dict:
    """
    features: dict matching artifact['feature_columns'] exactly (see schemas.ScreeningInput,
    Breed/Sex/Age/Weight/Vaccination/Deworming are merged in by the router from the dog record).
    """
    a = _load_artifact()
    model = a["model"]
    feature_columns = a["feature_columns"]
    classes = a["classes"]

    row = {col: features.get(col, a["numeric_defaults"].get(col)) for col in feature_columns}
    df = pd.DataFrame([row], columns=feature_columns)

    proba = model.predict_proba(df)[0]
    probabilities = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}

    top_idx = int(proba.argmax())
    predicted_disease = classes[top_idx]
    confidence = round(float(proba[top_idx]), 4)
    risk_level = _risk_level_from_confidence(confidence, predicted_disease)

    return {
        "predicted_disease": predicted_disease,
        "confidence": confidence,
        "probabilities": probabilities,
        "risk_level": risk_level,
        "model_name": a["model_name"],
        "recommendation": RECOMMENDATIONS.get(predicted_disease, "Consult a veterinarian for further evaluation."),
    }
