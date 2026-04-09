"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setSessionValid(true);
      } else {
        setError("Your reset session has expired or is invalid. Please request a new password reset link.");
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!sessionValid) {
      setError("No active session found. Please try again from the link in your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">Verifying reset session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-800/90 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-[var(--pokedex-red)] mb-2">
            Reset Password
          </h1>
          <p className="text-center text-zinc-400 mb-6">
            Enter your new password below.
          </p>

          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="rounded-lg bg-green-900/50 px-4 py-3 text-sm text-green-200">
                {success}
              </div>
              <Link
                href="/"
                className="inline-block w-full rounded-lg bg-zinc-700 py-2.5 font-bold text-white transition hover:bg-zinc-600"
              >
                Go to Home
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {sessionValid && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      New Password
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

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-700/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition focus:border-[var(--pokedex-red)] focus:ring-2 focus:ring-[var(--pokedex-red)]/50"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[var(--pokedex-red)] py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm font-semibold text-[var(--pokedex-red)] hover:brightness-110 transition"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
