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
    <main className="p-6 md:p-10">
      <section className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-900/80 p-6 shadow-inner">
        <PokedexWithLoadMore
          initialList={initialList}
          obtainingLocations={obtainingLocations}
        />
      </section>
    </main>
  );
}
