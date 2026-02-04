"use client";

import { FormEvent, useState } from "react";
import { signIn, signUp } from "@/lib/supabase/auth";

interface AuthFormProps {
  onSuccess: () => void;
  initialMode?: "login" | "signup";
}

export function AuthForm({ onSuccess, initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favoritePokemon, setFavoritePokemon] = useState("pikachu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        // Map pokemon name to ID (for simplicity, just support common Pokemon)
        const pokemonMap: Record<string, number> = {
          pikachu: 25,
          charizard: 6,
          blastoise: 9,
          venusaur: 3,
          machamp: 68,
          golem: 76,
          arcanine: 59,
          lapras: 131,
          dragonite: 149,
          mewtwo: 150,
          gyarados: 130,
          alakazam: 65,
        };

        const pokemonId = pokemonMap[favoritePokemon.toLowerCase()] || 25; // Default to Pikachu
        await signUp(email, password, pokemonId);
        setSuccess(
          "Account created! Please check your email to confirm your account.",
        );
        setEmail("");
        setPassword("");
        setFavoritePokemon("pikachu");
        setTimeout(() => setMode("login"), 2000);
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-800/90 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-[var(--pokedex-red)] mb-2">
            My Pokédex
          </h1>
          <p className="text-center text-zinc-400 mb-6">
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-900/50 px-4 py-3 text-sm text-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
                placeholder="••••••••"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="favoritePokemon"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Favorite Pokémon
                </label>
                <input
                  id="favoritePokemon"
                  type="text"
                  value={favoritePokemon}
                  onChange={(e) => setFavoritePokemon(e.target.value)}
                  className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--pokedex-red)] py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[var(--pokedex-red)] hover:brightness-110 font-semibold transition"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
