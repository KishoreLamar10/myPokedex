import { NextRequest } from "next/server";
import { getPokemonList } from "@/lib/pokeapi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 150));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const list = await getPokemonList(limit, offset);
  return Response.json(list);
}
