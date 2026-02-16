"use client";

import { useMemo } from "react";
import type { PokemonListItem } from "@/types/pokemon";
import {
  TYPE_CHART,
  getTypeClass,
} from "@/lib/typeEffectiveness";

interface TeamCoverageProps {
  team: (PokemonListItem | null)[];
}

export function TeamCoverage({ team }: TeamCoverageProps) {
  const activeMembers = useMemo(
    () => team.filter((p): p is PokemonListItem => p !== null),
    [team],
  );

  const coverage = useMemo(() => {
    const weaknesses: Record<string, number> = {};
    const resistances: Record<string, number> = {};

    Object.keys(TYPE_CHART).forEach((attackType) => {
      let teamWeakCount = 0;
      let teamResistCount = 0;

      activeMembers.forEach((pokemon) => {
        let multiplier = 1;
        pokemon.types.forEach((defType) => {
          multiplier *= TYPE_CHART[attackType][defType.toLowerCase()] ?? 1;
        });

        if (multiplier > 1) teamWeakCount++;
        if (multiplier < 1) teamResistCount++;
      });

      if (teamWeakCount > 0) weaknesses[attackType] = teamWeakCount;
      if (teamResistCount > 0) resistances[attackType] = teamResistCount;
    });

    return { weaknesses, resistances };
  }, [activeMembers]);

  if (activeMembers.length === 0) return null;

  const sortedWeaknesses = Object.entries(coverage.weaknesses)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2);

  const allTypes = Object.keys(TYPE_CHART).map(
    (t) => t.charAt(0).toUpperCase() + t.slice(1),
  );

  return (
    <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
      <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
        <span className="text-[var(--pokedex-red)]">🛡️</span> Team Coverage Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Critical Weaknesses */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-400">
            Critical Weaknesses (2+ members)
          </h4>
          {sortedWeaknesses.length > 0 ? (
            <div className="space-y-3">
              {sortedWeaknesses.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2.5 py-1 text-xs font-bold uppercase ${getTypeClass(
                        type.charAt(0).toUpperCase() + type.slice(1),
                      )}`}
                    >
                      {type}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {count} {count === 1 ? "member" : "members"} weak
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">No major type weaknesses! Great balance.</p>
          )}
        </div>

        {/* Coverage Summary */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Type Resistances
          </h4>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => {
              const resistCount = coverage.resistances[type.toLowerCase()] || 0;
              const weakCount = coverage.weaknesses[type.toLowerCase()] || 0;
              const score = resistCount - weakCount;

              return (
                <div
                  key={type}
                  title={`${type}: ${resistCount} resists, ${weakCount} weak`}
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase transition flex items-center gap-1.5 ${
                    score > 0
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : score < 0
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 opacity-60"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-40"
                  }`}
                >
                  {type}
                  {score !== 0 && (
                    <span className={`text-[9px] ${score > 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {score > 0 ? `+${score}` : score}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <strong className="text-zinc-400">How to read:</strong> Critical weaknesses identify types that threaten 2 or more of your team members. A positive resistance score means your team has more resistances than weaknesses to that type.
        </p>
      </div>
    </div>
  );
}
