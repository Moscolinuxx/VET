// Centralized API client. All frontend data calls go through here so the
// backend base URL only needs to change in one place (env var).

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vetguard_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("vetguard_token", token);
  else localStorage.removeItem("vetguard_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ---------- Types ----------
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "owner" | "admin";
  created_at: string;
}

export interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  sex: "Male" | "Female";
  age_months: number;
  weight_kg: number;
  vaccination_status: string;
  deworming_status: string;
  photo_url?: string;
  created_at: string;
}

export interface ScreeningInput {
  dog_id: string;
  Vomiting: string;
  Diarrhea: string;
  Bloody_Stool: string;
  Eye_Discharge: string;
  Weakness: string;
  Fever: string;
  Skin_Lesions: string;
  Hair_Loss: string;
  Excessive_Salivation: string;
  Aggression_Level: string;
  Mucous_Membrane_State: string;
  Physical_Condition: string;
  General_Appearance: string;
  Parasite_Presence: string;
  Tick_Infestation: string;
  Flea_Infestation: string;
  Body_Temperature_C: number;
  Heart_Rate_bpm: number;
  Respiratory_Rate_bpm: number;
  human_bite_or_scratch: boolean;
  human_saliva_contact: boolean;
  human_shared_food_or_licking: boolean;
  caregiver_immunocompromised_or_child_or_pregnant: boolean;
}

export interface ScreeningResult {
  id: string;
  dog_id: string;
  predicted_disease: string;
  confidence: number;
  probabilities: Record<string, number>;
  risk_level: "Low" | "Moderate" | "High";
  model_name: string;
  recommendation: string;
  human_exposure_flag: boolean;
  human_exposure_message?: string;
  created_at: string;
}

export interface Disease {
  key: string;
  name: string;
  pathogen_type: string;
  transmission: string;
  dog_signs: string[];
  human_risk: string;
  prevention: string[];
  urgency: "Low" | "Moderate" | "High" | "Emergency";
}

export interface Reminder {
  id: string;
  dog_id: string;
  title: string;
  category: string;
  due_date: string;
  is_completed: boolean;
  notes?: string;
}

// ---------- Auth ----------
export const authApi = {
  register: (data: { full_name: string; email: string; password: string; phone?: string }) =>
    request<{ access_token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/api/auth/me"),
};

// ---------- Dogs ----------
export const dogsApi = {
  list: () => request<Dog[]>("/api/dogs"),
  get: (id: string) => request<Dog>(`/api/dogs/${id}`),
  create: (data: Omit<Dog, "id" | "owner_id" | "created_at">) =>
    request<Dog>("/api/dogs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Omit<Dog, "id" | "owner_id" | "created_at">) =>
    request<Dog>(`/api/dogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/dogs/${id}`, { method: "DELETE" }),
};

// ---------- Screenings ----------
export const screeningsApi = {
  run: (data: ScreeningInput) =>
    request<ScreeningResult>("/api/screenings", { method: "POST", body: JSON.stringify(data) }),
  list: (dogId?: string) =>
    request<ScreeningResult[]>(`/api/screenings${dogId ? `?dog_id=${dogId}` : ""}`),
  get: (id: string) => request<ScreeningResult>(`/api/screenings/${id}`),
};

// ---------- Diseases ----------
export const diseasesApi = {
  list: () => request<Disease[]>("/api/diseases"),
  get: (key: string) => request<Disease>(`/api/diseases/${key}`),
};

// ---------- Reminders ----------
export const remindersApi = {
  list: (params?: { dogId?: string; upcomingOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.dogId) q.set("dog_id", params.dogId);
    if (params?.upcomingOnly) q.set("upcoming_only", "true");
    const qs = q.toString();
    return request<Reminder[]>(`/api/reminders${qs ? `?${qs}` : ""}`);
  },
  create: (data: { dog_id: string; title: string; category: string; due_date: string; notes?: string }) =>
    request<Reminder>("/api/reminders", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ is_completed: boolean; title: string; due_date: string; notes: string }>) =>
    request<Reminder>(`/api/reminders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/api/reminders/${id}`, { method: "DELETE" }),
};

// ---------- Admin ----------
export const adminApi = {
  analytics: () => request<any>("/api/admin/analytics"),
  modelInfo: () => request<any>("/api/admin/model-info"),
  users: () => request<any[]>("/api/admin/users"),
};

export { getToken };
