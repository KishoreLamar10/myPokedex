"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCaught } from "@/components/CaughtProvider";
import { getEggMoveEntry } from "@/lib/eggMoves";
import { getHiddenAbilityRecommendation } from "@/lib/hiddenAbilities";
import type { Evolution, PokemonVariety, PokemonDetail } from "@/types/pokemon";
import type { PokemonMoveSet } from "@/types/move";
import {
  TYPE_COLORS,
  TYPE_CHART,
  getTypeClass,
  getEffectivenessData,
  getStrengths,
} from "@/lib/typeEffectiveness";
import { fetchPokemonMoves } from "@/lib/moveData";
import { MovesTimeline } from "@/components/MovesTimeline";
import { TMCompatibility } from "@/components/TMCompatibility";
import { MoveCard } from "@/components/MoveCard";


const TYPE_GRADIENTS: Record<string, string> = {
  Normal: "from-zinc-500/20 via-zinc-400/10 to-transparent",
  Fire: "from-orange-600/40 via-orange-500/20 to-transparent",
  Water: "from-blue-600/40 via-blue-500/20 to-transparent",
  Electric: "from-yellow-400/40 via-yellow-300/20 to-transparent",
  Grass: "from-green-600/40 via-green-500/20 to-transparent",
  Ice: "from-cyan-400/40 via-cyan-300/20 to-transparent",
  Fighting: "from-red-700/40 via-red-600/20 to-transparent",
  Poison: "from-purple-600/40 via-purple-500/20 to-transparent",
  Ground: "from-amber-700/40 via-amber-600/20 to-transparent",
  Flying: "from-indigo-400/40 via-indigo-300/20 to-transparent",
  Psychic: "from-pink-600/40 via-pink-500/20 to-transparent",
  Bug: "from-lime-600/40 via-lime-500/20 to-transparent",
  Rock: "from-stone-600/40 via-stone-500/20 to-transparent",
  Ghost: "from-violet-800/40 via-violet-700/20 to-transparent",
  Dragon: "from-indigo-700/40 via-indigo-600/20 to-transparent",
  Dark: "from-zinc-900/60 via-zinc-800/30 to-transparent",
  Steel: "from-zinc-400/40 via-zinc-300/20 to-transparent",
  Fairy: "from-pink-400/40 via-pink-300/20 to-transparent",
};


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

function RadarChart({ stats, colorClass }: { stats: { name: string; value: number }[]; colorClass: string }) {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  const maxStat = 255;

  const points = stats.map((stat, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const valueRadius = (stat.value / maxStat) * radius;
    const x = center + valueRadius * Math.cos(angle);
    const y = center + valueRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const axisPoints = stats.map((_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Outer Hexagon Background */}
        <polygon
          points={axisPoints.map(p => `${p.x},${p.y}`).join(" ")}
          className="fill-zinc-800/30 stroke-zinc-700/20 stroke-1"
        />

        {/* Connection Polygons (Grid rings) */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={stats.map((_, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const x = center + radius * scale * Math.cos(angle);
              const y = center + radius * scale * Math.sin(angle);
              return `${x},${y}`;
            }).join(" ")}
            className="fill-none stroke-zinc-400/10 stroke-[1]"
          />
        ))}

        {/* Axis Lines */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            className="stroke-zinc-400/10 stroke-[1]"
          />
        ))}

        {/* Data Polygon */}
        <polygon
          points={points}
          className={`${colorClass} fill-current fill-opacity-40 stroke-current stroke-2 transition-all duration-700 ease-in-out`}
        />
        
        {/* Labels */}
        {stats.map((stat, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const labelRadius = radius + 30;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          
          // Simplified labels: HP, ATK, DEF, SPA, SPD, SPE
          const shortName = stat.name.toLowerCase() === "hp" ? "HP" : 
                           stat.name.toLowerCase().includes("special attack") ? "SPA" :
                           stat.name.toLowerCase().includes("special defense") ? "SPD" :
                           stat.name.toUpperCase().substring(0, 3);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-400 text-[9px] font-black uppercase tracking-widest pointer-events-none"
            >
              <tspan x={x} dy="-0.6em">{shortName}</tspan>
              <tspan x={x} dy="1.4em" className="fill-white font-mono text-xs">{stat.value}</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
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
  const [varieties, setVarieties] = useState<PokemonVariety[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [smogonNature, setSmogonNature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "pro">("stats");
  const [activeVarietyIndex, setActiveVarietyIndex] = useState(-1); // -1 for Base
  const [shinyIds, setShinyIds] = useState<Set<number>>(new Set());
  const [hiddenAbilityIds, setHiddenAbilityIds] = useState<Set<number>>(
    new Set(),
  );
  const [movesTab, setMovesTab] = useState<"level-up" | "tm" | "egg" | "tutor">("level-up");
  const [pokemonMoves, setPokemonMoves] = useState<PokemonMoveSet | null>(null);
  const [movesLoading, setMovesLoading] = useState(false);
  const preferencesLoadedRef = useRef(false);
  const persistTimeoutRef = useRef<number | null>(null);

  const activeVariety = activeVarietyIndex !== -1 ? varieties[activeVarietyIndex] : null;
  const isVariety = activeVarietyIndex !== -1 && Boolean(activeVariety);
  const activeStats = useMemo(
    () => (isVariety && activeVariety ? activeVariety.stats : pokemon.stats),
    [isVariety, activeVariety, pokemon.stats],
  );
  const activeTypes = useMemo(
    () => (isVariety && activeVariety ? activeVariety.types : pokemon.types),
    [isVariety, activeVariety, pokemon.types],
  );
  const activeAbilities =
    isVariety && activeVariety ? activeVariety.abilities : abilities;
  const activeName = isVariety && activeVariety ? activeVariety.name : pokemon.name;
  const activeArtwork =
    isVariety && activeVariety
      ? activeVariety.officialArtwork || activeVariety.sprite
      : officialArtwork || pokemon.sprite;
  const activeShinyArtwork =
    isVariety && activeVariety ? activeVariety.shinyArtwork : shinyArtwork;
  const showShiny = Boolean(activeShinyArtwork);
  const activeSmogonNature = isVariety && activeVariety ? activeVariety.smogonNature : smogonNature;

  const primaryType = activeTypes[0];
  const typeGradient =
    TYPE_GRADIENTS[primaryType] ||
    "from-zinc-800/20 via-zinc-800/10 to-transparent";

  const caught = caughtIds.includes(pokemon.id);
  const recommendation = useMemo(
    () => getRecommendations(activeStats),
    [activeStats],
  );
  const competitiveExtras = useMemo(
    () => getCompetitiveExtras(activeStats),
    [activeStats],
  );
  const effectiveness = useMemo(() => getEffectivenessData(activeTypes), [activeTypes]);
  const strengths = useMemo(() => getStrengths(activeTypes), [activeTypes]);
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
        note.toLowerCase().includes("non-variety"),
      ),
    [hiddenAbilityNotes],
  );
  const megaStoneItems = useMemo(() => {
    if (!varieties.length) return [];
    const mapped = varieties
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
  }, [varieties, pokemon.name, prefersNonMega]);
  const hasHiddenAbility = activeAbilities.hidden.length > 0;
  const shouldRecommendHiddenAbility =
    !isVariety && hasHiddenAbility && hiddenAbilityChain.length > 0;

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
        setVarieties(Array.isArray(data.varieties) ? data.varieties : []);
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
    setActiveTab("stats");
    setActiveVarietyIndex(-1);
  }, [pokemon.id]);

  useEffect(() => {
    if (activeVarietyIndex >= varieties.length) {
      setActiveVarietyIndex(-1);
    }
  }, [varieties, activeVarietyIndex]);

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
    <div
      className={`relative min-h-screen space-y-3 pt-3 transition-all duration-700 bg-gradient-to-br ${typeGradient} bg-fixed animate-in fade-in slide-in-from-bottom-2`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800 w-fit">
          <button
            type="button"
            onClick={() => {
              setActiveTab("stats");
              setActiveVarietyIndex(-1);
            }}
            className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "stats" && activeVarietyIndex === -1
                ? "bg-zinc-100 text-zinc-900 shadow-lg"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            Base
          </button>

          {varieties.map((form, index) => {
            let label = form.name.replace(pokemon.name, "").trim();
            if (!label) label = "Form";
            
            label = label.replace(/Alolan/i, "Alola");
            label = label.replace(/Galarian/i, "Galar");
            label = label.replace(/Hisuian/i, "Hisui");
            label = label.replace(/Paldean/i, "Paldea");

            return (
              <button
                key={form.id}
                type="button"
                onClick={() => {
                  setActiveTab("stats");
                  setActiveVarietyIndex(index);
                }}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "stats" && activeVarietyIndex === index
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                {label}
              </button>
            );
          })}

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          <button
            type="button"
            onClick={() => setActiveTab("pro")}
            className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "pro"
                ? "bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30 font-black"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            Pro
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-3 md:w-64">
          <div className="flex w-full flex-col items-center rounded-xl border-2 border-[var(--pokedex-border)] bg-zinc-800/80 p-4">
            {activeArtwork ? (
              <Image
                src={
                  shinyIds.has(pokemon.id)
                    ? activeShinyArtwork || activeArtwork
                    : activeArtwork
                }
                alt={activeName}
                width={144}
                height={144}
                className="h-36 w-36 object-contain"
              />
            ) : (
              <span className="text-8xl text-zinc-600">?</span>
            )}
            {(showShiny || activeAbilities.hidden.length > 0) && (
              <div className="mt-3 flex w-full gap-2">
                {showShiny && (
                  <button
                    type="button"
                    onClick={toggleShiny}
                    className={`flex-1 rounded-lg py-1.5 font-semibold transition border flex items-center justify-center ${
                      shinyIds.has(pokemon.id)
                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/60"
                        : "bg-zinc-800/40 border-red-400 hover:bg-red-600/10 text-red-100"
                    } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400/70`}
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
                    className={`flex-1 rounded-lg py-1.5 font-semibold transition border flex items-center justify-center ${
                      hiddenAbilityIds.has(pokemon.id)
                        ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/60"
                        : "bg-zinc-800/40 border-green-400 hover:bg-green-600/10 text-green-100"
                    } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400/70`}
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
            <p className="mt-1.5 font-mono text-xs text-zinc-500">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
            <div className="flex items-center gap-2">
              <p className="max-w-[12.5rem] truncate text-center text-lg font-bold text-white">
                {activeName}
              </p>
              {isVariety && (
                <span className="rounded-full bg-rose-600/20 px-2 py-0.5 text-xs font-semibold text-rose-200">
                  Form
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
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
              className={`mt-4 w-full rounded-lg py-2 text-sm font-medium transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokedex-red)]/70 ${
                caught
                  ? "bg-[var(--pokedex-screen)] text-zinc-900"
                  : "bg-zinc-600 text-zinc-300 hover:bg-zinc-500"
              }`}
            >
              {busy ? "…" : caught ? "Caught ✓" : "Mark as Caught"}
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {activeTab === "stats" ? (
            <div className="space-y-3">
              {/* SYNTHESIZED DATA DASHBOARD */}

              {/* SYNTHESIZED DATA DASHBOARD */}
              <div className="grid gap-4 grid-cols-1 xl:grid-cols-5">
                {/* RADAR CHART - Takes 1 column on wide, full on mobile */}
                <div className="xl:col-span-2 rounded-xl border border-[var(--pokedex-border)] bg-zinc-900/40 p-3 shadow-inner flex flex-col items-center justify-center min-h-[320px]">
                    <h3 className="w-full mb-1.5 text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                        Base Stats
                        <span className="text-[9px] font-normal lowercase">Spider Visualization</span>
                    </h3>
                    <RadarChart 
                      stats={activeStats} 
                      colorClass={primaryType === 'Normal' ? 'text-zinc-400' : (getTypeClass(primaryType).split(' ').find(c => c.startsWith('bg-'))?.replace('bg-', 'text-') || 'text-rose-500')} 
                    />
                </div>

                {/* TYPE ANALYSIS GRID - Takes 4 columns on desktop, 3 on xl */}
                <div className="xl:col-span-3 grid gap-3 grid-cols-1 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-3 shadow-inner">
                    <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-between">
                      Weak to
                      <span className="text-[9px] font-normal lowercase text-zinc-500">2x/4x</span>
                    </h3>
                    {effectiveness.weak.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {effectiveness.weak.map((w) => (
                          <span
                            key={w.type}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase shadow-sm ${getTypeClass(
                              w.type,
                            )} transition-transform hover:scale-105`}
                          >
                            <span>{w.type}</span>
                            <span className="opacity-90 text-[10px] bg-black/20 px-1.5 rounded font-mono">{w.multiplier}x</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">No weaknesses.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4 shadow-inner">
                    <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-between">
                      Resistant
                      <span className="text-[9px] font-normal lowercase text-zinc-500">0.5x/0.25x</span>
                    </h3>
                    {effectiveness.resistant.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {effectiveness.resistant.map((r) => (
                          <span
                            key={r.type}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase shadow-sm ${getTypeClass(
                              r.type,
                            )} transition-transform hover:scale-105`}
                          >
                            <span>{r.type}</span>
                            <span className="opacity-90 text-[10px] bg-black/20 px-1.5 rounded font-mono">{r.multiplier}x</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">No resists.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4 shadow-inner">
                    <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center justify-between">
                      Immune
                      <span className="text-[9px] font-normal lowercase text-zinc-500">0x</span>
                    </h3>
                    {effectiveness.immune.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {effectiveness.immune.map((i) => (
                          <span
                            key={i.type}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase shadow-sm ${getTypeClass(
                              i.type,
                            )} transition-transform hover:scale-105`}
                          >
                            <span>{i.type}</span>
                            <span className="opacity-90 text-[10px] bg-black/20 px-1.5 rounded font-mono">0x</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">No immunities.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/50 p-4 shadow-inner">
                    <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center justify-between">
                      Offense
                      <span className="text-[9px] font-normal lowercase text-zinc-500">Coverage</span>
                    </h3>
                    {strengths.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {strengths.map((s) => (
                          <span
                            key={s.type}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase shadow-sm ${getTypeClass(
                              s.type,
                            )} transition-transform hover:scale-105`}
                          >
                            <span>{s.type}</span>
                            <span className="opacity-90 text-[10px] bg-black/20 px-1.5 rounded font-mono">2x</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">No coverage.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeVarietyIndex === -1 && pokemon.obtainingMethod && (
                  <div className="rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/60 p-4">
                    <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-[var(--pokedex-screen)]">
                      Obtained
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">{pokemon.obtainingMethod}</p>
                  </div>
                )}

                {!detailsLoading && evolutions.length > 0 && (
                  <div className={`rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/60 p-4 ${activeVarietyIndex !== -1 || !pokemon.obtainingMethod ? 'md:col-span-2' : ''}`}>
                    <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-[var(--pokedex-screen)]">
                      Evolutions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {evolutions.map((evo) => (
                        <Link
                          key={evo.id}
                          href={`/pokedex/${evo.id}`}
                          className="flex items-center gap-3 rounded-xl bg-zinc-900/40 p-2 border border-zinc-800/50 transition hover:bg-zinc-800 hover:border-zinc-700 min-w-[140px]"
                        >
                          <div className="h-10 w-10 flex-shrink-0">
                            {evo.sprite ? (
                              <Image
                                src={evo.sprite}
                                alt={evo.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600 bg-zinc-800 rounded">?</div>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white truncate leading-tight">{evo.name}</p>
                            <p className="text-[9px] font-mono text-zinc-500">#{String(evo.id).padStart(3, "0")}</p>
                            <div className="mt-0.5 flex gap-1">
                              {evo.types.slice(0, 1).map((t) => (
                                <span key={t} className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${getTypeClass(t)}`}>{t}</span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {detailsLoading && (
                  <div className="md:col-span-2 rounded-xl border border-[var(--pokedex-border)] bg-zinc-800/60 p-4">
                    <div className="h-4 w-24 rounded bg-zinc-700/70 animate-pulse mb-3" />
                    <div className="flex gap-3">
                       {[1, 2, 3].map(i => <div key={i} className="h-14 w-32 rounded-xl bg-zinc-800 animate-pulse" />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PRO TAB CONTENT */
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="rounded-2xl border border-[var(--pokedex-border)] bg-zinc-900/60 p-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-lg font-bold text-[var(--pokedex-screen)] flex items-center gap-2">
                      <span className="text-amber-500 italic text-sm">✨</span> Pro Analysis
                      <span className="text-[10px] font-normal text-zinc-500 lowercase">(SV Singles)</span>
                    </h3>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                      Suggested Set
                    </span>
                  </div>
                  
                  <div className="grid gap-4 lg:grid-cols-5">
                    {/* SPECS COLUMN */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-zinc-800/40 p-2 border border-zinc-700/30">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Role</p>
                          <p className="text-xs font-bold text-white truncate">{recommendation.role}</p>
                        </div>
                        <div className="rounded-lg bg-zinc-800/40 p-2 border border-zinc-700/30">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Nature</p>
                          <p className="text-xs font-bold text-white truncate">{activeSmogonNature ?? recommendation.nature}</p>
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-zinc-800/40 p-2 border border-zinc-700/30">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">EV Spread</p>
                        <p className="text-[11px] font-mono text-zinc-200">{recommendation.evs}</p>
                      </div>

                      <div className="rounded-lg bg-zinc-800/40 p-2 border border-zinc-700/30">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Preferred Items</p>
                        <div className="mt-1 flex flex-wrap gap-1.5 font-bold uppercase">
                          {competitiveExtras.items.map((item) => (
                            <span key={item} className="text-[9px] text-zinc-100 bg-zinc-700/50 px-1.5 py-0.5 rounded-md border border-zinc-600/30">
                              {item}
                            </span>
                          ))}
                          {megaStoneItems.map((stone) => (
                            <span key={stone.name} className={`text-[9px] px-1.5 py-0.5 rounded-md border ${stone.suggested ? 'text-rose-100 bg-rose-500/20 border-rose-500/40' : 'text-zinc-100 bg-zinc-700/50 border-zinc-600/30'}`}>
                              {stone.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-500 italic leading-relaxed px-1">Note: {recommendation.note}</p>
                    </div>

                    {/* ABILITIES COLUMN */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Abilities</h4>
                          <div className="space-y-1.5">
                            {detailsLoading ? (
                                 Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="h-8 w-full rounded-md bg-zinc-800/60 animate-pulse" />
                                 ))
                            ) : (
                                activeAbilities.normal.map((a) => (
                                    <div key={a} className="px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-between group hover:border-zinc-500 transition-colors">
                                        <span className="text-[11px] font-bold text-zinc-100 group-hover:text-white uppercase tracking-tight">{a}</span>
                                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">BASE</span>
                                    </div>
                                ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-500 ml-1">Hidden Talent</h4>
                          {detailsLoading ? (
                              <div className="h-10 w-full rounded-md bg-zinc-800/60 animate-pulse" />
                          ) : activeAbilities.hidden.length > 0 ? (
                              activeAbilities.hidden.map((a) => (
                                  <div key={a} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                      <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-[11px] font-bold text-amber-200 uppercase tracking-tight">{a}</span>
                                          <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 py-0.5 rounded font-black uppercase tracking-widest">HIDDEN</span>
                                      </div>
                                      {shouldRecommendHiddenAbility && (
                                          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                              Recommended
                                          </div>
                                      )}
                                  </div>
                              ))
                          ) : (
                              <div className="p-2.5 rounded-lg bg-zinc-800/30 border border-dashed border-zinc-700 flex items-center justify-center">
                                  <span className="text-[10px] text-zinc-600 uppercase font-bold italic">No Hidden Ability</span>
                              </div>
                          )}
                        </div>
                      </div>

                      {!isVariety && eggMoveEntry && (
                        <div className="pt-3 border-t border-zinc-800/50">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                            Egg Moves <span className="text-zinc-500/50 font-normal normal-case">({eggMoveEntry.eggGroups})</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {eggMoveEntry.moves.map((move) => (
                              <span key={move} className="px-2 py-1 rounded bg-zinc-900/60 text-[9px] font-bold text-zinc-400 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                {move}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOVES SECTION */}
                  <div className="mt-6 pt-6 border-t border-zinc-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--pokedex-screen)] mb-4">
                      Moves & Learnset
                    </h3>

                    {/* Moves Tabs */}
                    <div className="flex flex-wrap gap-1.5 mb-4 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-800 w-fit">
                      <button
                        onClick={() => {
                          setMovesTab("level-up");
                          if (!pokemonMoves && !movesLoading) {
                            setMovesLoading(true);
                            fetchPokemonMoves(pokemon.id).then((data) => {
                              setPokemonMoves(data);
                              setMovesLoading(false);
                            });
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          movesTab === "level-up"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        Level-Up
                      </button>
                      <button
                        onClick={() => {
                          setMovesTab("tm");
                          if (!pokemonMoves && !movesLoading) {
                            setMovesLoading(true);
                            fetchPokemonMoves(pokemon.id).then((data) => {
                              setPokemonMoves(data);
                              setMovesLoading(false);
                            });
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          movesTab === "tm"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        TM/TR
                      </button>
                      <button
                        onClick={() => setMovesTab("egg")}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          movesTab === "egg"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        Egg
                      </button>
                      <button
                        onClick={() => {
                          setMovesTab("tutor");
                          if (!pokemonMoves && !movesLoading) {
                            setMovesLoading(true);
                            fetchPokemonMoves(pokemon.id).then((data) => {
                              setPokemonMoves(data);
                              setMovesLoading(false);
                            });
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          movesTab === "tutor"
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        Tutor
                      </button>
                    </div>

                    {/* Moves Content */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                      {movesLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-zinc-500">Loading moves...</p>
                        </div>
                      ) : pokemonMoves ? (
                        <>
                          {movesTab === "level-up" && (
                            <MovesTimeline moves={pokemonMoves.moves} pokemonName={pokemonMoves.pokemonName} />
                          )}
                          {movesTab === "tm" && (
                            <TMCompatibility moves={pokemonMoves.moves} pokemonName={pokemonMoves.pokemonName} />
                          )}
                          {movesTab === "egg" && (
                            <div className="space-y-2">
                              {pokemonMoves.moves.filter((m) => m.method === "egg").length > 0 ? (
                                pokemonMoves.moves
                                  .filter((m) => m.method === "egg")
                                  .map((learnedMove) => (
                                    <MoveCard
                                      key={learnedMove.move.id}
                                      move={learnedMove.move}
                                      variant="compact"
                                    />
                                  ))
                              ) : (
                                <p className="text-center py-8 text-zinc-500">No egg moves available</p>
                              )}
                            </div>
                          )}
                          {movesTab === "tutor" && (
                            <div className="space-y-2">
                              {pokemonMoves.moves.filter((m) => m.method === "tutor").length > 0 ? (
                                pokemonMoves.moves
                                  .filter((m) => m.method === "tutor")
                                  .map((learnedMove) => (
                                    <MoveCard
                                      key={learnedMove.move.id}
                                      move={learnedMove.move}
                                      variant="compact"
                                    />
                                  ))
                              ) : (
                                <p className="text-center py-8 text-zinc-500">No tutor moves available</p>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-zinc-500 mb-3">Click a tab to load moves</p>
                          <button
                            onClick={() => {
                              setMovesLoading(true);
                              fetchPokemonMoves(pokemon.id).then((data) => {
                                setPokemonMoves(data);
                                setMovesLoading(false);
                              });
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                          >
                            Load Moves
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          )}
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
