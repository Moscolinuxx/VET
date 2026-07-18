"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { diseasesApi, Disease } from "@/lib/api";

const URGENCY_STYLES: Record<string, string> = {
  Low: "bg-secondary-container text-on-secondary-container",
  Moderate: "bg-tertiary-container/20 text-tertiary",
  High: "bg-error-container text-on-error-container",
  Emergency: "bg-error text-on-error",
};

export default function DiseaseLibraryPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selected, setSelected] = useState<Disease | null>(null);

  useEffect(() => {
    diseasesApi.list().then((d) => {
      setDiseases(d);
      setSelected(d[0] ?? null);
    });
  }, []);

  return (
    <DashboardShell>
      <h1 className="mb-2 text-2xl font-semibold text-on-surface">Disease Library</h1>
      <p className="mb-6 text-on-surface-variant">Learn about the five zoonotic diseases this system screens for.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {diseases.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelected(d)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selected?.key === d.key ? "border-primary bg-primary/5" : "border-outline-variant/40 bg-surface-container-lowest"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-on-surface">{d.name}</p>
                <span className={`pill ${URGENCY_STYLES[d.urgency]}`}>{d.urgency}</span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">{d.pathogen_type}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-on-surface">{selected.name}</h2>
              <span className={`pill ${URGENCY_STYLES[selected.urgency]}`}>{selected.urgency} urgency</span>
            </div>
            <p className="mb-4 text-sm text-on-surface-variant">{selected.pathogen_type}</p>

            <div className="mb-5">
              <p className="mb-1 text-sm font-semibold text-on-surface">Transmission</p>
              <p className="text-sm text-on-surface-variant">{selected.transmission}</p>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-on-surface">Signs in dogs</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                {selected.dog_signs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <p className="mb-1 text-sm font-semibold text-on-surface">Human health risk</p>
              <p className="text-sm text-on-surface-variant">{selected.human_risk}</p>
            </div>

            <div className="rounded-lg bg-secondary-container/20 p-4">
              <p className="mb-2 text-sm font-semibold text-on-surface">Prevention tips</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                {selected.prevention.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
