"use client";

import { useCaught } from "@/components/CaughtProvider";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllPokemonForSelector } from "@/lib/pokeapi";
import { getTypeClass } from "@/lib/typeEffectiveness";

export default function JournalPage() {
  const { caughtHistory, loading: caughtLoading } = useCaught();
  const [pokemonMap, setPokemonMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pokes = await getAllPokemonForSelector();
        const map: Record<number, any> = {};
        pokes.forEach((p) => {
          map[p.id] = p;
        });
        setPokemonMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || caughtLoading) {
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
        <p className="text-sm text-zinc-400">A chronological record of your Pokémon journey.</p>
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
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
          {caughtHistory.map((record, index) => {
            const pokemon = pokemonMap[record.pokemonId];
            if (!pokemon) return null;

            const date = new Date(record.caughtAt);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={`${record.pokemonId}-${record.caughtAt}`} className="relative flex items-center gap-4 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 20}ms` }}>
                {/* Dot with Number */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-950 text-zinc-400 shadow-lg shrink-0 z-10 transition-all group-hover:border-[var(--pokedex-red)] group-hover:text-white group-hover:scale-110">
                  <span className="text-xs font-black">{caughtHistory.length - index}</span>
                </div>
 
                {/* Compact Card */}
                <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-2xl shadow-lg transition-all duration-300 group-hover:border-zinc-700 group-hover:bg-zinc-800/80 group-hover:shadow-[var(--pokedex-red)]/5 flex items-center gap-4">
                  <Link href={`/pokedex/${pokemon.id}`} className="relative w-14 h-14 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group-hover:border-[var(--pokedex-red)]/30 transition-colors shrink-0">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      fill
                      className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-black text-white group-hover:text-[var(--pokedex-red)] transition-colors capitalize truncate">
                        {pokemon.name}
                      </h3>
                      <time className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-tighter whitespace-nowrap">
                        {formattedDate}
                      </time>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                       <span className="text-[11px] font-mono font-bold text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                         #{String(pokemon.id).padStart(3, "0")}
                       </span>
                       <div className="flex gap-1.5">
                        {pokemon.types.map((t: string) => (
                          <div key={t} className={`w-2.5 h-2.5 rounded-full shadow-sm hover:scale-125 transition-transform ${getTypeClass(t).split(' ')[0]}`} title={t} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
