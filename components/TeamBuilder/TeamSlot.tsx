"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { TeamMember } from "@/types/team";
import { ItemSelector } from "./ItemSelector";
import { ItemIcon } from "./ItemIcon";
import { MoveSelector } from "./MoveSelector";
import { getPokemonById } from "@/lib/pokeapi";

interface TeamSlotProps {
  member: TeamMember | null;
  onAdd: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onUpdate: (member: TeamMember) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-zinc-500",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-500",
  Grass: "bg-green-500",
  Ice: "bg-cyan-400",
  Fighting: "bg-red-700",
  Poison: "bg-purple-600",
  Ground: "bg-amber-700",
  Flying: "bg-indigo-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-600",
  Rock: "bg-stone-600",
  Ghost: "bg-purple-800",
  Dragon: "bg-indigo-700",
  Steel: "bg-slate-500",
  Dark: "bg-zinc-800",
  Fairy: "bg-pink-400",
};

export function TeamSlot({ member, onAdd, onEdit, onRemove, onUpdate }: TeamSlotProps) {
  const [activeSelector, setActiveSelector] = useState<"item" | "move" | null>(null);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);
  const [analyzedAbilities, setAnalyzedAbilities] = useState<{ name: string; isHidden: boolean }[] | null>(null);

  useEffect(() => {
    if (!member) {
        setAnalyzedAbilities(null);
        return;
    }

    // specific check: if we have object capabilities already, use them
    if (member.availableAbilities && member.availableAbilities.length > 0 && typeof member.availableAbilities[0] !== 'string') {
        setAnalyzedAbilities(member.availableAbilities as { name: string; isHidden: boolean }[]);
        return;
    }

    // Otherwise (legacy string array or missing), fetch details
    getPokemonById(member.id).then((data) => {
        if (data?.abilities) {
            setAnalyzedAbilities(data.abilities);
        }
    });
  }, [member?.id, member?.availableAbilities]); // Re-run if ID or abilities prop changes

  const handleItemSelect = (item: string) => {
    if (!member) return;
    onUpdate({ ...member, item });
    setActiveSelector(null);
  };

  const handleMoveSelect = (move: string) => {
    if (!member || activeMoveIndex === null) return;
    const newMoves = [...member.moves];
    newMoves[activeMoveIndex] = move;
    onUpdate({ ...member, moves: newMoves });
    setActiveSelector(null);
    setActiveMoveIndex(null);
  };

  if (!member) {
    return (
      <div 
        onClick={onAdd}
        className="aspect-square bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition cursor-pointer group"
      >
        <span className="text-4xl mb-2 group-hover:scale-110 transition">+</span>
        <span className="text-sm font-medium">Add Pokémon</span>
      </div>
    );
  }

  const isHiddenAbility = analyzedAbilities?.some(a => a.name === member.ability && a.isHidden);

  return (
    <>
      <div className={`relative bg-zinc-800 rounded-xl border overflow-hidden group transition ${isHiddenAbility ? "border-red-900/50 hover:border-red-500/50" : "border-zinc-700 hover:border-zinc-500"}`}>
          {/* Remove Button */}
          <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
              }}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
          >
              ✕
          </button>

          <div className="p-3 h-full flex flex-col">
              <div className="relative h-24 w-full mb-2 cursor-pointer" onClick={onEdit}>
                   <Image
                      src={member.sprite || "/placeholder.png"}
                      alt={member.name}
                      fill
                      className={`object-contain transition-all duration-300 ${member.shiny ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] brightness-110" : ""}`}
                      unoptimized
                   />
                   <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSelector("item");
                      }}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900/80 rounded-full flex items-center justify-center border border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800 transition cursor-pointer overflow-hidden" 
                      title={member.item || "Add Item"}
                   >
                      {member.item ? (
                        <ItemIcon itemName={member.item} className="w-full h-full" />
                      ) : (
                        <span className="text-xs text-zinc-500">+</span>
                      )}
                   </div>
              </div>
              
              <div className="text-center cursor-pointer" onClick={onEdit}>
                  <p className="font-bold text-white truncate">{member.nickname || member.name}</p>
                  <p className="text-xs text-zinc-500 truncate">
                      {member.nickname && `(${member.name}) `}
                      {member.ability && (
                          <span className={`transition ${isHiddenAbility ? "text-amber-400 font-medium" : "text-zinc-400"}`}>
                             {member.ability}
                             {isHiddenAbility && (
                                <span className="ml-1 text-[9px] bg-red-600 text-white px-1 rounded font-bold uppercase shadow-sm">HA</span>
                             )}
                          </span>
                      )}
                  </p>
              </div>

              <div className="mt-2 space-y-1">
                   <div className="flex flex-wrap justify-center gap-1">
                      {member.types.map(t => (
                          <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded text-white font-bold shadow-sm ${TYPE_COLORS[t] || "bg-zinc-700"}`}>
                              {t}
                          </span>
                      ))}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-0.5 mt-2">
                      {Array.from({ length: 4 }).map((_, i) => {
                          const move = member.moves[i];
                          return (
                            <button 
                                key={i} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMoveIndex(i);
                                    setActiveSelector("move");
                                }}
                                className={`text-[10px] px-1 py-0.5 rounded truncate text-center transition ${
                                    move 
                                    ? "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600" 
                                    : "bg-zinc-800/30 text-zinc-600 border border-dashed border-zinc-700 hover:border-zinc-500 hover:text-zinc-500"
                                }`}
                            >
                                {move || "--"}
                            </button>
                          );
                      })}
                   </div>
              </div>
          </div>
      </div>

      <ItemSelector
        isOpen={activeSelector === "item"}
        onClose={() => setActiveSelector(null)}
        onSelect={handleItemSelect}
      />

      <MoveSelector
        isOpen={activeSelector === "move"}
        onClose={() => setActiveSelector(null)}
        onSelect={handleMoveSelect}
      />
    </>
  );
}
