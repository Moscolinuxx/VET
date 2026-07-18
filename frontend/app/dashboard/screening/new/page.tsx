"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import RiskBadge from "@/components/RiskBadge";
import { dogsApi, screeningsApi, Dog, ScreeningInput, ScreeningResult, ApiError } from "@/lib/api";

const STEPS = ["Select Dog", "Symptoms", "Vitals", "Human Exposure", "AI Result"];

const YES_NO = ["No", "Yes"];

type SymptomState = Omit<
  ScreeningInput,
  "dog_id" | "human_bite_or_scratch" | "human_saliva_contact" | "human_shared_food_or_licking" | "caregiver_immunocompromised_or_child_or_pregnant"
>;

const DEFAULT_SYMPTOMS: SymptomState = {
  Vomiting: "No",
  Diarrhea: "No",
  Bloody_Stool: "No",
  Eye_Discharge: "No",
  Weakness: "No",
  Fever: "No",
  Skin_Lesions: "No",
  Hair_Loss: "No",
  Excessive_Salivation: "No",
  Aggression_Level: "Low",
  Mucous_Membrane_State: "Normal Pink",
  Physical_Condition: "Healthy",
  General_Appearance: "Active",
  Parasite_Presence: "No",
  Tick_Infestation: "No",
  Flea_Infestation: "No",
  Body_Temperature_C: 38.5,
  Heart_Rate_bpm: 90,
  Respiratory_Rate_bpm: 22,
};

export default function NewScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [symptoms, setSymptoms] = useState<SymptomState>(DEFAULT_SYMPTOMS);
  const [exposure, setExposure] = useState({
    human_bite_or_scratch: false,
    human_saliva_contact: false,
    human_shared_food_or_licking: false,
    caregiver_immunocompromised_or_child_or_pregnant: false,
  });
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dogsApi.list().then((d) => {
      setDogs(d);
      if (d.length > 0) setSelectedDogId(d[0].id);
    });
  }, []);

  const yn = (key: keyof SymptomState, label: string) => (
    <div key={key}>
      <label className="mb-1.5 block text-sm font-medium text-on-surface">{label}</label>
      <div className="flex gap-2">
        {YES_NO.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => setSymptoms({ ...symptoms, [key]: opt })}
            className={`flex-1 rounded border py-2 text-sm font-medium transition ${
              symptoms[key] === opt ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  async function submitScreening() {
    setSubmitting(true);
    setError("");
    try {
      const payload: ScreeningInput = {
        dog_id: selectedDogId,
        ...symptoms,
        ...exposure,
      };
      const res = await screeningsApi.run(payload);
      setResult(res);
      setStep(4);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Screening failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <h1 className="mb-2 text-2xl font-semibold text-on-surface">New Screening</h1>
      <p className="mb-6 text-on-surface-variant">
        This preliminary screening does not replace veterinary examination or laboratory confirmation.
      </p>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i <= step ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {i + 1}
              </div>
              <p className="mt-1 text-center text-xs text-on-surface-variant">{s}</p>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-surface-container"}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 rounded bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>}

      <div className="card">
        {/* Step 0: Select dog */}
        {step === 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Which dog are you screening?</h2>
            {dogs.length === 0 ? (
              <p className="text-on-surface-variant">
                You need to add a dog first. Go to "My Dogs" to add one.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {dogs.map((dog) => (
                  <button
                    key={dog.id}
                    onClick={() => setSelectedDogId(dog.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selectedDogId === dog.id ? "border-primary bg-primary/5" : "border-outline-variant"
                    }`}
                  >
                    <p className="font-medium text-on-surface">{dog.name}</p>
                    <p className="text-sm text-on-surface-variant">
                      {dog.breed} · {dog.age_months} mo
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Symptoms</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {yn("Vomiting", "Vomiting")}
              {yn("Diarrhea", "Diarrhoea")}
              {yn("Bloody_Stool", "Bloody stool")}
              {yn("Eye_Discharge", "Eye discharge")}
              {yn("Weakness", "Weakness")}
              {yn("Fever", "Fever (suspected)")}
              {yn("Skin_Lesions", "Skin lesions")}
              {yn("Hair_Loss", "Hair loss")}
              {yn("Excessive_Salivation", "Excessive salivation")}
              {yn("Parasite_Presence", "Visible parasites")}
              {yn("Tick_Infestation", "Tick infestation")}
              {yn("Flea_Infestation", "Flea infestation")}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Aggression level</label>
                <select className="input-field" value={symptoms.Aggression_Level} onChange={(e) => setSymptoms({ ...symptoms, Aggression_Level: e.target.value as any })}>
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Mucous membrane state</label>
                <select className="input-field" value={symptoms.Mucous_Membrane_State} onChange={(e) => setSymptoms({ ...symptoms, Mucous_Membrane_State: e.target.value as any })}>
                  <option>Normal Pink</option>
                  <option>Pale</option>
                  <option>Congested</option>
                  <option>Dry</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Physical condition</label>
                <select className="input-field" value={symptoms.Physical_Condition} onChange={(e) => setSymptoms({ ...symptoms, Physical_Condition: e.target.value as any })}>
                  <option>Healthy</option>
                  <option>Fair</option>
                  <option>Weak</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">General appearance</label>
                <select className="input-field" value={symptoms.General_Appearance} onChange={(e) => setSymptoms({ ...symptoms, General_Appearance: e.target.value as any })}>
                  <option>Active</option>
                  <option>Lethargic</option>
                  <option>Depressed</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vitals */}
        {step === 2 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Vital signs</h2>
            <p className="mb-4 text-sm text-on-surface-variant">
              If you don't have exact measurements, use typical resting values as a starting point.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Body temperature (°C)</label>
                <input type="number" step="0.1" className="input-field" value={symptoms.Body_Temperature_C} onChange={(e) => setSymptoms({ ...symptoms, Body_Temperature_C: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Heart rate (bpm)</label>
                <input type="number" className="input-field" value={symptoms.Heart_Rate_bpm} onChange={(e) => setSymptoms({ ...symptoms, Heart_Rate_bpm: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Respiratory rate (bpm)</label>
                <input type="number" className="input-field" value={symptoms.Respiratory_Rate_bpm} onChange={(e) => setSymptoms({ ...symptoms, Respiratory_Rate_bpm: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Human exposure */}
        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Human exposure check</h2>
            <p className="mb-4 text-sm text-on-surface-variant">
              This helps flag whether any household member may need medical attention, separate from the dog's prediction.
            </p>
            <div className="space-y-3">
              {[
                { key: "human_bite_or_scratch", label: "Has this dog bitten or scratched a person recently?" },
                { key: "human_saliva_contact", label: "Has anyone had contact with this dog's saliva (e.g. via a wound)?" },
                { key: "human_shared_food_or_licking", label: "Does the dog share food/utensils or lick faces?" },
                { key: "caregiver_immunocompromised_or_child_or_pregnant", label: "Is a child, pregnant person, or immunocompromised individual in close contact with this dog?" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 rounded-lg border border-outline-variant/40 p-4">
                  <input
                    type="checkbox"
                    checked={(exposure as any)[item.key]}
                    onChange={(e) => setExposure({ ...exposure, [item.key]: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-on-surface">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-on-surface">AI Screening Result</h2>
            <div className="mb-6 flex items-center justify-between rounded-lg bg-surface-container-low p-5">
              <div>
                <p className="text-sm text-on-surface-variant">Most likely condition</p>
                <p className="text-2xl font-semibold text-on-surface">{result.predicted_disease}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{Math.round(result.confidence * 100)}% model confidence</p>
              </div>
              <RiskBadge level={result.risk_level} />
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-on-surface">Probability breakdown</p>
              <div className="space-y-2">
                {Object.entries(result.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([disease, prob]) => (
                    <div key={disease} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-sm text-on-surface-variant">{disease}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full bg-primary" style={{ width: `${prob * 100}%` }} />
                      </div>
                      <span className="w-12 text-right text-sm text-on-surface-variant">{Math.round(prob * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {result.human_exposure_flag && (
              <div className="mb-6 rounded-lg border border-error bg-error-container/30 p-4">
                <p className="text-sm font-semibold text-on-error-container">Human exposure flagged</p>
                <p className="mt-1 text-sm text-on-error-container">{result.human_exposure_message}</p>
              </div>
            )}

            <div className="mb-6 rounded-lg bg-secondary-container/20 p-4">
              <p className="text-sm font-semibold text-on-surface">Recommendation</p>
              <p className="mt-1 text-sm text-on-surface-variant">{result.recommendation}</p>
            </div>

            <p className="mb-4 text-xs text-on-surface-variant">
              Model: {result.model_name} · This is a preliminary AI estimate, not a diagnosis. Always confirm with a licensed veterinarian.
            </p>

            <div className="flex gap-3">
              <button onClick={() => router.push(`/dashboard/reports?id=${result.id}`)} className="btn-primary">
                View full report
              </button>
              <button onClick={() => router.push("/dashboard/screening/history")} className="btn-secondary">
                Screening history
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !selectedDogId}
              className="btn-primary disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button onClick={submitScreening} disabled={submitting || !selectedDogId} className="btn-primary disabled:opacity-40">
              {submitting ? "Analysing..." : "Run AI Screening"}
            </button>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
