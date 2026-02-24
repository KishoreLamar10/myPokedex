'use client';

import type { Move, MoveCategory } from '@/types/move';
import { getTypeClass } from '@/lib/typeEffectiveness';

interface MoveCategoryIconProps {
  category: MoveCategory;
  className?: string;
}

export function MoveCategoryIcon({ category, className = '' }: MoveCategoryIconProps) {
  const icons = {
    physical: '⚔️',
    special: '✨',
    status: '🛡️',
  };

  const colors = {
    physical: 'text-red-400',
    special: 'text-blue-400',
    status: 'text-gray-400',
  };

  return (
    <span className={`${colors[category]} ${className}`} title={category}>
      {icons[category]}
    </span>
  );
}

interface MoveCardProps {
  move: Move;
  onClick?: () => void;
  variant?: 'compact' | 'list';
  showLevel?: number;
}

export function MoveCard({ move, onClick, variant = 'list', showLevel }: MoveCardProps) {
  const getTypeColorClass = (type: string) => {
    return getTypeClass(type.charAt(0).toUpperCase() + type.slice(1).toLowerCase());
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition border border-zinc-700/50 hover:border-zinc-600 w-full text-left"
      >
        <MoveCategoryIcon category={move.category} className="text-lg" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate capitalize">
            {move.name.replace(/-/g, ' ')}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTypeColorClass(move.type)}`}>
              {move.type}
            </span>
            {move.power && (
              <span className="text-[10px] text-zinc-500">
                {move.power} PWR
              </span>
            )}
          </div>
        </div>
        {showLevel !== undefined && (
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
            Lv.{showLevel}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 transition border border-zinc-700/30 hover:border-zinc-600 w-full text-left"
    >
      <MoveCategoryIcon category={move.category} className="text-2xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-white capitalize">
          {move.name.replace(/-/g, ' ')}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getTypeColorClass(move.type)}`}>
            {move.type}
          </span>
          {move.power && (
            <span className="text-xs text-zinc-400">
              Power: {move.power}
            </span>
          )}
          {move.accuracy && (
            <span className="text-xs text-zinc-400">
              Acc: {move.accuracy}%
            </span>
          )}
        </div>
      </div>
      {showLevel !== undefined && (
        <div className="flex-shrink-0 bg-zinc-900 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-mono text-zinc-400">Lv.{showLevel}</span>
        </div>
      )}
    </button>
  );
}
