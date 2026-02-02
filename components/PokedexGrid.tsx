"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCaught } from "@/components/CaughtProvider";
import type { PokemonListItem } from "@/types/pokemon";

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

interface PokedexGridProps {
  list: PokemonListItem[];
}

export function PokedexGrid({ list }: PokedexGridProps) {
  const { caughtIds, toggleCaught, loading, error } = useCaught();
  const [filter, setFilter] = useState<"all" | "caught" | "uncaught">("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered =
    filter === "all"
      ? list
      : filter === "caught"
      ? list.filter((p) => caughtIds.includes(p.id))
      : list.filter((p) => !caughtIds.includes(p.id));

  const caughtCount = list.filter((p) => caughtIds.includes(p.id)).length;

  const handleToggle = async (e: React.MouseEvent, pokemonId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId !== null) return;
    setTogglingId(pokemonId);
    try {
      await toggleCaught(pokemonId);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-zinc-400">
          {loading ? (
            "Loading…"
          ) : (
            <>
              <span className="font-semibold text-[var(--pokedex-screen)]">
                {caughtCount}
              </span>
              {" / "}
              {list.length} caught
            </>
          )}
        </p>
        <div className="flex gap-2">
          {(["all", "caught", "uncaught"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-[var(--pokedex-red)] text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((pokemon) => {
          const caught = caughtIds.includes(pokemon.id);
          const busy = togglingId === pokemon.id;
          return (
            <div
              key={pokemon.id}
              className={`rounded-xl border-2 bg-zinc-800/80 p-3 transition ${
                caught
                  ? "border-[var(--pokedex-screen)] shadow-[0_0_12px_rgba(139,195,74,0.3)]"
                  : "border-[var(--pokedex-border)]"
              }`}
            >
              <Link
                href={`/pokedex/${pokemon.id}`}
                className="block"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex justify-center py-2">
                  {pokemon.sprite ? (
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <span className="text-4xl text-zinc-600">?</span>
                  )}
                  <span className="absolute right-0 top-0 text-xs font-mono text-zinc-500">
                    #{String(pokemon.id).padStart(3, "0")}
                  </span>
                </div>
                <p className="mb-2 text-center font-semibold text-white">
                  {pokemon.name}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {pokemon.types.map((t) => (
                    <span
                      key={t}
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${getTypeClass(
                        t
                      )}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
              <button
                type="button"
                disabled={loading || busy}
                onClick={(e) => handleToggle(e, pokemon.id)}
                className={`mt-2 w-full rounded-lg py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                  caught
                    ? "bg-[var(--pokedex-screen)] text-zinc-900"
                    : "bg-zinc-600 text-zinc-300 hover:bg-zinc-500"
                }`}
              >
                {busy ? "…" : caught ? "Caught ✓" : "Mark caught"}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-zinc-500">
          {filter === "caught"
            ? "No Pokémon caught yet."
            : "No Pokémon match this filter."}
        </p>
      )}
    </div>
  );
}
