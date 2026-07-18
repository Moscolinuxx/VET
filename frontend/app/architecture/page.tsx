import Navbar from "@/components/Navbar";

const FLOW = [
  { title: "Register / Login", desc: "Dog owner creates an account or logs in. JWT-based auth secures all subsequent requests." },
  { title: "Add Dog", desc: "Owner creates a dog profile: breed, sex, age, weight, vaccination and deworming status." },
  { title: "Start Screening", desc: "Owner selects a dog and begins a new screening session." },
  { title: "Answer Symptoms", desc: "Structured multi-step form captures clinical signs, vitals, and physical examination findings." },
  { title: "Human Exposure Check", desc: "Separate questions capture bite/scratch, saliva contact, and vulnerable household members — used for referral urgency, not fed to the ML model." },
  { title: "AI Result", desc: "Combined dog profile + symptom data is sent to the trained classifier, which returns a predicted disease, confidence score, and full probability breakdown." },
  { title: "Report", desc: "A shareable, printable report is generated summarising inputs, prediction, and recommendation." },
  { title: "Reminder", desc: "Owner can set follow-up reminders (vaccination, deworming, vet visit) tied to the dog profile." },
];

const LAYERS = [
  {
    name: "Input Layer",
    items: ["Dog characteristics (breed, sex, age, weight)", "Vaccination & deworming history", "Clinical symptoms", "Physical examination findings", "Parasite indicators", "Vital signs (temperature, heart rate, respiratory rate)"],
  },
  {
    name: "Preprocessing",
    items: ["Missing value imputation", "Categorical encoding (One-Hot)", "Numerical feature scaling", "Derived feature: Cardio-Respiratory Index"],
  },
  {
    name: "Machine-Learning Layer",
    items: ["Logistic Regression (selected — best-performing)", "Decision Tree", "Random Forest", "Support Vector Machine", "Gradient Boosting"],
  },
  {
    name: "Output Layer",
    items: ["Predicted disease class (1 of 5)", "Confidence score & full probability distribution", "Rule-based risk level (Low / Moderate / High)", "Veterinary referral recommendation"],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="mx-auto max-w-[1100px] px-6 py-16">
        <h1 className="text-3xl font-semibold text-on-surface">System Architecture & Logic Flow</h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          VetGuard AI is a supervised multiclass classification system for preliminary screening of five
          zoonotic diseases in dogs. This page summarises the end-to-end pipeline, from data capture to
          AI-assisted recommendation.
        </p>

        {/* Core flow */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-on-surface">Core user flow</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, i) => (
              <div key={step.title} className="card">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="font-semibold text-on-surface">{step.title}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conceptual framework */}
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-semibold text-on-surface">Conceptual framework</h2>
          <p className="mb-6 text-sm text-on-surface-variant">
            dog-health features → data preprocessing → machine-learning classification → disease prediction → preliminary screening and veterinary recommendation
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {LAYERS.map((layer, i) => (
              <div key={layer.name} className="card">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{layer.name}</p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  {layer.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-semibold text-on-surface">Technology stack</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="card">
              <p className="mb-3 font-semibold text-on-surface">Frontend</p>
              <ul className="space-y-1 text-sm text-on-surface-variant">
                <li>Next.js (App Router) + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Recharts (admin analytics)</li>
              </ul>
            </div>
            <div className="card">
              <p className="mb-3 font-semibold text-on-surface">Backend</p>
              <ul className="space-y-1 text-sm text-on-surface-variant">
                <li>FastAPI (Python)</li>
                <li>SQLite (development database) via SQLAlchemy</li>
                <li>JWT authentication</li>
                <li>scikit-learn model (Tuned Logistic Regression)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-outline-variant/40 bg-surface-container-low p-6">
          <p className="text-sm text-on-surface-variant">
            <strong className="text-on-surface">Important:</strong> The dataset used to train the current model
            is simulated. This system is an academic prototype intended to demonstrate the design and
            implementation of a machine learning-based screening pipeline. It requires validation with
            authentic veterinary records before any clinical use, and its output should always be treated as
            preliminary and supportive rather than diagnostic.
          </p>
        </section>
      </div>
    </div>
  );
}
