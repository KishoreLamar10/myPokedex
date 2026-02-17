'use client';

import { useState } from 'react';
import { TEAM_TEMPLATES, type TeamTemplate } from '@/lib/teamTemplates';
import type { TeamMember } from '@/types/team';
import { DEFAULT_IVS } from '@/types/team';

interface TeamTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (pokemon: TeamMember[]) => void;
}

export function TeamTemplates({ isOpen, onClose, onImport }: TeamTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TeamTemplate | null>(null);
  const [filterFormat, setFilterFormat] = useState<'All' | 'Singles' | 'Doubles' | 'VGC'>('All');

  const filteredTemplates = TEAM_TEMPLATES.filter(
    template => filterFormat === 'All' || template.format === filterFormat
  );

  const handleImport = (template: TeamTemplate) => {
    // Convert partial team members to full team members
    const fullTeam: TeamMember[] = template.pokemon.map((partial, index) => ({
      id: index + 1, // Placeholder, will be replaced when imported
      instanceId: crypto.randomUUID(),
      name: partial.name || 'Unknown',
      sprite: '', // Will be filled by the import handler
      types: partial.types || [],
      ability: partial.ability || '',
      nature: partial.nature || '',
      item: partial.item || '',
      moves: partial.moves || [],
      ivs: DEFAULT_IVS,
      evs: partial.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      shiny: false,
    }));

    onImport(fullTeam);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-zinc-900/95 border-2 border-zinc-700 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">📋 Team Templates</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-white text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Format Filter */}
          <div className="flex gap-2 mt-4">
            {(['All', 'Singles', 'Doubles', 'VGC'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setFilterFormat(format)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterFormat === format
                    ? 'bg-[var(--pokedex-red)] text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Template List */}
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selectedTemplate?.id === template.id
                      ? 'bg-zinc-800 border-[var(--pokedex-red)] shadow-lg'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{template.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
                          {template.format}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
                          {template.playstyle}
                        </span>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <span className="text-[var(--pokedex-red)] text-2xl">▶</span>
                    )}
                  </div>
                </button>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  <p>No templates found for this format</p>
                </div>
              )}
            </div>

            {/* Template Details */}
            <div className="sticky top-0">
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedTemplate.name}</h3>
                    <p className="text-sm text-zinc-300 mb-4">{selectedTemplate.strategy}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h4>
                        <ul className="space-y-1">
                          {selectedTemplate.strengths.map((strength, i) => (
                            <li key={i} className="text-xs text-zinc-400">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Weaknesses</h4>
                        <ul className="space-y-1">
                          {selectedTemplate.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-xs text-zinc-400">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pokemon List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-zinc-400">Team Composition</h4>
                    {selectedTemplate.pokemon.map((pokemon, i) => (
                      <div key={i} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{pokemon.name}</div>
                            <div className="text-xs text-zinc-400 mt-1">
                              {pokemon.ability} • {pokemon.nature} • {pokemon.item}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pokemon.moves?.map((move, j) => (
                                <span key={j} className="px-2 py-0.5 rounded bg-zinc-700 text-xs text-zinc-300">
                                  {move}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Import Button */}
                  <button
                    onClick={() => handleImport(selectedTemplate)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--pokedex-red)] hover:bg-[var(--pokedex-red)]/90 text-white font-bold transition"
                  >
                    Import This Team
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <p className="text-lg">Select a template to view details</p>
                    <p className="text-sm mt-2">Choose from {filteredTemplates.length} available templates</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
