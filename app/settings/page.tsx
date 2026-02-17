'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'theme' | 'general'>('theme');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-4"
          >
            ← Back to Pokédex
          </Link>
          <h1 className="text-4xl font-black">Settings</h1>
          <p className="text-zinc-400 mt-2">Customize your Pokédex experience</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveSection('theme')}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeSection === 'theme'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            🎨 Theme
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              activeSection === 'general'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            ⚙️ General
          </button>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {activeSection === 'theme' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Theme Customization</h2>
              <p className="text-zinc-400 mb-6">
                Personalize the look and feel of your Pokédex with custom themes and colors.
              </p>
              <ThemeCustomizer />
            </div>
          )}

          {activeSection === 'general' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">General Settings</h2>
              <p className="text-zinc-400 mb-6">
                More settings coming soon...
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <h3 className="font-semibold mb-2">Data Management</h3>
                  <p className="text-sm text-zinc-400">
                    Import/export your preferences, tags, and notes.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <p className="text-sm text-zinc-400">
                    Configure PWA notifications (coming soon).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
