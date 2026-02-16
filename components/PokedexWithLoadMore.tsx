"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PokedexGrid } from "@/components/PokedexGrid";
import { TOTAL_POKEMON } from "@/lib/pokeapi";
import { getEggMoveEntry } from "@/lib/eggMoves";
import { getHiddenAbilityRecommendation } from "@/lib/hiddenAbilities";
import {
  getObtainingLocationPokemonMap,
  normalizePokemonKey,
} from "@/lib/obtaining";
import { useCaught } from "@/components/CaughtProvider";
import type { PokemonListItem } from "@/types/pokemon";

const BATCH_SIZE = 150;

const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic",
  "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

const GENERATIONS = [
  { label: "All Gen", start: 1, end: 1025 },
  { label: "Gen I", start: 1, end: 151 },
  { label: "Gen II", start: 152, end: 251 },
  { label: "Gen III", start: 252, end: 386 },
  { label: "Gen IV", start: 387, end: 493 },
  { label: "Gen V", start: 494, end: 649 },
  { label: "Gen VI", start: 650, end: 721 },
  { label: "Gen VII", start: 722, end: 809 },
  { label: "Gen VIII", start: 810, end: 905 },
  { label: "Gen IX", start: 906, end: 1025 },
];

type SortOption = "id" | "bst" | "weight" | "height" | "name";

function normalizeObtainingFilter(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface PokedexWithLoadMoreProps {
  initialList: PokemonListItem[];
  obtainingLocations: string[];
}

export function PokedexWithLoadMore({
  initialList,
  obtainingLocations,
}: PokedexWithLoadMoreProps) {
  const { caughtIds } = useCaught();
  const [list, setList] = useState<PokemonListItem[]>(initialList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [nameIdMap, setNameIdMap] = useState<Map<string, number> | null>(null);
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [prefetchDone, setPrefetchDone] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedGen, setSelectedGen] = useState<number>(0); // 0 = All
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [filters, setFilters] = useState({
    hasMega: false,
    haRecommended: false,
    eggMoves: false,
  });
  const [metaById, setMetaById] = useState<
    Record<number, { hasMega?: boolean }>
  >({});
  const metaLoadingRef = useRef<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const deferredSearch = useDeferredValue(searchQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchQuery(q);
  }, [searchParams]);

  const initialParams = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const q = params.get("q") ?? "";
    const countParam = Number(params.get("count"));
    const count = Number.isFinite(countParam) ? countParam : null;
    return { q, count };
  }, [searchParamsString]);

  const loadMore = useCallback(async () => {
    if (loading || list.length >= TOTAL_POKEMON) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pokemon?limit=${BATCH_SIZE}&offset=${list.length}`,
      );
      if (!res.ok) throw new Error("Failed to load");
      const next = (await res.json()) as PokemonListItem[];
      setList((prev) => [...prev, ...next].sort((a, b) => a.id - b.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Pokémon");
    } finally {
      setLoading(false);
    }
  }, [list.length, loading]);

  const hasMore = list.length < TOTAL_POKEMON;

  const baseList = useMemo(() => list.filter((p) => p.id <= 1025), [list]);

  const locationPokemonMap = useMemo(
    () => getObtainingLocationPokemonMap(),
    [],
  );

  const locationPokemonSets = useMemo(() => {
    const sets: Record<string, Set<string>> = {};
    Object.entries(locationPokemonMap).forEach(([location, names]) => {
      sets[location] = new Set(names);
    });
    return sets;
  }, [locationPokemonMap]);

  const applyObtainingFilter = useCallback(
    (items: PokemonListItem[]) => {
      if (!selectedLocation) return items;
      const names = locationPokemonSets[selectedLocation];
      if (!names || names.size === 0) return [];
      return items.filter((pokemon) => {
        const key = normalizePokemonKey(pokemon.name);
        return names.has(key);
      });
    },
    [selectedLocation, locationPokemonSets],
  );

  const filteredLocations = useMemo(() => {
    const query = normalizeObtainingFilter(locationSearch);
    if (!query) return obtainingLocations;
    return obtainingLocations.filter((location) =>
      normalizeObtainingFilter(location).includes(query),
    );
  }, [locationSearch, obtainingLocations]);

  useEffect(() => {
    let active = true;
    fetch("/api/pokemon/names")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ id: number; name: string }>) => {
        if (!active) return;
        const map = new Map<string, number>();
        data.forEach((item) => {
          map.set(normalizePokemonKey(item.name), item.id);
        });
        setNameIdMap(map);
      })
      .catch(() => {
        if (active) setNameIdMap(new Map());
      });
    return () => {
      active = false;
    };
  }, []);

  const caughtIdSet = useMemo(() => new Set(caughtIds), [caughtIds]);

  const nameToId = useMemo(() => nameIdMap ?? new Map(), [nameIdMap]);

  const locationCompletion = useMemo(() => {
    if (!nameIdMap) return {} as Record<string, boolean>;
    const completion: Record<string, boolean> = {};
    obtainingLocations.forEach((location) => {
      const names = locationPokemonMap[location] ?? [];
      if (names.length === 0) {
        completion[location] = false;
        return;
      }

      for (const nameKey of names) {
        const id = nameToId.get(nameKey);
        if (!id) {
          completion[location] = false;
          return;
        }
        if (!caughtIdSet.has(id)) {
          completion[location] = false;
          return;
        }
      }

      completion[location] = true;
    });
    return completion;
  }, [obtainingLocations, locationPokemonMap, nameToId, caughtIdSet]);

  const selectedLocationComplete =
    selectedLocation && locationCompletion[selectedLocation];

  const processedList = useMemo(() => {
    let items = [...baseList];

    // Search filter (handles results from search API)
    const q = deferredSearch.trim();
    if (q) {
      items = searchResults;
    }

    // Type filter
    if (selectedType) {
      items = items.filter((p) => p.types.includes(selectedType));
    }

    // Generation filter
    if (selectedGen > 0) {
      const gen = GENERATIONS[selectedGen];
      items = items.filter((p) => p.id >= gen.start && p.id <= gen.end);
    }

    // Obtaining filter
    items = applyObtainingFilter(items);

    // Meta filters
    if (filters.haRecommended) {
      items = items.filter((p) => getHiddenAbilityRecommendation(p.name));
    }
    if (filters.eggMoves) {
      items = items.filter((p) => getEggMoveEntry(p.name));
    }
    if (filters.hasMega) {
      items = items.filter((p) => metaById[p.id]?.hasMega);
    }

    // Sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case "bst":
          return (b.baseStatTotal || 0) - (a.baseStatTotal || 0);
        case "weight":
          return (b.weight || 0) - (a.weight || 0);
        case "height":
          return (b.height || 0) - (a.height || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "id":
        default:
          return a.id - b.id;
      }
    });

    return items;
  }, [
    baseList,
    deferredSearch,
    searchResults,
    selectedType,
    selectedGen,
    applyObtainingFilter,
    filters,
    metaById,
    sortBy,
  ]);

  useEffect(() => {
    setSearchQuery(initialParams.q);
    setTargetCount(initialParams.count);
  }, [initialParams]);

  useEffect(() => {
    if (selectedLocation) {
      setTargetCount(TOTAL_POKEMON);
      return;
    }
    setTargetCount(initialParams.count);
  }, [selectedLocation, initialParams.count]);

  useEffect(() => {
    if (!targetCount || !hasMore || loading) return;
    if (targetCount > list.length) {
      loadMore();
    }
  }, [targetCount, hasMore, loading, list.length, loadMore]);

  useEffect(() => {
    if (prefetchDone || loading || searchQuery.trim()) return;
    if (list.length !== initialList.length) return;
    if (!hasMore) return;

    const hasIdleCallback = "requestIdleCallback" in window;
    const idleCallback = hasIdleCallback
      ? (window as any).requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 300);

    const idleId: number | ReturnType<typeof requestIdleCallback> =
      idleCallback(async () => {
        await loadMore();
        setPrefetchDone(true);
      });

    return () => {
      if (hasIdleCallback) {
        (window as any).cancelIdleCallback(idleId);
        return;
      }
      window.clearTimeout(idleId as number);
    };
  }, [
    prefetchDone,
    loading,
    searchQuery,
    list.length,
    initialList.length,
    hasMore,
    loadMore,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParamsString);
      const currentQ = params.get("q") ?? "";
      const currentCount = Number(params.get("count"));
      const nextCount = Math.min(list.length, TOTAL_POKEMON);

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        params.delete("q");
      }

      params.set("count", String(nextCount));

      const shouldUpdate =
        currentQ !== (searchQuery.trim() || "") || currentCount !== nextCount;

      if (shouldUpdate) {
        router.replace(`/pokedex?${params.toString()}`, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, list.length, searchParamsString, router]);

  useEffect(() => {
    if (!hasMore || loading || searchQuery.trim()) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, searchQuery]);

  useEffect(() => {
    const q = deferredSearch.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/pokemon/search?query=${encodeURIComponent(q)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const results = (await res.json()) as PokemonListItem[];
        setSearchResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [deferredSearch]);

  useEffect(() => {
    if (!deferredSearch.trim()) return;
    const timeout = setTimeout(() => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "search",
          payload: {
            query: deferredSearch.trim(),
            resultsCount: processedList.length,
          },
        }),
      }).catch(() => {});
    }, 400);

    return () => clearTimeout(timeout);
  }, [deferredSearch, processedList.length]);

  useEffect(() => {
    if (!filters.hasMega) return;
    const q = deferredSearch.trim();
    if (!q) return;

    const missing = searchResults.filter(
      (p) => metaById[p.id]?.hasMega === undefined,
    );

    missing.forEach((p) => {
      if (metaLoadingRef.current.has(p.id)) return;
      metaLoadingRef.current.add(p.id);
      fetch(`/api/pokemon/${p.id}?v=2`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const hasMega =
            Array.isArray(data?.megaForms) && data.megaForms.length > 0;
          setMetaById((prev) => ({
            ...prev,
            [p.id]: { hasMega },
          }));
        })
        .finally(() => {
          metaLoadingRef.current.delete(p.id);
        });
    });
  }, [filters.hasMega, deferredSearch, searchResults, metaById]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border-2 border-[var(--pokedex-border)] bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)]"
        >
          <option value="id">Sort by: Default (ID)</option>
          <option value="name">Sort by: Name</option>
          <option value="bst">Sort by: Base Stats</option>
          <option value="weight">Sort by: Weight</option>
          <option value="height">Sort by: Height</option>
        </select>

        {/* Generation Toggle */}
        <select
          value={selectedGen}
          onChange={(e) => setSelectedGen(Number(e.target.value))}
          className="rounded-lg border-2 border-[var(--pokedex-border)] bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)]"
        >
          {GENERATIONS.map((gen, idx) => (
            <option key={gen.label} value={idx}>
              {gen.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              !selectedType
                ? "bg-zinc-200 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All Types
          </button>
          {POKEMON_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                selectedType === type
                  ? "bg-[var(--pokedex-red)] text-white shadow-[0_0_8px_rgba(227,53,13,0.5)]"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setLocationOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg border-2 bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 ${
              selectedLocationComplete
                ? "border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "border-[var(--pokedex-border)] hover:border-[var(--pokedex-red)]/70"
            }`}
            aria-controls="location-filter-panel"
          >
            <span>Filter by location</span>
            <span className="text-xs text-zinc-400">
              {selectedLocation ? `• ${selectedLocation}` : "• All"}
            </span>
            <span className="text-zinc-400">{locationOpen ? "▾" : "▸"}</span>
          </button>
          {selectedLocation && (
            <button
              type="button"
              onClick={() => setSelectedLocation("")}
              className="text-xs font-semibold text-zinc-300 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
            >
              Clear
            </button>
          )}
        </div>
        {locationOpen && (
          <div id="location-filter-panel" className="space-y-3">
            <input
              type="text"
              aria-label="Search locations"
              placeholder="Search locations..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className={`w-full rounded-lg border-2 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-[var(--pokedex-red)]/50 ${
                selectedLocationComplete
                  ? "border-emerald-400/80"
                  : "border-[var(--pokedex-border)] focus:border-[var(--pokedex-red)]"
              }`}
            />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedLocation("")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                  !selectedLocation
                    ? "border-[var(--pokedex-red)] bg-[var(--pokedex-red)]/20 text-white"
                    : "border-zinc-700/70 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
                }`}
              >
                All Locations
              </button>
              {filteredLocations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => setSelectedLocation(location)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                    selectedLocation === location
                      ? "border-[var(--pokedex-red)] bg-[var(--pokedex-red)]/20 text-white"
                      : locationCompletion[location]
                        ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100"
                        : "border-zinc-700/70 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
                  }`}
                >
                  {location}
                  {locationCompletion[location] ? " ✓" : ""}
                </button>
              ))}
              {filteredLocations.length === 0 && (
                <span className="text-xs text-zinc-500">
                  No locations found.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {deferredSearch.trim() && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: "hasMega", label: "Has Mega" },
            { key: "haRecommended", label: "HA Recommended" },
            { key: "eggMoves", label: "Egg Moves" },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  [filter.key]: !prev[filter.key as keyof typeof prev],
                }))
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                filters[filter.key as keyof typeof filters]
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                  : "border-zinc-700/70 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      {searchLoading && <p className="text-sm text-zinc-400">Searching…</p>}
      <PokedexGrid list={processedList} />
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-40 rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/50 animate-pulse"
            />
          ))}
        </div>
      )}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loading && <span className="text-zinc-500">Loading more…</span>}
        </div>
      )}
    </div>
  );
}
