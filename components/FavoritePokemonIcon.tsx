"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function FavoritePokemonIcon() {
  const [image, setImage] = useState<string>("");
  const [name, setName] = useState<string>("Pikachu");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavoritePokemon = async () => {
      try {
        const cached = localStorage.getItem("favoritePokemonCache");
        if (cached) {
          const parsed = JSON.parse(cached) as {
            cachedAt: number;
            data: { name?: string; animatedSprite?: string; sprite?: string };
          };
          if (Date.now() - parsed.cachedAt < 60 * 60 * 1000) {
            const cachedImage =
              parsed.data.animatedSprite || parsed.data.sprite || "";
            if (cachedImage) {
              setImage(cachedImage);
            }
            if (parsed.data.name) {
              setName(parsed.data.name);
            }
          }
        }

        const favoriteRes = await fetch("/api/user/favorite");
        const favoriteData = favoriteRes.ok
          ? await favoriteRes.json()
          : { favoritePokemon: 25 };
        const pokemonId = Number(favoriteData.favoritePokemon) || 25;

        const res = await fetch(`/api/pokemon/${pokemonId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch pokemon ${pokemonId}`);
        }

        const pokemonData = await res.json();
        const animatedSprite =
          pokemonData.animatedSprite || pokemonData.sprite || "";
        const pokemonName = pokemonData.name || "Pikachu";

        if (animatedSprite) {
          setImage(animatedSprite);
          setName(pokemonName);
        }

        localStorage.setItem(
          "favoritePokemonCache",
          JSON.stringify({
            cachedAt: Date.now(),
            data: {
              name: pokemonName,
              animatedSprite,
              sprite: pokemonData.sprite || "",
            },
          }),
        );
      } catch (error) {
        console.error("Failed to load favorite pokemon:", error);
        // Keep default Pikachu
      } finally {
        setLoading(false);
      }
    };

    loadFavoritePokemon();
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setIsEditing((prev) => !prev);
          setInputValue("");
          setError(null);
        }}
        className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 rounded-lg"
        aria-live="polite"
        aria-label={`Favorite Pokémon: ${name}. Click to change.`}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            width={64}
            height={64}
            className="h-16 w-16 object-contain drop-shadow-lg"
          />
        ) : (
          <div className="h-16 w-16 flex items-center justify-center text-2xl">
            {loading ? "…" : "⭐"}
          </div>
        )}
      </button>

      {isEditing && (
        <div className="absolute top-full mt-2 w-60 rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-900/95 p-3 shadow-xl z-20">
          <label className="text-xs text-zinc-400">
            Set favorite (name or ID)
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. Pikachu or 25"
            className="mt-2 w-full rounded-lg border-2 border-zinc-700 bg-zinc-800/80 px-3 py-2 text-white text-sm outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
          />
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                const raw = inputValue.trim();
                if (!raw) {
                  setError("Enter a Pokémon name or ID.");
                  return;
                }
                setSaving(true);
                setError(null);
                try {
                  const query = encodeURIComponent(raw.toLowerCase());
                  const lookupRes = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${query}`,
                  );
                  if (!lookupRes.ok) {
                    throw new Error("Pokémon not found.");
                  }
                  const lookup = await lookupRes.json();
                  const pokemonId = Number(lookup.id);
                  if (!Number.isFinite(pokemonId)) {
                    throw new Error("Invalid Pokémon.");
                  }

                  const saveRes = await fetch("/api/user/favorite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ favoritePokemon: pokemonId }),
                  });
                  if (!saveRes.ok) {
                    const errorPayload = await saveRes.json().catch(() => null);
                    const message =
                      errorPayload?.error || "Failed to save favorite.";
                    throw new Error(message);
                  }

                  const pokemonRes = await fetch(`/api/pokemon/${pokemonId}`);
                  if (pokemonRes.ok) {
                    const pokemonData = await pokemonRes.json();
                    const animatedSprite =
                      pokemonData.animatedSprite || pokemonData.sprite || "";
                    const pokemonName = pokemonData.name || raw;

                    if (animatedSprite) {
                      setImage(animatedSprite);
                    }
                    setName(pokemonName);
                    localStorage.setItem(
                      "favoritePokemonCache",
                      JSON.stringify({
                        cachedAt: Date.now(),
                        data: {
                          name: pokemonName,
                          animatedSprite,
                          sprite: pokemonData.sprite || "",
                        },
                      }),
                    );
                  }

                  setIsEditing(false);
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Failed to update",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-lg bg-[var(--pokedex-red)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
