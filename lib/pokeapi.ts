import type {
  Evolution,
  PokemonDetail,
  PokemonExtended,
  PokemonListItem,
} from "@/types/pokemon";

const POKEAPI = "https://pokeapi.co/api/v2";

/** Total Pokémon in PokeAPI (used for Load more). */
export const TOTAL_POKEMON = 1025;

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getPokemonList(
  limit = 151,
  offset = 0,
): Promise<PokemonListItem[]> {
  const res = await fetch(
    `${POKEAPI}/pokemon?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 3600 },
    },
  );
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
        types: (detail.types ?? []).map((t: { type: { name: string } }) =>
          capitalize(t.type.name),
        ),
      };
    }),
  );
  return results;
}

export async function getPokemonById(
  id: number,
): Promise<PokemonDetail | null> {
  try {
    const res = await fetch(`${POKEAPI}/pokemon/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    // Fetch evolution chain
    let evolutions: Evolution[] = [];
    try {
      const speciesRes = await fetch(`${POKEAPI}/pokemon-species/${id}`, {
        next: { revalidate: 3600 },
      });
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        if (speciesData.evolution_chain?.url) {
          const chainRes = await fetch(speciesData.evolution_chain.url, {
            next: { revalidate: 3600 },
          });
          if (chainRes.ok) {
            const chainData = await chainRes.json();
            evolutions = extractEvolutions(chainData.chain, id);
          }
        }
      }
    } catch {
      // silently fail if evolution chain fetch fails
    }

    return {
      id: data.id,
      name: capitalize(data.name),
      sprite: data.sprites?.front_default ?? "",
      types: (data.types ?? []).map((t: { type: { name: string } }) =>
        capitalize(t.type.name),
      ),
      height: data.height ?? 0,
      weight: data.weight ?? 0,
      abilities: (data.abilities ?? []).map(
        (a: { ability: { name: string } }) =>
          capitalize(a.ability.name.replace(/-/g, " ")),
      ),
      stats: (data.stats ?? []).map(
        (s: { stat: { name: string }; base_stat: number }) => ({
          name: capitalize(s.stat.name.replace(/-/g, " ")),
          value: s.base_stat,
        }),
      ),
      evolutions,
    };
  } catch {
    return null;
  }
}

function extractEvolutions(chain: any, currentId: number): Evolution[] {
  const evolutions: Evolution[] = [];
  const visited = new Set<number>();

  function traverse(node: any) {
    if (!node) return;

    const pokemonId = parseInt(
      node.species.url.split("/").filter(Boolean).pop() ?? "0",
      10,
    );

    // Skip the current Pokemon and already visited ones
    if (pokemonId !== currentId && !visited.has(pokemonId)) {
      visited.add(pokemonId);
      // We'll fetch the details asynchronously later
      evolutions.push({
        id: pokemonId,
        name: capitalize(node.species.name),
        sprite: "",
        types: [],
      });
    }

    // Traverse all evolutions
    if (node.evolves_to && Array.isArray(node.evolves_to)) {
      for (const evolution of node.evolves_to) {
        traverse(evolution);
      }
    }
  }

  traverse(chain);
  return evolutions;
}

function extractEvolutionIds(chain: any, currentId: number) {
  const evolutions: { id: number; name: string }[] = [];
  const visited = new Set<number>();

  function traverse(node: any) {
    if (!node) return;

    const pokemonId = parseInt(
      node.species.url.split("/").filter(Boolean).pop() ?? "0",
      10,
    );

    if (pokemonId !== currentId && !visited.has(pokemonId)) {
      visited.add(pokemonId);
      evolutions.push({
        id: pokemonId,
        name: capitalize(node.species.name),
      });
    }

    if (node.evolves_to && Array.isArray(node.evolves_to)) {
      for (const evolution of node.evolves_to) {
        traverse(evolution);
      }
    }
  }

  traverse(chain);
  return evolutions;
}

async function getEvolutionDetails(
  ids: { id: number; name: string }[],
): Promise<Evolution[]> {
  const details = await Promise.all(
    ids.map(async (evo) => {
      try {
        const res = await fetch(`${POKEAPI}/pokemon/${evo.id}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          return {
            id: evo.id,
            name: evo.name,
            sprite: "",
            types: [],
          };
        }
        const data = await res.json();
        return {
          id: evo.id,
          name: capitalize(data.name),
          sprite:
            data.sprites?.other?.["official-artwork"]?.front_default ||
            data.sprites?.front_default ||
            "",
          types: (data.types ?? []).map((t: { type: { name: string } }) =>
            capitalize(t.type.name),
          ),
        };
      } catch {
        return {
          id: evo.id,
          name: evo.name,
          sprite: "",
          types: [],
        };
      }
    }),
  );

  return details;
}

export async function getPokemonExtended(
  id: number,
): Promise<PokemonExtended | null> {
  try {
    const res = await fetch(`${POKEAPI}/pokemon/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    const normalAbilities: string[] = [];
    const hiddenAbilities: string[] = [];
    (data.abilities ?? []).forEach(
      (a: { ability: { name: string }; is_hidden: boolean }) => {
        const abilityName = a.ability.name.replace(/-/g, " ");
        if (a.is_hidden) {
          hiddenAbilities.push(abilityName);
        } else {
          normalAbilities.push(abilityName);
        }
      },
    );

    let evolutions: Evolution[] = [];
    try {
      const speciesRes = await fetch(`${POKEAPI}/pokemon-species/${id}`, {
        next: { revalidate: 3600 },
      });
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        if (speciesData.evolution_chain?.url) {
          const chainRes = await fetch(speciesData.evolution_chain.url, {
            next: { revalidate: 3600 },
          });
          if (chainRes.ok) {
            const chainData = await chainRes.json();
            const evoIds = extractEvolutionIds(chainData.chain, id);
            evolutions = await getEvolutionDetails(evoIds);
          }
        }
      }
    } catch {
      evolutions = [];
    }

    const animatedSprite =
      data.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default || "";

    return {
      id: data.id,
      name: capitalize(data.name),
      sprite: data.sprites?.front_default ?? "",
      animatedSprite,
      officialArtwork:
        data.sprites?.other?.["official-artwork"]?.front_default ||
        data.sprites?.other?.["official-artwork"]?.front_shiny ||
        "",
      shinyArtwork:
        data.sprites?.other?.["official-artwork"]?.front_shiny ||
        data.sprites?.front_shiny ||
        "",
      types: (data.types ?? []).map((t: { type: { name: string } }) =>
        capitalize(t.type.name),
      ),
      abilities: {
        normal: normalAbilities,
        hidden: hiddenAbilities,
      },
      evolutions,
    };
  } catch {
    return null;
  }
}
