import { getPokemonExtended } from "@/lib/pokeapi";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);

  if (!Number.isFinite(numId) || numId < 1) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const data = await getPokemonExtended(numId);
  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(data, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
