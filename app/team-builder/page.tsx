"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchUserTeams, createTeam, updateTeam, deleteTeam } from "@/lib/supabase/teams";
import { getAllPokemonForSelector, getPokemonById } from "@/lib/pokeapi";
import { PokemonSelector } from "@/components/TeamBuilder/PokemonSelector";
import { TeamSlot } from "@/components/TeamBuilder/TeamSlot";
import { EditPokemonModal } from "@/components/TeamBuilder/EditPokemonModal";
import { TeamCoverage } from "@/components/TeamCoverage";
import { ImportExportModal } from "@/components/TeamBuilder/ImportExportModal";
import { SynergyDashboard } from "@/components/TeamBuilder/SynergyDashboard";
import { DamageCalculator } from "@/components/TeamBuilder/DamageCalculator";
import { TeamTemplates } from "@/components/TeamBuilder/TeamTemplates";
import type { Team, TeamMember, StatBlock } from "@/types/team";
import { DEFAULT_EVS, DEFAULT_IVS } from "@/types/team";
import { useCaught } from "@/components/CaughtProvider";
import type { PokemonListItem } from "@/types/pokemon";

export default function TeamBuilderPage() {
  const { userId } = useCaught();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Modal State
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [synergyVisible, setSynergyVisible] = useState(false);
  const [damageCalcOpen, setDamageCalcOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!userId) return;
    const loadTeams = async () => {
      try {
        const supabase = createClient();
        const data = await fetchUserTeams(supabase, userId);
        setTeams(data);
      } catch (err) {
        setError("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [userId]);

  const handleCreateTeam = async () => {
    if (!userId || creating) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const newTeam = await createTeam(supabase, userId, `Team ${teams.length + 1}`);
      setTeams([newTeam, ...teams]);
    } catch (err) {
      setError("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      const supabase = createClient();
      await deleteTeam(supabase, teamId);
      setTeams(teams.filter((t) => t.id !== teamId));
    } catch (err) {
      alert("Failed to delete team");
    }
  };

  const handleUpdateName = async (teamId: string, newName: string) => {
    // Optimistic update
    setTeams(teams.map(t => t.id === teamId ? { ...t, name: newName } : t));
    try {
      const supabase = createClient();
      await updateTeam(supabase, teamId, { name: newName });
    } catch (err) {
      // Revert on failure (could be improved with more sophisticated state management)
      console.error("Failed to update name");
    }
  };

  // --- TEAM MEMBER MANAGEMENT --- //

  const openSelector = (teamId: string, slotIndex: number) => {
    setActiveTeamId(teamId);
    setActiveSlotIndex(slotIndex);
    setSelectorOpen(true);
  };

  const handleSelectPokemon = async (pokemon: PokemonListItem) => {
    if (!activeTeamId || activeSlotIndex === null) return;

    let availableAbilities: { name: string; isHidden: boolean }[] = [];
    let baseStats: StatBlock = DEFAULT_IVS; // Fallback
    try {
        const details = await getPokemonById(pokemon.id);
        if (details) {
            availableAbilities = details.abilities;
            
            // Map details.stats to baseStats
            const statsMap: any = {};
            details.stats.forEach(s => {
                const name = s.name.toLowerCase();
                if (name === "hp") statsMap.hp = s.value;
                if (name === "attack") statsMap.atk = s.value;
                if (name === "defense") statsMap.def = s.value;
                if (name === "special attack") statsMap.spa = s.value;
                if (name === "special defense") statsMap.spd = s.value;
                if (name === "speed") statsMap.spe = s.value;
            });
            baseStats = statsMap as StatBlock;
        }
    } catch (e) {
        console.error("Failed to fetch details for abilities/stats", e);
    }

    const newMember: TeamMember = {
      id: pokemon.id,
      instanceId: crypto.randomUUID(),
      name: pokemon.name,
      sprite: pokemon.sprite,
      types: pokemon.types,
      ability: availableAbilities[0]?.name || "",
      availableAbilities: availableAbilities,
      nature: "",
      item: "",
      moves: [],
      ivs: DEFAULT_IVS,
      evs: DEFAULT_EVS,
      baseStats,
      shiny: false,
    };

    updateTeamMember(activeTeamId, activeSlotIndex, newMember);
    setSelectorOpen(false);
    
    // Optional: Open editor immediately after adding
    setEditingMember(newMember);
    setEditorOpen(true);
  };

  const handleRemoveMember = (teamId: string, slotIndex: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newPokemon = [...team.pokemon];
    newPokemon[slotIndex] = null as any; // We'll filter/handle sparse arrays, or standard is just remove
    // Actually, keeping array size 6 is easier for UI slots
    // Let's assume team.pokemon is array of size up to 6, or we pad it.
    // For simpler DB, let's keep it as is and just splice or nullify.
    // My types say TeamMember[], let's assume valid members.
    // Making it easier: UI expects 6 slots. We can store just the array of actual members.
    // But then index logic is tricky if we want fixed slots.
    // Let's explicitly store nulls? No, JSONB usually cleans sparse.
    // Let's just remove it from the array for now.
    
    // Wait, simpler: just remove it from the list.
    const updatedMembers = team.pokemon.filter((_, i) => i !== slotIndex);
    saveTeamMembers(teamId, updatedMembers);
  };

  const openEditor = (member: TeamMember, teamId: string, slotIndex: number) => {
    setEditingMember(member);
    setActiveTeamId(teamId);
    setActiveSlotIndex(slotIndex);
    setEditorOpen(true);
  };

  const handleSaveMember = (updatedMember: TeamMember) => {
    if (!activeTeamId || activeSlotIndex === null) return;
    updateTeamMember(activeTeamId, activeSlotIndex, updatedMember);
  };

  const updateTeamMember = async (teamId: string, index: number, member: TeamMember) => {
     const team = teams.find(t => t.id === teamId);
     if (!team) return;

     const newPokemon = [...(team.pokemon || [])];
     // Handle cases where array might be shorter than index (if we allow adding to empty slots at end)
     // logic: if I click slot 5 but only have 2 pokemon?
     // Actually, let's enforce: you add to the list. Detailed slot logic (Drag drop) is harder.
     // For now: Simple list. "Add" appends.
     // Wait, my UI had 6 specific slots.
     // If I stick to "List" it's easier. If I stick to "Slots", I need to represent empty slots in DB or fill with null.
     // Let's do: "Append" for now if slot is empty, or "Replace" if edit.
     // My UI rendered 6 slots using array index.
     
     if (index >= newPokemon.length) {
         newPokemon.push(member);
     } else {
         newPokemon[index] = member;
     }

     saveTeamMembers(teamId, newPokemon);
  };

  const saveTeamMembers = async (teamId: string, newPokemon: TeamMember[]) => {
      // Optimistic
      setTeams(teams.map(t => t.id === teamId ? { ...t, pokemon: newPokemon } : t));
      
      try {
          const supabase = createClient();
          await updateTeam(supabase, teamId, { pokemon: newPokemon });
      } catch (err) {
          console.error("Failed to save team members");
          // Revert logic needed here in robust app
      }
  };


  if (loading) {
     return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">Loading Teams...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-[var(--pokedex-screen)]">Team Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTemplatesOpen(true)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span>📋</span>
              <span>Templates</span>
            </button>
            <button
              onClick={handleCreateTeam}
              disabled={creating}
              className="px-4 py-2 bg-[var(--pokedex-red)] text-white rounded-lg font-semibold hover:brightness-110 disabled:opacity-50"
            >
              {creating ? "Creating..." : "+ New Team"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {teams.length === 0 ? (
            <div className="text-center py-12 bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-700">
              <p className="text-zinc-400 mb-4">No teams created yet.</p>
              <button
                onClick={handleCreateTeam}
                className="text-[var(--pokedex-screen)] hover:underline"
              >
                Create your first team
              </button>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 shadow-lg relative">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-700">
                    <input
                        type="text"
                        value={team.name}
                        onChange={(e) => handleUpdateName(team.id, e.target.value)}
                        className="bg-transparent text-xl font-bold focus:outline-none focus:border-b border-[var(--pokedex-screen)] w-full max-w-md"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDamageCalcOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-semibold transition flex items-center gap-2"
                        >
                            <span>⚔️</span>
                            <span>Damage Calc</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTeamId(team.id);
                                setImportExportOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-semibold transition flex items-center gap-2"
                        >
                            <span>⇅</span>
                            <span>Import/Export</span>
                        </button>
                        <button
                            onClick={() => setSynergyVisible(!synergyVisible)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                                synergyVisible 
                                    ? 'bg-[var(--pokedex-screen)] text-zinc-900' 
                                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                            }`}
                        >
                            <span>{synergyVisible ? '▼' : '▶'}</span>
                            <span>Synergy Analysis</span>
                        </button>
                        <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-zinc-400 hover:text-red-400 text-sm px-3 py-1"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => {
                        const member = team.pokemon?.[i] || null;
                        return (
                             <TeamSlot 
                                key={member ? member.instanceId : `empty-${i}`}
                                member={member}
                                onAdd={() => openSelector(team.id, i)}
                                onEdit={() => member && openEditor(member, team.id, i)}
                                onRemove={() => handleRemoveMember(team.id, i)}
                                onUpdate={(updated) => updateTeamMember(team.id, i, updated)}
                             />
                        )
                    })}
                  </div>
                <div className="mt-6 border-t border-zinc-700/50 pt-6">
                  <TeamCoverage team={team.pokemon || []} />
                </div>
                
                {/* Synergy Dashboard - Collapsible */}
                {synergyVisible && (
                  <div className="mt-6 border-t border-zinc-700/50 pt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    <SynergyDashboard team={team.pokemon || []} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <PokemonSelector 
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectPokemon}
      />

      {editingMember && (
          <EditPokemonModal
             isOpen={editorOpen}
             onClose={() => setEditorOpen(false)}
             member={editingMember}
             onSave={handleSaveMember}
          />
      )}

      {activeTeamId && (
        <ImportExportModal
          isOpen={importExportOpen}
          onClose={() => setImportExportOpen(false)}
          team={teams.find(t => t.id === activeTeamId)?.pokemon || []}
          onImport={(importedPokemon) => {
            if (activeTeamId) {
              saveTeamMembers(activeTeamId, importedPokemon);
              setImportExportOpen(false);
            }
          }}
        />
      )}

      <DamageCalculator
        isOpen={damageCalcOpen}
        onClose={() => setDamageCalcOpen(false)}
      />

      <TeamTemplates
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onImport={async (importedPokemon) => {
          // Create a new team with the imported Pokemon
          if (!userId) {
            setError('You must be logged in to import teams');
            return;
          }
          try {
            const supabase = createClient();
            const newTeam = await createTeam(supabase, userId, 'Imported Team');
            if (newTeam) {
              await updateTeam(supabase, newTeam.id, { pokemon: importedPokemon });
              setTeams([...teams, { ...newTeam, pokemon: importedPokemon }]);
              setTemplatesOpen(false);
            }
          } catch (err) {
            console.error('Failed to import team:', err);
            setError('Failed to import team');
          }
        }}
      />
    </div>
  );
}
