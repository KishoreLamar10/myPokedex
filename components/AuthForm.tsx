"use client";

import { FormEvent, useState } from "react";
import { signIn, signUp, getSecretQuestion, resetPasswordWithSecret } from "@/lib/supabase/auth";

interface AuthFormProps {
  onSuccess: () => void;
  initialMode?: "login" | "signup";
}

const SECRET_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city were you born in?",
  "What was your first car?",
  "What is your favorite childhood book?",
];

export function AuthForm({ onSuccess, initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot-password">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [favoritePokemon, setFavoritePokemon] = useState("pikachu");
  
  // Recovery fields
  const [secretQuestion, setSecretQuestion] = useState(SECRET_QUESTIONS[0]);
  const [secretAnswer, setSecretAnswer] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"username" | "answer">("username");
  const [fetchedQuestion, setFetchedQuestion] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const question = await getSecretQuestion(username);
      if (question) {
        setFetchedQuestion(question);
        setRecoveryStep("answer");
      } else {
        setError("User not found or no recovery question set.");
      }
    } catch (err: any) {
      setError(err?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const pokemonMap: Record<string, number> = {
          pikachu: 25, charizard: 6, blastoise: 9, venusaur: 3,
          machamp: 68, golem: 76, arcanine: 59, lapras: 131,
          dragonite: 149, mewtwo: 150, gyarados: 130, alakazam: 65,
        };
        const pokemonId = pokemonMap[favoritePokemon.toLowerCase()] || 25;
        
        await signUp(username, password, pokemonId, secretQuestion, secretAnswer);
        setSuccess("Account created successfully! You can now sign in.");
        setUsername("");
        setPassword("");
        setSecretAnswer("");
        setTimeout(() => setMode("login"), 2000);
      } else if (mode === "forgot-password") {
        await resetPasswordWithSecret(username, secretAnswer, password);
        setSuccess("Password reset successful! You can now sign in with your new password.");
        setTimeout(() => {
          setMode("login");
          setRecoveryStep("username");
          setPassword("");
          setSecretAnswer("");
        }, 2000);
      } else {
        await signIn(username, password);
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || err?.error_description || "An error occurred");
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
              ? "Sign in with your username"
              : mode === "signup"
                ? "Create a new account"
                : recoveryStep === "username" 
                  ? "Enter your username to begin recovery"
                  : "Answer your secret question"}
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

          {mode === "forgot-password" && recoveryStep === "username" ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                  placeholder="Your username"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--pokedex-red)] py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find My Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username (Locked if in recovery step "answer") */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={recoveryStep === "answer"}
                  className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)] disabled:opacity-50"
                />
              </div>

              {/* Secret Question Display or Dropdown */}
              {mode === "signup" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Secret Question</label>
                    <select
                      value={secretQuestion}
                      onChange={(e) => setSecretQuestion(e.target.value)}
                      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                    >
                      {SECRET_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Secret Answer</label>
                    <input
                      type="text"
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      required
                      placeholder="Your answer"
                      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                    />
                  </div>
                </div>
              )}

              {mode === "forgot-password" && recoveryStep === "answer" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-zinc-700/30 border border-zinc-600">
                    <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wider font-bold">Your Secret Question</p>
                    <p className="text-white font-medium">{fetchedQuestion}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Secret Answer</label>
                    <input
                      type="text"
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      required
                      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                    />
                  </div>
                </div>
              )}

              {/* Password field (Login / Signup) */}
              {mode !== "forgot-password" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot-password"); setRecoveryStep("username"); }}
                        className="text-xs text-[var(--pokedex-red)] hover:brightness-110"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                  />
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label htmlFor="favoritePokemon" className="block text-sm font-medium text-zinc-300 mb-2">Favorite Pokémon</label>
                  <input
                    id="favoritePokemon"
                    type="text"
                    value={favoritePokemon}
                    onChange={(e) => setFavoritePokemon(e.target.value)}
                    className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white outline-none focus:border-[var(--pokedex-red)]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--pokedex-red)] py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setRecoveryStep("username");
                setError(null); setSuccess(null);
                setUsername(""); setPassword(""); setSecretAnswer("");
              }}
              className="text-zinc-400 hover:text-white transition"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            {mode === "forgot-password" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setRecoveryStep("username"); setError(null); }}
                className="block w-full mt-2 text-sm text-zinc-500 hover:text-zinc-300"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
