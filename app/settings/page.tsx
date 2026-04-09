'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { SecuritySettings } from '@/components/SecuritySettings';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'theme' | 'security'>('theme');

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
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Settings</h1>
          <p className="text-zinc-400 mt-2">Customize your Pokédex experience</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveSection('theme')}
            className={`px-4 py-2 font-black italic uppercase tracking-tighter transition border-b-2 ${
              activeSection === 'theme'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            🎨 Theme
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-4 py-2 font-black italic uppercase tracking-tighter transition border-b-2 ${
              activeSection === 'security'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            ⚙️ Security
          </button>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-4 md:p-8 backdrop-blur-md">
          {activeSection === 'theme' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 shadow-sm">Theme Customization</h2>
              <p className="text-zinc-400 mb-8 max-w-2xl">
                Personalize the look and feel of your Pokédex with custom themes and accent colors.
              </p>
              <ThemeCustomizer />
            </div>
          )}

          {activeSection === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Account Security</h2>
              <p className="text-zinc-400 mb-8 max-w-2xl">
                Manage your login credentials and security recovery information.
              </p>
              <SecuritySettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
