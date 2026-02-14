"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { TeamMember, StatBlock } from "@/types/team";
import { MAX_EVS, MAX_SINGLE_EV, MAX_IV, DEFAULT_EVS, DEFAULT_IVS } from "@/types/team";
import { ItemSelector } from "./ItemSelector";
import { MoveSelector } from "./MoveSelector";
import { getPokemonById } from "@/lib/pokeapi";

interface EditPokemonModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: TeamMember) => void;
}

const NATURES = [
  "Adamant (+Atk, -SpA)", "Bashful", "Bold (+Def, -Atk)", "Brave (+Atk, -Spe)",
  "Calm (+SpD, -Atk)", "Careful (+SpD, -SpA)", "Docile", "Gentle (+SpD, -Def)",
  "Hardy", "Hasty (+Spe, -Def)", "Impish (+Def, -SpA)", "Jolly (+Spe, -SpA)",
  "Lax (+Def, -SpD)", "Lonely (+Atk, -Def)", "Mild (+SpA, -Def)", "Modest (+SpA, -Atk)",
  "Naive (+Spe, -SpD)", "Naughty (+Atk, -SpD)", "Quiet (+SpA, -Spe)", "Quirky",
  "Rash (+SpA, -SpD)", "Relaxed (+Def, -Spe)", "Sassy (+SpD, -Spe)", "Serious",
  "Timid (+Spe, -Atk)"
];

const STAT_LABELS: Record<keyof StatBlock, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export function EditPokemonModal({ member, isOpen, onClose, onSave }: EditPokemonModalProps) {
  const [edited, setEdited] = useState<TeamMember>(member);
  const [activeTab, setActiveTab] = useState<"general" | "stats" | "moves">("general");

  // Selector State
  const [selectorOpen, setSelectorOpen] = useState<"item" | "move" | null>(null);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);

  // Reset state when modal opens with a new member
  useEffect(() => {
    setEdited(member);
    
    // Fetch available abilities if missing (legacy members)
    if (member && isOpen && (!member.availableAbilities || member.availableAbilities.length === 0)) {
        getPokemonById(member.id).then(details => {
            if (details && details.abilities) {
                setEdited(prev => ({
                    ...prev,
                    availableAbilities: details.abilities
                }));
            }
        });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const totalEVs = Object.values(edited.evs).reduce((a, b) => a + b, 0);

  const updateStat = (type: "evs" | "ivs", stat: keyof StatBlock, value: number) => {
    let newValue = value;
    if (isNaN(newValue)) newValue = 0;
    
    if (type === "ivs") {
      newValue = Math.max(0, Math.min(MAX_IV, newValue));
    } else {
      newValue = Math.max(0, Math.min(MAX_SINGLE_EV, newValue));
    }

    // Clone the stats object to avoid mutation
    const updatedStats = { ...edited[type], [stat]: newValue };

    // For EVs, check total cap
    if (type === "evs") {
         const currentTotal = Object.values(updatedStats).reduce((a, b) => a + b, 0);
         if (currentTotal > MAX_EVS) {
             // If over cap, prevent update (or reduce this value to fit)
             // Simple version: just revert to old value if it exceeds
             return; 
         }
    }

    setEdited((prev) => ({
      ...prev,
      [type]: updatedStats,
    }));
  };

  const handleItemSelect = (item: string) => {
    setEdited({ ...edited, item });
    setSelectorOpen(null);
  };

  const handleMoveSelect = (move: string) => {
    if (activeMoveIndex === null) return;
    const newMoves = [...edited.moves];
    newMoves[activeMoveIndex] = move;
    setEdited(prev => ({ ...prev, moves: newMoves }));
    setSelectorOpen(null);
    setActiveMoveIndex(null);
  };

  const handleSave = () => {
      onSave(edited);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
                 {edited.sprite && <Image src={edited.sprite} alt={edited.name} fill className="object-contain" unoptimized />}
            </div>
            <div>
                 <h2 className="text-xl font-bold text-white">{edited.name}</h2>
                 <p className="text-xs text-zinc-400">Editing Details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white px-2 text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
           {(["general", "stats", "moves"] as const).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold capitalize transition ${
                      activeTab === tab ? "text-[var(--pokedex-screen)] border-b-2 border-[var(--pokedex-screen)] bg-zinc-800/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                  }`}
               >
                   {tab}
               </button>
           ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            
            {/* GENERAL TAB */}
            {activeTab === "general" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Nickname</label>
                        <input
                            type="text"
                            value={edited.nickname || ""}
                            onChange={(e) => setEdited({...edited, nickname: e.target.value})}
                            placeholder={edited.name}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-[var(--pokedex-screen)] focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Item</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={edited.item}
                                readOnly
                                placeholder="No Item"
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none cursor-default opacity-80"
                            />
                            <button 
                                onClick={() => setSelectorOpen("item")}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                            >
                                🔍 Search
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-2">Ability</label>
                        {edited.availableAbilities && edited.availableAbilities.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                               {edited.availableAbilities.map((a, i) => {
                                   const abilityName = typeof a === 'string' ? a : a.name;
                                   const isHidden = typeof a === 'string' ? false : a.isHidden;
                                   const isSelected = edited.ability === abilityName;
                                   
                                   return (
                                       <button
                                           key={`${abilityName}-${i}`}
                                           onClick={() => setEdited({...edited, ability: abilityName})}
                                           className={`relative px-3 py-2 rounded-lg text-sm font-medium transition border ${
                                               isSelected 
                                               ? "bg-[var(--pokedex-screen)] text-zinc-900 border-[var(--pokedex-screen)]" 
                                               : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
                                           }`}
                                       >
                                           {abilityName}
                                           {isHidden && (
                                               <span className={`absolute -top-1.5 -right-1.5 text-[9px] px-1 rounded-full font-bold uppercase tracking-wider ${
                                                   isSelected ? "bg-red-600 text-white shadow-sm" : "bg-red-900/80 text-red-200"
                                               }`}>
                                                   HA
                                               </span>
                                           )}
                                       </button>
                                   );
                               })}
                           </div>
                        ) : (
                             <input
                                type="text"
                                value={edited.ability}
                                onChange={(e) => setEdited({...edited, ability: e.target.value})}
                                placeholder="Ability"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-[var(--pokedex-screen)] focus:outline-none"
                            />
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={edited.shiny}
                                onChange={(e) => setEdited({...edited, shiny: e.target.checked})}
                                className="w-4 h-4 rounded bg-zinc-700 border-zinc-600 text-[var(--pokedex-red)] focus:ring-[var(--pokedex-red)]"
                            />
                            <span className="text-zinc-300">Shiny</span>
                        </label>
                    </div>
                </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
                <div className="space-y-6">
                     <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Nature</label>
                        <select
                            value={edited.nature}
                            onChange={(e) => setEdited({...edited, nature: e.target.value})}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-[var(--pokedex-screen)] focus:outline-none"
                        >
                            <option value="">Select Nature...</option>
                            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-white">EVs & IVs</h3>
                            <span className={`text-xs font-mono ${totalEVs > MAX_EVS ? "text-red-400" : "text-zinc-500"}`}>
                                Total EVs: {totalEVs}/{MAX_EVS}
                            </span>
                       </div>
                       
                       <div className="grid grid-cols-[3rem_1fr_4rem_1fr_4rem] gap-3 items-center text-center text-xs font-semibold text-zinc-500 mb-1">
                          <div>Stat</div>
                          <div>EV Slider</div>
                          <div>EV</div>
                          <div>IV Slider</div>
                          <div>IV</div>
                       </div>

                       {(Object.keys(STAT_LABELS) as Array<keyof StatBlock>).map((stat) => (
                           <div key={stat} className="grid grid-cols-[3rem_1fr_4rem_1fr_4rem] gap-3 items-center mb-2">
                               <div className="text-zinc-300 font-bold text-right pr-2 uppercase">{STAT_LABELS[stat]}</div>
                               
                               {/* EV */}
                               <input 
                                  type="range" min="0" max="252" 
                                  value={edited.evs[stat]} 
                                  onChange={(e) => updateStat("evs", stat, parseInt(e.target.value))}
                                  className="accent-[var(--pokedex-screen)] cursor-pointer h-1 bg-zinc-700 rounded-lg appearance-none"
                               />
                               <input
                                  type="number" min="0" max="252"
                                  value={edited.evs[stat]}
                                  onChange={(e) => updateStat("evs", stat, parseInt(e.target.value))}
                                  className="bg-zinc-800 border border-zinc-700 rounded text-center text-white py-1 text-xs focus:outline-none focus:border-[var(--pokedex-screen)]"
                               />

                               {/* IV */}
                               <input 
                                  type="range" min="0" max="31" 
                                  value={edited.ivs[stat]} 
                                  onChange={(e) => updateStat("ivs", stat, parseInt(e.target.value))}
                                   className="accent-amber-500 cursor-pointer h-1 bg-zinc-700 rounded-lg appearance-none"
                               />
                               <input
                                  type="number" min="0" max="31"
                                  value={edited.ivs[stat]}
                                  onChange={(e) => updateStat("ivs", stat, parseInt(e.target.value))}
                                  className="bg-zinc-800 border border-zinc-700 rounded text-center text-white py-1 text-xs focus:outline-none focus:border-amber-500"
                               />
                           </div>
                       ))}
                    </div>
                </div>
            )}

            {/* MOVES TAB */}
            {activeTab === "moves" && (
                <div className="space-y-4">
                    <p className="text-xs text-zinc-400 mb-2">Select moves from the database.</p>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <label className="block text-xs font-semibold text-zinc-500 mb-1">Move {i + 1}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={edited.moves[i] || ""}
                                    readOnly
                                    placeholder={`Move ${i + 1}`}
                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none cursor-default opacity-80"
                                />
                                <button 
                                    onClick={() => {
                                        setActiveMoveIndex(i);
                                        setSelectorOpen("move");
                                    }}
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                >
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-800/50 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-zinc-300 hover:text-white font-medium">Cancel</button>
            <button 
                onClick={handleSave} 
                className="px-6 py-2 bg-[var(--pokedex-screen)] text-zinc-900 rounded-lg font-bold hover:brightness-110 shadow-[0_0_15px_rgba(139,195,74,0.3)] transition"
            >
                Save
            </button>
        </div>
      </div>

      <ItemSelector
        isOpen={selectorOpen === "item"}
        onClose={() => setSelectorOpen(null)}
        onSelect={handleItemSelect}
      />

      <MoveSelector
        isOpen={selectorOpen === "move"}
        onClose={() => {
            setSelectorOpen(null);
            setActiveMoveIndex(null);
        }}
        onSelect={handleMoveSelect}
      />
    </div>
  );
}

