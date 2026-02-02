"use client";

import { createClient } from "./client";

export async function ensureAnonymousUser(supabase: ReturnType<typeof createClient>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session.user.id;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function fetchCaughtIds(supabase: ReturnType<typeof createClient>, userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("caught")
    .select("pokemon_id")
    .eq("user_id", userId)
    .order("pokemon_id");
  if (error) throw error;
  return (data ?? []).map((row) => row.pokemon_id);
}

export async function addCaught(supabase: ReturnType<typeof createClient>, userId: string, pokemonId: number) {
  const { error } = await supabase.from("caught").insert({ user_id: userId, pokemon_id: pokemonId });
  if (error) throw error;
}

export async function removeCaught(supabase: ReturnType<typeof createClient>, userId: string, pokemonId: number) {
  const { error } = await supabase.from("caught").delete().eq("user_id", userId).eq("pokemon_id", pokemonId);
  if (error) throw error;
}

export async function toggleCaughtInDb(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  pokemonId: number,
  currentlyCaught: boolean
): Promise<boolean> {
  if (currentlyCaught) {
    await removeCaught(supabase, userId, pokemonId);
    return false;
  }
  await addCaught(supabase, userId, pokemonId);
  return true;
}
