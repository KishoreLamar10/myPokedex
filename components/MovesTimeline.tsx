'use client';

import { useState, useMemo } from 'react';
import type { LearnedMove, MoveCategory } from '@/types/move';
import { MoveCard } from './MoveCard';
import { MoveDetailModal } from './MoveDetailModal';

interface MovesTimelineProps {
  moves: LearnedMove[];
  pokemonName: string;
}

export function MovesTimeline({ moves, pokemonName }: MovesTimelineProps) {
  const [selectedMove, setSelectedMove] = useState<LearnedMove | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<MoveCategory | 'all'>('all');

  // Filter and sort level-up moves
  const levelUpMoves = useMemo(() => {
    return moves
      .filter((m) => m.method === 'level-up' && m.level !== undefined)
      .filter((m) => typeFilter === 'all' || m.move.type === typeFilter)
      .filter((m) => categoryFilter === 'all' || m.move.category === categoryFilter)
      .sort((a, b) => (a.level || 0) - (b.level || 0));
  }, [moves, typeFilter, categoryFilter]);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(moves.map((m) => m.move.type));
    return Array.from(types).sort();
  }, [moves]);

  if (levelUpMoves.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p>No level-up moves found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as MoveCategory | 'all')}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Categories</option>
          <option value="physical">⚔️ Physical</option>
          <option value="special">✨ Special</option>
          <option value="status">🛡️ Status</option>
        </select>

        <div className="ml-auto text-xs text-zinc-500 flex items-center">
          {levelUpMoves.length} move{levelUpMoves.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-3">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500/50 via-zinc-700/50 to-zinc-800/50" />

        {levelUpMoves.map((learnedMove, index) => {
          const level = learnedMove.level || 0;
          const isFirst = index === 0;
          const isLast = index === levelUpMoves.length - 1;

          return (
            <div key={`${learnedMove.move.id}-${level}`} className="relative flex items-start gap-4">
              {/* Level marker */}
              <div className="relative z-10 flex-shrink-0 w-16 text-right">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isFirst
                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/50'
                    : isLast
                    ? 'bg-zinc-700 border-zinc-600'
                    : 'bg-zinc-800 border-zinc-700'
                }`}>
                  <span className="text-sm font-bold text-white">{level}</span>
                </div>
              </div>

              {/* Move card */}
              <div className="flex-1 pt-1.5">
                <MoveCard
                  move={learnedMove.move}
                  onClick={() => setSelectedMove(learnedMove)}
                  variant="compact"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Detail Modal */}
      {selectedMove && (
        <MoveDetailModal
          move={selectedMove.move}
          isOpen={!!selectedMove}
          onClose={() => setSelectedMove(null)}
        />
      )}
    </div>
  );
}
