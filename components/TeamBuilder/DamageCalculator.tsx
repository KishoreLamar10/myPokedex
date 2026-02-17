'use client';

import { useState, useMemo } from 'react';
import { calculateDamage, calculateStat, getNatureModifier, type DamageCalcOptions } from '@/lib/damageCalc';
import type { TeamMember } from '@/types/team';

interface DamageCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialAttacker?: TeamMember;
  initialDefender?: TeamMember;
}

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const MOVE_CATEGORIES = ['physical', 'special', 'status'] as const;

export function DamageCalculator({ isOpen, onClose, initialAttacker, initialDefender }: DamageCalculatorProps) {
  // Attacker state
  const [attackerName, setAttackerName] = useState(initialAttacker?.name || 'Pikachu');
  const [attackerLevel, setAttackerLevel] = useState(100);
  const [attackerTypes, setAttackerTypes] = useState<string[]>(initialAttacker?.types || ['electric']);
  const [attackerNature, setAttackerNature] = useState('Modest');
  const [attackerItem, setAttackerItem] = useState('');
  const [attackerBaseAtk, setAttackerBaseAtk] = useState(initialAttacker?.baseStats?.atk || 55);
  const [attackerBaseSpa, setAttackerBaseSpa] = useState(initialAttacker?.baseStats?.spa || 50);
  const [attackerAtkEV, setAttackerAtkEV] = useState(0);
  const [attackerSpaEV, setAttackerSpaEV] = useState(252);
  const [attackerAtkIV, setAttackerAtkIV] = useState(31);
  const [attackerSpaIV, setAttackerSpaIV] = useState(31);

  // Defender state
  const [defenderName, setDefenderName] = useState(initialDefender?.name || 'Charizard');
  const [defenderLevel, setDefenderLevel] = useState(100);
  const [defenderTypes, setDefenderTypes] = useState<string[]>(initialDefender?.types || ['fire', 'flying']);
  const [defenderNature, setDefenderNature] = useState('Bold');
  const [defenderItem, setDefenderItem] = useState('');
  const [defenderBaseHP, setDefenderBaseHP] = useState(initialDefender?.baseStats?.hp || 78);
  const [defenderBaseDef, setDefenderBaseDef] = useState(initialDefender?.baseStats?.def || 78);
  const [defenderBaseSpd, setDefenderBaseSpd] = useState(initialDefender?.baseStats?.spd || 85);
  const [defenderHPEV, setDefenderHPEV] = useState(252);
  const [defenderDefEV, setDefenderDefEV] = useState(0);
  const [defenderSpdEV, setDefenderSpdEV] = useState(4);
  const [defenderHPIV, setDefenderHPIV] = useState(31);
  const [defenderDefIV, setDefenderDefIV] = useState(31);
  const [defenderSpdIV, setDefenderSpdIV] = useState(31);

  // Move state
  const [moveName, setMoveName] = useState('Thunderbolt');
  const [movePower, setMovePower] = useState(90);
  const [moveType, setMoveType] = useState('electric');
  const [moveCategory, setMoveCategory] = useState<'physical' | 'special'>('special');

  // Modifiers
  const [weather, setWeather] = useState<'sun' | 'rain' | 'sand' | 'snow' | 'none'>('none');
  const [terrain, setTerrain] = useState<'electric' | 'grassy' | 'misty' | 'psychic' | 'none'>('none');
  const [isCritical, setIsCritical] = useState(false);
  const [hasReflect, setHasReflect] = useState(false);
  const [hasLightScreen, setHasLightScreen] = useState(false);

  // Calculate stats
  const attackerAtk = useMemo(() => {
    const natureMod = getNatureModifier(attackerNature, 'atk');
    return calculateStat(attackerBaseAtk, attackerLevel, attackerAtkEV, attackerAtkIV, natureMod);
  }, [attackerBaseAtk, attackerLevel, attackerAtkEV, attackerAtkIV, attackerNature]);

  const attackerSpa = useMemo(() => {
    const natureMod = getNatureModifier(attackerNature, 'spa');
    return calculateStat(attackerBaseSpa, attackerLevel, attackerSpaEV, attackerSpaIV, natureMod);
  }, [attackerBaseSpa, attackerLevel, attackerSpaEV, attackerSpaIV, attackerNature]);

  const defenderHP = useMemo(() => {
    return calculateStat(defenderBaseHP, defenderLevel, defenderHPEV, defenderHPIV, 1.0, true);
  }, [defenderBaseHP, defenderLevel, defenderHPEV, defenderHPIV]);

  const defenderDef = useMemo(() => {
    const natureMod = getNatureModifier(defenderNature, 'def');
    let stat = calculateStat(defenderBaseDef, defenderLevel, defenderDefEV, defenderDefIV, natureMod);
    if (hasReflect && moveCategory === 'physical') stat = Math.floor(stat * 2);
    return stat;
  }, [defenderBaseDef, defenderLevel, defenderDefEV, defenderDefIV, defenderNature, hasReflect, moveCategory]);

  const defenderSpd = useMemo(() => {
    const natureMod = getNatureModifier(defenderNature, 'spd');
    let stat = calculateStat(defenderBaseSpd, defenderLevel, defenderSpdEV, defenderSpdIV, natureMod);
    if (hasLightScreen && moveCategory === 'special') stat = Math.floor(stat * 2);
    return stat;
  }, [defenderBaseSpd, defenderLevel, defenderSpdEV, defenderSpdIV, defenderNature, hasLightScreen, moveCategory]);

  // Calculate damage
  const damageResult = useMemo(() => {
    const attackStat = moveCategory === 'physical' ? attackerAtk : attackerSpa;
    const defenseStat = moveCategory === 'physical' ? defenderDef : defenderSpd;

    const options: DamageCalcOptions = {
      level: attackerLevel,
      weather,
      terrain,
      isCritical,
      attackerItem,
      defenderItem,
    };

    return calculateDamage(
      attackerLevel,
      attackStat,
      defenseStat,
      movePower,
      moveType,
      attackerTypes,
      defenderTypes,
      defenderHP,
      options
    );
  }, [
    attackerLevel, attackerAtk, attackerSpa, defenderDef, defenderSpd, defenderHP,
    movePower, moveType, moveCategory, attackerTypes, defenderTypes,
    weather, terrain, isCritical, attackerItem, defenderItem
  ]);

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
            <h2 className="text-2xl font-bold text-white">⚔️ Damage Calculator</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-white text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attacker */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-500">Attacker</h3>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Pokémon</label>
                <input
                  type="text"
                  value={attackerName}
                  onChange={(e) => setAttackerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Level: {attackerLevel}</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={attackerLevel}
                  onChange={(e) => setAttackerLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Nature</label>
                <select
                  value={attackerNature}
                  onChange={(e) => setAttackerNature(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {NATURES.map(nature => (
                    <option key={nature} value={nature}>{nature}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Item</label>
                <input
                  type="text"
                  value={attackerItem}
                  onChange={(e) => setAttackerItem(e.target.value)}
                  placeholder="e.g., Life Orb"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Atk Base</label>
                  <input
                    type="number"
                    value={attackerBaseAtk}
                    onChange={(e) => setAttackerBaseAtk(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SpA Base</label>
                  <input
                    type="number"
                    value={attackerBaseSpa}
                    onChange={(e) => setAttackerBaseSpa(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Atk EV</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={attackerAtkEV}
                    onChange={(e) => setAttackerAtkEV(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SpA EV</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={attackerSpaEV}
                    onChange={(e) => setAttackerSpaEV(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="text-xs text-zinc-400">Calculated Stats</div>
                <div className="text-sm text-white mt-1">
                  Atk: {attackerAtk} | SpA: {attackerSpa}
                </div>
              </div>
            </div>

            {/* Move & Modifiers */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-500">Move & Modifiers</h3>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Move Name</label>
                <input
                  type="text"
                  value={moveName}
                  onChange={(e) => setMoveName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Power: {movePower}</label>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={movePower}
                  onChange={(e) => setMovePower(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Type</label>
                <input
                  type="text"
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Category</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMoveCategory('physical')}
                    className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
                      moveCategory === 'physical'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ⚔️ Physical
                  </button>
                  <button
                    onClick={() => setMoveCategory('special')}
                    className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${
                      moveCategory === 'special'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ✨ Special
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="none">None</option>
                  <option value="sun">☀️ Sun</option>
                  <option value="rain">🌧️ Rain</option>
                  <option value="sand">🌪️ Sandstorm</option>
                  <option value="snow">❄️ Snow</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Critical Hit
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReflect}
                    onChange={(e) => setHasReflect(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Reflect (Physical)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLightScreen}
                    onChange={(e) => setHasLightScreen(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Light Screen (Special)
                </label>
              </div>
            </div>

            {/* Defender */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-blue-500">Defender</h3>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Pokémon</label>
                <input
                  type="text"
                  value={defenderName}
                  onChange={(e) => setDefenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Level: {defenderLevel}</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={defenderLevel}
                  onChange={(e) => setDefenderLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Nature</label>
                <select
                  value={defenderNature}
                  onChange={(e) => setDefenderNature(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NATURES.map(nature => (
                    <option key={nature} value={nature}>{nature}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-1">Item</label>
                <input
                  type="text"
                  value={defenderItem}
                  onChange={(e) => setDefenderItem(e.target.value)}
                  placeholder="e.g., Leftovers"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">HP Base</label>
                  <input
                    type="number"
                    value={defenderBaseHP}
                    onChange={(e) => setDefenderBaseHP(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Def Base</label>
                  <input
                    type="number"
                    value={defenderBaseDef}
                    onChange={(e) => setDefenderBaseDef(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SpD Base</label>
                  <input
                    type="number"
                    value={defenderBaseSpd}
                    onChange={(e) => setDefenderBaseSpd(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">HP EV</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={defenderHPEV}
                    onChange={(e) => setDefenderHPEV(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Def EV</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={defenderDefEV}
                    onChange={(e) => setDefenderDefEV(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SpD EV</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={defenderSpdEV}
                    onChange={(e) => setDefenderSpdEV(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="text-xs text-zinc-400">Calculated Stats</div>
                <div className="text-sm text-white mt-1">
                  HP: {defenderHP} | Def: {defenderDef} | SpD: {defenderSpd}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">📊 Damage Calculation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="text-sm text-zinc-400 mb-1">Damage Range</div>
                <div className="text-3xl font-bold text-white">
                  {damageResult.min} - {damageResult.max}
                </div>
                <div className="text-sm text-zinc-400 mt-1">
                  {damageResult.minPercent.toFixed(1)}% - {damageResult.maxPercent.toFixed(1)}%
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="text-sm text-zinc-400 mb-1">KO Chance</div>
                <div className={`text-2xl font-bold ${
                  damageResult.koChance.includes('Guaranteed') ? 'text-green-500' :
                  damageResult.koChance.includes('Possible') ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {damageResult.koChance}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="text-sm text-zinc-400 mb-1">Defender HP</div>
                <div className="text-3xl font-bold text-white">{defenderHP}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  Remaining: {Math.max(0, defenderHP - damageResult.max)} - {Math.max(0, defenderHP - damageResult.min)}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700">
              <div className="text-sm font-semibold text-zinc-300">
                {attackerName} ({attackerLevel}) vs {defenderName} ({defenderLevel}): {moveName} ({movePower} BP)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
