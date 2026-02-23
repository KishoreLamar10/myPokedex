"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCaught } from "@/components/CaughtProvider";
import type { PokemonListItem } from "@/types/pokemon";
import { getTypeClass } from "@/lib/typeEffectiveness";

interface PokedexGridProps {
  list: PokemonListItem[];
}

export function PokedexGrid({ list }: PokedexGridProps) {
  const router = useRouter();
  const { caughtIds, toggleCaught, loading, error } = useCaught();
  const [filter, setFilter] = useQueryState("caught", { defaultValue: "all" as "all" | "caught" | "uncaught" });
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [abilities, setAbilities] = useState<
    Record<number, { normal: string[]; hidden: string[] }>
  >({});
  const [officialArtwork, setOfficialArtwork] = useState<
    Record<number, string>
  >({});
  const [shinyIds, setShinyIds] = useState<Set<number>>(new Set());
  const [hiddenAbilityIds, setHiddenAbilityIds] = useState<Set<number>>(
    new Set(),
  );
  const [shinyArtwork, setShinyArtwork] = useState<Record<number, string>>({});
  const hoverTimeoutRef = useRef<number | null>(null);
  const preferencesLoadedRef = useRef(false);
  const persistTimeoutRef = useRef<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const evolutionChainRef = useRef<Map<number, number[]>>(new Map());

  const filtered =
    filter === "all"
      ? list
      : filter === "caught"
        ? list.filter((p) => caughtIds.includes(p.id))
        : list.filter((p) => !caughtIds.includes(p.id));

  const caughtCount = caughtIds.length;

  useEffect(() => {
    if (filtered.length === 0) {
      setFocusedIndex(-1);
      return;
    }
    setFocusedIndex((prev) => (prev < 0 || prev >= filtered.length ? 0 : prev));
  }, [filtered.length]);

  const getEvolutionChainIds = async (pokemonId: number) => {
    const cached = evolutionChainRef.current.get(pokemonId);
    if (cached) return cached;
    try {
      const res = await fetch(`/api/pokemon/${pokemonId}`);
      if (!res.ok) throw new Error("Failed to load evolution chain");
      const data = await res.json();
      const chainIds = [
        pokemonId,
        ...((data.evolutions ?? []) as { id: number }[]).map((e) => e.id),
      ];
      chainIds.forEach((id) => evolutionChainRef.current.set(id, chainIds));
      return chainIds;
    } catch {
      const fallback = [pokemonId];
      evolutionChainRef.current.set(pokemonId, fallback);
      return fallback;
    }
  };

  const handleToggle = async (e: React.MouseEvent, pokemonId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId !== null) return;
    setTogglingId(pokemonId);
    try {
      const currentlyCaught = caughtIds.includes(pokemonId);
      await toggleCaught(pokemonId);
      if (!currentlyCaught) {
        const chainIds = await getEvolutionChainIds(pokemonId);
        const hasHiddenInChain = chainIds.some(
          (id) => id !== pokemonId && hiddenAbilityIds.has(id),
        );
        if (hasHiddenInChain && !hiddenAbilityIds.has(pokemonId)) {
          setHiddenAbilityIds((prev) => new Set([...prev, pokemonId]));
        }
      }
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "caught_toggle",
          payload: {
            pokemonId,
            caught: !currentlyCaught,
          },
        }),
      }).catch(() => {});
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadPreferences = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setShinyIds(new Set<number>(data.shinyIds ?? []));
        setHiddenAbilityIds(new Set<number>(data.hiddenAbilityIds ?? []));
        preferencesLoadedRef.current = true;
      } catch {
        // ignore
      }
    };
    loadPreferences();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!preferencesLoadedRef.current) return;
    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shinyIds: Array.from(shinyIds),
          hiddenAbilityIds: Array.from(hiddenAbilityIds),
        }),
      }).catch(() => {});
    }, 400);

    return () => {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [shinyIds, hiddenAbilityIds]);

  const toggleShiny = (e: React.MouseEvent, pokemonId: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark as caught if not already caught
    if (!caughtIds.includes(pokemonId)) {
      toggleCaught(pokemonId);
    }

    setShinyIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pokemonId)) {
        newSet.delete(pokemonId);
      } else {
        newSet.add(pokemonId);
      }
      return newSet;
    });
  };

  const toggleHiddenAbility = async (
    e: React.MouseEvent,
    pokemonId: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark as caught if not already caught
    if (!caughtIds.includes(pokemonId)) {
      toggleCaught(pokemonId);
    }

    setHiddenAbilityIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pokemonId)) {
        newSet.delete(pokemonId);
      } else {
        newSet.add(pokemonId);
      }
      return newSet;
    });

    await getEvolutionChainIds(pokemonId);
  };

  const handleMouseEnter = async (pokemonId: number) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredId(pokemonId);
      hoverTimeoutRef.current = null;
    }, 1000);

    const hasCachedData =
      abilities[pokemonId] &&
      officialArtwork[pokemonId] &&
      shinyArtwork[pokemonId];

    if (hasCachedData) return;

    try {
      const res = await fetch(`/api/pokemon/${pokemonId}`);
      if (!res.ok) return;
      const data = await res.json();

      // Fetch abilities
      if (!abilities[pokemonId]) {
        setAbilities((prev) => ({
          ...prev,
          [pokemonId]: data.abilities || { normal: [], hidden: [] },
        }));
      }

      // Fetch official artwork image
      if (!officialArtwork[pokemonId]) {
        const artwork = data.officialArtwork || data.sprite || "";
        if (artwork) {
          setOfficialArtwork((prev) => ({ ...prev, [pokemonId]: artwork }));
        }
      }

      // Fetch shiny artwork image
      if (!shinyArtwork[pokemonId]) {
        const shinyArt = data.shinyArtwork || "";
        if (shinyArt) {
          setShinyArtwork((prev) => ({ ...prev, [pokemonId]: shinyArt }));
        }
      }
    } catch {
      // silently fail if data can't be fetched
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
              1350 caught
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
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filtered.map((pokemon, index) => {
          const caught = caughtIds.includes(pokemon.id);
          const isHovered = hoveredId === pokemon.id;
          const hasShiny = shinyIds.has(pokemon.id);
          const hasHiddenAbility = hiddenAbilityIds.has(pokemon.id);
          const pokemonAbilities = abilities[pokemon.id];
          const backgroundImage =
            isHovered && hasShiny && shinyArtwork[pokemon.id]
              ? shinyArtwork[pokemon.id]
              : isHovered && officialArtwork[pokemon.id]
                ? officialArtwork[pokemon.id]
                : pokemon.sprite;

          return (
            <div
              key={`${pokemon.id}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              tabIndex={index === focusedIndex ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => router.push(`/pokedex/${pokemon.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(e as any, pokemon.id);
                  return;
                }
                if (
                  e.key === "ArrowRight" ||
                  e.key === "ArrowDown" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowUp"
                ) {
                  e.preventDefault();
                  const delta =
                    e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                  const nextIndex =
                    (index + delta + filtered.length) % filtered.length;
                  setFocusedIndex(nextIndex);
                  cardRefs.current[nextIndex]?.focus();
                }
              }}
              className="relative perspective focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 rounded-xl cursor-pointer"
              onMouseEnter={() => handleMouseEnter(pokemon.id)}
              onMouseLeave={() => {
                if (hoverTimeoutRef.current) {
                  window.clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setHoveredId(null);
              }}
              aria-label={`Pokemon ${pokemon.name}`}
            >
              <div
                className={`rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  caught
                    ? "bg-green-950/70 border-[var(--pokedex-screen)] shadow-[0_0_12px_rgba(139,195,74,0.3)]"
                    : "bg-zinc-800/80 border-[var(--pokedex-border)]"
                } ${
                  isHovered
                    ? "scale-110 shadow-2xl border-[var(--pokedex-red)] z-10 p-6"
                    : "shadow-lg p-3"
                }`}
              >
                {backgroundImage && (
                  <Image
                    src={backgroundImage}
                    alt=""
                    aria-hidden
                    width={360}
                    height={360}
                    sizes="100vw"
                    className={`absolute left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 ${
                      isHovered
                        ? "-top-16 h-[70%] w-[70%]"
                        : "top-6 h-[40%] w-[40%]"
                    } object-contain`}
                  />
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${
                    isHovered
                      ? "from-transparent via-zinc-800/70 to-zinc-900/95"
                      : "from-transparent via-zinc-800/60 to-zinc-900/95"
                  }`}
                />
                <div className="relative z-10">
                  <div
                    className={`relative flex justify-between items-start transition-all duration-300 ${
                      isHovered ? "min-h-40 py-2" : "min-h-12 py-1"
                    }`}
                  >
                    <span
                      className={`text-xs font-mono text-zinc-300 transition-all duration-300 ${
                        isHovered ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      #{String(pokemon.id).padStart(3, "0")}
                    </span>
                    {pokemon.id <= 1025 && (
                      <button
                        type="button"
                        onClick={(e) => handleToggle(e, pokemon.id)}
                        className={`rounded-full font-semibold transition ${
                          isHovered ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-sm"
                        } ${
                          caught
                            ? "bg-[var(--pokedex-screen)] text-zinc-900"
                            : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70`}
                        aria-label={`Toggle caught for ${pokemon.name}`}
                      >
                        {caught ? "Caught" : "Catch"}
                      </button>
                    )}
                  </div>
                  <p
                    className={`text-center font-semibold text-white transition-all duration-300 drop-shadow-lg ${
                      isHovered ? "text-xs mb-1" : "text-base mb-2"
                    }`}
                  >
                    {pokemon.name}
                  </p>
                  <div
                    className={`flex flex-wrap justify-center gap-1 transition-all duration-300 ${
                      isHovered ? "mb-2" : "mb-0"
                    }`}
                  >
                    {pokemon.types.map((t) => (
                      <span
                        key={t}
                        className={`rounded px-1.5 py-0.5 font-medium ${
                          isHovered ? "text-xs" : "text-xs"
                        } ${getTypeClass(t)}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {isHovered && pokemonAbilities && (
                    <div className="border-t border-zinc-700 pt-1 mb-2">
                      <p className="text-xs font-semibold text-zinc-300 mb-1">
                        Abilities
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {pokemonAbilities.normal.map((ability) => (
                          <span
                            key={ability}
                            className="text-xs bg-zinc-700/60 text-zinc-100 rounded px-2 py-0.5 capitalize"
                          >
                            {ability}
                          </span>
                        ))}
                        {pokemonAbilities.hidden.map((ability) => (
                          <span
                            key={ability}
                            className="text-xs bg-amber-600/70 text-amber-50 rounded px-2 py-0.5 capitalize font-semibold border border-amber-500/50"
                            title="Hidden Ability"
                          >
                            ✨ {ability}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {isHovered && pokemon.obtainingMethod && (
                    <div className="border-t border-zinc-700 pt-1 mb-2">
                      <p className="text-xs font-semibold text-zinc-300 mb-1">
                        Obtained
                      </p>
                      <p className="text-xs text-zinc-100">
                        {pokemon.obtainingMethod}
                      </p>
                    </div>
                  )}
                  {isHovered &&
                    (shinyArtwork[pokemon.id] ||
                      abilities[pokemon.id]?.hidden.length > 0) && (
                      <div className="flex gap-2 mb-2">
                        {shinyArtwork[pokemon.id] && (
                          <button
                            type="button"
                            onClick={(e) => toggleShiny(e, pokemon.id)}
                            aria-label={`Toggle shiny for ${pokemon.name}`}
                            className={`flex-1 rounded-lg py-2 font-semibold transition border-2 flex items-center justify-center ${
                              hasShiny
                                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/60"
                                : "bg-zinc-800/40 border-red-400 hover:bg-red-600/10"
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70`}
                            title="Toggle Shiny"
                          >
                            <svg
                              className={`w-6 h-6 ${hasShiny ? "fill-white" : "fill-red-500"}`}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        )}
                        {abilities[pokemon.id]?.hidden.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleHiddenAbility(e, pokemon.id)}
                            aria-label={`Toggle hidden ability highlight for ${pokemon.name}`}
                            className={`flex-1 rounded-lg py-2 font-semibold transition border-2 flex items-center justify-center ${
                              hasHiddenAbility
                                ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/60"
                                : "bg-zinc-800/40 border-green-400 hover:bg-green-600/10"
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70`}
                            title="Toggle Hidden Ability"
                          >
                            <svg
                              className={`w-6 h-6 ${hasHiddenAbility ? "fill-white" : "fill-green-500"}`}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  {isHovered && (
                    <Link
                      href={`/pokedex/${pokemon.id}`}
                      className="w-full block rounded-lg bg-zinc-700/80 hover:bg-zinc-600 text-white px-3 py-2 text-xs font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Overview
                    </Link>
                  )}
                </div>
              </div>
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
