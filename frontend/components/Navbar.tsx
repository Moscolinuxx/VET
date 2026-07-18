"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
            V
          </span>
          <span className="text-lg font-semibold text-on-surface">VetGuard AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm font-medium text-on-surface-variant hover:text-primary">
            Features
          </Link>
          <Link href="/architecture" className="text-sm font-medium text-on-surface-variant hover:text-primary">
            How it works
          </Link>
          <Link href="/#diseases" className="text-sm font-medium text-on-surface-variant hover:text-primary">
            Diseases
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
