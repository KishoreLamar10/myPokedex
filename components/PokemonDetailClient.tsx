"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCaught } from "@/components/CaughtProvider";
import { getEggMoveEntry } from "@/lib/eggMoves";
import { getHiddenAbilityRecommendation } from "@/lib/hiddenAbilities";
import type { Evolution, MegaForm, PokemonDetail } from "@/types/pokemon";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-amber-100 text-amber-900",
  Fire: "bg-orange-500 text-white",
  Water: "bg-blue-500 text-white",
  Electric: "bg-yellow-400 text-yellow-950",
  Grass: "bg-green-500 text-white",
  Ice: "bg-cyan-300 text-cyan-950",
  Fighting: "bg-red-700 text-white",
  Poison: "bg-purple-600 text-white",
  Ground: "bg-amber-700 text-white",
  Flying: "bg-indigo-300 text-indigo-950",
  Psychic: "bg-pink-500 text-white",
  Bug: "bg-lime-600 text-white",
  Rock: "bg-stone-600 text-white",
  Ghost: "bg-violet-800 text-white",
  Dragon: "bg-indigo-600 text-white",
  Dark: "bg-zinc-800 text-white",
  Steel: "bg-zinc-400 text-zinc-900",
  Fairy: "bg-pink-300 text-pink-950",
};

const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0,
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

function getTypeClass(type: string) {
  return TYPE_COLORS[type] ?? "bg-zinc-500 text-white";
}

function getWeaknesses(types: string[]) {
  const typeKeys = types.map((t) => t.toLowerCase());
  const multipliers: Record<string, number> = {};

  Object.keys(TYPE_CHART).forEach((attackType) => {
    const chart = TYPE_CHART[attackType];
    let multiplier = 1;
    typeKeys.forEach((defType) => {
      multiplier *= chart[defType] ?? 1;
    });
    multipliers[attackType] = multiplier;
  });

  return Object.entries(multipliers)
    .filter(([, mult]) => mult >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1));
}

interface PokemonDetailClientProps {
  pokemon: PokemonDetail;
}

type Recommendation = {
  role: string;
  nature: string;
  evs: string;
  ivs: string;
  note: string;
};

type CompetitiveExtras = {
  items: string[];
};

function getMegaStoneName(baseName: string, megaName: string) {
  const normalizedBase = baseName.replace(/[^a-zA-Z0-9]/g, "");
  const hasMegaX = /mega x/i.test(megaName);
  const hasMegaY = /mega y/i.test(megaName);
  if (/^mewtwo$/i.test(normalizedBase)) {
    return hasMegaX ? "Mewtwonite X" : hasMegaY ? "Mewtwonite Y" : "Mewtwonite";
  }
  const suffix = hasMegaX ? " X" : hasMegaY ? " Y" : "";
  return `${normalizedBase}ite${suffix}`;
}

function getStatValue(stats: PokemonDetail["stats"], name: string) {
  return stats.find((s) => s.name.toLowerCase() === name)?.value ?? 0;
}
function getRecommendations(stats: PokemonDetail["stats"]): Recommendation {
  const hp = getStatValue(stats, "hp");
  const atk = getStatValue(stats, "attack");
  const def = getStatValue(stats, "defense");
  const spa = getStatValue(stats, "special attack");
  const spd = getStatValue(stats, "special defense");
  const spe = getStatValue(stats, "speed");

  const physical = atk >= spa + 10;
  const special = spa >= atk + 10;
  const fast = spe >= Math.max(def, spd) && spe >= Math.max(atk, spa) * 0.8;
  const bulky = hp >= 80 && (def >= 80 || spd >= 80) && spe < 80;

  if (bulky) {
    if (def >= spd) {
      return {
        role: "Physical bulky",
        nature: "Impish (+Def, -SpA)",
        evs: "252 HP / 252 Def / 4 SpD",
        ivs: "31/31/31/0/31/31 (5x31, SpA 0)",
        note: "General SV singles bulk spread.",
      };
    }
    return {
      role: "Special bulky",
      nature: "Calm (+SpD, -Atk)",
      evs: "252 HP / 252 SpD / 4 Def",
      ivs: "31/0/31/31/31/31 (5x31, Atk 0)",
      note: "General SV singles bulk spread.",
    };
  }

  if (physical) {
    return {
      role: fast ? "Physical sweeper" : "Physical breaker",
      nature: fast ? "Jolly (+Spe, -SpA)" : "Adamant (+Atk, -SpA)",
      evs: "252 Atk / 252 Spe / 4 HP",
      ivs: "31/31/31/0/31/31 (5x31, SpA 0)",
      note: "General SV singles offense spread.",
    };
  }

  if (special) {
    return {
      role: fast ? "Special sweeper" : "Special breaker",
      nature: fast ? "Timid (+Spe, -Atk)" : "Modest (+SpA, -Atk)",
      evs: "252 SpA / 252 Spe / 4 HP",
      ivs: "31/0/31/31/31/31 (5x31, Atk 0)",
      note: "General SV singles offense spread.",
    };
  }

  return {
    role: fast ? "Mixed attacker" : "Balanced attacker",
    nature: fast ? "Naive (+Spe, -SpD)" : "Mild (+SpA, -Def)",
    evs: "252 Atk / 252 SpA / 4 Spe",
    ivs: "31/31/31/31/31/31 (6x31)",
    note: "General mixed spread. Adjust for your moveset.",
  };
}

function getCompetitiveExtras(
  stats: PokemonDetail["stats"],
): CompetitiveExtras {
  const atk = getStatValue(stats, "attack");
  const spa = getStatValue(stats, "special attack");
  const def = getStatValue(stats, "defense");
  const spd = getStatValue(stats, "special defense");
  const spe = getStatValue(stats, "speed");
  const hp = getStatValue(stats, "hp");

  const physical = atk >= spa + 10;
  const special = spa >= atk + 10;
  const fast = spe >= Math.max(def, spd) && spe >= Math.max(atk, spa) * 0.8;
  const bulky = hp >= 80 && (def >= 80 || spd >= 80) && spe < 80;

  if (bulky) {
    return {
      items: [
        "Leftovers",
        def >= spd ? "Rocky Helmet" : "Assault Vest",
        "Heavy-Duty Boots",
      ],
    };
  }

  if (physical) {
    return {
      items: fast
        ? ["Choice Scarf", "Life Orb", "Heavy-Duty Boots"]
        : ["Choice Band", "Life Orb", "Assault Vest"],
    };
  }

  if (special) {
    return {
      items: fast
        ? ["Choice Scarf", "Life Orb", "Focus Sash"]
        : ["Choice Specs", "Life Orb", "Heavy-Duty Boots"],
    };
  }

  return {
    items: ["Life Orb", "Expert Belt", "Heavy-Duty Boots"],
  };
}

export function PokemonDetailClient({ pokemon }: PokemonDetailClientProps) {
  const { caughtIds, toggleCaught, loading, error } = useCaught();
  const [busy, setBusy] = useState(false);
  const [officialArtwork, setOfficialArtwork] = useState<string | null>(null);
  const [shinyArtwork, setShinyArtwork] = useState<string | null>(null);
  const [abilities, setAbilities] = useState<{
    normal: string[];
    hidden: string[];
  }>({ normal: [], hidden: [] });
  const [megaForms, setMegaForms] = useState<MegaForm[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [smogonNature, setSmogonNature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "mega">("overview");
  const [activeMegaIndex, setActiveMegaIndex] = useState(0);
  const [shinyIds, setShinyIds] = useState<Set<number>>(new Set());
  const [hiddenAbilityIds, setHiddenAbilityIds] = useState<Set<number>>(
    new Set(),
  );
  const preferencesLoadedRef = useRef(false);
  const persistTimeoutRef = useRef<number | null>(null);

  const activeMega = megaForms[activeMegaIndex];
  const isMega = activeTab === "mega" && Boolean(activeMega);
  const activeStats = useMemo(
    () => (isMega && activeMega ? activeMega.stats : pokemon.stats),
    [isMega, activeMega, pokemon.stats],
  );
  const activeTypes = useMemo(
    () => (isMega && activeMega ? activeMega.types : pokemon.types),
    [isMega, activeMega, pokemon.types],
  );
  const activeAbilities =
    isMega && activeMega ? activeMega.abilities : abilities;
  const activeName = isMega && activeMega ? activeMega.name : pokemon.name;
  const activeArtwork =
    isMega && activeMega
      ? activeMega.officialArtwork || activeMega.sprite
      : officialArtwork || pokemon.sprite;
  const activeShinyArtwork =
    isMega && activeMega ? activeMega.shinyArtwork : shinyArtwork;
  const showShiny = Boolean(activeShinyArtwork);
  const activeSmogonNature = isMega ? activeMega?.smogonNature : smogonNature;

  const caught = caughtIds.includes(pokemon.id);
  const recommendation = useMemo(
    () => getRecommendations(activeStats),
    [activeStats],
  );
  const competitiveExtras = useMemo(
    () => getCompetitiveExtras(activeStats),
    [activeStats],
  );
  const weaknesses = useMemo(() => getWeaknesses(activeTypes), [activeTypes]);
  const eggMoveEntry = useMemo(
    () => getEggMoveEntry(pokemon.name),
    [pokemon.name],
  );
  const evolutionChainNames = useMemo(
    () => [pokemon.name, ...evolutions.map((evo) => evo.name)],
    [pokemon.name, evolutions],
  );
  const lowerEvolutionNames = useMemo(
    () => evolutions.map((evo) => evo.name),
    [evolutions],
  );
  const hiddenAbilityChain = useMemo(
    () =>
      evolutionChainNames
        .map((name) => ({
          name,
          rec: getHiddenAbilityRecommendation(name),
        }))
        .filter((entry) => Boolean(entry.rec)),
    [evolutionChainNames],
  );
  const hiddenAbilityLowerChain = useMemo(
    () =>
      lowerEvolutionNames
        .map((name) => ({
          name,
          rec: getHiddenAbilityRecommendation(name),
        }))
        .filter((entry) => Boolean(entry.rec)),
    [lowerEvolutionNames],
  );
  const hiddenAbilityNotes = useMemo(() => {
    const notes = hiddenAbilityChain
      .map((entry) => entry.rec?.note)
      .filter(Boolean) as string[];
    return Array.from(new Set(notes));
  }, [hiddenAbilityChain]);
  const hiddenAbilityLowerNotes = useMemo(() => {
    const notes = hiddenAbilityLowerChain
      .map((entry) => entry.rec?.note)
      .filter(Boolean) as string[];
    return Array.from(new Set(notes));
  }, [hiddenAbilityLowerChain]);
  const prefersNonMega = useMemo(
    () =>
      hiddenAbilityNotes.some((note) =>
        note.toLowerCase().includes("non-mega"),
      ),
    [hiddenAbilityNotes],
  );
  const megaStoneItems = useMemo(() => {
    if (!megaForms.length) return [];
    const mapped = megaForms
      .map((form) => ({
        name: getMegaStoneName(pokemon.name, form.name),
        suggested: Boolean(form.smogonRecommended) && !prefersNonMega,
      }))
      .filter((item) => item.name);

    const deduped = new Map<string, boolean>();
    mapped.forEach((item) => {
      const prev = deduped.get(item.name);
      deduped.set(item.name, Boolean(prev) || item.suggested);
    });

    return Array.from(deduped.entries()).map(([name, suggested]) => ({
      name,
      suggested,
    }));
  }, [megaForms, pokemon.name, prefersNonMega]);
  const hasHiddenAbility = activeAbilities.hidden.length > 0;
  const shouldRecommendHiddenAbility =
    !isMega && hasHiddenAbility && hiddenAbilityChain.length > 0;

  useEffect(() => {
    const fetchArtwork = async () => {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const res = await fetch(`/api/pokemon/${pokemon.id}?v=2`);
        if (!res.ok) {
          setDetailsError("Failed to load Pokémon details.");
          return;
        }
        const data = await res.json();

        const artwork = data.officialArtwork || data.sprite || "";
        const shinyArt = data.shinyArtwork || "";
        if (artwork) {
          setOfficialArtwork(artwork);
          const main = document.querySelector("main");
          if (main) {
            (main as HTMLElement).style.backgroundImage = `url('${artwork}')`;
            (main as HTMLElement).style.backgroundSize = "contain";
            (main as HTMLElement).style.backgroundRepeat = "no-repeat";
            (main as HTMLElement).style.backgroundPosition = "right center";
            (main as HTMLElement).style.backgroundAttachment = "fixed";
          }
        }
        if (shinyArt) {
          setShinyArtwork(shinyArt);
        }
        setAbilities(data.abilities || { normal: [], hidden: [] });
        setEvolutions(data.evolutions || []);
        setMegaForms(Array.isArray(data.megaForms) ? data.megaForms : []);
        setSmogonNature(
          typeof data.smogonNature === "string" ? data.smogonNature : null,
        );
      } catch {
        setDetailsError("Failed to load Pokémon details.");
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchArtwork();
  }, [pokemon.id]);

  useEffect(() => {
    setActiveTab("overview");
    setActiveMegaIndex(0);
  }, [pokemon.id]);

  useEffect(() => {
    if (megaForms.length === 0 && activeTab === "mega") {
      setActiveTab("overview");
    }
    if (activeMegaIndex >= megaForms.length) {
      setActiveMegaIndex(0);
    }
  }, [megaForms, activeTab, activeMegaIndex]);

  useEffect(() => {
    let cancelled = false;
    const loadPreferences = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setShinyIds(new Set<number>(data.shinyIds ?? []));
        setHiddenAbilityIds(new Set<number>(data.hiddenAbilityIds ?? []));
        preferencesLoadedRef.current = true;
      } catch {
        // ignore
      }
    };
    loadPreferences();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!preferencesLoadedRef.current) return;
    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shinyIds: Array.from(shinyIds),
          hiddenAbilityIds: Array.from(hiddenAbilityIds),
        }),
      }).catch(() => {});
    }, 400);

    return () => {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [shinyIds, hiddenAbilityIds]);

  const handleToggle = useCallback(async () => {
    if (loading || busy) return;
    setBusy(true);
    try {
      await toggleCaught(pokemon.id);
    } finally {
      setBusy(false);
    }
  }, [pokemon.id, toggleCaught, loading, busy]);

  const toggleShiny = async () => {
    if (!caughtIds.includes(pokemon.id)) {
      await toggleCaught(pokemon.id);
    }

    setShinyIds((prev) => {
      const next = new Set(prev);
      if (next.has(pokemon.id)) {
        next.delete(pokemon.id);
      } else {
        next.add(pokemon.id);
      }
      return next;
    });
  };

  const toggleHiddenAbility = async () => {
    if (!caughtIds.includes(pokemon.id)) {
      await toggleCaught(pokemon.id);
    }

    setHiddenAbilityIds((prev) => {
      const next = new Set(prev);
      const chainIds = [pokemon.id, ...evolutions.map((evo) => evo.id)];
      const shouldEnable = !next.has(pokemon.id);
      chainIds.forEach((id) => {
        if (shouldEnable) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {megaForms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              activeTab === "overview"
                ? "bg-[var(--pokedex-screen)] text-zinc-900"
                : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mega")}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              activeTab === "mega"
                ? "bg-rose-600 text-white"
                : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
            }`}
          >
            Mega
          </button>
          {activeTab === "mega" && megaForms.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {megaForms.map((form, index) => {
                const label = form.name.startsWith(pokemon.name)
                  ? form.name.replace(`${pokemon.name} `, "")
                  : form.name;
                return (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => setActiveMegaIndex(index)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      activeMegaIndex === index
                        ? "border-rose-400 bg-rose-500/20 text-rose-100"
                        : "border-zinc-700/70 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/70"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {error && (
          <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <div className="flex flex-col items-center gap-4 md:w-72">
          <div className="flex w-full flex-col items-center rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-6">
            {activeArtwork ? (
              <Image
                src={
                  shinyIds.has(pokemon.id)
                    ? activeShinyArtwork || activeArtwork
                    : activeArtwork
                }
                alt={activeName}
                width={192}
                height={192}
                className="h-48 w-48 object-contain"
              />
            ) : (
              <span className="text-8xl text-zinc-600">?</span>
            )}
            {(showShiny || activeAbilities.hidden.length > 0) && (
              <div className="mt-4 flex w-full gap-2">
                {showShiny && (
                  <button
                    type="button"
                    onClick={toggleShiny}
                    className={`flex-1 rounded-lg py-2 font-semibold transition border-2 flex items-center justify-center ${
                      shinyIds.has(pokemon.id)
                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/60"
                        : "bg-zinc-800/40 border-red-400 hover:bg-red-600/10"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70`}
                    title="Toggle Shiny"
                    aria-label={`Toggle shiny for ${activeName}`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        shinyIds.has(pokemon.id) ? "fill-white" : "fill-red-500"
                      }`}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                )}
                {activeAbilities.hidden.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleHiddenAbility}
                    className={`flex-1 rounded-lg py-2 font-semibold transition border-2 flex items-center justify-center ${
                      hiddenAbilityIds.has(pokemon.id)
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/60"
                        : "bg-zinc-800/40 border-green-400 hover:bg-green-600/10"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70`}
                    title="Toggle Hidden Ability"
                    aria-label={`Toggle hidden ability for ${activeName}`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        hiddenAbilityIds.has(pokemon.id)
                          ? "fill-white"
                          : "fill-green-500"
                      }`}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p className="mt-2 font-mono text-zinc-500">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
            <div className="flex items-center gap-2">
              <p className="max-w-[12.5rem] truncate text-center text-xl font-bold text-white sm:text-2xl">
                {activeName}
              </p>
              {isMega && (
                <span className="rounded-full bg-rose-600/20 px-2 py-0.5 text-xs font-semibold text-rose-200">
                  Mega
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {activeTypes.map((t) => (
                <span
                  key={t}
                  className={`rounded px-2 py-1 text-sm font-medium ${getTypeClass(
                    t,
                  )}`}
                >
                  {t}
                </span>
              ))}
            </div>
            <button
              type="button"
              disabled={loading || busy}
              onClick={handleToggle}
              className={`mt-4 w-full rounded-lg py-2 font-medium transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 ${
                caught
                  ? "bg-[var(--pokedex-screen)] text-zinc-900"
                  : "bg-zinc-600 text-zinc-300 hover:bg-zinc-500"
              }`}
            >
              {busy ? "…" : caught ? "Caught ✓" : "Mark as Caught"}
            </button>
          </div>

          {activeTab === "overview" && pokemon.obtainingMethod && (
            <div className="w-full rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-4">
              <h3 className="mb-2 text-lg font-semibold text-[var(--pokedex-screen)]">
                Obtained
              </h3>
              <p className="text-sm text-zinc-200">{pokemon.obtainingMethod}</p>
            </div>
          )}

          {detailsLoading && (
            <div className="w-full rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-4">
              <div className="h-5 w-28 rounded bg-zinc-700/70 animate-pulse" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`evo-skeleton-${i}`}
                    className="h-24 rounded-lg bg-zinc-700/70 animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}
          {!detailsLoading && evolutions.length > 0 && (
            <div className="w-full rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-4">
              <h3 className="mb-3 text-lg font-semibold text-[var(--pokedex-screen)]">
                Evolutions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {evolutions.map((evo) => (
                  <Link
                    key={evo.id}
                    href={`/pokedex/${evo.id}`}
                    className="flex flex-col items-center rounded-lg bg-zinc-900/60 p-2 transition hover:bg-zinc-800 cursor-pointer"
                  >
                    {evo.sprite ? (
                      <Image
                        src={evo.sprite}
                        alt={evo.name}
                        width={80}
                        height={80}
                        className="h-16 w-16 object-contain mb-1"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center text-xl text-zinc-600 mb-1">
                        ?
                      </div>
                    )}
                    <p className="text-xs font-semibold text-white text-center">
                      {evo.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      #{String(evo.id).padStart(3, "0")}
                    </p>
                    {evo.types.length > 0 && (
                      <div className="mt-1 flex gap-1 flex-wrap justify-center">
                        {evo.types.map((t) => (
                          <span
                            key={t}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getTypeClass(
                              t,
                            )}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[var(--pokedex-screen)]">
                Competitive (SV Singles)
              </h3>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                Suggested set
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-900/60 px-3 py-2">
                  <span className="text-zinc-400">Role</span>
                  <span className="font-semibold text-white">
                    {recommendation.role}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-900/60 px-3 py-2">
                  <span className="text-zinc-400">Nature</span>
                  <span className="font-semibold text-white">
                    {activeSmogonNature ?? recommendation.nature}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-900/60 px-3 py-2">
                  <span className="text-zinc-400">EVs</span>
                  <span className="font-mono text-zinc-200">
                    {recommendation.evs}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-900/60 px-3 py-2">
                  <span className="text-zinc-400">IVs</span>
                  <span className="font-mono text-zinc-200">
                    {recommendation.ivs}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {!isMega && (
                  <div className="rounded-lg bg-zinc-900/60 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Items
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {competitiveExtras.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                        >
                          {item}
                        </span>
                      ))}
                      {megaStoneItems.map((stone) => (
                        <span
                          key={stone.name}
                          className={
                            stone.suggested
                              ? "rounded-full border border-rose-500/60 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-100"
                              : "rounded-full border border-zinc-700/80 bg-zinc-800/70 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                          }
                        >
                          {stone.name}
                          {stone.suggested ? " · Suggested" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!isMega && (
                  <div className="rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Hidden Ability
                    </p>
                    {shouldRecommendHiddenAbility ? (
                      <div className="mt-2 space-y-1">
                        <p className="font-semibold text-emerald-200">
                          Yes — {activeAbilities.hidden.join(", ")}
                        </p>
                        {hiddenAbilityLowerChain.length > 0 && (
                          <p className="text-xs text-emerald-200/80">
                            Applies to:{" "}
                            {hiddenAbilityLowerChain
                              .map((e) => e.name)
                              .join(", ")}
                          </p>
                        )}
                        {hiddenAbilityNotes.length > 0 && (
                          <p className="text-xs text-emerald-200/80">
                            Recommended: {hiddenAbilityNotes.join(" · ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-zinc-400">
                        Hidden Ability isn’t required for this set.
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-zinc-400">{recommendation.note}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-3">
              <h3 className="mb-3 text-lg font-semibold text-[var(--pokedex-screen)]">
                Type Counters
              </h3>
              {weaknesses.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map((t) => (
                    <span
                      key={t}
                      className={`rounded px-2 py-1 text-sm font-medium ${getTypeClass(
                        t,
                      )}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No major weaknesses.</p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-3">
              <h3 className="mb-2 text-lg font-semibold text-[var(--pokedex-screen)]">
                Abilities
              </h3>
              {detailsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`ability-skeleton-${i}`}
                      className="h-7 w-24 rounded bg-zinc-700/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {activeAbilities.normal.map((a) => (
                    <li
                      key={a}
                      className="rounded bg-zinc-700 px-2 py-1 text-sm text-zinc-200"
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </li>
                  ))}
                  {activeAbilities.hidden.map((a) => (
                    <li
                      key={a}
                      className="rounded bg-amber-600/80 px-2 py-1 text-sm text-amber-50 font-semibold border border-amber-500/50"
                      title="Hidden Ability"
                    >
                      ✨ {a.charAt(0).toUpperCase() + a.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {!isMega && eggMoveEntry && (
            <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-3">
              <h3 className="mb-2 text-lg font-semibold text-[var(--pokedex-screen)]">
                Egg Moves
              </h3>
              <p className="text-xs text-zinc-400">
                Egg Groups: {eggMoveEntry.eggGroups}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {eggMoveEntry.moves.map((move) => (
                  <li
                    key={move}
                    className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-100"
                  >
                    {move}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/60 p-4">
            <h3 className="mb-4 text-lg font-semibold text-[var(--pokedex-screen)]">
              Stats
            </h3>
            <ul className="space-y-2">
              {activeStats.map((s) => {
                const statPercent = Math.min(100, (s.value / 255) * 100);
                return (
                  <li
                    key={s.name}
                    className="rounded-lg bg-zinc-900/60 px-3 py-2"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                      <span className="uppercase tracking-wide">{s.name}</span>
                      <span className="font-mono text-zinc-200">{s.value}</span>
                    </div>
                    <progress
                      value={statPercent}
                      max={100}
                      className="stat-progress"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          {detailsError && (
            <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-200">
              {detailsError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
