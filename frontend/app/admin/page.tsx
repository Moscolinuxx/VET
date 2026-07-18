"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { adminApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#00685f", "#006c49", "#825100", "#ba1a1a", "#6bd8cb"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .analytics()
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load analytics. Admin access required."));
  }, []);

  if (error) {
    return (
      <DashboardShell>
        <div className="card text-center text-error">{error}</div>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell>
        <p className="text-on-surface-variant">Loading analytics...</p>
      </DashboardShell>
    );
  }

  const diseaseData = Object.entries(data.disease_distribution).map(([name, value]) => ({ name, value }));
  const riskData = Object.entries(data.risk_distribution).map(([name, value]) => ({ name, value }));
  const dailyData = Object.entries(data.daily_screenings_last_14_days).map(([date, count]) => ({ date, count }));

  return (
    <DashboardShell>
      <h1 className="mb-2 text-2xl font-semibold text-on-surface">Admin Dashboard</h1>
      <p className="mb-6 text-on-surface-variant">System-wide screening analytics and model performance.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Owners" value={data.total_owners} />
        <StatCard label="Dogs" value={data.total_dogs} />
        <StatCard label="Total screenings" value={data.total_screenings} />
        <StatCard label="Last 30 days" value={data.screenings_last_30_days} />
        <StatCard label="Avg. confidence" value={`${Math.round(data.average_model_confidence * 100)}%`} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Disease distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={diseaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {diseaseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Risk level distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dee4e1" />
              <XAxis dataKey="name" stroke="#3d4947" fontSize={12} />
              <YAxis stroke="#3d4947" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#00685f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6 card">
        <h2 className="mb-4 text-lg font-semibold text-on-surface">Screenings — last 14 days</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dee4e1" />
            <XAxis dataKey="date" stroke="#3d4947" fontSize={11} />
            <YAxis stroke="#3d4947" fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#006c49" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-on-surface">Model performance (held-out test set)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Model" value={data.model_info.Model} small />
          <StatCard label="Accuracy" value={`${Math.round(data.model_info.Accuracy * 100)}%`} />
          <StatCard label="Macro F1" value={data.model_info["Macro F1"].toFixed(3)} />
          <StatCard label="High-risk cases" value={data.high_risk_screening_count} />
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, small }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`mt-1 font-semibold text-on-surface ${small ? "text-sm" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
