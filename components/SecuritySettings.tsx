"use client";

import { useState } from "react";
import { updatePassword, updateSecretQuestion } from "@/lib/supabase/auth";
import { useCaught } from "@/components/CaughtProvider";

const SECRET_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city were you born in?",
  "What was your first car?",
  "What is your favorite childhood book?",
];

export function SecuritySettings() {
  const { userId } = useCaught();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(SECRET_QUESTIONS[0]);
  const [secretAnswer, setSecretAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await updatePassword(password);
      setMessage({ type: "success", text: "Password updated successfully" });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!secretAnswer.trim()) {
      setMessage({ type: "error", text: "Secret answer cannot be empty" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await updateSecretQuestion(userId, selectedQuestion, secretAnswer);
      setMessage({ type: "success", text: "Security question updated successfully" });
      setSecretAnswer("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === "success" 
            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      {/* Password Reset Section */}
      <section className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-xl">🔑</span> Change Password
          </h3>
          <p className="text-zinc-400 text-sm mt-1">Update your account login password.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 px-4 py-3 focus:border-[var(--pokedex-red)] focus:ring-1 focus:ring-[var(--pokedex-red)] outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 px-4 py-3 focus:border-[var(--pokedex-red)] focus:ring-1 focus:ring-[var(--pokedex-red)] outline-none transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-[var(--pokedex-red)] hover:bg-red-600 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-red-500/20"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* Security Question Section */}
      <section className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-xl">🛡️</span> Recovery Question
          </h3>
          <p className="text-zinc-400 text-sm mt-1">Change your secret question and answer for account recovery.</p>
        </div>

        <form onSubmit={handleUpdateSecurity} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Secret Question</label>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 px-4 py-3 focus:border-[var(--pokedex-red)] focus:ring-1 focus:ring-[var(--pokedex-red)] outline-none transition appearance-none"
            >
              {SECRET_QUESTIONS.map((q) => (
                <option key={q} value={q} className="bg-zinc-900">
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Secret Answer</label>
            <input
              type="text"
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
              placeholder="Your answer"
              className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 px-4 py-3 focus:border-[var(--pokedex-red)] focus:ring-1 focus:ring-[var(--pokedex-red)] outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 disabled:opacity-50 text-white font-bold transition shadow-lg"
          >
            {loading ? "Updating..." : "Update Question"}
          </button>
        </form>
      </section>
    </div>
  );
}
