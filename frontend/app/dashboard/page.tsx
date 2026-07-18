"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import RiskBadge from "@/components/RiskBadge";
import { useAuth } from "@/lib/auth-context";
import { dogsApi, screeningsApi, remindersApi, Dog, ScreeningResult, Reminder } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([dogsApi.list(), screeningsApi.list(), remindersApi.list({ upcomingOnly: true })])
      .then(([d, s, r]) => {
        setDogs(d);
        setScreenings(s.slice(0, 5));
        setReminders(r.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Welcome back, {user?.full_name?.split(" ")[0]}</h1>
          <p className="mt-1 text-on-surface-variant">Here's a snapshot of your dogs' health screening activity.</p>
        </div>
        <Link href="/dashboard/screening/new" className="btn-primary">
          + New Screening
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-on-surface-variant">Dogs registered</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{dogs.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-on-surface-variant">Total screenings</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{screenings.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-on-surface-variant">Upcoming reminders</p>
          <p className="mt-2 text-3xl font-semibold text-on-surface">{reminders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Recent screenings</h2>
            <Link href="/dashboard/screening/history" className="text-sm font-medium text-primary">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-on-surface-variant">Loading...</p>
          ) : screenings.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No screenings yet.{" "}
              <Link href="/dashboard/screening/new" className="text-primary font-medium">
                Run your first screening
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {screenings.map((s) => {
                const dog = dogs.find((d) => d.id === s.dog_id);
                return (
                  <Link
                    key={s.id}
                    href={`/dashboard/reports?id=${s.id}`}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/40 p-4 hover:bg-surface-container-low"
                  >
                    <div>
                      <p className="font-medium text-on-surface">
                        {dog?.name ?? "Dog"} — {s.predicted_disease}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(s.created_at).toLocaleDateString()} · {Math.round(s.confidence * 100)}% confidence
                      </p>
                    </div>
                    <RiskBadge level={s.risk_level} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Upcoming reminders</h2>
            <Link href="/dashboard/reminders" className="text-sm font-medium text-primary">
              Manage
            </Link>
          </div>
          {reminders.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No upcoming reminders.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div key={r.id} className="rounded-lg border border-outline-variant/40 p-3">
                  <p className="text-sm font-medium text-on-surface">{r.title}</p>
                  <p className="text-xs text-on-surface-variant">
                    {r.category} · Due {new Date(r.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dogs.length === 0 && !loading && (
        <div className="card mt-6 flex items-center justify-between bg-secondary-container/20">
          <div>
            <p className="font-medium text-on-surface">Add your first dog to get started</p>
            <p className="text-sm text-on-surface-variant">You'll need a dog profile before running a screening.</p>
          </div>
          <Link href="/dashboard/dogs" className="btn-primary">
            Add a dog
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
