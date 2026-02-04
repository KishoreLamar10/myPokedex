import { createClient } from "./client";

export async function signUp(
  email: string,
  password: string,
  favoritePokemon: number = 25,
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;

  // Create user profile with favorite pokemon
  if (data.user?.id) {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: data.user.id,
        favorite_pokemon: favoritePokemon,
      });
    if (profileError) throw profileError;
  }

  return data.user;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getFavoritePokemon(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("favorite_pokemon")
    .eq("id", userId)
    .single();

  if (error) return 25; // Default to Pikachu
  return data?.favorite_pokemon ?? 25;
}
