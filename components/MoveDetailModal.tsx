'use client';

import { useEffect } from 'react';
import type { Move } from '@/types/move';
import { getTypeClass } from '@/lib/typeEffectiveness';

interface MoveDetailModalProps {
  move: Move;
  isOpen: boolean;
  onClose: () => void;
}

export function MoveDetailModal({ move, isOpen, onClose }: MoveDetailModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryIcon = {
    physical: '⚔️',
    special: '✨',
    status: '🛡️',
  }[move.category];

  const categoryColor = {
    physical: 'text-red-400',
    special: 'text-blue-400',
    status: 'text-gray-400',
  }[move.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-900/95 border-2 border-zinc-700 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-6 border-b border-zinc-800 ${getTypeClass(move.type)}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 hover:bg-black/50 transition text-white text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex items-start gap-4">
            <span className={`text-4xl ${categoryColor}`}>{categoryIcon}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white capitalize mb-1">
                {move.name.replace(/-/g, ' ')}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getTypeClass(move.type)}`}>
                  {move.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-zinc-800 ${categoryColor}`}>
                  {move.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 border-b border-zinc-800">
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Power</p>
            <p className="text-2xl font-bold text-white">
              {move.power ?? '—'}
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-white">
              {move.accuracy ? `${move.accuracy}%` : '—'}
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">PP</p>
            <p className="text-2xl font-bold text-white">{move.pp}</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Priority</p>
            <p className={`text-2xl font-bold ${move.priority > 0 ? 'text-green-400' : move.priority < 0 ? 'text-red-400' : 'text-white'}`}>
              {move.priority > 0 ? `+${move.priority}` : move.priority}
            </p>
          </div>
        </div>

        {/* Effect Description */}
        <div className="p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">
            Effect
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {move.effect}
          </p>
          {move.effectChance && (
            <p className="mt-2 text-xs text-zinc-500">
              Effect chance: {move.effectChance}%
            </p>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6 flex items-center justify-between text-xs text-zinc-500">
          <span>Generation {move.generation}</span>
          <span className="font-mono">#{String(move.id).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
}
