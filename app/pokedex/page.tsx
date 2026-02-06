import Link from "next/link";
import { getPokemonList } from "@/lib/pokeapi";
import { getObtainingLocations } from "@/lib/obtaining";
import { PokedexWithLoadMore } from "@/components/PokedexWithLoadMore";
import { UserMenu } from "@/components/UserMenu";
import { FavoritePokemonIcon } from "@/components/FavoritePokemonIcon";

const INITIAL_BATCH = 60;

export default async function PokedexPage() {
  const initialList = await getPokemonList(INITIAL_BATCH, 0);
  const obtainingLocations = getObtainingLocations();

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[var(--pokedex-red)] drop-shadow-[0_0_8px_rgba(227,53,13,0.5)] transition hover:brightness-110"
          >
            My Pokédex
          </Link>
          <FavoritePokemonIcon />
        </div>
        <UserMenu />
      </header>
      <section className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
        <PokedexWithLoadMore
          initialList={initialList}
          obtainingLocations={obtainingLocations}
        />
      </section>
    </main>
  );
}
