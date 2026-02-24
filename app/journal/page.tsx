"use client";

import { useCaught } from "@/components/CaughtProvider";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPokemonBasicInfoBatch } from "@/lib/pokeapi";
import { getTypeClass } from "@/lib/typeEffectiveness";
import type { PokemonListItem } from "@/types/pokemon";

export default function JournalPage() {
  const { caughtHistory, loading: caughtLoading } = useCaught();
  const [pokemonMap, setPokemonMap] = useState<Record<number, PokemonListItem>>({});
  const [loadedCount, setLoadedCount] = useState(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (caughtLoading || caughtHistory.length === 0 || fetchedRef.current) return;
    fetchedRef.current = true;

    const ids = caughtHistory.map((r) => r.pokemonId);

    getPokemonBasicInfoBatch(
      ids,
      (batch) => {
        setPokemonMap((prev) => ({ ...prev, ...batch }));
        setLoadedCount((prev) => prev + Object.keys(batch).length);
      },
      8, // fetch 8 at a time for fast progressive rendering
    );
  }, [caughtLoading, caughtHistory]);

  const totalUnique = new Set(caughtHistory.map((r) => r.pokemonId)).size;
  const isFullyLoaded = loadedCount >= totalUnique;

  if (caughtLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Consulting the Professor's records...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <span className="text-[var(--pokedex-red)]">📓</span> Adventure Journal
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-zinc-400">A chronological record of your Pokémon journey.</p>
          {!isFullyLoaded && caughtHistory.length > 0 && (
            <span className="text-xs text-zinc-500 animate-pulse">
              Loading {loadedCount}/{totalUnique}...
            </span>
          )}
        </div>
      </header>

      {caughtHistory.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
          <p className="text-zinc-500 mb-6">Your journal is empty. Start catching Pokémon to record your history!</p>
          <Link
            href="/pokedex"
            className="px-6 py-3 bg-[var(--pokedex-red)] text-white rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-red-900/20"
          >
            Go to Pokédex
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {caughtHistory.map((record, index) => {
            const pokemon = pokemonMap[record.pokemonId];

            // Skeleton placeholder while still loading this Pokémon's data
            if (!pokemon) {
              return (
                <div
                  key={`${record.pokemonId}-${record.caughtAt}`}
                  className="relative min-h-[140px] bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3 animate-pulse"
                >
                  <div className="w-full aspect-square bg-zinc-800/50 rounded-xl mb-2" />
                  <div className="h-4 bg-zinc-800/50 rounded w-3/4 mx-auto" />
                </div>
              );
            }

            const date = new Date(record.caughtAt);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={`${record.pokemonId}-${record.caughtAt}`}
                className="relative group animate-in fade-in zoom-in-95 duration-500"
                style={{ animationDelay: `${Math.min(index, 20) * 15}ms` }}
              >
                {/* Catch Number Badge */}
                <div className="absolute -top-1.5 -left-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-black text-zinc-400 shadow-xl transition-all group-hover:scale-125 group-hover:bg-[var(--pokedex-red)] group-hover:border-white group-hover:text-white">
                  {caughtHistory.length - index}
                </div>

                <Link
                  href={`/pokedex/${pokemon.id}`}
                  className="block relative min-h-[140px] bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3 transition-all duration-300 group-hover:border-[var(--pokedex-red)]/50 group-hover:bg-zinc-800/80 group-hover:shadow-[0_0_20px_rgba(227,53,13,0.1)] overflow-hidden"
                >
                  {/* Background Accents */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-[var(--pokedex-red)] to-transparent" />
                  
                  <div className="relative h-full flex flex-col items-center justify-between gap-1">
                    {/* Large Sprite */}
                    <div className="relative w-full aspect-square flex items-center justify-center">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        fill
                        className="object-contain p-1 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6"
                        unoptimized
                      />
                    </div>

                    {/* Meta Footer */}
                    <div className="w-full text-center mt-auto p-1.5 bg-zinc-950/80 rounded-xl border border-zinc-800 select-none">
                      <h3 className="text-sm font-extrabold text-white capitalize group-hover:text-[var(--pokedex-red)] transition-colors leading-tight">
                        {pokemon.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-1 py-0.5 border-t border-zinc-800/50">
                        <time className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-tighter">
                          {formattedDate}
                        </time>
                        <div className="flex gap-1">
                          {pokemon.types.map((t: string) => (
                            <div
                              key={t}
                              className={`w-2.5 h-2.5 rounded-full ring-2 ring-zinc-950/50 ${getTypeClass(t).split(' ')[0]}`}
                              title={t}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
