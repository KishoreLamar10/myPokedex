"use client";

import { useCallback, useState } from "react";
import { useCaught } from "@/components/CaughtProvider";
import type { PokemonDetail } from "@/types/pokemon";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-amber-100 text-amber-900",
  Fire: "bg-orange-500 text-white",
  Water: "bg-blue-500 text-white",
  Electric: "bg-yellow-400 text-yellow-950",
  Grass: "bg-green-500 text-white",
  Ice: "bg-cyan-300 text-cyan-950",
  Fighting: "bg-red-700 text-white",
  Poison: "bg-purple-600 text-white",
  Ground: "bg-amber-700 text-white",
  Flying: "bg-indigo-300 text-indigo-950",
  Psychic: "bg-pink-500 text-white",
  Bug: "bg-lime-600 text-white",
  Rock: "bg-stone-600 text-white",
  Ghost: "bg-violet-800 text-white",
  Dragon: "bg-indigo-600 text-white",
  Dark: "bg-zinc-800 text-white",
  Steel: "bg-zinc-400 text-zinc-900",
  Fairy: "bg-pink-300 text-pink-950",
};

function getTypeClass(type: string) {
  return TYPE_COLORS[type] ?? "bg-zinc-500 text-white";
}

interface PokemonDetailClientProps {
  pokemon: PokemonDetail;
}

export function PokemonDetailClient({ pokemon }: PokemonDetailClientProps) {
  const { caughtIds, toggleCaught, loading, error } = useCaught();
  const [busy, setBusy] = useState(false);

  const caught = caughtIds.includes(pokemon.id);

  const handleToggle = useCallback(async () => {
    if (loading || busy) return;
    setBusy(true);
    try {
      await toggleCaught(pokemon.id);
    } finally {
      setBusy(false);
    }
  }, [pokemon.id, toggleCaught, loading, busy]);

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      {error && (
        <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <div className="flex flex-col items-center rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-6 md:w-72">
        {pokemon.sprite ? (
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="h-48 w-48 object-contain"
          />
        ) : (
          <span className="text-8xl text-zinc-600">?</span>
        )}
        <p className="mt-2 font-mono text-zinc-500">
          #{String(pokemon.id).padStart(3, "0")}
        </p>
        <p className="text-2xl font-bold text-white">{pokemon.name}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {pokemon.types.map((t) => (
            <span
              key={t}
              className={`rounded px-2 py-1 text-sm font-medium ${getTypeClass(
                t
              )}`}
            >
              {t}
            </span>
          ))}
        </div>
        <button
          type="button"
          disabled={loading || busy}
          onClick={handleToggle}
          className={`mt-4 w-full rounded-lg py-2 font-medium transition disabled:opacity-50 ${
            caught
              ? "bg-[var(--pokedex-screen)] text-zinc-900"
              : "bg-zinc-600 text-zinc-300 hover:bg-zinc-500"
          }`}
        >
          {busy ? "…" : caught ? "Caught ✓" : "Mark as caught"}
        </button>
      </div>

      <div className="flex-1 space-y-6">
        <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-[var(--pokedex-screen)]">
            Stats
          </h3>
          <ul className="space-y-2">
            {pokemon.stats.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className="w-28 text-zinc-400">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-[var(--pokedex-red)]"
                    style={{
                      width: `${Math.min(100, (s.value / 255) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-white">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-[var(--pokedex-screen)]">
              Height & Weight
            </h3>
            <p className="text-zinc-300">
              {pokemon.height / 10} m · {(pokemon.weight / 10).toFixed(1)} kg
            </p>
          </div>
          <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-[var(--pokedex-screen)]">
              Abilities
            </h3>
            <ul className="flex flex-wrap gap-2">
              {pokemon.abilities.map((a) => (
                <li
                  key={a}
                  className="rounded bg-zinc-700 px-2 py-1 text-sm text-zinc-200"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
