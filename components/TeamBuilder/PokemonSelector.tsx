"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce"; // Assuming we need to create this or use a simple timeout
import { getAllPokemonForSelector } from "@/lib/pokeapi";
import type { PokemonListItem } from "@/types/pokemon";

// Simple debounce hook if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface PokemonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemon: PokemonListItem) => void;
}

export function PokemonSelector({ isOpen, onClose, onSelect }: PokemonSelectorProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceValue(search, 300);
  const [list, setList] = useState<PokemonListItem[]>([]);
  const [filtered, setFiltered] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Load initial list if empty
      if (list.length === 0) {
        setLoading(true);
        getAllPokemonForSelector().then((data) => {
          setList(data);
          setFiltered(data.slice(0, 20));
          setLoading(false);
        });
      }
    }
  }, [isOpen, list.length]);

  useEffect(() => {
    if (!search) {
      setFiltered(list.slice(0, 20));
      return;
    }
    const lower = search.toLowerCase().replace(/-/g, " ");
    const results = list.filter((p) => p.name.toLowerCase().includes(lower));
    setFiltered(results.slice(0, 50));
  }, [debouncedSearch, list]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Select Pokémon</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Pokémon..."
            className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {loading ? (
             <div className="col-span-full py-8 text-center text-zinc-500">Loading Pokémon...</div>
          ) : filtered.length === 0 ? (
             <div className="col-span-full py-8 text-center text-zinc-500">No Pokémon found.</div>
          ) : (
            filtered.map((pokemon) => (
              <button
                key={pokemon.id}
                onClick={() => onSelect(pokemon)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition text-left group"
              >
                <div className="relative w-12 h-12">
                   {pokemon.sprite ? (
                     <Image
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                        unoptimized
                     />
                   ) : (
                     <div className="w-full h-full bg-zinc-800 rounded-full" />
                   )}
                </div>
                <div>
                  <p className="font-bold text-zinc-200 group-hover:text-white">{pokemon.name}</p>
                  <div className="flex gap-1 mt-1">
                    {pokemon.types.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">
                            {t}
                        </span>
                    ))}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
