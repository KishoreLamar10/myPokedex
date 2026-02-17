'use client';

import { useEffect, useState } from 'react';
import { getSmogonUsageData, getTierColor, getTierDescription, type SmogonUsageData } from '@/lib/smogon';

interface MetaStatsProps {
  pokemonName: string;
}

export function MetaStats({ pokemonName }: MetaStatsProps) {
  const [data, setData] = useState<SmogonUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const usageData = await getSmogonUsageData(pokemonName);
      setData(usageData);
      setLoading(false);
    }
    fetchData();
  }, [pokemonName]);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-zinc-700 rounded w-1/3"></div>
          <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
          <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <p className="text-zinc-400 text-sm">
          📊 No competitive meta data available for {pokemonName}
        </p>
        <p className="text-zinc-500 text-xs mt-2">
          Meta data is currently available for: Landorus-Therian, Garchomp, Dragapult
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tier & Usage */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">📊 Competitive Meta</h3>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: getTierColor(data.tier), color: '#000' }}
            >
              {data.tier}
            </span>
            <span className="text-sm text-zinc-400">
              Rank #{data.rank}
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-2">{getTierDescription(data.tier)}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[var(--pokedex-red)] transition-all duration-500"
              style={{ width: `${Math.min(data.usagePercent, 100)}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-white">{data.usagePercent.toFixed(1)}%</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Usage in {data.tier}</p>
      </div>

      {/* Abilities */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Common Abilities</h4>
        <div className="space-y-2">
          {data.abilities.map((ability, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{ability.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${ability.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-zinc-400 w-12 text-right">{ability.percent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Common Items</h4>
        <div className="space-y-2">
          {data.items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{item.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-zinc-400 w-12 text-right">{item.percent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spreads */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Common EV Spreads</h4>
        <div className="space-y-3">
          {data.spreads.map((spread, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-semibold">{spread.nature}</span>
                <span className="text-xs text-zinc-400">{spread.percent.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono">{spread.evs}</div>
              <div className="w-full bg-zinc-700 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${spread.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moves */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Common Moves</h4>
        <div className="grid grid-cols-1 gap-2">
          {data.moves.slice(0, 6).map((move, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{move.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${move.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-zinc-400 w-12 text-right">{move.percent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teammates */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Common Teammates</h4>
        <div className="space-y-2">
          {data.teammates.map((teammate, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{teammate.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${teammate.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-zinc-400 w-12 text-right">{teammate.percent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h4 className="text-sm font-bold text-zinc-300 mb-3">Top Counters</h4>
        <div className="space-y-2">
          {data.counters.map((counter, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{counter.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(counter.score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-zinc-400 w-12 text-right">{counter.score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          💡 Counter score indicates how effectively this Pokemon checks {data.pokemon}
        </p>
      </div>
    </div>
  );
}
