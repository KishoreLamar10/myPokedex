"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonSearch } from "./PokemonSearch";
import { FavoritePokemonIcon } from "./FavoritePokemonIcon";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalCaughtTracker } from "./GlobalCaughtTracker";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-xl transition-all duration-300 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex flex-col px-4 py-3 md:px-8 lg:px-12 md:flex-row md:items-center md:justify-between md:gap-4 max-w-[1920px]">
        {/* Row 1: Logo & Instant Access Items */}
        <div className="flex items-center justify-between gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-[var(--pokedex-red)] drop-shadow-[0_0_12px_rgba(227,53,13,0.4)] transition-all hover:brightness-125 active:scale-95 flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full border-2 border-[var(--pokedex-red)] bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg shadow-[var(--pokedex-red)]/20 group-hover:scale-110 transition-transform">
                <Image src="/icon-192.png" alt="" width={40} height={40} className="object-contain" />
              </div>
              <span className="hidden min-[480px]:inline bg-gradient-to-r from-[var(--pokedex-red)] to-red-400 bg-clip-text text-transparent">My Pokédex</span>
            </Link>
            
            <div className="flex items-center gap-1.5 sm:gap-3">
              <FavoritePokemonIcon />
              <GlobalCaughtTracker />
              <Link
                href="/map"
                className="hidden lg:block text-sm font-bold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
              >
                World Map
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 transition-all md:hidden text-zinc-400 hover:text-white active:scale-90"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Search & Secondary Nav (Collapsible on Mobile) */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col gap-4 mt-4 md:mt-0 md:flex md:flex-row md:items-center md:flex-1 md:justify-end md:gap-6 animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex-1 w-full max-w-full md:max-w-[400px] lg:max-w-[500px]">
            <PokemonSearch />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 pb-2 md:pb-0 border-t border-zinc-800/50 pt-4 md:pt-0 md:border-0">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/map"
                className="lg:hidden text-sm font-bold text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:bg-[var(--pokedex-red)]/10"
              >
                Map
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="p-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700/50 transition-all hover:scale-110 active:scale-90 shadow-inner group"
                title="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-zinc-400 group-hover:text-zinc-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
