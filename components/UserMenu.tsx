"use client";

import { useState } from "react";
import { signOut } from "@/lib/supabase/auth";

export function UserMenu() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sign out"
      className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
    >
      {loading ? "Logging out..." : "Sign out"}
    </button>
  );
}
