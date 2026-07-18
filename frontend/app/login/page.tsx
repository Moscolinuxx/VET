"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20">
        <h1 className="text-2xl font-semibold text-on-surface">Welcome back</h1>
        <p className="mt-2 text-on-surface-variant">Log in to screen your dogs and view history.</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
          {error && (
            <div className="rounded bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-on-surface-variant">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
