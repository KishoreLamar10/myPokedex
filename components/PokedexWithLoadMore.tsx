"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PokedexGrid } from "@/components/PokedexGrid";
import { TOTAL_POKEMON } from "@/lib/pokeapi";
import type { PokemonListItem } from "@/types/pokemon";

const BATCH_SIZE = 150;

interface PokedexWithLoadMoreProps {
  initialList: PokemonListItem[];
}

export function PokedexWithLoadMore({ initialList }: PokedexWithLoadMoreProps) {
  const [list, setList] = useState<PokemonListItem[]>(initialList);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || list.length >= TOTAL_POKEMON) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/pokemon?limit=${BATCH_SIZE}&offset=${list.length}`
      );
      if (!res.ok) throw new Error("Failed to load");
      const next = (await res.json()) as PokemonListItem[];
      setList((prev) => [...prev, ...next].sort((a, b) => a.id - b.id));
    } finally {
      setLoading(false);
    }
  }, [list.length, loading]);

  const hasMore = list.length < TOTAL_POKEMON;

  useEffect(() => {
    if (!hasMore || loading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <div className="space-y-6">
      <PokedexGrid list={list} />
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loading && <span className="text-zinc-500">Loading more…</span>}
        </div>
      )}
    </div>
  );
}
