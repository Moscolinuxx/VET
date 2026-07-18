"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import RiskBadge from "@/components/RiskBadge";
import { screeningsApi, dogsApi, ScreeningResult, Dog } from "@/lib/api";

export default function ScreeningHistoryPage() {
  const router = useRouter();
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDog, setFilterDog] = useState("all");

  useEffect(() => {
    Promise.all([screeningsApi.list(), dogsApi.list()])
      .then(([s, d]) => {
        setScreenings(s);
        setDogs(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterDog === "all" ? screenings : screenings.filter((s) => s.dog_id === filterDog);

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-on-surface">Screening History</h1>
        <select className="input-field w-auto" value={filterDog} onChange={(e) => setFilterDog(e.target.value)}>
          <option value="all">All dogs</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-on-surface-variant">No screenings found.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant/40 bg-surface-container-low text-left text-on-surface-variant">
              <tr>
                <th className="px-5 py-3 font-medium">Dog</th>
                <th className="px-5 py-3 font-medium">Predicted disease</th>
                <th className="px-5 py-3 font-medium">Confidence</th>
                <th className="px-5 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const dog = dogs.find((d) => d.id === s.dog_id);
                return (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/dashboard/reports?id=${s.id}`)}
                    className="cursor-pointer border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low"
                  >
                    <td className="px-5 py-3 text-on-surface">{dog?.name ?? "-"}</td>
                    <td className="px-5 py-3 text-on-surface">{s.predicted_disease}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{Math.round(s.confidence * 100)}%</td>
                    <td className="px-5 py-3">
                      <RiskBadge level={s.risk_level} />
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
