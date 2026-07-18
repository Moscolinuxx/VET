# System Architecture

This document mirrors the conceptual framework described in Chapter 2 of the
project report and explains how it was implemented in software.

## 1. Conceptual pipeline

```
dog-health features → data preprocessing → machine-learning classification
    → disease prediction → preliminary screening and veterinary recommendation
```

## 2. Layered design

### Input layer
Captured across two places in the UI:
- **Dog profile** (My Dogs page): breed, sex, age, weight, vaccination status,
  deworming status. Entered once, reused for every screening.
- **Screening flow** (New Screening page): symptoms, physical examination
  findings, parasite indicators, and vital signs. Entered fresh per screening
  session, since these change over time.

A separate **Human Exposure Check** step captures bite/scratch, saliva contact,
shared food/licking, and vulnerable-household-member flags. These are
deliberately **not** sent to the ML model (they are not part of the trained
feature set) — they drive a rule-based referral banner shown alongside the
model's own output.

### Preprocessing layer
Handled inside the trained scikit-learn `Pipeline` stored in
`best_model_artifact.joblib`:
- `SimpleImputer` for missing values
- `StandardScaler` for numerical features (age, weight, temperature, heart
  rate, respiratory rate, cardio-respiratory index)
- `OneHotEncoder` for categorical features (breed, sex, vaccination/deworming
  status, all Yes/No symptom fields, and multi-level fields like aggression
  level, mucous membrane state, physical condition, general appearance)

The backend's `ml_engine.py` builds a single-row `DataFrame` with columns in
the exact order the pipeline was fitted on (`feature_columns` stored inside
the artifact), so the transform step behaves identically to training time.

### Machine-learning layer
Five algorithms were compared during model development, per the study's
objectives (Chapter 1, objective 3-4):
1. Logistic Regression - **selected as best-performing** (Tuned Logistic
   Regression, ~56.8% accuracy on the held-out test set)
2. Decision Tree
3. Random Forest
4. Support Vector Machine
5. Gradient Boosting

The selected model is serialized with its full preprocessing pipeline into
`best_model_artifact.joblib`, so the API only needs to call `.predict_proba()`
- no manual re-implementation of preprocessing logic in the backend.

### Output layer
`ml_engine.predict()` returns:
- `predicted_disease` - argmax of the 5-class probability vector
- `confidence` - probability of the predicted class
- `probabilities` - full distribution across all 5 classes (shown as a bar
  chart in the AI Result step and the Report page)
- `risk_level` - a transparent, documented heuristic layered on top of the
  raw model output (High/Moderate/Low based on confidence, with Rabies
  always floored at Moderate given its near-100% fatality once symptomatic)
- `recommendation` - a static, disease-specific referral message

## 3. Data flow (textual diagram)

```
Dog Profile ------\
                    >---> Screening Router (FastAPI) ---> ml_engine.py (loads joblib pipeline)
Symptoms/Vitals ---/                |                              |
                                      \____________________________/
Human Exposure ---> stored, NOT sent to model                |
                                                               v
                                                     Screening table (SQLite)
                                                               |
                                             Report / History / Admin Analytics
```

## 4. Why the model is isolated behind one function

`ml_engine.py` exposes exactly one function the rest of the app depends on:
`predict(features: dict) -> dict`. This was a deliberate design choice
matching the brief's requirement for a "transparent AI risk engine that can
later be replaced with your trained ML model" - if you retrain with more
data, a different algorithm, or additional features, only `ml_engine.py` and
the artifact path need to change. The router, database schema, and frontend
are unaffected as long as the new artifact exposes the same dict keys
(`model_name`, `model`, `feature_columns`, `categorical_features`,
`numerical_features`, `classes`, `numeric_defaults`, `test_metrics`).

## 5. Known limitations (for your report's "Limitations" / "Future Work" section)

- Trained on a **simulated** dataset (10,000 records, 2,000 per class per
  Chapter 2) - needs validation against authentic veterinary records before
  any real-world use.
- Test accuracy is ~57%, reflecting genuine overlap between disease
  presentations (as discussed in Chapter 2's Pattern Recognition Theory
  section) - the system is explicitly a preliminary screening aid, not a
  diagnostic tool.
- Risk-level thresholds are a documented heuristic, not learned from data -
  a natural extension would be calibrating these against real clinical
  urgency outcomes.
- SQLite is used for development per the project brief; a production
  deployment would move to PostgreSQL by changing only `DATABASE_URL`.
