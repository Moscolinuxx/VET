"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { remindersApi, dogsApi, Reminder, Dog } from "@/lib/api";

const CATEGORIES = ["Vaccination", "Deworming", "Vet Visit", "General"];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dog_id: "", title: "", category: "Vaccination", due_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([remindersApi.list(), dogsApi.list()]).then(([r, d]) => {
      setReminders(r);
      setDogs(d);
      if (d.length > 0 && !form.dog_id) setForm((f) => ({ ...f, dog_id: d[0].id }));
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await remindersApi.create(form);
      setShowForm(false);
      setForm({ ...form, title: "", due_date: "", notes: "" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleComplete(r: Reminder) {
    await remindersApi.update(r.id, { is_completed: !r.is_completed });
    load();
  }

  async function remove(id: string) {
    await remindersApi.remove(id);
    load();
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Reminders</h1>
          <p className="mt-1 text-on-surface-variant">Vaccinations, deworming, and vet visits.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={dogs.length === 0}>
          + Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="card text-center text-on-surface-variant">No reminders yet.</div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const dog = dogs.find((d) => d.id === r.dog_id);
            const overdue = !r.is_completed && new Date(r.due_date) < new Date();
            return (
              <div key={r.id} className={`card flex items-center justify-between ${r.is_completed ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={r.is_completed} onChange={() => toggleComplete(r)} className="h-5 w-5 accent-primary" />
                  <div>
                    <p className={`font-medium text-on-surface ${r.is_completed ? "line-through" : ""}`}>{r.title}</p>
                    <p className="text-xs text-on-surface-variant">
                      {dog?.name} · {r.category} · Due {new Date(r.due_date).toLocaleDateString()}
                      {overdue && <span className="ml-2 font-medium text-error">Overdue</span>}
                    </p>
                  </div>
                </div>
                <button onClick={() => remove(r.id)} className="text-sm text-error hover:underline">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-overlay">
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Add Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Dog</label>
                <select required className="input-field" value={form.dog_id} onChange={(e) => setForm({ ...form, dog_id: e.target.value })}>
                  {dogs.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Title</label>
                <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Rabies booster" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Category</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Due date</label>
                <input type="date" required className="input-field" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
