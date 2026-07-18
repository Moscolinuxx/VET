# API Reference

Base URL (local): `http://localhost:8000`
Interactive Swagger docs: `http://localhost:8000/docs`

All endpoints except `/api/auth/register` and `/api/auth/login` require a
`Authorization: Bearer <token>` header.

## Auth

### POST /api/auth/register
Registers a new dog-owner account and returns a JWT.

```json
// Request
{ "full_name": "Jane Doe", "email": "jane@example.com", "password": "secret123", "phone": "+234..." }

// Response 201
{ "access_token": "...", "token_type": "bearer", "user": { "id": "...", "full_name": "Jane Doe", "email": "jane@example.com", "role": "owner", "created_at": "..." } }
```

### POST /api/auth/login
```json
{ "email": "jane@example.com", "password": "secret123" }
```

### GET /api/auth/me
Returns the currently authenticated user.

## Dogs

| Method | Path | Description |
|---|---|---|
| POST | `/api/dogs` | Create a dog profile |
| GET | `/api/dogs` | List the current user's dogs |
| GET | `/api/dogs/{id}` | Get one dog |
| PUT | `/api/dogs/{id}` | Update a dog |
| DELETE | `/api/dogs/{id}` | Delete a dog (cascades screenings/reminders) |

Dog fields: `name, breed, sex, age_months, weight_kg, vaccination_status, deworming_status, photo_url?`

## Screenings

### POST /api/screenings
Runs the trained model against a dog's symptoms and vitals. Request body:

```json
{
  "dog_id": "uuid",
  "Vomiting": "No", "Diarrhea": "No", "Bloody_Stool": "No", "Eye_Discharge": "No",
  "Weakness": "Yes", "Fever": "No", "Skin_Lesions": "No", "Hair_Loss": "No",
  "Excessive_Salivation": "Yes", "Aggression_Level": "High",
  "Mucous_Membrane_State": "Normal Pink", "Physical_Condition": "Fair",
  "General_Appearance": "Aggressive", "Parasite_Presence": "No",
  "Tick_Infestation": "No", "Flea_Infestation": "No",
  "Body_Temperature_C": 39.5, "Heart_Rate_bpm": 100, "Respiratory_Rate_bpm": 26,
  "human_bite_or_scratch": false, "human_saliva_contact": true,
  "human_shared_food_or_licking": false,
  "caregiver_immunocompromised_or_child_or_pregnant": false
}
```

Note: `Breed, Sex, Age_Months, Weight_kg, Vaccination_Status, Deworming_Status` are
pulled automatically from the dog's stored profile — you don't send them here.

Response:
```json
{
  "id": "uuid",
  "dog_id": "uuid",
  "predicted_disease": "Rabies",
  "confidence": 0.62,
  "probabilities": { "Rabies": 0.62, "Leptospirosis": 0.15, "...": "..." },
  "risk_level": "High",
  "model_name": "Tuned Logistic Regression",
  "recommendation": "Seek urgent veterinary and medical attention immediately...",
  "human_exposure_flag": true,
  "human_exposure_message": "Based on your answers...",
  "created_at": "..."
}
```

| Method | Path | Description |
|---|---|---|
| GET | `/api/screenings?dog_id=` | List screenings (optionally filtered by dog) |
| GET | `/api/screenings/{id}` | Get one screening result |

## Diseases

| Method | Path | Description |
|---|---|---|
| GET | `/api/diseases` | List all 5 diseases (static reference content) |
| GET | `/api/diseases/{key}` | One disease (`rabies`, `leptospirosis`, `ringworm`, `scabies`, `helminthosis`) |

## Reminders

| Method | Path | Description |
|---|---|---|
| POST | `/api/reminders` | Create a reminder |
| GET | `/api/reminders?dog_id=&upcoming_only=true` | List reminders |
| PATCH | `/api/reminders/{id}` | Update (e.g. mark complete) |
| DELETE | `/api/reminders/{id}` | Delete |

## Admin (requires `role: admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/analytics` | Aggregate stats: totals, disease/risk distribution, daily trend, model metrics |
| GET | `/api/admin/model-info` | Model name, classes, features, test metrics |
| GET | `/api/admin/users` | List all registered owners |
