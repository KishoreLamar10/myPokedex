export type HiddenAbilityEntry = {
  species: string;
  note?: string;
  forms?: "both" | "alola" | "normal" | "male" | "female" | "galar";
};

const HIDDEN_ABILITIES: HiddenAbilityEntry[] = [
  // Starters
  { species: "blaziken" },
  { species: "chesnaught" },
  { species: "cinderace" },
  { species: "emboar" },
  { species: "feraligatr" },
  { species: "greninja", note: "HP Fire" },
  { species: "incineroar" },
  { species: "infernape", note: "Physical/atk MS" },
  { species: "inteleon" },
  { species: "meowscarada" },
  { species: "quaquaval" },
  { species: "rillaboom" },
  { species: "sceptile", note: "NM, HP Fire" },
  { species: "serperior", note: "HP Fire/Ice" },
  { species: "skeledirge" },
  { species: "typhlosion" },
  { species: "venusaur", note: "NM, HP Fire" },

  // Eeveelutions
  { species: "espeon" },
  { species: "flareon" },
  { species: "glaceon", note: "CB" },
  { species: "leafeon" },
  { species: "sylveon" },

  // Legendaries
  { species: "entei" },
  { species: "landorus", note: "HP Ice (Incarnate Form, 30 Atk)" },
  { species: "lugia" },
  { species: "moltres" },
  { species: "raikou", note: "HP Ice" },
  { species: "suicune" },
  { species: "zapdos", note: "HP Ice" },

  // Standard Pokemons
  { species: "alakazam" },
  { species: "alomomola" },
  { species: "amoonguss", note: "HP Fire" },
  { species: "breloom", note: "CB" },
  { species: "cinccino" },
  { species: "corsola", note: "Non Galar" },
  { species: "crawdaunt" },
  { species: "darmanitan", note: "Galar (MS)", forms: "galar" },
  { species: "diggersby" },
  { species: "dragalge" },
  { species: "dragonite" },
  { species: "excadrill" },
  { species: "froslass" },
  { species: "frosmoth" },
  { species: "garchomp" },
  { species: "gliscor" },
  { species: "gothitelle" },
  { species: "hatterene" },
  { species: "hitmonlee" },
  { species: "honchkrow" },
  { species: "illumise", note: "CB" },
  { species: "indeedee" },
  { species: "kingler" },
  { species: "liepard" },
  { species: "lokix" },
  { species: "lurantis" },
  { species: "luxray" },
  { species: "mamoswine" },
  { species: "maushold" },
  { species: "meowstic", note: "Male/Female", forms: "both" },
  { species: "mightyena" },
  { species: "nidoking" },
  { species: "nidoqueen" },
  { species: "ninetales", note: "Both Forms", forms: "both" },
  { species: "pincurchin" },
  { species: "politoed" },
  { species: "primeape" },
  { species: "pyukumuku" },
  { species: "quagsire" },
  { species: "qwilfish" },
  { species: "rampardos" },
  { species: "reuniclus" },
  { species: "rhyperior" },
  { species: "roserade", note: "HP Fire" },
  { species: "sableye" },
  { species: "salamence", note: "NM" },
  { species: "sandslash", note: "Both Forms", forms: "both" },
  { species: "scolipede" },
  { species: "sharpedo" },
  { species: "slowbro" },
  { species: "slowking" },
  { species: "slurpuff" },
  { species: "staraptor" },
  { species: "swoobat" },
  { species: "talonflame", note: "CB" },
  { species: "tangrowth", note: "HP Ice" },
  { species: "toxapex" },
  { species: "tyrantrum" },
  { species: "volbeat" },
  { species: "xatu" },

  // Forms mentioned as both
  { species: "raichu", note: "Both Forms", forms: "both" },
  { species: "diglett", note: "Both Forms", forms: "both" },
  { species: "grimer", note: "Both Forms", forms: "both" },
];

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFormTag(normalizedName: string) {
  if (normalizedName.includes("alola") || normalizedName.includes("alolan")) {
    return "alola" as const;
  }
  if (normalizedName.includes("galar") || normalizedName.includes("galarian")) {
    return "galar" as const;
  }
  if (normalizedName.includes("male")) {
    return "male" as const;
  }
  if (normalizedName.includes("female")) {
    return "female" as const;
  }
  return "normal" as const;
}

function stripFormWords(normalizedName: string) {
  return normalizedName
    .replace(/alola|alolan|galar|galarian/g, "")
    .replace(/male|female/g, "")
    .trim();
}

function expandNote(note?: string) {
  if (!note) return note;
  return note
    .replace(/\bCB\b/g, "Can run both")
    .replace(/\bHP\b/g, "Hidden Power")
    .replace(/\bM\/F\b/g, "Male/Female")
    .replace(/\bMS\b/g, "Moveset")
    .replace(/\bNM\b/g, "Non-mega")
    .replace(/\bNWBC\b/g, "Not worth Bottle Cap")
    .replace(/HP Fire/g, "Hidden Power Fire")
    .replace(/HP Ice/g, "Hidden Power Ice");
}

export function getHiddenAbilityRecommendation(pokemonName: string) {
  const normalized = normalizeName(pokemonName);
  const formTag = getFormTag(normalized);
  const base = stripFormWords(normalized);

  const exactForm = HIDDEN_ABILITIES.find(
    (entry) =>
      entry.species === base &&
      ((entry.forms === "alola" && formTag === "alola") ||
        (entry.forms === "galar" && formTag === "galar") ||
        (entry.forms === "male" && formTag === "male") ||
        (entry.forms === "female" && formTag === "female")),
  );
  if (exactForm) return { recommended: true, note: expandNote(exactForm.note) };

  const bothForms = HIDDEN_ABILITIES.find(
    (entry) => entry.species === base && entry.forms === "both",
  );
  if (bothForms) return { recommended: true, note: expandNote(bothForms.note) };

  const normalForm = HIDDEN_ABILITIES.find(
    (entry) =>
      entry.species === base && (!entry.forms || entry.forms === "normal"),
  );
  if (!normalForm) return null;

  if (
    (formTag === "alola" || formTag === "galar") &&
    normalForm.forms !== "both"
  ) {
    return null;
  }

  return { recommended: true, note: expandNote(normalForm.note) };
}
