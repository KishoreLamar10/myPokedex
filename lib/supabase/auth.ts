import { createClient } from "./client";
import { getURL } from "./utils";

/**
 * Signs up a new user using a username and password.
 * Internally maps the username to a @pokedex.local email.
 */
export async function signUp(
  username: string,
  password: string,
  favoritePokemon: number,
  secretQuestion: string,
  secretAnswer: string,
) {
  const supabase = createClient();
  const internalEmail = `${username.trim().toLowerCase()}@pokedex.local`;

  const { data, error } = await supabase.auth.signUp({
    email: internalEmail,
    password,
    options: {
      data: {
        favorite_pokemon: favoritePokemon,
        secret_question: secretQuestion,
        secret_answer: secretAnswer,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Signs in a user using a username and password.
 */
export async function signIn(username: string, password: string) {
  const supabase = createClient();
  const internalEmail = `${username.trim().toLowerCase()}@pokedex.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Fetches the secret question for a given username.
 */
export async function getSecretQuestion(username: string) {
  const supabase = createClient();

  // Better approach: use a dedicated RPC to fetch question securely by username
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_question', {
    p_username: username
  });

  if (rpcError) throw rpcError;
  return rpcData;
}

/**
 * Resets a password using the secret answer.
 */
export async function resetPasswordWithSecret(username: string, answer: string, newPassword: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('reset_password_with_secret', {
    p_username: username.trim().toLowerCase(),
    p_secret_answer: answer,
    p_new_password: newPassword
  });

  if (error) throw error;
  return data;
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

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });
  if (error) throw error;
}

export async function updateSecretQuestion(userId: string, question: string, answer: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      secret_question: question,
      secret_answer: answer,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) throw error;
}
