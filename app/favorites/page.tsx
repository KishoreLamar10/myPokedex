import Link from "next/link";
import { FavoritesPageClient } from "@/components/FavoritesPageClient";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/pokedex"
          className="text-2xl font-bold tracking-tight text-[var(--pokedex-red)] drop-shadow-[0_0_8px_rgba(227,53,13,0.5)] transition hover:brightness-110"
        >
          ← My Pokédex
        </Link>
      </header>
      <FavoritesPageClient />
    </main>
  );
}
