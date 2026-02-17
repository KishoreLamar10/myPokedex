'use client';

import { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { TYPE_THEME_PRESETS, getTypeThemePreset } from '@/lib/themes';
import type { PokemonType } from '@/types/userPreferences';

interface ThemeCustomizerProps {
  onClose?: () => void;
}

export function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
  const { preferences, updateTheme } = usePreferences();
  
  if (!preferences) return null;
  
  const [localTheme, setLocalTheme] = useState(preferences.theme);

  const handleSave = () => {
    updateTheme(localTheme);
    onClose?.();
  };

  const handleReset = () => {
    const defaultTheme = { mode: 'dark' as const, accentColor: '#ef4444' };
    setLocalTheme(defaultTheme);
  };

  const typePresets: PokemonType[] = [
    'fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 'dark', 'fairy',
    'ice', 'fighting', 'poison', 'ground', 'flying', 'bug', 'rock', 'ghost', 'steel', 'normal'
  ];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div>
        <label className="block text-sm font-bold text-zinc-400 mb-2">Theme Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setLocalTheme({ ...localTheme, mode: 'dark' })}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              localTheme.mode === 'dark'
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setLocalTheme({ ...localTheme, mode: 'light' })}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              localTheme.mode === 'light'
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ☀️ Light
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-bold text-zinc-400 mb-2">Accent Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={localTheme.accentColor}
            onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value, primaryType: undefined })}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-zinc-700"
          />
          <div className="flex-1">
            <input
              type="text"
              value={localTheme.accentColor}
              onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value, primaryType: undefined })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white font-mono"
              placeholder="#ef4444"
            />
          </div>
        </div>
      </div>

      {/* Type Presets */}
      <div>
        <label className="block text-sm font-bold text-zinc-400 mb-2">Type-Based Presets</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {typePresets.map((type) => {
            const preset = getTypeThemePreset(type);
            const isActive = localTheme.primaryType === type;
            
            return (
              <button
                key={type}
                onClick={() => setLocalTheme(preset)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition ${
                  isActive
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: TYPE_THEME_PRESETS[type], color: 'white' }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50">
        <p className="text-xs font-bold text-zinc-400 mb-2">Preview</p>
        <div className="space-y-2">
          <button
            className="px-4 py-2 rounded-lg font-semibold transition"
            style={{ backgroundColor: localTheme.accentColor, color: 'white' }}
          >
            Primary Button
          </button>
          <p className="text-sm text-zinc-300">
            This is how your accent color will look throughout the app.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 font-semibold hover:text-white transition"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-700 text-white font-semibold hover:bg-zinc-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 rounded-lg font-semibold transition"
          style={{ backgroundColor: localTheme.accentColor, color: 'white' }}
        >
          Save Theme
        </button>
      </div>
    </div>
  );
}
