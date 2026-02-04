import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokemonById } from "@/lib/pokeapi";
import { PokemonDetailClient } from "@/components/PokemonDetailClient";

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId) || numId < 1) notFound();

  const pokemon = await getPokemonById(numId);
  if (!pokemon) notFound();

  return (
    <main className="min-h-screen p-6 md:p-10 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-zinc-900/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/pokedex"
            className="text-2xl font-bold tracking-tight text-[var(--pokedex-red)] drop-shadow-[0_0_8px_rgba(227,53,13,0.5)] transition hover:brightness-110"
          >
            ← My Pokédex
          </Link>
        </header>
        <section className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
          <PokemonDetailClient pokemon={pokemon} />
        </section>
      </div>
    </main>
  );
}
