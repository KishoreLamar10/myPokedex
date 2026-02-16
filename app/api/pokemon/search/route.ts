import { getObtainingMethod } from "@/lib/obtaining";

const POKEAPI = "https://pokeapi.co/api/v2";
const TOTAL_POKEMON = 2000;
const RESULT_LIMIT = 10;

let cachedList: Array<{ name: string; url: string }> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim().toLowerCase();

  if (!query) {
    return Response.json([]);
  }

  try {
    const now = Date.now();
    if (!cachedList || now - cacheTimestamp > CACHE_TTL) {
      const listRes = await fetch(
        `${POKEAPI}/pokemon?limit=${TOTAL_POKEMON}&offset=0`,
        { next: { revalidate: 3600 } },
      );
      if (!listRes.ok) return Response.json([]);
      const listData = await listRes.json();
      cachedList = listData.results ?? [];
      cacheTimestamp = now;
    }

    const list = cachedList ?? [];
    const startsWithMatches = list.filter((p) => p.name.startsWith(query));
    const includesMatches = list.filter(
      (p) => !p.name.startsWith(query) && p.name.includes(query),
    );
    const matches = [...startsWithMatches, ...includesMatches].slice(
      0,
      RESULT_LIMIT,
    );

    if (matches.length === 0) return Response.json([]);

    const details = await Promise.all(
      matches.map(async (match) => {
        try {
          const res = await fetch(match.url, { next: { revalidate: 3600 } });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.id,
            name: capitalize(data.name),
            sprite: data.sprites?.front_default ?? "",
            types: (data.types ?? []).map((t: { type: { name: string } }) =>
              capitalize(t.type.name),
            ),
            obtainingMethod: getObtainingMethod(capitalize(data.name)),
          };
        } catch {
          return null;
        }
      }),
    );

    return Response.json(details.filter(Boolean));
  } catch {
    return Response.json([]);
  }
}
