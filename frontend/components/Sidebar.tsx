"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const OWNER_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/dogs", label: "My Dogs", icon: "🐕" },
  { href: "/dashboard/screening/new", label: "New Screening", icon: "🩺" },
  { href: "/dashboard/screening/history", label: "Screening History", icon: "📋" },
  { href: "/dashboard/diseases", label: "Disease Library", icon: "📚" },
  { href: "/dashboard/reminders", label: "Reminders", icon: "⏰" },
  { href: "/dashboard/reports", label: "Reports", icon: "📄" },
  { href: "/architecture", label: "System Architecture", icon: "🧬" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

const ADMIN_LINKS = [{ href: "/admin", label: "Admin Dashboard", icon: "🛡️" }];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role === "admin" ? [...OWNER_LINKS, ...ADMIN_LINKS] : OWNER_LINKS;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest md:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
          V
        </span>
        <span className="text-lg font-semibold text-on-surface">VetGuard AI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-outline-variant/40 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-sm font-semibold">
            {user?.full_name?.[0]?.toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{user?.full_name}</p>
            <p className="truncate text-xs text-on-surface-variant">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full rounded border border-outline-variant py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container">
          Log out
        </button>
      </div>
    </aside>
  );
}
