"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "@/lib/supabase/auth";
import { useCaught } from "@/components/CaughtProvider";

export function UserMenu() {
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { caughtIds } = useCaught();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showStats) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setShowStats(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStats]);

  const generations = useMemo(
    () => [
      { label: "Gen I", start: 1, end: 151 },
      { label: "Gen II", start: 152, end: 251 },
      { label: "Gen III", start: 252, end: 386 },
      { label: "Gen IV", start: 387, end: 493 },
      { label: "Gen V", start: 494, end: 649 },
      { label: "Gen VI", start: 650, end: 721 },
      { label: "Gen VII", start: 722, end: 809 },
      { label: "Gen VIII", start: 810, end: 905 },
      { label: "Gen IX", start: 906, end: 1025 },
    ],
    [],
  );

  const caughtSet = useMemo(() => new Set(caughtIds), [caughtIds]);
  const generationStats = useMemo(
    () =>
      generations.map((gen) => {
        const total = gen.end - gen.start + 1;
        let caught = 0;
        for (let id = gen.start; id <= gen.end; id += 1) {
          if (caughtSet.has(id)) caught += 1;
        }
        return {
          ...gen,
          total,
          caught,
          percent: total > 0 ? Math.round((caught / total) * 100) : 0,
        };
      }),
    [generations, caughtSet],
  );

  const totalCaught = caughtIds.length;
  const totalPokemon = generations[generations.length - 1].end;
  const totalPercent = Math.round((totalCaught / totalPokemon) * 100);

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
    <div ref={menuRef} className="relative flex items-center gap-2">
      <a
        href="/team-builder"
        className="rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
      >
        Team Builder
      </a>
      <button
        type="button"
        onClick={() => setShowStats((prev) => !prev)}
        className="rounded-lg border border-zinc-700/80 bg-zinc-800/70 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
      >
        Stats
      </button>
      <button
        onClick={handleLogout}
        disabled={loading}
        aria-label="Sign out"
        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
      >
        {loading ? "Logging out..." : "Sign out"}
      </button>

      {showStats && (
        <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-[var(--pokedex-border)] bg-zinc-900/95 p-4 shadow-2xl">
          <div className="mb-4">
            <p className="text-sm text-zinc-400">Overall</p>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-400 shadow-[0_0_16px_rgba(74,222,128,0.55)]"
                style={{ width: `${totalPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {totalCaught} / {totalPokemon} caught ({totalPercent}%)
            </p>
          </div>
          <div className="space-y-3">
            {generationStats.map((gen) => (
              <div key={gen.label}>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{gen.label}</span>
                  <span>
                    {gen.caught}/{gen.total} ({gen.percent}%)
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 shadow-[0_0_12px_rgba(129,140,248,0.5)]"
                    style={{ width: `${gen.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
