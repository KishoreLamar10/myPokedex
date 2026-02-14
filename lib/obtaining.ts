import { OBTAINING_CSV } from "@/lib/obtainingData";

type ObtainingMap = Record<string, string[]>;

const FORM_LABELS = new Set([
  "Kanto Form",
  "Alola Form",
  "Galar Form",
  "Johto Form",
  "Unova Form",
  "Normal Rotom",
  "Heat Rotom",
  "Wash Rotom",
  "Frost Rotom",
  "Fan Rotom",
  "Mow Rotom",
  "Land Form",
  "Sky Form",
  "Ordinary Form",
  "Midday Form",
  "Midnight Form",
  "Solo Form",
  "School Form",
  "Meteor Form",
  "Red Core",
  "Orange Core",
  "Yellow Core",
  "Green Core",
  "Blue Core",
  "Indigo Core",
  "Violet Core",
  "Spring Form",
  "West Sea",
  "East Sea",
  "Natural Form",
  "Red-Striped",
  "Blue-Striped",
]);

function normalizeKey(name: string) {
  return name
    .toLowerCase()
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizePokemonKey(name: string) {
  return normalizeKey(name);
}

function isLabel(value: string) {
  return FORM_LABELS.has(value);
}

function parseCsvLine(line: string): string[] {
  const row: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  row.push(current);
  return row;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    rows.push(parseCsvLine(line));
  }
  return rows;
}

function appendToLast(
  map: ObtainingMap,
  lastKey: string | null,
  extra: string,
) {
  if (!lastKey) return;
  const list = map[lastKey];
  if (!list || list.length === 0) return;
  const idx = list.length - 1;
  list[idx] = `${list[idx]} • ${extra}`;
}

function buildObtainingMap(): ObtainingMap {
  const rows = parseCsv(OBTAINING_CSV);
  const map: ObtainingMap = {};
  let lastKey: string | null = null;

  for (let i = 1; i < rows.length; i += 1) {
    const [c1 = "", c2 = "", c3 = ""] = rows[i];
    const col1 = c1.trim();
    const col2 = c2.trim();
    const col3 = c3.trim();

    if (!col1 && !col2 && !col3) continue;

    const label = isLabel(col1)
      ? col1
      : isLabel(col2)
        ? col2
        : isLabel(col3)
          ? col3
          : "";
    if (label && !col1 && !col2 && col3 === label) {
      appendToLast(map, lastKey, label);
      continue;
    }
    if (label && !col1 && col2 === label) {
      appendToLast(map, lastKey, label);
      continue;
    }
    if (label && col1 === label && !col2) {
      appendToLast(map, lastKey, label);
      continue;
    }
    if (label && col1 === label && col2 && !col3) {
      appendToLast(map, lastKey, `${label}: ${col2}`);
      continue;
    }
    if (label && col2 === label && col3 && !col1) {
      appendToLast(map, lastKey, `${label}: ${col3}`);
      continue;
    }

    if (!col1 && col2) {
      appendToLast(map, lastKey, col2);
      continue;
    }

    if (!col1 && !col2 && col3) {
      appendToLast(map, lastKey, col3);
      continue;
    }

    if (!col1 || !col2) {
      continue;
    }

    const key = normalizeKey(col1);
    lastKey = key;
    if (!map[key]) map[key] = [];
    const method = col3 ? `${col2} • ${col3}` : col2;
    map[key].push(method);
  }

  return map;
}

const OBTAINING_MAP = buildObtainingMap();

function cleanupLocation(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+(during|at|while|by|using)\b.*$/i, "")
    .replace(/^the\s+/i, "")
    .trim();
}

function extractLocationsFromMethod(method: string) {
  const locations = new Set<string>();
  const cleaned = method.replace(/\u00a0/g, " ").trim();

  const routeMatches = cleaned.match(/Route\s+\d+/gi) ?? [];
  routeMatches.forEach((match) => {
    const normalized = match.replace(/\s+/g, " ").trim();
    const route = `Route ${normalized.split(" ")[1]}`;
    locations.add(route);
  });

  const matchers: RegExp[] = [
    /Catch in the grass patches on ([^•/]+)/i,
    /Catch in grass patches on ([^•/]+)/i,
    /Catch in the grass patches in ([^•/]+)/i,
    /Catch in grass patches in ([^•/]+)/i,
    /Catch by fishing on ([^•/]+)/i,
    /Catch by fishing in ([^•/]+)/i,
    /Catch on ([^•/]+)/i,
    /Catch in ([^•/]+)/i,
    /Catch at ([^•/]+)/i,
    /Adopt from ([^•/]+)/i,
    /Found in ([^•/]+)/i,
  ];

  matchers.forEach((matcher) => {
    const match = cleaned.match(matcher);
    if (!match?.[1]) return;
    const location = cleanupLocation(match[1]);
    if (location) locations.add(location);
  });

  return Array.from(locations);
}

function isCatchMethod(method: string) {
  const cleaned = method.replace(/\u00a0/g, " ").trim();
  return /^(Catch|Adopt|Found|Receive)/i.test(cleaned);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractEvolutionBaseKey(method: string) {
  const match = method.match(/Evolve\s+([^•/]+)/i);
  if (!match?.[1]) return null;
  let base = match[1].trim();
  base = base.replace(/^(male|female)\s+/i, "");
  base = base.replace(
    /^(Kantonian|Alolan|Galarian|Hisuian|Paldean|Johto|Unova|Hoenn|Sinnoh|Kalos)\s+/i,
    "",
  );
  FORM_LABELS.forEach((label) => {
    const pattern = new RegExp(`\\b${escapeRegExp(label)}\\b`, "i");
    base = base.replace(pattern, "").trim();
  });
  return base ? normalizeKey(base) : null;
}

export function getCatchLocationsForMethod(method: string) {
  const parts = method.split(" / ").map((part) => part.trim());
  const locations = new Set<string>();
  parts.forEach((part) => {
    if (!part) return;
    if (!isCatchMethod(part)) return;
    extractLocationsFromMethod(part).forEach((location) => {
      if (location) locations.add(location);
    });
  });
  return Array.from(locations);
}

function buildObtainingLocations() {
  const locations = new Set<string>();
  Object.values(OBTAINING_MAP).forEach((methods) => {
    methods.forEach((method) => {
      getCatchLocationsForMethod(method).forEach((loc) => {
        if (loc) locations.add(loc);
      });
    });
  });

  const rows = parseCsv(OBTAINING_CSV);
  for (let i = 1; i < rows.length; i += 1) {
    const [, c2 = "", c3 = ""] = rows[i];
    [c2, c3].forEach((value) => {
      if (!value) return;
      if (!isCatchMethod(value)) return;
      extractLocationsFromMethod(value).forEach((loc) => {
        if (loc) locations.add(loc);
      });
    });
  }

  const routeLocations = Array.from(locations).filter((loc) =>
    /^Route\s+\d+$/i.test(loc),
  );
  const otherLocations = Array.from(locations).filter(
    (loc) => !/^Route\s+\d+$/i.test(loc),
  );

  routeLocations.sort(
    (a, b) => Number(a.replace(/\D+/g, "")) - Number(b.replace(/\D+/g, "")),
  );
  otherLocations.sort((a, b) => a.localeCompare(b));

  return [...routeLocations, ...otherLocations];
}

const OBTAINING_LOCATIONS = buildObtainingLocations();

function buildLocationPokemonMap() {
  const locationMap: Record<string, Set<string>> = {};
  const catchLocationsByName: Record<string, Set<string>> = {};
  const rows = parseCsv(OBTAINING_CSV);
  let lastName: string | null = null;

  for (let i = 1; i < rows.length; i += 1) {
    const [c1 = "", c2 = "", c3 = ""] = rows[i];
    const col1 = c1.trim();
    const col2 = c2.trim();
    const col3 = c3.trim();

    if (col1 && !isLabel(col1)) {
      lastName = col1;
    }

    if (!lastName) continue;
    const normalizedLastName = normalizeKey(lastName);

    [col2, col3].forEach((method) => {
      if (!method) return;
      if (!isCatchMethod(method)) return;
      const locations = getCatchLocationsForMethod(method);
      locations.forEach((location) => {
        if (!location) return;
        if (!locationMap[location]) locationMap[location] = new Set();
        locationMap[location].add(normalizedLastName);
        if (!catchLocationsByName[normalizedLastName]) {
          catchLocationsByName[normalizedLastName] = new Set();
        }
        catchLocationsByName[normalizedLastName].add(location);
      });
    });
  }

  lastName = null;
  for (let i = 1; i < rows.length; i += 1) {
    const [c1 = "", c2 = "", c3 = ""] = rows[i];
    const col1 = c1.trim();
    const col2 = c2.trim();
    const col3 = c3.trim();

    if (col1 && !isLabel(col1)) {
      lastName = col1;
    }

    if (!lastName) continue;
    const normalizedLastName = normalizeKey(lastName);

    [col2, col3].forEach((method) => {
      if (!method) return;
      const baseKey = extractEvolutionBaseKey(method);
      if (!baseKey) return;
      const locations = catchLocationsByName[baseKey];
      if (!locations || locations.size === 0) return;
      locations.forEach((location) => {
        if (!locationMap[location]) locationMap[location] = new Set();
        locationMap[location].add(normalizedLastName);
      });
    });
  }

  return Object.fromEntries(
    Object.entries(locationMap).map(([location, names]) => [
      location,
      Array.from(names),
    ]),
  );
}

const OBTAINING_LOCATION_POKEMON_MAP = buildLocationPokemonMap();

export function getObtainingMethod(name: string) {
  const key = normalizeKey(name);
  const methods = OBTAINING_MAP[key];
  if (!methods || methods.length === 0) return undefined;
  return methods.join(" / ");
}

export function getObtainingLocations() {
  return OBTAINING_LOCATIONS;
}

export function getObtainingLocationsForMethod(method: string) {
  return extractLocationsFromMethod(method);
}

export function getObtainingLocationPokemonMap() {
  return OBTAINING_LOCATION_POKEMON_MAP;
}
