export type EggMoveEntry = {
  species: string;
  eggGroups: string;
  moves: string[];
  forms?: "both" | "alola" | "normal" | "male";
};

const EGG_MOVES: EggMoveEntry[] = [
  { species: "bulbasaur", eggGroups: "Grass, Monster", moves: ["Giga Drain"] },
  {
    species: "charmander",
    eggGroups: "Dragon, Monster",
    moves: ["Dragon Dance [ For Char-X ]"],
  },
  {
    species: "squirtle",
    eggGroups: "Monster, Water 1",
    moves: ["Aura Sphere [Offensive]", "Yawn", "Haze [Defensive]"],
  },
  {
    species: "raichu",
    eggGroups: "Fairy, Field",
    moves: ["Encore [Normal And Alolan]"],
    forms: "both",
  },
  {
    species: "clefairy",
    eggGroups: "Fairy",
    moves: ["Wish", "Stored Power"],
  },
  {
    species: "vulpix",
    eggGroups: "Field",
    moves: ["Moonblast", "Encore", "Freeze-Dry"],
    forms: "alola",
  },
  { species: "jigglypuff", eggGroups: "Fairy", moves: ["Wish"] },
  { species: "oddish", eggGroups: "Grass", moves: ["Synthesis"] },
  {
    species: "diglett",
    eggGroups: "Field",
    moves: [
      "Final Gambit",
      "Memento [ Normal ]",
      "Pursuit [ Alolan ]",
      "Memento [ Alolan ]",
    ],
    forms: "both",
  },
  {
    species: "meowth",
    eggGroups: "Field",
    moves: ["Parting Shot"],
    forms: "alola",
  },
  {
    species: "psyduck",
    eggGroups: "Field, Water 1",
    moves: ["Encore", "Yawn"],
  },
  { species: "mankey", eggGroups: "Field", moves: ["Encore"] },
  { species: "growlithe", eggGroups: "Field", moves: ["Morning Sun"] },
  {
    species: "poliwag",
    eggGroups: "Water 1",
    moves: ["Encore [ Politoed ]"],
  },
  {
    species: "abra",
    eggGroups: "Human-Like",
    moves: ["Encore", "Knock Off [ Magic Guard Set ]"],
  },
  {
    species: "machop",
    eggGroups: "Human-Like",
    moves: [
      "Bullet Punch",
      "Close Combat",
      "Knock Off",
      "Fire Punch / Ice Punch / Thunder Punch",
    ],
  },
  { species: "bellsprout", eggGroups: "Grass", moves: ["Power Whip"] },
  {
    species: "tentacool",
    eggGroups: "Water 3",
    moves: ["Haze", "Knock Off", "Rapid Spin"],
  },
  { species: "ponyta", eggGroups: "Field", moves: ["Morning Sun"] },
  {
    species: "slowpoke",
    eggGroups: "Monster, Water 1",
    moves: ["Future Sight"],
  },
  { species: "doduo", eggGroups: "Flying", moves: ["Brave Bird"] },
  {
    species: "seel",
    eggGroups: "Field, Water 1",
    moves: ["Perish Song"],
  },
  {
    species: "grimer",
    eggGroups: "Amorphous",
    moves: [
      "Curse [ Normal ]",
      "Pursuit [ Alolan ]",
      "Shadow Sneak [ Alolan ]",
    ],
    forms: "both",
  },
  {
    species: "shellder",
    eggGroups: "Water 3",
    moves: ["Icicle Spear", "Rock Blast", "Rapid Spin"],
  },
  { species: "onix", eggGroups: "Mineral", moves: ["Heavy Slam"] },
  {
    species: "krabby",
    eggGroups: "Water 3",
    moves: ["Agility", "Knock Off"],
  },
  {
    species: "exeggcute",
    eggGroups: "Grass",
    moves: ["Leaf Storm [ Both Forms ]"],
    forms: "both",
  },
  {
    species: "koffing",
    eggGroups: "Amorphous",
    moves: ["Pain Split", "Toxic Spikes"],
  },
  {
    species: "chansey",
    eggGroups: "Fairy",
    moves: ["Aromatherapy / Heal Bell", "Seismic Toss"],
  },
  { species: "kangaskhan", eggGroups: "Monster", moves: ["Double-Edge"] },
  {
    species: "electabuzz",
    eggGroups: "Human-Like",
    moves: ["Fire Punch", "Ice Punch"],
  },
  {
    species: "pinsir",
    eggGroups: "Bug",
    moves: ["Close Combat", "Quick Attack"],
  },
  { species: "eevee", eggGroups: "Field", moves: ["Wish"] },
  {
    species: "omanyte",
    eggGroups: "Water 1, Water 3",
    moves: ["Haze", "Knock Off", "Spikes"],
  },
  {
    species: "kabuto",
    eggGroups: "Water 1, Water 3",
    moves: ["Knock Off", "Rapid Spin"],
  },
  { species: "aerodactyl", eggGroups: "Flying", moves: ["Pursuit"] },
  { species: "snorlax", eggGroups: "Monster", moves: ["Curse"] },
  {
    species: "dratini",
    eggGroups: "Dragon, Water 1",
    moves: ["Dragon Dance", "Extreme Speed"],
  },
  {
    species: "totodile",
    eggGroups: "Monster, Water 1",
    moves: ["Dragon Dance", "Aqua Jet", "Ice Punch"],
  },
  {
    species: "spinarak",
    eggGroups: "Bug",
    moves: ["Toxic Spikes", "Megahorn"],
  },
  { species: "togepi", eggGroups: "Fairy", moves: ["Nasty Plot"] },
  { species: "natu", eggGroups: "Flying", moves: ["Roost"] },
  {
    species: "marill",
    eggGroups: "Fairy, Water 1",
    moves: ["Aqua Jet", "Belly Drum"],
  },
  { species: "hoppip", eggGroups: "Fairy, Grass", moves: ["Encore"] },
  { species: "aipom", eggGroups: "Field", moves: ["Fake Out"] },
  {
    species: "wooper",
    eggGroups: "Field, Water 1",
    moves: ["Recover"],
  },
  { species: "murkrow", eggGroups: "Flying", moves: ["Brave Bird"] },
  {
    species: "misdreavus",
    eggGroups: "Amorphous",
    moves: ["Nasty Plot"],
  },
  {
    species: "pineco",
    eggGroups: "Bug",
    moves: ["Stealth Rock", "Toxic Spikes"],
  },
  { species: "snubbull", eggGroups: "Fairy, Field", moves: ["Heal Bell"] },
  { species: "shuckle", eggGroups: "Bug", moves: ["Knock Off"] },
  { species: "heracross", eggGroups: "Bug", moves: ["Rock Blast"] },
  {
    species: "sneasel",
    eggGroups: "Field",
    moves: ["Icicle Crash", "Pursuit"],
  },
  {
    species: "teddiursa",
    eggGroups: "Field",
    moves: ["Crunch", "Close Combat"],
  },
  {
    species: "swinub",
    eggGroups: "Field",
    moves: ["Icicle Crash", "Stealth Rock"],
  },
  { species: "mantine", eggGroups: "Water 1", moves: ["Haze"] },
  {
    species: "skarmory",
    eggGroups: "Flying",
    moves: ["Brave Bird", "Stealth Rock", "Whirlwind"],
  },
  { species: "houndour", eggGroups: "Field", moves: ["Nasty Plot"] },
  {
    species: "phanpy",
    eggGroups: "Field",
    moves: ["Ice Shard", "Play Rough"],
  },
  {
    species: "larvitar",
    eggGroups: "Monster",
    moves: ["Dragon Dance", "Iron Head / Iron Tail", "Pursuit", "Stealth Rock"],
  },
  { species: "torchic", eggGroups: "Field", moves: ["Baton Pass"] },
  {
    species: "poochyena",
    eggGroups: "Field",
    moves: ["Fire Fang", "Ice Fang", "Play Rough", "Thunder Fang"],
  },
  { species: "lotad", eggGroups: "Grass, Water 1", moves: ["Giga Drain"] },
  { species: "nuzleaf", eggGroups: "Field, Grass", moves: ["Foul Play"] },
  {
    species: "wingull",
    eggGroups: "Flying, Water 1",
    moves: ["Knock Off"],
  },
  {
    species: "ralts",
    eggGroups: "Amorphous [ Prior to Gen 7 ]",
    moves: ["Shadow Sneak [ For Gallade ]"],
  },
  {
    species: "shroomish",
    eggGroups: "Fairy, Grass",
    moves: ["Bullet Seed", "Drain Punch"],
  },
  { species: "makuhita", eggGroups: "Human-Like", moves: ["Bullet Punch"] },
  { species: "sableye", eggGroups: "Human-Like", moves: ["Recover"] },
  { species: "mawile", eggGroups: "Fairy, Field", moves: ["Fire Fang"] },
  {
    species: "aron",
    eggGroups: "Monster",
    moves: ["Head Smash", "Stealth Rock"],
  },
  {
    species: "meditite",
    eggGroups: "Human-Like",
    moves: [
      "Fake Out",
      "Ice Punch",
      "Bullet Punch / Fire Punch / Thunder Punch [ Optional ]",
    ],
  },
  { species: "torkoal", eggGroups: "Field", moves: ["Yawn"] },
  {
    species: "corphish",
    eggGroups: "Water 1, Water 3",
    moves: ["Aqua Jet", "Dragon Dance"],
  },
  { species: "feebas", eggGroups: "Dragon, Water 1", moves: ["Haze"] },
  {
    species: "shuppet",
    eggGroups: "Amorphous",
    moves: ["Destiny Bond", "Gunk Shot"],
  },
  { species: "duskull", eggGroups: "Amorphous", moves: ["Pain Split"] },
  { species: "snorunt", eggGroups: "Fairy, Mineral", moves: ["Spikes"] },
  { species: "bagon", eggGroups: "Dragon", moves: ["Dragon Dance"] },
  {
    species: "chimchar",
    eggGroups: "Field, Human-Like",
    moves: ["Thunder Punch"],
  },
  { species: "starly", eggGroups: "Flying", moves: ["Double-Edge"] },
  {
    species: "bidoof",
    eggGroups: "Field, Water 1",
    moves: ["Double Edge", "Quick Attack"],
  },
  {
    species: "buneary",
    eggGroups: "Field, Human-Like",
    moves: ["Fake Out", "Ice Punch"],
  },
  {
    species: "spiritomb",
    eggGroups: "Amorphous",
    moves: ["Foul Play"],
  },
  {
    species: "lucario",
    eggGroups: "Field, Human-Like",
    moves: ["Bullet Punch"],
  },
  {
    species: "hippopotas",
    eggGroups: "Field",
    moves: ["Slack Off", "Whirlwind"],
  },
  { species: "croagunk", eggGroups: "Human-Like", moves: ["Drain Punch"] },
  { species: "snover", eggGroups: "Grass, Monster", moves: ["Leech Seed"] },
  { species: "tangela", eggGroups: "Grass", moves: ["Leech Seed"] },
  { species: "snivy", eggGroups: "Grass, Field", moves: ["Glare"] },
  {
    species: "tepig",
    eggGroups: "Field",
    moves: ["Superpower", "Sucker Punch"],
  },
  {
    species: "pansage",
    eggGroups: "Field",
    moves: ["Nasty Plot", "Leaf Storm"],
  },
  { species: "pansear", eggGroups: "Field", moves: ["Nasty Plot"] },
  {
    species: "panpour",
    eggGroups: "Field",
    moves: ["Nasty Plot", "Hydro Pump"],
  },
  { species: "munna", eggGroups: "Field", moves: ["Healing Wish"] },
  { species: "drillbur", eggGroups: "Field", moves: ["Rapid Spin"] },
  { species: "audino", eggGroups: "Fairy", moves: ["Heal Bell", "Wish"] },
  {
    species: "timburr",
    eggGroups: "Human-Like",
    moves: ["Drain Punch", "Mach Punch"],
  },
  { species: "tympole", eggGroups: "Water 1", moves: ["Earth Power"] },
  {
    species: "cottonee",
    eggGroups: "Fairy, Grass",
    moves: ["Encore", "Memento"],
  },
  { species: "sandile", eggGroups: "Field", moves: ["Fire Fang", "Pursuit"] },
  { species: "maractus", eggGroups: "Grass", moves: ["Leech Seed", "Spikes"] },
  { species: "dwebble", eggGroups: "Bug, Mineral", moves: ["Spikes"] },
  {
    species: "scraggy",
    eggGroups: "Dragon, Field",
    moves: ["Dragon Dance", "Ice Punch", "Drain Punch"],
  },
  {
    species: "yamask",
    eggGroups: "Amorphous, Mineral",
    moves: ["Memento", "Toxic Spikes"],
  },
  {
    species: "archen",
    eggGroups: "Flying, Water 3",
    moves: ["Head Smash", "Knock Off"],
  },
  { species: "trubbish", eggGroups: "Mineral", moves: ["Spikes"] },
  { species: "zorua", eggGroups: "Field", moves: ["Sucker Punch"] },
  { species: "minccino", eggGroups: "Field", moves: ["Knock Off"] },
  {
    species: "karrablast",
    eggGroups: "Bug",
    moves: ["Megahorn", "Knock Off", "Pursuit"],
  },
  { species: "foongus", eggGroups: "Grass", moves: ["Stun Spore"] },
  { species: "frillish", eggGroups: "Amorphous", moves: ["Recover"] },
  {
    species: "ferroseed",
    eggGroups: "Grass, Mineral",
    moves: ["Leech Seed", "Stealth Rock", "Spikes"],
  },
  { species: "cubchoo", eggGroups: "Field", moves: ["Play Rough"] },
  { species: "shelmet", eggGroups: "Bug", moves: ["Encore", "Spikes"] },
  { species: "mienfoo", eggGroups: "Field, Human-Like", moves: ["Knock Off"] },
  {
    species: "druddigon",
    eggGroups: "Dragon, Monster",
    moves: ["Glare", "Sucker Punch"],
  },
  { species: "pawniard", eggGroups: "Human-Like", moves: ["Sucker Punch"] },
  {
    species: "vullaby",
    eggGroups: "Flying",
    moves: ["Knock Off", "Foul Play"],
  },
  { species: "heatmor", eggGroups: "Field", moves: ["Sucker Punch"] },
  { species: "deino", eggGroups: "Dragon", moves: ["Earth Power"] },
  { species: "chespin", eggGroups: "Field", moves: ["Spikes", "Synthesis"] },
  { species: "fennekin", eggGroups: "Field", moves: ["Wish"] },
  { species: "froakie", eggGroups: "Water 1", moves: ["Toxic Spikes"] },
  {
    species: "pancham",
    eggGroups: "Field, Human-Like",
    moves: ["Storm Throw"],
  },
  {
    species: "meowstic",
    eggGroups: "Field",
    moves: ["Yawn [ Male ]"],
    forms: "male",
  },
  { species: "honedge", eggGroups: "Mineral", moves: ["Shadow Sneak"] },
  { species: "spritzee", eggGroups: "Fairy", moves: ["Wish"] },
  { species: "swirlix", eggGroups: "Fairy", moves: ["Belly Drum"] },
  { species: "skrelp", eggGroups: "Dragon, Water 1", moves: ["Toxic Spikes"] },
  {
    species: "tyrunt",
    eggGroups: "Dragon, Monster",
    moves: ["Dragon Dance / Rock Polish"],
  },
  {
    species: "bergmite",
    eggGroups: "Monster [ Prior to Gen 7 ]",
    moves: ["Recover"],
  },
  { species: "rowlet", eggGroups: "Flying", moves: ["Defog"] },
  { species: "litten", eggGroups: "Field", moves: ["Fake Out"] },
  { species: "pikipek", eggGroups: "Flying", moves: ["Brave Bird"] },
  { species: "cutiefly", eggGroups: "Bug, Fairy", moves: ["Moonblast"] },
  {
    species: "rockruff",
    eggGroups: "Field",
    moves: ["Sucker Punch", "Fire Fang"],
  },
  { species: "mareanie", eggGroups: "Water 1", moves: ["Haze"] },
  { species: "mudbray", eggGroups: "Field", moves: ["Close Combat"] },
  {
    species: "fomantis",
    eggGroups: "Grass",
    moves: ["Defog", "Leaf Storm", "Aromatherapy"],
  },
  { species: "morelull", eggGroups: "Grass", moves: ["Leech Seed"] },
  { species: "stufful", eggGroups: "Field", moves: ["Ice Punch"] },
  { species: "bounsweet", eggGroups: "Grass", moves: ["Synthesis"] },
  {
    species: "wimpod",
    eggGroups: "Bug, Water 3",
    moves: ["Spikes", "Aqua Jet"],
  },
  { species: "grookey", eggGroups: "Field, Grass", moves: ["Fake Out"] },
  {
    species: "scorbunny",
    eggGroups: "Field, Human-Like",
    moves: ["High Jump Kick", "Sucker Punch"],
  },
  { species: "skwovet", eggGroups: "Field", moves: ["Belly Drum"] },
  { species: "rookidee", eggGroups: "Flying", moves: ["Defog", "Roost"] },
  { species: "blipbug", eggGroups: "Bug", moves: ["Recover", "Sticky Web"] },
  { species: "gossifleur", eggGroups: "Grass", moves: ["Leech Seed"] },
  { species: "sizzlipede", eggGroups: "Bug", moves: ["Knock Off"] },
  {
    species: "pincurchin",
    eggGroups: "Amorphous, Water 1",
    moves: ["Memento"],
  },
  {
    species: "eiscue",
    eggGroups: "Field, Water 1",
    moves: ["Belly Drum", "Icicle Crash"],
  },
  {
    species: "morpeko",
    eggGroups: "Fairy, Field",
    moves: ["Parting Shot", "Rapid Spin"],
  },
  {
    species: "dreepy",
    eggGroups: "Amorphous, Dragon",
    moves: ["Sucker Punch"],
  },
  {
    species: "sprigatito",
    eggGroups: "Field, Grass",
    moves: ["Sucker Punch"],
  },
  { species: "fuecoco", eggGroups: "Field", moves: ["Slack Off"] },
  { species: "quaxly", eggGroups: "Flying, Water 1", moves: ["Roost"] },
  { species: "tarountula", eggGroups: "Bug", moves: ["Memento"] },
  { species: "tandemaus", eggGroups: "Fairy, Field", moves: ["Bite"] },
  { species: "fidough", eggGroups: "Field, Mineral", moves: ["Wish"] },
  { species: "smoliv", eggGroups: "Grass", moves: ["Strength Sap"] },
  { species: "nacli", eggGroups: "Mineral", moves: ["Curse"] },
  { species: "tadbulb", eggGroups: "Water 1", moves: ["Soak"] },
  {
    species: "maschiff",
    eggGroups: "Field",
    moves: ["Play Rough", "Destiny Bond"],
  },
  {
    species: "toedscool",
    eggGroups: "Grass",
    moves: ["Knock Off", "Rapid Spin"],
  },
  { species: "klawf", eggGroups: "Water 3", moves: ["Knock Off"] },
  {
    species: "wiglett",
    eggGroups: "Water 3",
    moves: ["Final Gambit", "Memento"],
  },
  {
    species: "cetoddle",
    eggGroups: "Field",
    moves: ["Belly Drum", "Icicle Crash"],
  },
  {
    species: "impidimp",
    eggGroups: "Fairy, Human-Like",
    moves: ["Fake Out", "Parting Shot"],
  },
  {
    species: "chewtle",
    eggGroups: "Monster, Water 1",
    moves: ["Shell Smash"],
  },
];

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFormTag(normalizedName: string) {
  if (normalizedName.includes("alola") || normalizedName.includes("alolan")) {
    return "alola" as const;
  }
  if (normalizedName.includes("male")) {
    return "male" as const;
  }
  return "normal" as const;
}

function stripFormWords(normalizedName: string) {
  return normalizedName
    .replace(/alola|alolan/g, "")
    .replace(/male|female/g, "")
    .trim();
}

export function getEggMoveEntry(pokemonName: string) {
  const normalized = normalizeName(pokemonName);
  const formTag = getFormTag(normalized);
  const base = stripFormWords(normalized);

  const exactForm = EGG_MOVES.find(
    (entry) =>
      entry.species === base &&
      ((entry.forms === "alola" && formTag === "alola") ||
        (entry.forms === "male" && formTag === "male")),
  );
  if (exactForm) return exactForm;

  const bothForms = EGG_MOVES.find(
    (entry) => entry.species === base && entry.forms === "both",
  );
  if (bothForms) return bothForms;

  const normalForm = EGG_MOVES.find(
    (entry) =>
      entry.species === base && (!entry.forms || entry.forms === "normal"),
  );
  if (!normalForm) return null;

  if (formTag === "alola" && normalForm.forms !== "both") return null;
  return normalForm;
}
