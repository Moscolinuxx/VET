"use client";

import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <h1 className="mb-6 text-2xl font-semibold text-on-surface">Profile</h1>

      <div className="card max-w-lg">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-2xl font-semibold text-on-secondary-container">
            {user?.full_name?.[0]?.toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-on-surface">{user?.full_name}</p>
            <p className="text-sm text-on-surface-variant capitalize">{user?.role} account</p>
          </div>
        </div>

        <dl className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-outline-variant/30 pb-3">
            <dt className="text-on-surface-variant">Email</dt>
            <dd className="font-medium text-on-surface">{user?.email}</dd>
          </div>
          <div className="flex justify-between border-b border-outline-variant/30 pb-3">
            <dt className="text-on-surface-variant">Phone</dt>
            <dd className="font-medium text-on-surface">{user?.phone || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Member since</dt>
            <dd className="font-medium text-on-surface">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardShell>
  );
}
