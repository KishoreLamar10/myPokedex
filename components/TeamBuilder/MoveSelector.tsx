"use client";

import { useState, useEffect, useRef } from "react";
import { getAllMoves } from "@/lib/pokeapi";

interface MoveSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (move: string) => void;
}

interface Move {
    name: string;
    url: string;
}

export function MoveSelector({ isOpen, onClose, onSelect }: MoveSelectorProps) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState<Move[]>([]);
  const [filtered, setFiltered] = useState<Move[]>([]);
  const [loading, setLoading] = useState(false);
  const [moveDetails, setMoveDetails] = useState<Record<string, { type: string }>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      if (list.length === 0) {
        setLoading(true);
        getAllMoves().then((data) => {
          setList(data);
          setFiltered(data.slice(0, 50));
          setLoading(false);
        }).catch(() => setLoading(false));
      }
    }
  }, [isOpen, list.length]);

  useEffect(() => {
    if (!search) {
      setFiltered(list.slice(0, 50));
      return;
    }
    const lower = search.toLowerCase().replace(/-/g, " ");
    const results = list.filter((p) => p.name.toLowerCase().includes(lower));
    setFiltered(results.slice(0, 50));
  }, [search, list]);

  // Fetch details for visible moves
  useEffect(() => {
      if (filtered.length === 0) return;
      
      const visible = filtered.slice(0, 20);
      const toFetch = visible.filter(m => !moveDetails[m.name]);
      
      if (toFetch.length === 0) return;

      const fetchTypes = async () => {
          const results = await Promise.all(toFetch.map(async (move) => {
              try {
                  const res = await fetch(move.url, { next: { revalidate: 86400 } });
                  if (!res.ok) return null;
                  const data = await res.json();
                  return { name: move.name, type: data.type.name };
              } catch {
                  return null;
              }
          }));

          setMoveDetails(prev => {
              const next = { ...prev };
              results.forEach(r => {
                  if (r) next[r.name] = { type: r.type };
              });
              return next;
          });
      };
      
      fetchTypes();
  }, [filtered, moveDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Select Move</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Moves..."
            className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
             <div className="py-8 text-center text-zinc-500">Loading Moves...</div>
          ) : filtered.length === 0 ? (
             <div className="py-8 text-center text-zinc-500">No Moves found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
                {filtered.map((move) => (
                <button
                    key={move.name}
                    onClick={() => onSelect(move.name)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-lg">
                            ⚔️
                        </div>
                        <span className="font-medium text-zinc-200 group-hover:text-white">{move.name}</span>
                    </div>
                    {moveDetails[move.name] && (
                        <span className="text-[10px] px-2 py-1 bg-zinc-700 rounded-full text-zinc-300 uppercase font-bold tracking-wide">
                            {moveDetails[move.name].type}
                        </span>
                    )}
                </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
