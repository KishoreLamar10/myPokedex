import { NextResponse } from "next/server";
import { TOTAL_POKEMON } from "@/lib/pokeapi";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}&offset=0`
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const list = data.results.map((p: any) => ({
      name: p.name,
      id: parseInt(p.url.split("/").filter(Boolean).pop() ?? "0", 10),
    }));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
