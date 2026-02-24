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
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { PokedexGrid } from "@/components/PokedexGrid";
import { TOTAL_POKEMON } from "@/lib/pokeapi";
import { getEggMoveEntry } from "@/lib/eggMoves";
import { getHiddenAbilityRecommendation } from "@/lib/hiddenAbilities";
import {
  getObtainingLocationPokemonMap,
  normalizePokemonKey,
} from "@/lib/obtaining";
import { useCaught } from "@/components/CaughtProvider";
import { AdvancedFilters, DEFAULT_ADVANCED_FILTERS, type AdvancedFilterState } from "@/components/AdvancedFilters";
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

  const [selectedLocation, setSelectedLocation] = useQueryState("location", parseAsString.withDefault(""));
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [nameIdMap, setNameIdMap] = useState<Map<string, number> | null>(null);
  const [prefetchDone, setPrefetchDone] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedType, setSelectedType] = useQueryState("type", parseAsString.withDefault(""));
  const [selectedGen, setSelectedGen] = useQueryState("gen", parseAsInteger.withDefault(0)); // 0 = All
  const [selectedMethod, setSelectedMethod] = useQueryState("method", parseAsString.withDefault("All Methods"));
  const [sortBy, setSortByRaw] = useQueryState("sort", parseAsString.withDefault("id"));
  const setSortBy = (val: SortOption) => setSortByRaw(val);
  const [filters, setFilters] = useState({
    hasMega: false,
    haRecommended: false,
    eggMoves: false,
  });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(DEFAULT_ADVANCED_FILTERS);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [metaById, setMetaById] = useState<
    Record<number, { hasMega?: boolean }>
  >({});
  const [showFilters, setShowFilters] = useState(false);
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
      setList((prev) => {
        // Prevent concurrent triggers from appending duplicates
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = next.filter(p => !existingIds.has(p.id));
        return [...prev, ...newItems].sort((a, b) => a.id - b.id);
      });
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

    // Method filter
    if (selectedMethod !== "All Methods") {
      items = items.filter((p) => {
        if (!p.obtainingMethod) return false;
        const method = p.obtainingMethod.toLowerCase();
        
        switch (selectedMethod) {
          case "Catching":
            return method.includes("catch") && !method.includes("fishing") && !method.includes("rod");
          case "Fishing/Surfing":
            return method.includes("fishing") || method.includes("surf") || method.includes("rod");
          case "Trading":
            return method.includes("trade") || method.includes("trading");
          case "Evolving":
            return method.includes("evolve");
          default:
            return true;
        }
      });
    }

    // Obtaining Filter from Modal
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
    selectedMethod,
    applyObtainingFilter,
    filters,
    metaById,
    sortBy,
  ]);

  useEffect(() => {
    setSearchQuery(initialParams.q);
  }, [initialParams]);

  useEffect(() => {
    const targetCount = initialParams.count;
    if (!targetCount || !hasMore || loading) return;
    if (targetCount > list.length) {
      loadMore();
    }
  }, [initialParams.count, hasMore, loading, list.length, loadMore]);

  const expectedLocationCount = useMemo(() => {
    if (!selectedLocation) return null;
    return locationPokemonMap[selectedLocation]?.length || 0;
  }, [selectedLocation, locationPokemonMap]);

  // Auto-load more if a filter is active but we have very few results showing
  useEffect(() => {
    if (!hasMore || loading || searchQuery) return;

    const needsMoreLocation = 
      selectedLocation && 
      processedList.length < (expectedLocationCount || 0) &&
      processedList.length < 24; // Still cap it so we don't load too much if not looking

    const needsMoreType = 
      selectedType && 
      processedList.length < 24;

    if (needsMoreLocation || needsMoreType) {
      const timeout = setTimeout(() => {
        loadMore();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [selectedLocation, selectedType, processedList.length, expectedLocationCount, hasMore, loading, loadMore, searchQuery]);

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
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-wrap md:gap-3">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 text-sm font-bold text-zinc-200 md:hidden transition-all hover:border-[var(--pokedex-red)]"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--pokedex-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Sort Options
          </div>
          <span className="text-zinc-500">{showFilters ? "▼" : "▶"}</span>
        </button>

        {/* Filter Selection Container */}
        <div className={`${showFilters ? 'flex' : 'hidden'} flex-col gap-3 md:flex md:flex-row md:flex-wrap md:items-center animate-in slide-in-from-top-2 duration-300`}>
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 md:py-2 text-sm font-bold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)] w-full md:w-auto"
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
            className="rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 md:py-2 text-sm font-bold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)] w-full md:w-auto"
          >
            {GENERATIONS.map((gen, idx) => (
              <option key={gen.label} value={idx}>
                {gen.label}
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 md:py-2 text-sm font-bold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)] w-full md:w-auto"
          >
            <option value="">All Types</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Obtaining Method Dropdown */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 md:py-2 text-sm font-bold text-zinc-200 outline-none transition focus:border-[var(--pokedex-red)] w-full md:w-auto"
          >
            <option value="All Methods">All Methods</option>
            <option value="Catching">Catching</option>
            <option value="Fishing/Surfing">Fishing / Surfing</option>
            <option value="Trading">Trading</option>
            <option value="Evolving">Evolving</option>
          </select>

          {/* Location Filter Trigger */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 md:py-2 text-sm font-bold transition flex items-center justify-between gap-2 md:w-auto ${
                selectedLocation
                  ? 'bg-blue-900/30 border-blue-500/50 text-blue-200'
                  : 'bg-zinc-800 border-[var(--pokedex-border)] text-zinc-200 hover:border-[var(--pokedex-red)]'
              }`}
            >
              <span className="truncate max-w-[150px]">
                📍 {selectedLocation ? `Location: ${selectedLocation}` : 'All Locations'}
              </span>
              <span className="text-zinc-500">{locationOpen ? "▼" : "▶"}</span>
            </button>
            {selectedLocation && (
              <button
                onClick={() => setSelectedLocation("")}
                className="p-3 md:p-2 rounded-xl bg-zinc-800 border-2 border-[var(--pokedex-border)] text-[var(--pokedex-red)] hover:bg-[var(--pokedex-red)]/10"
                title="Clear Location"
              >
                ✕
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            className={`rounded-xl border-2 px-6 py-3 md:py-2 text-sm font-bold transition w-full md:w-auto ${
              advancedFiltersOpen
                ? 'bg-[var(--pokedex-red)] border-[var(--pokedex-red)] text-white'
                : 'bg-zinc-800 border-[var(--pokedex-border)] text-zinc-200 hover:border-[var(--pokedex-red)]/70'
            }`}
          >
            🔍 Advanced {advancedFiltersOpen ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Location Expansion Panel */}
      {locationOpen && (
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 space-y-4">
          <input
            type="text"
            aria-label="Search locations"
            placeholder="Filter locations..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)]"
          />
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
            <button
              onClick={() => {
                setSelectedLocation("");
                setLocationOpen(false);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                !selectedLocation
                  ? 'border-[var(--pokedex-red)] bg-[var(--pokedex-red)]/20 text-white'
                  : 'border-zinc-700/70 bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              All Locations
            </button>
            {filteredLocations.map((loc: string) => (
              <button
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  setLocationOpen(false);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                  selectedLocation === loc
                    ? 'border-[var(--pokedex-red)] bg-[var(--pokedex-red)]/20 text-white'
                    : 'border-zinc-700/70 bg-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {/* Advanced Filters Panel */}
      {advancedFiltersOpen && (
        <AdvancedFilters
          isOpen={advancedFiltersOpen}
          filters={advancedFilters}
          onChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)}
        />
      )}

      {deferredSearch.trim() && (
        <div className="mt-4 flex flex-wrap gap-2">
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
      {hasMore && (!selectedLocation || (expectedLocationCount !== null && processedList.length < expectedLocationCount)) && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loading && <span className="text-zinc-500">Loading more…</span>}
        </div>
      )}
    </div>
  );
}
