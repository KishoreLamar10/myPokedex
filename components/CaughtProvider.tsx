"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ensureAnonymousUser,
  fetchCaughtIds,
  toggleCaughtInDb,
} from "@/lib/supabase/caught";
import { createClient } from "@/lib/supabase/client";

type CaughtContextValue = {
  caughtIds: number[];
  toggleCaught: (pokemonId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
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

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const supabase = createClient();
        const uid = await ensureAnonymousUser(supabase);
        if (cancelled || !uid) return;
        setUserId(uid);
        const ids = await fetchCaughtIds(supabase, uid);
        if (!cancelled) setCaughtIds(ids);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load caught list"
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
          currentlyCaught
        );
        setCaughtIds((prev) =>
          newCaught
            ? [...prev, pokemonId].sort((a, b) => a - b)
            : prev.filter((id) => id !== pokemonId)
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update");
      }
    },
    [userId, caughtIds]
  );

  const value: CaughtContextValue = {
    caughtIds,
    toggleCaught,
    loading,
    error,
  };

  return (
    <CaughtContext.Provider value={value}>{children}</CaughtContext.Provider>
  );
}
