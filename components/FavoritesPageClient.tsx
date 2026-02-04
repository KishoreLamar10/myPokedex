"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PokemonExtended } from "@/types/pokemon";

const CACHE_KEY = "favoritePokemonCache";
const CACHE_TTL = 60 * 60 * 1000;

export function FavoritesPageClient() {
  const [favorite, setFavorite] = useState<PokemonExtended | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            cachedAt: number;
            data?: PokemonExtended;
          };
          if (parsed.data && Date.now() - parsed.cachedAt < CACHE_TTL) {
            setFavorite(parsed.data);
          }
        }

        const favoriteRes = await fetch("/api/user/favorite");
        const favoriteData = favoriteRes.ok
          ? await favoriteRes.json()
          : { favoritePokemon: 25 };
        const pokemonId = Number(favoriteData.favoritePokemon) || 25;

        const res = await fetch(`/api/pokemon/${pokemonId}`);
        if (!res.ok) return;
        const data = (await res.json()) as PokemonExtended;
        if (cancelled) return;

        setFavorite(data);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ cachedAt: Date.now(), data }),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !favorite) {
    return (
      <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
        <div className="h-28 w-28 rounded-full bg-zinc-700/70 animate-pulse" />
        <div className="mt-4 h-5 w-40 rounded bg-zinc-700/70 animate-pulse" />
      </div>
    );
  }

  if (!favorite) {
    return (
      <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
        <p className="text-zinc-400">No favorite Pokémon found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
      <div className="flex flex-col items-center gap-4">
        {favorite.officialArtwork || favorite.sprite ? (
          <Image
            src={favorite.officialArtwork || favorite.sprite}
            alt={favorite.name}
            width={200}
            height={200}
            className="h-48 w-48 object-contain"
          />
        ) : (
          <div className="h-48 w-48 flex items-center justify-center text-5xl text-zinc-600">
            ?
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-mono text-zinc-400">
            #{String(favorite.id).padStart(3, "0")}
          </p>
          <h2 className="text-2xl font-bold text-white">{favorite.name}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {(favorite.types ?? []).map((type) => (
            <span
              key={type}
              className="rounded bg-zinc-700 px-2 py-1 text-sm text-zinc-200"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
