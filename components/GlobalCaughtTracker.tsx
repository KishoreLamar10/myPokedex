"use client";

import { useCaught } from "@/components/CaughtProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function GlobalCaughtTracker() {
  const { caughtIds, loading, userId } = useCaught();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Total current National Dex size
  const TOTAL_POKEMON = 1025;

  // Don't render anything if we're on the team builder page,
  // or if we haven't mounted yet to prevent hydration mismatches,
  // or if the user isn't logged in.
  if (!mounted || pathname?.startsWith("/team-builder") || !userId) {
    return null;
  }

  const caughtCount = caughtIds.length;
  const percentage = Math.round((caughtCount / TOTAL_POKEMON) * 100);

  return (
    <div className="group relative flex items-center gap-2 px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 transition-colors rounded-full border border-zinc-700/50 shadow-sm overflow-hidden">
      {/* Background progress fill overlay */}
      {caughtCount > 0 && (
        <div 
          className="absolute inset-0 bg-[var(--pokedex-red)]/10 transition-all duration-1000 ease-out z-0"
          style={{ width: `${percentage}%` }}
        />
      )}
      
      <div className="relative z-10 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--pokedex-red)] shadow-[0_0_4px_var(--pokedex-red)] animate-pulse" />
        <span className="text-xs font-semibold font-mono tracking-tight">
          <span className="text-zinc-100">{caughtCount}</span>
          <span className="text-zinc-500 mx-0.5">/</span>
          <span className="text-zinc-400">{TOTAL_POKEMON}</span>
        </span>
      </div>
    </div>
  );
}
