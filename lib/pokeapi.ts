import type {
  Evolution,
  PokemonDetail,
  PokemonExtended,
  PokemonListItem,
  PokemonVariety,
} from "@/types/pokemon";
import { getObtainingMethod, getPokemonLocations } from "@/lib/obtaining";

const POKEAPI = "https://pokeapi.co/api/v2";

/** Total Pokémon in PokeAPI (used for Load more). */
export const TOTAL_POKEMON = 2000;

const SMOGON_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const smogonCache = new Map<string, { value: any; expiresAt: number }>();
const moveCache = new Map<string, any>();

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatName(str: string) {
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((part) => capitalize(part))
    .join(" ");
}

function isRedundantForm(name: string, id: number): boolean {
  if (id < 10000) return false;
  const lower = name.toLowerCase();
  const battleOnlySuffixes = [
    "-blade",
    "-school",
    "-zen",
    "-active",
    "-busted",
    "-gulping",
    "-cramorgorging",
    "-noice",
    "-hangry",
    "-hero",
    "-terastal",
    "-stellar",
    "-meteor",
    "-complete",
    "-resolute",
    "-pirouette",
    "-active",
    "-busted",
  ];
  return battleOnlySuffixes.some((s) => lower.endsWith(s));
}

function getBestArtwork(sprites: any) {
  const official =
    sprites?.other?.["official-artwork"]?.front_default ||
    sprites?.other?.home?.front_default ||
    sprites?.other?.dream_world?.front_default ||
    sprites?.front_default ||
    "";

  const shiny =
    sprites?.other?.["official-artwork"]?.front_shiny ||
    sprites?.other?.home?.front_shiny ||
    sprites?.front_shiny ||
    official ||
    "";

  return { official, shiny };
}

async function isSmogonRecommended(megaSlug: string) {
  const cacheKey = `smogon:rec:${megaSlug}`;
  const cached = smogonCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const res = await fetch(
      `https://www.smogon.com/dex/sm/pokemon/${megaSlug}/`,
      { next: { revalidate: 86400 } },
    );
    const value = res.ok;
    smogonCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + SMOGON_TTL_MS,
    });
    return value;
  } catch {
    return false;
  }
}

async function fetchSmogonNature(slug: string, gen: "sv" | "sm") {
  const cacheKey = `smogon:nature:${gen}:${slug}`;
  const cached = smogonCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const res = await fetch(
      `https://www.smogon.com/dex/${gen}/pokemon/${slug}/`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ");
    const match = text.match(/Nature:\s*([A-Za-z-]+)/);
    const value = match?.[1] ?? null;
    smogonCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + SMOGON_TTL_MS,
    });
    return value;
  } catch {
    return null;
  }
}

async function getSmogonNature(slug: string, gens: Array<"sv" | "sm">) {
  for (const gen of gens) {
    const nature = await fetchSmogonNature(slug, gen);
    if (nature) return nature;
  }
  return null;
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

  const results: PokemonListItem[] = [];
  const chunkSize = 20;

  for (let i = 0; i < data.results.length; i += chunkSize) {
    const chunk = data.results.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (p: { url: string }) => {
        const id = parseInt(p.url.split("/").filter(Boolean).pop() ?? "0", 10);
        const detailRes = await fetch(p.url, { next: { revalidate: 3600 } });
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();
        return {
          id,
          name: capitalize(detail.name),
          sprite: detail.sprites?.front_default ?? "",
          types: (detail.types ?? []).map((t: { type: { name: string } }) =>
            capitalize(t.type.name),
          ),
          height: detail.height,
          weight: detail.weight,
          baseStatTotal: (detail.stats ?? []).reduce(
            (acc: number, s: { base_stat: number }) => acc + s.base_stat,
            0,
          ),
          obtainingMethod: getObtainingMethod(capitalize(detail.name)),
        };
      }),
    );
    results.push(
      ...(chunkResults.filter((p) => {
        if (!p) return false;
        return !isRedundantForm(p.name, p.id);
      }) as PokemonListItem[]),
    );
  }

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
    let isLegendary = false;
    let isMythical = false;
    try {
      const speciesRes = await fetch(`${POKEAPI}/pokemon-species/${id}`, {
        next: { revalidate: 3600 },
      });
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        isLegendary = speciesData.is_legendary;
        isMythical = speciesData.is_mythical;
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
        (a: { ability: { name: string }; is_hidden: boolean }) => ({
          name: capitalize(a.ability.name.replace(/-/g, " ")),
          isHidden: a.is_hidden,
        }),
      ),
      stats: (data.stats ?? []).map(
        (s: { stat: { name: string }; base_stat: number }) => ({
          name: capitalize(s.stat.name.replace(/-/g, " ")),
          value: s.base_stat,
        }),
      ),
      obtainingMethod: getObtainingMethod(capitalize(data.name)),
      locations: getPokemonLocations(capitalize(data.name)),
      evolutions,
      isLegendary,
      isMythical,
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
    let varieties: PokemonVariety[] = [];
    let isLegendary = false;
    let isMythical = false;
    const smogonNature = await getSmogonNature(data.name, ["sv", "sm"]);
    try {
      const speciesRes = await fetch(`${POKEAPI}/pokemon-species/${id}`, {
        next: { revalidate: 3600 },
      });
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        isLegendary = speciesData.is_legendary;
        isMythical = speciesData.is_mythical;

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

        const varietyNames = (speciesData.varieties ?? [])
          .filter(
            (v: { is_default: boolean; pokemon: { name: string } }) =>
              !v.is_default
          )
          .map((v: { pokemon: { name: string } }) => v.pokemon.name);

        if (varietyNames.length > 0) {
          const varietyDetails = await Promise.all(
            varietyNames.map(async (name: string) => {
              try {
                const res = await fetch(`${POKEAPI}/pokemon/${name}`, {
                  next: { revalidate: 3600 },
                });
                if (!res.ok) return null;
                const mega = await res.json();

                const normal: string[] = [];
                const hidden: string[] = [];
                (mega.abilities ?? []).forEach(
                  (a: { ability: { name: string }; is_hidden: boolean }) => {
                    const abilityName = formatName(a.ability.name);
                    if (a.is_hidden) {
                      hidden.push(abilityName);
                    } else {
                      normal.push(abilityName);
                    }
                  },
                );

                const smogonRecommended = await isSmogonRecommended(mega.name);
                const smogonNature = await getSmogonNature(mega.name, ["sm"]);

                const { official, shiny } = getBestArtwork(mega.sprites);

                return {
                  id: mega.id,
                  slug: mega.name,
                  name: formatName(mega.name),
                  sprite: mega.sprites?.front_default ?? "",
                  officialArtwork: official,
                  shinyArtwork: shiny,
                  types: (mega.types ?? []).map(
                    (t: { type: { name: string } }) => formatName(t.type.name),
                  ),
                  stats: (mega.stats ?? []).map(
                    (s: { stat: { name: string }; base_stat: number }) => ({
                      name: formatName(s.stat.name),
                      value: s.base_stat,
                    }),
                  ),
                  smogonNature: smogonNature ?? undefined,
                  abilities: {
                    normal,
                    hidden,
                  },
                  smogonRecommended,
                } as PokemonVariety;
              } catch {
                return null;
              }
            }),
          );

          varieties = varietyDetails.filter((form) => {
            if (!form) return false;
            return Boolean(form.officialArtwork || form.sprite);
          }) as PokemonVariety[];
        }
      }
    } catch {
      evolutions = [];
      varieties = [];
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
      smogonNature: smogonNature ?? undefined,
      abilities: {
        normal: normalAbilities,
        hidden: hiddenAbilities,
      },
      evolutions,
      varieties,
      obtainingMethod: getObtainingMethod(capitalize(data.name)),
      locations: getPokemonLocations(capitalize(data.name)),
      isLegendary,
      isMythical,
    };
  } catch {
    return null;
  }
}

export async function getAllItems(): Promise<{ name: string; url: string }[]> {
  try {
    const res = await fetch(`${POKEAPI}/item?limit=2000&offset=0`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.map((item: { name: string; url: string }) => ({
      name: capitalize(item.name.replace(/-/g, " ")),
      url: item.url,
    }));
  } catch {
    return [];
  }

}

export async function getAllMoves(): Promise<{ name: string; url: string }[]> {
  try {
    const res = await fetch(`${POKEAPI}/move?limit=2000&offset=0`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.map((move: { name: string; url: string }) => ({
      name: capitalize(move.name.replace(/-/g, " ")),
      url: move.url,
    }));
  } catch {
    return [];
  }
}

export async function getMoveDetails(moveName: string): Promise<any | null> {
  const normalized = moveName.toLowerCase().replace(/ /g, "-");
  if (moveCache.has(normalized)) return moveCache.get(normalized);

  try {
    const res = await fetch(`${POKEAPI}/move/${normalized}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const details = {
      name: formatName(data.name),
      type: data.type.name,
      power: data.power,
      damageClass: data.damage_class?.name,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
    };
    moveCache.set(normalized, details);
    return details;
  } catch {
    return null;
  }
}

export async function getMoveType(moveName: string): Promise<string | null> {
  const details = await getMoveDetails(moveName);
  return details?.type ?? null;
}

export async function getAllPokemonForSelector(): Promise<PokemonListItem[]> {
  return getPokemonList(TOTAL_POKEMON, 0);
}

/**
 * Lightweight batch fetcher — only grabs id, name, types, sprite.
 * No species data, no evolutions, no abilities. Perfect for the Journal.
 * Fetches in small concurrent batches for progressive rendering.
 */
export async function getPokemonBasicInfoBatch(
  ids: number[],
  onBatchLoaded?: (batch: Record<number, PokemonListItem>) => void,
  batchSize = 10,
): Promise<Record<number, PokemonListItem>> {
  const uniqueIds = [...new Set(ids)];
  const result: Record<number, PokemonListItem> = {};

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const chunk = uniqueIds.slice(i, i + batchSize);
    const fetched = await Promise.all(
      chunk.map(async (id) => {
        try {
          const res = await fetch(`${POKEAPI}/pokemon/${id}`, {
            next: { revalidate: 3600 },
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.id,
            name: formatName(data.name),
            types: (data.types ?? []).map(
              (t: { type: { name: string } }) => t.type.name,
            ),
            sprite:
              data.sprites?.front_default ??
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
          } as PokemonListItem;
        } catch {
          return null;
        }
      }),
    );

    const batchMap: Record<number, PokemonListItem> = {};
    for (const p of fetched) {
      if (p) {
        result[p.id] = p;
        batchMap[p.id] = p;
      }
    }

    // Notify the caller so the UI can render progressively
    if (onBatchLoaded && Object.keys(batchMap).length > 0) {
      onBatchLoaded(batchMap);
    }
  }

  return result;
}

export async function getPokemonLearnset(id: number | string): Promise<{ name: string; url: string }[]> {
  try {
    const res = await fetch(`${POKEAPI}/pokemon/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.moves ?? []).map((m: any) => ({
      name: formatName(m.move.name),
      url: m.move.url,
    }));
  } catch {
    return [];
  }
}
