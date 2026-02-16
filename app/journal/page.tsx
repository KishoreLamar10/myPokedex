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
        <div className="relative space-y-3 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
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
              <div key={`${record.pokemonId}-${record.caughtAt}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 30}ms` }}>
                {/* Dot */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-[var(--pokedex-screen)] group-hover:text-[var(--pokedex-screen)]">
                  <span className="text-[10px] font-bold leading-none">{index + 1}</span>
                </div>
 
                {/* Card */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-xl transition-all duration-300 group-hover:border-zinc-700 group-hover:bg-zinc-800/50 group-hover:shadow-[var(--pokedex-red)]/5">
                  <div className="flex items-center justify-between mb-2">
                    <time className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{formattedDate} • {formattedTime}</time>
                    <div className="flex gap-1">
                      {pokemon.types.map((t: string) => (
                        <div key={t} className={`w-2 h-2 rounded-full ${getTypeClass(t).split(' ')[0]}`} title={t} />
                      ))}
                    </div>
                  </div>
                  
                  <Link href={`/pokedex/${pokemon.id}`} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[var(--pokedex-screen)] transition-colors capitalize">
                        {pokemon.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-mono">#{String(pokemon.id).padStart(3, "0")}</p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
