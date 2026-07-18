"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { dogsApi, Dog } from "@/lib/api";

const BREEDS = ["Beagle", "Bulldog", "Doberman", "German Shepherd", "Golden Retriever", "Husky", "Labrador Retriever", "Mongrel", "Pit Bull", "Rottweiler"];

const EMPTY_FORM = {
  name: "",
  breed: BREEDS[0],
  sex: "Male" as "Male" | "Female",
  age_months: 12,
  weight_kg: 15,
  vaccination_status: "Not Vaccinated",
  deworming_status: "Unknown",
};

export default function MyDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    dogsApi.list().then(setDogs).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(dog: Dog) {
    setForm({
      name: dog.name,
      breed: dog.breed,
      sex: dog.sex,
      age_months: dog.age_months,
      weight_kg: dog.weight_kg,
      vaccination_status: dog.vaccination_status,
      deworming_status: dog.deworming_status,
    });
    setEditingId(dog.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await dogsApi.update(editingId, form);
      } else {
        await dogsApi.create(form);
      }
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this dog and all its screening history?")) return;
    await dogsApi.remove(id);
    load();
  }

  return (
    <DashboardShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">My Dogs</h1>
          <p className="mt-1 text-on-surface-variant">Manage your dog profiles.</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          + Add Dog
        </button>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : dogs.length === 0 ? (
        <div className="card text-center text-on-surface-variant">No dogs added yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <div key={dog.id} className="card">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-xl">
                  🐕
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{dog.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {dog.breed} · {dog.sex}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
                <p>Age: {dog.age_months} mo</p>
                <p>Weight: {dog.weight_kg} kg</p>
                <p>Vax: {dog.vaccination_status}</p>
                <p>Deworm: {dog.deworming_status}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(dog)} className="btn-secondary flex-1 text-center">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dog.id)}
                  className="flex-1 rounded border border-error text-error py-2.5 text-sm font-medium hover:bg-error-container/30"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 shadow-overlay">
            <h2 className="mb-4 text-lg font-semibold text-on-surface">{editingId ? "Edit Dog" : "Add Dog"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-on-surface">Name</label>
                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Breed</label>
                  <select className="input-field" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}>
                    {BREEDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Sex</label>
                  <select className="input-field" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as "Male" | "Female" })}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Age (months)</label>
                  <input type="number" required min={0} className="input-field" value={form.age_months} onChange={(e) => setForm({ ...form, age_months: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Weight (kg)</label>
                  <input type="number" required min={0} step="0.1" className="input-field" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Vaccination status</label>
                  <select className="input-field" value={form.vaccination_status} onChange={(e) => setForm({ ...form, vaccination_status: e.target.value })}>
                    <option>Not Vaccinated</option>
                    <option>Partial</option>
                    <option>Up-to-date</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-on-surface">Deworming status</label>
                  <select className="input-field" value={form.deworming_status} onChange={(e) => setForm({ ...form, deworming_status: e.target.value })}>
                    <option>Unknown</option>
                    <option>Irregular</option>
                    <option>Regular</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
