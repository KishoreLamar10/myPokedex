"use client";

import { useMemo, useState, useEffect } from "react";
import type { TeamMember } from "@/types/team";
import {
  TYPE_CHART,
  getTypeClass,
  getStrengths,
} from "@/lib/typeEffectiveness";
import { getMoveType } from "@/lib/pokeapi";

interface TeamCoverageProps {
  team: (TeamMember | null)[];
}

export function TeamCoverage({ team }: TeamCoverageProps) {
  const activeMembers = useMemo(
    () => team.filter((p): p is TeamMember => p !== null),
    [team],
  );

  const [moveTypes, setMoveTypes] = useState<string[]>([]);

  useEffect(() => {
    const allMoves = activeMembers.flatMap(m => m.moves).filter(Boolean);
    const uniqueMoves = Array.from(new Set(allMoves));
    
    const fetchMoveTypes = async () => {
      const types = await Promise.all(uniqueMoves.map(m => getMoveType(m)));
      const filteredTypes = types.filter((t): t is string => t !== null);
      setMoveTypes(Array.from(new Set(filteredTypes)));
    };

    fetchMoveTypes();
  }, [activeMembers]);

  const coverage = useMemo(() => {
    const weaknesses: Record<string, string[]> = {}; // Type -> Names of weak Pokemon
    const resistances: Record<string, string[]> = {}; // Type -> Names of resistant Pokemon
    const immunities: Record<string, string[]> = {}; // Type -> Names of immune Pokemon

    Object.keys(TYPE_CHART).forEach((attackType) => {
      activeMembers.forEach((pokemon) => {
        let multiplier = 1;
        pokemon.types.forEach((defType) => {
          multiplier *= TYPE_CHART[attackType][defType.toLowerCase()] ?? 1;
        });

        if (multiplier > 1) {
          if (!weaknesses[attackType]) weaknesses[attackType] = [];
          weaknesses[attackType].push(pokemon.name);
        } else if (multiplier === 0) {
          if (!immunities[attackType]) immunities[attackType] = [];
          immunities[attackType].push(pokemon.name);
        } else if (multiplier < 1) {
          if (!resistances[attackType]) resistances[attackType] = [];
          resistances[attackType].push(pokemon.name);
        }
      });
    });

    const offensiveStrengths = getStrengths(moveTypes);

    return { weaknesses, resistances, immunities, offensiveStrengths };
  }, [activeMembers, moveTypes]);

  if (activeMembers.length === 0) return null;

  const allTypes = Object.keys(TYPE_CHART).map(
    (t) => t.charAt(0).toUpperCase() + t.slice(1),
  );

  // Identify "Major Weaknesses" - 3+ members weak, or 2+ weak and 0 resistant/immune
  const majorWeaknesses = Object.entries(coverage.weaknesses)
    .filter(([type, weakNames]) => {
      const resistCount = (coverage.resistances[type]?.length || 0) + (coverage.immunities[type]?.length || 0);
      return weakNames.length >= 3 || (weakNames.length >= 2 && resistCount === 0);
    })
    .sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-[var(--pokedex-red)]">📊</span> Team Analysis
        </h3>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-mono border border-zinc-700">
             {activeMembers.length} Members
           </div>
           <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-mono border border-zinc-700">
             {moveTypes.length} Move Types
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Defensive Side */}
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between">
              Defensive Gaps
              <span className="text-[9px] font-normal normal-case">Weaknesses vs Resistances</span>
            </h4>
            
            {majorWeaknesses.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                    <p className="text-[10px] font-bold text-red-400 uppercase mb-3 tracking-tighter">⚠️ Major Gaps Detected</p>
                    <div className="space-y-3">
                        {majorWeaknesses.map(([type, names]) => (
                            <div key={type} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <span className={`w-20 text-center rounded px-2 py-0.5 text-[10px] font-black uppercase ${getTypeClass(type.charAt(0).toUpperCase() + type.slice(1))}`}>
                                        {type}
                                    </span>
                                    <span className="text-[11px] text-zinc-400">
                                        Weak: <span className="text-zinc-200">{names.join(", ")}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {allTypes.map((type) => {
                const typeLower = type.toLowerCase();
                const weakCount = coverage.weaknesses[typeLower]?.length || 0;
                const resistCount = (coverage.resistances[typeLower]?.length || 0) + (coverage.immunities[typeLower]?.length || 0);
                const score = resistCount - weakCount;
                
                const typeColorClass = score !== 0 ? getTypeClass(type) : "";

                return (
                  <div
                    key={type}
                    title={`${type}: ${resistCount} Resists, ${weakCount} Weak\nWeak: ${coverage.weaknesses[typeLower]?.join(', ') || 'None'}\nResistant: ${coverage.resistances[typeLower]?.join(', ') || 'None'}`}
                    className={`group relative rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2 shadow-sm ${
                      score > 0
                        ? `${typeColorClass} border-transparent ring-1 ring-inset ring-white/10`
                        : score < 0
                          ? `${typeColorClass} border-transparent ring-1 ring-inset ring-black/10`
                          : "bg-zinc-800/30 text-zinc-500 border border-zinc-700/50 opacity-40"
                    } hover:scale-105 hover:opacity-100 hover:z-10`}
                  >
                    {type}
                    {score !== 0 && (
                      <span className={`text-[10px] font-mono px-1 rounded bg-black/20 ${score > 0 ? "text-white/80" : "text-white/90"}`}>
                        {score > 0 ? `+${score}` : score}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Offensive Side */}
        <div className="space-y-6">
             <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between">
                    Offensive Coverage
                    <span className="text-[9px] font-normal normal-case">Super-Effective vs</span>
                </h4>
                
                {coverage.offensiveStrengths.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {coverage.offensiveStrengths.map((strength) => (
                            <div
                                key={strength.type}
                                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase transition-all duration-300 shadow-lg ${getTypeClass(strength.type)} border-transparent hover:scale-110 hover:z-10 ring-1 ring-inset ring-white/10`}
                            >
                                {strength.type}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
                        <p className="text-xs text-zinc-500">Pick some moves to see offensive coverage!</p>
                    </div>
                )}
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                     <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800/50 shadow-inner group">
                        <div className="text-[9px] text-zinc-500 uppercase font-black mb-1 group-hover:text-zinc-400 transition-colors">Move Diversity</div>
                        <div className="text-2xl font-black text-white">{moveTypes.length}<span className="text-[10px] text-zinc-500 font-bold ml-1 uppercase tracking-widest">Types</span></div>
                     </div>
                     <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800/50 shadow-inner group">
                        <div className="text-[9px] text-zinc-500 uppercase font-black mb-1 group-hover:text-zinc-400 transition-colors">Threats Hit</div>
                        <div className="text-2xl font-black text-[var(--pokedex-screen)]">{coverage.offensiveStrengths.length}<span className="text-[10px] text-zinc-500 font-bold ml-1 uppercase tracking-widest text-zinc-500">Types</span></div>
                     </div>
                </div>
             </div>
        </div>
      </div>

      <footer className="mt-8 pt-6 border-t border-zinc-800/50">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center text-[10px] text-zinc-500">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                <span>Positive Score: Good Resistance</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                <span>Negative Score: Vulnerability</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                <span>Hover for member breakdown</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
