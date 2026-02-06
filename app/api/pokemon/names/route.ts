import { TOTAL_POKEMON } from "@/lib/pokeapi";

const POKEAPI = "https://pokeapi.co/api/v2";

let cached: Array<{ id: number; name: string }> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET() {
  const now = Date.now();
  if (cached && now - cacheTimestamp < CACHE_TTL) {
    return Response.json(cached, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const res = await fetch(
      `${POKEAPI}/pokemon?limit=${TOTAL_POKEMON}&offset=0`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return Response.json([]);
    const data = await res.json();
    const list = (data.results ?? []).map(
      (item: { name: string; url: string }) => {
        const id = parseInt(
          item.url.split("/").filter(Boolean).pop() ?? "0",
          10,
        );
        return { id, name: item.name };
      },
    );
    cached = list;
    cacheTimestamp = now;

    return Response.json(list, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json([]);
  }
}
