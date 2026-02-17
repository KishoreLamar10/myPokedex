'use client';

import { useState, useMemo } from 'react';
import type { LearnedMove } from '@/types/move';
import { MoveCard } from './MoveCard';
import { MoveDetailModal } from './MoveDetailModal';
import { getTMByMove } from '@/lib/tmData';

interface TMCompatibilityProps {
  moves: LearnedMove[];
  pokemonName: string;
}

export function TMCompatibility({ moves, pokemonName }: TMCompatibilityProps) {
  const [selectedMove, setSelectedMove] = useState<LearnedMove | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter TM/machine moves
  const tmMoves = useMemo(() => {
    return moves
      .filter((m) => m.method === 'machine' || m.method === 'tm' || m.method === 'tr')
      .filter((m) => {
        const matchesSearch = m.move.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || m.move.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Try to sort by TM number if available
        const tmA = getTMByMove(a.move.name);
        const tmB = getTMByMove(b.move.name);
        if (tmA && tmB) {
          return tmA.number.localeCompare(tmB.number);
        }
        return a.move.name.localeCompare(b.move.name);
      });
  }, [moves, searchQuery, typeFilter]);

  // Get unique types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(moves.filter((m) => m.method === 'machine' || m.method === 'tm' || m.method === 'tr').map((m) => m.move.type));
    return Array.from(types).sort();
  }, [moves]);

  if (moves.filter((m) => m.method === 'machine' || m.method === 'tm' || m.method === 'tr').length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p>No TM/TR compatibility data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search moves..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

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

        <div className="ml-auto text-xs text-zinc-500 flex items-center">
          {tmMoves.length} move{tmMoves.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* TM Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {tmMoves.map((learnedMove) => {
          const tmData = getTMByMove(learnedMove.move.name);
          
          return (
            <div key={learnedMove.move.id} className="relative">
              {tmData && (
                <div className="absolute -top-1 -left-1 z-10 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {tmData.number}
                </div>
              )}
              <MoveCard
                move={learnedMove.move}
                onClick={() => setSelectedMove(learnedMove)}
                variant="compact"
              />
            </div>
          );
        })}
      </div>

      {tmMoves.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>No moves match your filters</p>
        </div>
      )}

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
