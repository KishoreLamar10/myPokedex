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

function appendToLast(map: ObtainingMap, lastKey: string | null, extra: string) {
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

    const label = isLabel(col1) ? col1 : isLabel(col2) ? col2 : isLabel(col3) ? col3 : "";
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

export function getObtainingMethod(name: string) {
  const key = normalizeKey(name);
  const methods = OBTAINING_MAP[key];
  if (!methods || methods.length === 0) return undefined;
  return methods.join(" / ");
}
