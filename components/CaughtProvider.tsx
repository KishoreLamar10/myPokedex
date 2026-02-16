"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchCaughtIds, fetchCaughtHistory, toggleCaughtInDb } from "@/lib/supabase/caught";
import { createClient } from "@/lib/supabase/client";
import { AuthForm } from "@/components/AuthForm";

type CatchRecord = { pokemonId: number; caughtAt: string };

type CaughtContextValue = {
  caughtIds: number[];
  caughtHistory: CatchRecord[];
  toggleCaught: (pokemonId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  userId: string | null;
};

const CaughtContext = createContext<CaughtContextValue | null>(null);

export function useCaught() {
  const ctx = useContext(CaughtContext);
  if (!ctx) throw new Error("useCaught must be used inside CaughtProvider");
  return ctx;
}

export function CaughtProvider({ children }: { children: React.ReactNode }) {
  const [caughtIds, setCaughtIds] = useState<number[]>([]);
  const [caughtHistory, setCaughtHistory] = useState<CatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setUserId(user.id);
        setAuthenticated(true);
        
        // Critical: load main caught IDs
        const ids = await fetchCaughtIds(supabase, user.id);
        if (!cancelled) setCaughtIds(ids);

        // Non-critical: load catch history (migration might be pending)
        try {
          const history = await fetchCaughtHistory(supabase, user.id);
          if (!cancelled) setCaughtHistory(history);
        } catch (hErr) {
          console.warn("Caught history load failed (non-critical):", hErr);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load caught list",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCaught = useCallback(
    async (pokemonId: number) => {
      if (!userId) return;
      try {
        const supabase = createClient();
        const currentlyCaught = caughtIds.includes(pokemonId);
        const newCaughtState = await toggleCaughtInDb(
          supabase,
          userId,
          pokemonId,
          currentlyCaught,
        );

        if (newCaughtState) {
          setCaughtIds((prev) => [...prev, pokemonId].sort((a, b) => a - b));
          setCaughtHistory((prev) => [
            { pokemonId, caughtAt: new Date().toISOString() },
            ...prev,
          ]);
        } else {
          setCaughtIds((prev) => prev.filter((id) => id !== pokemonId));
          setCaughtHistory((prev) =>
            prev.filter((item) => item.pokemonId !== pokemonId),
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update");
      }
    },
    [userId, caughtIds],
  );

  const value: CaughtContextValue = {
    caughtIds,
    caughtHistory,
    toggleCaught,
    loading,
    error,
    userId,
  };

  // Show auth form if not authenticated
  if (!authenticated && !loading) {
    return (
      <AuthForm
        onSuccess={() => {
          setAuthenticated(true);
          window.location.reload();
        }}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <CaughtContext.Provider value={value}>{children}</CaughtContext.Provider>
  );
}
