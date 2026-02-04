"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchCaughtIds, toggleCaughtInDb } from "@/lib/supabase/caught";
import { createClient } from "@/lib/supabase/client";
import { AuthForm } from "@/components/AuthForm";

type CaughtContextValue = {
  caughtIds: number[];
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
        const ids = await fetchCaughtIds(supabase, user.id);
        if (!cancelled) setCaughtIds(ids);
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
        const newCaught = await toggleCaughtInDb(
          supabase,
          userId,
          pokemonId,
          currentlyCaught,
        );
        setCaughtIds((prev) =>
          newCaught
            ? [...prev, pokemonId].sort((a, b) => a - b)
            : prev.filter((id) => id !== pokemonId),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update");
      }
    },
    [userId, caughtIds],
  );

  const value: CaughtContextValue = {
    caughtIds,
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
