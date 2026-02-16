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
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.pokemon_id).sort((a, b) => a - b);
}

export async function fetchCaughtHistory(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ pokemonId: number; caughtAt: string }[]> {
  try {
    const { data, error } = await supabase
      .from("caught")
      .select("pokemon_id, caught_at")
      .eq("user_id", userId)
      .order("caught_at", { ascending: false });
    
    // If column is missing or other SQL error, return empty history
    if (error) {
      console.warn("Could not fetch catch history (migration likely pending):", error.message);
      return [];
    }
    
    return (data ?? []).map((row) => ({
      pokemonId: row.pokemon_id,
      caughtAt: row.caught_at,
    }));
  } catch (err) {
    console.error("fetchCaughtHistory exception:", err);
    return [];
  }
}

export async function addCaught(supabase: ReturnType<typeof createClient>, userId: string, pokemonId: number) {
  // Try inserting with caught_at first
  const { error: firstError } = await supabase.from("caught").insert({ 
    user_id: userId, 
    pokemon_id: pokemonId,
    caught_at: new Date().toISOString()
  });

  // If it fails (likely due to missing column), try without caught_at
  if (firstError) {
    const { error: secondError } = await supabase.from("caught").insert({ 
      user_id: userId, 
      pokemon_id: pokemonId 
    });
    if (secondError) throw secondError;
  }
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
