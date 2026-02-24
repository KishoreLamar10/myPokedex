"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "@/lib/supabase/auth";
import { useCaught } from "@/components/CaughtProvider";
import Link from "next/link";

export function UserMenu() {
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { caughtIds } = useCaught();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setShowStats(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const navItems = [
    { label: "Team Builder", href: "/team-builder" },
    { label: "Journey", href: "/journal" },
  ];

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      {/* Desktop View: Row of controls */}
      <div className="hidden min-[1100px]:flex items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowStats((prev) => !prev)}
          className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-400 transition-all hover:bg-zinc-800/80 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
        >
          Stats
        </button>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="rounded-xl bg-zinc-800/80 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-300 transition-all hover:bg-rose-900/40 hover:text-rose-200 hover:scale-105 active:scale-95 disabled:opacity-50 border border-zinc-700/50"
        >
          {loading ? "..." : "Sign out"}
        </button>
      </div>

      {/* Tablet/Mobile View: Avatar/Dropdown Trigger */}
      <div className="min-[1100px]:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--pokedex-red)]/10 border-2 border-[var(--pokedex-red)]/50 text-[var(--pokedex-red)] hover:bg-[var(--pokedex-red)]/20 transition-all active:scale-90"
          aria-label="User Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center w-full px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setShowStats(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left"
            >
              Stats
            </button>
            <div className="h-px bg-zinc-800 my-1 mx-2" />
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center w-full px-4 py-3 text-sm font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-900/20 rounded-xl transition-colors text-left"
            >
              {loading ? "Logging out..." : "Sign out"}
            </button>
          </div>
        )}
      </div>

      {showStats && (
        <div className="absolute right-0 top-12 z-50 w-[min(90vw,320px)] rounded-2xl border border-[var(--pokedex-border)] bg-zinc-900/98 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-zinc-200">Total Progress</p>
            <button
               onClick={() => setShowStats(false)}
               className="text-zinc-500 hover:text-white"
            >
               ✕
            </button>
          </div>
          <div className="mb-4">
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-850 border border-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-400 shadow-[0_0_16px_rgba(74,222,128,0.3)]"
                style={{ width: `${totalPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-zinc-400">
              {totalCaught} / {totalPokemon} caught ({totalPercent}%)
            </p>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {generationStats.map((gen) => (
              <div key={gen.label}>
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                  <span>{gen.label}</span>
                  <span>
                    {gen.caught}/{gen.total} ({gen.percent}%)
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-850 border border-zinc-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 shadow-[0_0_12px_rgba(129,140,248,0.2)]"
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
