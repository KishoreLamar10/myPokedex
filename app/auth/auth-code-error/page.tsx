"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const searchParams = useSearchParams();
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try searchParams (query string)
    const queryError = searchParams.get("error_description") || searchParams.get("error");
    if (queryError) {
      setErrorDescription(decodeURIComponent(queryError.replace(/\+/g, " ")));
      return;
    }

    // 2. Try hash fragment (Supabase often puts errors here)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setErrorDescription(decodeURIComponent(hashError.replace(/\+/g, " ")));
      }
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border-2 border-[var(--pokedex-border)] bg-zinc-800/90 p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[var(--pokedex-red)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Authentication Error
        </h1>
        <p className="text-zinc-400 mb-8">
          {errorDescription ||
            "The authentication link is invalid or has expired. Please try requesting a new one."}
        </p>

        <Link
          href="/"
          className="inline-block w-full rounded-lg bg-[var(--pokedex-red)] py-2.5 font-bold text-white transition hover:brightness-110"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-zinc-400">Loading error details...</div>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}
