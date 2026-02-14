"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useDeferredValue } from "react";

export function PokemonSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);

  // Sync internal state with URL params
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Update URL when query changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams.toString());
      const currentQ = currentParams.get("q") || "";
      
      if (deferredQuery.trim() === currentQ) return;

      if (deferredQuery.trim()) {
        currentParams.set("q", deferredQuery.trim());
      } else {
        currentParams.delete("q");
      }
      
      // Navigate to /pokedex with updated params, preserving existing ones like 'count'
      router.replace(`/pokedex?${currentParams.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [deferredQuery, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        aria-label="Search Pokémon by name"
        placeholder="Search Pokémon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border-2 border-[var(--pokedex-border)] bg-zinc-800 px-5 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50 shadow-sm"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            // Immediate clear update to feel responsive
            const params = new URLSearchParams(searchParams.toString());
            params.delete("q");
            router.replace(`/pokedex?${params.toString()}`, { scroll: false });
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-700"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-8 text-zinc-600 pointer-events-none hidden md:block">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
}
