'use client';

import { useState } from 'react';

export interface AdvancedFilterState {
  ability: string;
  move: string;
  minHP: number;
  maxHP: number;
  minAtk: number;
  maxAtk: number;
  minDef: number;
  maxDef: number;
  minSpA: number;
  maxSpA: number;
  minSpD: number;
  maxSpD: number;
  minSpe: number;
  maxSpe: number;
  minBST: number;
  maxBST: number;
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilterState = {
  ability: '',
  move: '',
  minHP: 0,
  maxHP: 255,
  minAtk: 0,
  maxAtk: 255,
  minDef: 0,
  maxDef: 255,
  minSpA: 0,
  maxSpA: 255,
  minSpD: 0,
  maxSpD: 255,
  minSpe: 0,
  maxSpe: 255,
  minBST: 0,
  maxBST: 800,
};

interface AdvancedFiltersProps {
  isOpen: boolean;
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
}

export function AdvancedFilters({ isOpen, filters, onChange, onReset }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key: keyof AdvancedFilterState, value: string | number) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_ADVANCED_FILTERS);
    onReset();
  };

  if (!isOpen) return null;

  const hasActiveFilters = 
    filters.ability !== '' ||
    filters.move !== '' ||
    filters.minHP > 0 || filters.maxHP < 255 ||
    filters.minAtk > 0 || filters.maxAtk < 255 ||
    filters.minDef > 0 || filters.maxDef < 255 ||
    filters.minSpA > 0 || filters.maxSpA < 255 ||
    filters.minSpD > 0 || filters.maxSpD < 255 ||
    filters.minSpe > 0 || filters.maxSpe < 255 ||
    filters.minBST > 0 || filters.maxBST < 800;

  return (
    <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">🔍 Advanced Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ability Filter */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Ability</label>
          <input
            type="text"
            value={localFilters.ability}
            onChange={(e) => handleChange('ability', e.target.value)}
            placeholder="e.g., Levitate, Intimidate"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
          />
          <p className="text-xs text-zinc-500 mt-1">Find Pokémon with this ability</p>
        </div>

        {/* Move Filter */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Move</label>
          <input
            type="text"
            value={localFilters.move}
            onChange={(e) => handleChange('move', e.target.value)}
            placeholder="e.g., Earthquake, Ice Beam"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--pokedex-red)]"
          />
          <p className="text-xs text-zinc-500 mt-1">Find Pokémon that learn this move</p>
        </div>
      </div>

      {/* Base Stat Total */}
      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-2">
          Base Stat Total (BST): {localFilters.minBST} - {localFilters.maxBST}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="800"
            step="10"
            value={localFilters.minBST}
            onChange={(e) => handleChange('minBST', Number(e.target.value))}
            className="flex-1"
          />
          <input
            type="range"
            min="0"
            max="800"
            step="10"
            value={localFilters.maxBST}
            onChange={(e) => handleChange('maxBST', Number(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Individual Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* HP */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            HP: {localFilters.minHP}-{localFilters.maxHP}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minHP}
              onChange={(e) => handleChange('minHP', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxHP}
              onChange={(e) => handleChange('maxHP', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>

        {/* Attack */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Atk: {localFilters.minAtk}-{localFilters.maxAtk}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minAtk}
              onChange={(e) => handleChange('minAtk', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxAtk}
              onChange={(e) => handleChange('maxAtk', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>

        {/* Defense */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Def: {localFilters.minDef}-{localFilters.maxDef}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minDef}
              onChange={(e) => handleChange('minDef', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxDef}
              onChange={(e) => handleChange('maxDef', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>

        {/* Sp. Atk */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            SpA: {localFilters.minSpA}-{localFilters.maxSpA}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minSpA}
              onChange={(e) => handleChange('minSpA', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxSpA}
              onChange={(e) => handleChange('maxSpA', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>

        {/* Sp. Def */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            SpD: {localFilters.minSpD}-{localFilters.maxSpD}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minSpD}
              onChange={(e) => handleChange('minSpD', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxSpD}
              onChange={(e) => handleChange('maxSpD', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>

        {/* Speed */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Spe: {localFilters.minSpe}-{localFilters.maxSpe}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.minSpe}
              onChange={(e) => handleChange('minSpe', Number(e.target.value))}
              className="w-full h-1"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={localFilters.maxSpe}
              onChange={(e) => handleChange('maxSpe', Number(e.target.value))}
              className="w-full h-1"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-700">
        <p className="text-xs text-zinc-500">
          💡 Tip: Use stat filters to find Pokémon for specific roles (e.g., high Speed sweepers, bulky walls)
        </p>
      </div>
    </div>
  );
}
