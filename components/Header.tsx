import Link from "next/link";
import { PokemonSearch } from "./PokemonSearch";
import { FavoritePokemonIcon } from "./FavoritePokemonIcon";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--pokedex-border)] bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[var(--pokedex-red)] drop-shadow-[0_0_8px_rgba(227,53,13,0.5)] transition hover:brightness-110"
          >
            My Pokédex
          </Link>
          <div className="hidden sm:block">
            <FavoritePokemonIcon />
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <PokemonSearch />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
            title="Settings"
          >
            <span className="text-xl">⚙️</span>
          </Link>
          <div className="sm:hidden">
            <FavoritePokemonIcon />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
