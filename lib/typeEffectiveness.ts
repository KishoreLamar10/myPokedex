export const TYPE_COLORS: Record<string, string> = {
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

export const TYPE_CHART: Record<string, Record<string, number>> = {
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

export function getTypeClass(type: string) {
  return TYPE_COLORS[type] ?? "bg-zinc-500 text-white";
}

export function getWeaknesses(types: string[]) {
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
    .map(([type, multiplier]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      multiplier,
    }));
}

export function getStrengths(types: string[]) {
  const typeKeys = types.map((t) => t.toLowerCase());
  const strengths: Array<{ type: string; multiplier: number }> = [];
  const seen = new Set<string>();

  typeKeys.forEach((attackType) => {
    const chart = TYPE_CHART[attackType];
    if (!chart) return;
    Object.entries(chart).forEach(([defType, multiplier]) => {
      if (multiplier >= 2) {
        const typeName = defType.charAt(0).toUpperCase() + defType.slice(1);
        if (!seen.has(typeName)) {
          strengths.push({ type: typeName, multiplier });
          seen.add(typeName);
        }
      }
    });
  });

  return strengths.sort((a, b) => a.type.localeCompare(b.type));
}

export function getEffectivenessData(types: string[]) {
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

  const categorized = {
    weak: [] as Array<{ type: string; multiplier: number }>,
    resistant: [] as Array<{ type: string; multiplier: number }>,
    immune: [] as Array<{ type: string; multiplier: number }>,
  };

  Object.entries(multipliers).forEach(([type, mult]) => {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    const data = { type: typeName, multiplier: mult };
    if (mult > 1) {
      categorized.weak.push(data);
    } else if (mult === 0) {
      categorized.immune.push(data);
    } else if (mult < 1) {
      categorized.resistant.push(data);
    }
  });

  categorized.weak.sort((a, b) => b.multiplier - a.multiplier);
  categorized.resistant.sort((a, b) => a.multiplier - b.multiplier);
  categorized.immune.sort((a, b) => a.type.localeCompare(b.type));

  return categorized;
}
