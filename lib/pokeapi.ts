import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";

const POKEAPI = "https://pokeapi.co/api/v2";

/** Total Pokémon in PokeAPI (used for Load more). */
export const TOTAL_POKEMON = 1350;

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonListItem[]> {
  const res = await fetch(`${POKEAPI}/pokemon?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch Pokémon list");
  const data = await res.json();

  const results = await Promise.all(
    data.results.map(async (p: { url: string }) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop() ?? "0", 10);
      const detailRes = await fetch(p.url, { next: { revalidate: 3600 } });
      const detail = await detailRes.json();
      return {
        id,
        name: capitalize(detail.name),
        sprite: detail.sprites?.front_default ?? "",
        types: (detail.types ?? []).map((t: { type: { name: string } }) => capitalize(t.type.name)),
      };
    })
  );
  return results;
}

export async function getPokemonById(id: number): Promise<PokemonDetail | null> {
  try {
    const res = await fetch(`${POKEAPI}/pokemon/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      name: capitalize(data.name),
      sprite: data.sprites?.front_default ?? "",
      types: (data.types ?? []).map((t: { type: { name: string } }) => capitalize(t.type.name)),
      height: data.height ?? 0,
      weight: data.weight ?? 0,
      abilities: (data.abilities ?? []).map(
        (a: { ability: { name: string } }) => capitalize(a.ability.name.replace(/-/g, " "))
      ),
      stats: (data.stats ?? []).map((s: { stat: { name: string }; base_stat: number }) => ({
        name: capitalize(s.stat.name.replace(/-/g, " ")),
        value: s.base_stat,
      })),
    };
  } catch {
    return null;
  }
}
