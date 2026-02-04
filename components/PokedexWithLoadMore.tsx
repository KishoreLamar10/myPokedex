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
import type { PokemonListItem } from "@/types/pokemon";

const BATCH_SIZE = 150;

interface PokedexWithLoadMoreProps {
  initialList: PokemonListItem[];
}

export function PokedexWithLoadMore({ initialList }: PokedexWithLoadMoreProps) {
  const [list, setList] = useState<PokemonListItem[]>(initialList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [prefetchDone, setPrefetchDone] = useState(false);
  const [searchResults, setSearchResults] = useState<PokemonListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
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

  const searchFiltered = useMemo(() => {
    const q = deferredSearch.trim();
    if (!q) return [] as PokemonListItem[];
    let results = searchResults;
    if (filters.haRecommended) {
      results = results.filter((p) => getHiddenAbilityRecommendation(p.name));
    }
    if (filters.eggMoves) {
      results = results.filter((p) => getEggMoveEntry(p.name));
    }
    if (filters.hasMega) {
      results = results.filter((p) => metaById[p.id]?.hasMega);
    }
    return results;
  }, [deferredSearch, searchResults, filters, metaById]);

  const filteredList = useMemo(() => {
    const q = deferredSearch.trim();
    if (!q) return baseList;
    return searchFiltered;
  }, [baseList, deferredSearch, searchFiltered]);

  useEffect(() => {
    setSearchQuery(initialParams.q);
    setTargetCount(initialParams.count);
  }, [initialParams]);

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
            resultsCount: filteredList.length,
          },
        }),
      }).catch(() => {});
    }, 400);

    return () => clearTimeout(timeout);
  }, [deferredSearch, filteredList.length]);

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
      <div className="relative">
        <input
          type="text"
          aria-label="Search Pokémon by name"
          placeholder="Search Pokémon by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border-2 border-[var(--pokedex-border)] bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70"
            aria-label="Clear search"
          >
            ✕
          </button>
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
      <PokedexGrid list={filteredList} />
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
