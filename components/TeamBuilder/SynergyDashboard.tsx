'use client';

import type { TeamMember } from '@/types/team';
import { analyzeRoles, findWeaknessOverlap, calculateSynergyScore, suggestImprovements } from '@/lib/teamSynergy';
import { getTypeClass } from '@/lib/typeEffectiveness';

interface SynergyDashboardProps {
  team: TeamMember[];
}

export function SynergyDashboard({ team }: SynergyDashboardProps) {
  if (team.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 text-center">
        <p className="text-zinc-500">Add Pokémon to your team to see synergy analysis</p>
      </div>
    );
  }

  const roles = analyzeRoles(team);
  const weaknesses = findWeaknessOverlap(team);
  const synergy = calculateSynergyScore(team);
  const suggestions = suggestImprovements(team);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="space-y-4">
      {/* Overall Synergy Score */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/40">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">
          Team Synergy Score
        </h3>
        <div className="flex items-end gap-4">
          <div className={`text-6xl font-black ${getScoreColor(synergy.overall)}`}>
            {synergy.overall}
          </div>
          <div className="pb-2">
            <div className={`text-xl font-bold ${getScoreColor(synergy.overall)}`}>
              {getScoreLabel(synergy.overall)}
            </div>
            <div className="text-xs text-zinc-500">out of 100</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Type Coverage</div>
            <div className={`text-lg font-bold ${getScoreColor(synergy.typeCoverage)}`}>
              {synergy.typeCoverage}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Role Balance</div>
            <div className={`text-lg font-bold ${getScoreColor(synergy.roleBalance)}`}>
              {synergy.roleBalance}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Weakness Coverage</div>
            <div className={`text-lg font-bold ${getScoreColor(synergy.weaknessCoverage)}`}>
              {synergy.weaknessCoverage}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Speed Tiers</div>
            <div className={`text-lg font-bold ${getScoreColor(synergy.speedTiers)}`}>
              {synergy.speedTiers}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Move Coverage</div>
            <div className={`text-lg font-bold ${getScoreColor(synergy.moveCoverage)}`}>
              {synergy.moveCoverage}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Team Composition */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Team Composition
          </h4>
          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role.role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-white">{role.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{role.members.join(', ')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                    {role.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Weaknesses */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Shared Weaknesses
          </h4>
          <div className="space-y-2">
            {weaknesses.slice(0, 5).map((weakness) => (
              <div key={weakness.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getTypeClass(weakness.type)}`}>
                    {weakness.type}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {weakness.affectedMembers.slice(0, 2).join(', ')}
                    {weakness.affectedMembers.length > 2 && ` +${weakness.affectedMembers.length - 2}`}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  weakness.count >= 4 ? 'bg-red-900 text-red-200' :
                  weakness.count === 3 ? 'bg-orange-900 text-orange-200' :
                  'bg-yellow-900 text-yellow-200'
                }`}>
                  {weakness.count}×
                </span>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-2">No shared weaknesses</p>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
          Improvement Suggestions
        </h4>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
