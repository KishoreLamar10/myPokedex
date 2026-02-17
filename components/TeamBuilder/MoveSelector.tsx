"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getAllMoves, getPokemonLearnset, getMoveDetails, getPokemonById } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/lib/typeEffectiveness";
import { scoreMove, SimpleMove } from "@/lib/recommendations";

interface MoveSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (moveName: string, moveType?: string) => void;
  pokemonId: number;
  pokemonName?: string;
  pokemonTypes?: string[];
  stats?: Record<string, number>;
}

interface Move {
    name: string;
    url: string;
}

interface ScoredMove extends Move {
    score: number;
    details?: SimpleMove;
}

export function MoveSelector({ 
    isOpen, 
    onClose, 
    onSelect, 
    pokemonId, 
    pokemonName: propName,
    pokemonTypes: propTypes, 
    stats: propStats 
}: MoveSelectorProps) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState<ScoredMove[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Internal state for when props are missing
  const [internalName, setInternalName] = useState("");
  const [internalTypes, setInternalTypes] = useState<string[]>([]);
  const [internalStats, setInternalStats] = useState<Record<string, number>>({});

  const pokemonName = propName || internalName;
  const pokemonTypes = propTypes || internalTypes;
  const stats = propStats || internalStats;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
      
      const prepareData = async () => {
          setLoading(true);
          
          let currentTypes = propTypes;
          let currentStats = propStats;

          // Fetch basic info if missing
          if (!propName || !propTypes || !propStats) {
              try {
                  const details = await getPokemonById(pokemonId);
                  if (details) {
                      setInternalName(details.name);
                      setInternalTypes(details.types);
                      currentTypes = details.types;
                      
                      const statsMap: Record<string, number> = {};
                      details.stats.forEach((s: { name: string; value: number }) => {
                          const name = s.name.toLowerCase();
                          if (name === "hp") statsMap.hp = s.value;
                          if (name === "attack") statsMap.atk = s.value;
                          if (name === "defense") statsMap.def = s.value;
                          if (name === "special attack") statsMap.spa = s.value;
                          if (name === "special defense") statsMap.spd = s.value;
                          if (name === "speed") statsMap.spe = s.value;
                      });
                      setInternalStats(statsMap);
                      currentStats = statsMap;
                  }
              } catch (err) {
                  console.error("Failed to fetch pokemon details in MoveSelector:", err);
              }
          }

          try {
              const data = await getPokemonLearnset(pokemonId);
              const initialList = data.map(m => ({ ...m, score: 0 }));
              setList(initialList);
              setLoading(false);

              // Score moves
              setDetailsLoading(true);
              const detailedResults = await Promise.all(data.slice(0, 100).map(async (m) => {
                  try {
                      const details = await getMoveDetails(m.name);
                      if (!details) return { ...m, score: 0 };
                      
                      const simpleMove: SimpleMove = {
                          name: details.name,
                          type: details.type,
                          power: details.power,
                          damageClass: details.damageClass,
                          accuracy: details.accuracy
                      };
                      
                      return {
                          ...m,
                          details: simpleMove,
                          score: scoreMove(simpleMove, currentTypes || [], currentStats || {})
                      };
                  } catch {
                      return { ...m, score: 0 };
                  }
              }));

              setList(detailedResults.sort((a, b) => b.score - a.score));
          } catch (err) {
              console.error("Failed to load learnset:", err);
              setLoading(false);
          } finally {
              setDetailsLoading(false);
          }
      };

      prepareData();
    }
  }, [isOpen, pokemonId, propName, propTypes, propStats]);

  const filtered = useMemo(() => {
      if (!search) return list;
      const lower = search.toLowerCase().replace(/-/g, " ");
      return list.filter((m) => m.name.toLowerCase().includes(lower));
  }, [search, list]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Select Move</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-black">For {pokemonName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Moves..."
            className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {detailsLoading && (
              <div className="text-[10px] text-zinc-500 font-mono animate-pulse">Scoring...</div>
          )}
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
                    onClick={() => onSelect(move.name, move.details?.type)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition text-left group border border-transparent hover:border-zinc-700/50"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full ${move.details?.type ? (TYPE_COLORS[move.details.type.charAt(0).toUpperCase() + move.details.type.slice(1)] || "bg-zinc-700") : "bg-zinc-700"} opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-[var(--pokedex-screen)] transition-colors">{move.name}</span>
                                {move.score > 200 && (
                                    <span className="flex items-center gap-1 text-[9px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-tighter">
                                        ⭐ Recommended
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm ${move.details?.type ? (TYPE_COLORS[move.details.type.charAt(0).toUpperCase() + move.details.type.slice(1)] || "bg-zinc-800 text-zinc-500") : "bg-zinc-800 text-zinc-500"}`}>
                                    {move.details?.type || "???"}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-medium lowercase">
                                    {move.details?.damageClass === "status" && "✨ " }
                                    {move.details?.damageClass === "physical" && "⚔️ " }
                                    {move.details?.damageClass === "special" && "🔮 " }
                                    {move.details?.damageClass || "???"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {move.details && (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] px-2 py-1 bg-zinc-700 rounded-full text-zinc-300 uppercase font-black tracking-wide leading-none">
                                {move.details.type}
                            </span>
                        </div>
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
