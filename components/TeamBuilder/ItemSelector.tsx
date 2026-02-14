"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getAllItems } from "@/lib/pokeapi";
import { ItemIcon } from "./ItemIcon";

interface ItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
}

interface Item {
    name: string;
    url: string;
}

export function ItemSelector({ isOpen, onClose, onSelect }: ItemSelectorProps) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState<Item[]>([]);
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      if (list.length === 0) {
        setLoading(true);
        getAllItems().then((data) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Select Item</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Items..."
            className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
             <div className="py-8 text-center text-zinc-500">Loading Items...</div>
          ) : filtered.length === 0 ? (
             <div className="py-8 text-center text-zinc-500">No Items found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
                {filtered.map((item) => (
                <button
                    key={item.name}
                    onClick={() => onSelect(item.name)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition text-left group"
                >
                    <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full overflow-hidden">
                        <ItemIcon itemName={item.name} className="w-full h-full" />
                    </div>
                    <span className="font-medium text-zinc-200 group-hover:text-white">{item.name}</span>
                </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
