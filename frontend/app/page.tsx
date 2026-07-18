import Link from "next/link";
import Navbar from "@/components/Navbar";

const DISEASES = [
  { name: "Rabies", type: "Viral", urgency: "Emergency" },
  { name: "Leptospirosis", type: "Bacterial", urgency: "High" },
  { name: "Ringworm", type: "Fungal", urgency: "Moderate" },
  { name: "Scabies", type: "Parasitic", urgency: "Moderate" },
  { name: "Helminthosis", type: "Parasitic", urgency: "Low" },
];

const FEATURES = [
  { icon: "🩺", title: "Multi-step screening", desc: "Answer structured questions about symptoms, vitals, and exposure - takes under 3 minutes." },
  { icon: "🤖", title: "Transparent AI risk engine", desc: "A trained multiclass classifier estimates the most likely condition with a clear confidence score, not a black box." },
  { icon: "📚", title: "Disease library", desc: "Plain-language reference on transmission, signs, and prevention for five priority zoonotic diseases." },
  { icon: "⏰", title: "Reminders", desc: "Never miss a vaccination, deworming, or follow-up vet visit." },
  { icon: "📄", title: "Shareable reports", desc: "Generate a screening report you can bring to your veterinarian." },
  { icon: "🌍", title: "One Health approach", desc: "Built around the connection between animal, human, and environmental health." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 text-center">
        <span className="pill mb-6 bg-secondary-container text-on-secondary-container">
          Academic prototype - preliminary screening only
        </span>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-on-surface md:text-5xl">
          AI-assisted screening for dog-to-human zoonotic diseases
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
          VetGuard AI helps dog owners recognise combinations of symptoms that need veterinary
          attention — covering rabies, leptospirosis, ringworm, scabies, and helminthosis.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register" className="btn-primary px-8 py-3 text-base">
            Start screening your dog
          </Link>
          <Link href="/architecture" className="btn-secondary px-8 py-3 text-base">
            See how it works
          </Link>
        </div>
        <p className="mt-6 text-sm text-on-surface-variant">
          Not a replacement for veterinary examination or laboratory confirmation.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <h2 className="text-center text-3xl font-semibold text-on-surface">Everything you need to screen early</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-on-surface">{f.title}</h3>
                <p className="text-sm text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diseases */}
      <section id="diseases" className="mx-auto max-w-[1280px] px-6 py-20">
        <h2 className="text-center text-3xl font-semibold text-on-surface">Diseases covered</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-on-surface-variant">
          Five priority zoonotic diseases identified in the study, spanning viral, bacterial, fungal, and parasitic origins.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DISEASES.map((d) => (
            <div key={d.name} className="card text-center">
              <p className="text-sm text-on-surface-variant">{d.type}</p>
              <p className="mt-1 text-lg font-semibold text-on-surface">{d.name}</p>
              <span
                className={`pill mt-3 ${
                  d.urgency === "Emergency"
                    ? "bg-error text-on-error"
                    : d.urgency === "High"
                    ? "bg-error-container text-on-error-container"
                    : "bg-tertiary-container/20 text-tertiary"
                }`}
              >
                {d.urgency}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-center text-on-primary">
        <h2 className="text-3xl font-semibold">Protect your household and your dog</h2>
        <p className="mx-auto mt-3 max-w-xl text-on-primary/90">
          Create a free account and run your first screening in minutes.
        </p>
        <Link href="/register" className="mt-8 inline-block rounded bg-white px-8 py-3 font-medium text-primary hover:opacity-90">
          Get started free
        </Link>
      </section>

      <footer className="border-t border-outline-variant/40 bg-surface-container-lowest py-8 text-center text-sm text-on-surface-variant">
        © {new Date().getFullYear()} VetGuard AI — Academic prototype. Not a substitute for professional veterinary or medical advice.
      </footer>
    </div>
  );
}
