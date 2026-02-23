export interface RegionNode {
  id: string;
  name: string;
  isCity: boolean;
  connections: string[];
}

export const RORIA_MAP: Record<string, RegionNode> = {
  "Mitis Town": { id: "Mitis Town", name: "Mitis Town", isCity: true, connections: ["Route 1"] },
  "Route 1": { id: "Route 1", name: "Route 1", isCity: false, connections: ["Mitis Town", "Cheshma Town"] },
  "Cheshma Town": { id: "Cheshma Town", name: "Cheshma Town", isCity: true, connections: ["Route 1", "Gale Forest", "Route 2"] },
  "Gale Forest": { id: "Gale Forest", name: "Gale Forest", isCity: false, connections: ["Cheshma Town"] },
  "Route 2": { id: "Route 2", name: "Route 2", isCity: false, connections: ["Cheshma Town", "Route 3"] },
  "Route 3": { id: "Route 3", name: "Route 3", isCity: false, connections: ["Route 2", "Silvent City"] },
  "Silvent City": { id: "Silvent City", name: "Silvent City", isCity: true, connections: ["Route 3", "Route 4"] },
  "Route 4": { id: "Route 4", name: "Route 4", isCity: false, connections: ["Silvent City", "Route 5"] },
  "Route 5": { id: "Route 5", name: "Route 5", isCity: false, connections: ["Route 4", "Brimber City", "Old Graveyard", "Glistening Grotto"] },
  "Old Graveyard": { id: "Old Graveyard", name: "Old Graveyard", isCity: false, connections: ["Route 5"] },
  "Glistening Grotto": { id: "Glistening Grotto", name: "Glistening Grotto", isCity: false, connections: ["Route 5"] },
  "Brimber City": { id: "Brimber City", name: "Brimber City", isCity: true, connections: ["Route 5", "Route 6", "Route 7"] },
  "Route 6": { id: "Route 6", name: "Route 6", isCity: false, connections: ["Brimber City", "Mt. Igneus", "Calcite Chamber"] },
  "Mt. Igneus": { id: "Mt. Igneus", name: "Mt. Igneus", isCity: false, connections: ["Route 6"] },
  "Calcite Chamber": { id: "Calcite Chamber", name: "Calcite Chamber", isCity: false, connections: ["Route 6"] },
  "Route 7": { id: "Route 7", name: "Route 7", isCity: false, connections: ["Brimber City", "Path of Truth", "Lagoona Lake"] },
  "Path of Truth": { id: "Path of Truth", name: "Path of Truth", isCity: false, connections: ["Route 7"] },
  "Lagoona Lake": { id: "Lagoona Lake", name: "Lagoona Lake", isCity: false, connections: ["Route 7", "Route 8", "Secret Grove", "Lagoona Trenches"] },
  "Secret Grove": { id: "Secret Grove", name: "Secret Grove", isCity: false, connections: ["Lagoona Lake"] },
  "Lagoona Trenches": { id: "Lagoona Trenches", name: "Lagoona Trenches", isCity: false, connections: ["Lagoona Lake"] },
  "Route 8": { id: "Route 8", name: "Route 8", isCity: false, connections: ["Lagoona Lake", "Rosecove Beach"] },
  "Rosecove Beach": { id: "Rosecove Beach", name: "Rosecove Beach", isCity: false, connections: ["Route 8", "Rosecove City", "Silver Cove"] },
  "Silver Cove": { id: "Silver Cove", name: "Silver Cove", isCity: false, connections: ["Rosecove Beach"] },
  "Rosecove City": { id: "Rosecove City", name: "Rosecove City", isCity: true, connections: ["Rosecove Beach", "Route 9"] },
  "Route 9": { id: "Route 9", name: "Route 9", isCity: false, connections: ["Rosecove City", "Grove of Dreams", "Fortulose Manor", "Route 10"] },
  "Grove of Dreams": { id: "Grove of Dreams", name: "Grove of Dreams", isCity: false, connections: ["Route 9"] },
  "Fortulose Manor": { id: "Fortulose Manor", name: "Fortulose Manor", isCity: false, connections: ["Route 9"] },
  "Route 10": { id: "Route 10", name: "Route 10", isCity: false, connections: ["Route 9", "Cragonos Mines"] },
  "Cragonos Mines": { id: "Cragonos Mines", name: "Cragonos Mines", isCity: false, connections: ["Route 10", "Cragonos Cliffs", "Cragonos Peak", "Route 11"] },
  "Cragonos Cliffs": { id: "Cragonos Cliffs", name: "Cragonos Cliffs", isCity: false, connections: ["Cragonos Mines"] },
  "Cragonos Peak": { id: "Cragonos Peak", name: "Cragonos Peak", isCity: false, connections: ["Cragonos Mines"] },
  "Route 11": { id: "Route 11", name: "Route 11", isCity: false, connections: ["Cragonos Mines", "Desert Catacombs", "Aredia City"] },
  "Desert Catacombs": { id: "Desert Catacombs", name: "Desert Catacombs", isCity: false, connections: ["Route 11"] },
  "Aredia City": { id: "Aredia City", name: "Aredia City", isCity: true, connections: ["Route 11", "Old Aredia", "Route 12"] },
  "Old Aredia": { id: "Old Aredia", name: "Old Aredia", isCity: false, connections: ["Aredia City", "Aredia Ruins"] },
  "Aredia Ruins": { id: "Aredia Ruins", name: "Aredia Ruins", isCity: false, connections: ["Old Aredia"] },
  "Route 12": { id: "Route 12", name: "Route 12", isCity: false, connections: ["Aredia City", "Nature's Den", "Route 13"] },
  "Nature's Den": { id: "Nature's Den", name: "Nature's Den", isCity: false, connections: ["Route 12"] },
  "Route 13": { id: "Route 13", name: "Route 13", isCity: false, connections: ["Route 12", "Chamber of the Jewel", "Fluoruma City"] },
  "Chamber of the Jewel": { id: "Chamber of the Jewel", name: "Chamber of the Jewel", isCity: false, connections: ["Route 13"] },
  "Fluoruma City": { id: "Fluoruma City", name: "Fluoruma City", isCity: true, connections: ["Route 13", "Route 14"] },
  "Route 14": { id: "Route 14", name: "Route 14", isCity: false, connections: ["Fluoruma City", "Titans' Throng", "Route 15"] },
  "Titans' Throng": { id: "Titans' Throng", name: "Titans' Throng", isCity: false, connections: ["Route 14"] },
  "Route 15": { id: "Route 15", name: "Route 15", isCity: false, connections: ["Route 14", "Dendrite Chamber", "Frostveil City"] },
  "Dendrite Chamber": { id: "Dendrite Chamber", name: "Dendrite Chamber", isCity: false, connections: ["Route 15"] },
  "Frostveil City": { id: "Frostveil City", name: "Frostveil City", isCity: true, connections: ["Route 15", "Frostveil Catacombs", "Route 16"] },
  "Frostveil Catacombs": { id: "Frostveil Catacombs", name: "Frostveil Catacombs", isCity: false, connections: ["Frostveil City"] },
  "Route 16": { id: "Route 16", name: "Route 16", isCity: false, connections: ["Frostveil City", "Freezing Fissure", "Cosmeos Valley"] },
  "Freezing Fissure": { id: "Freezing Fissure", name: "Freezing Fissure", isCity: false, connections: ["Route 16"] },
  "Cosmeos Valley": { id: "Cosmeos Valley", name: "Cosmeos Valley", isCity: false, connections: ["Route 16", "Roria League", "Tinbell Construction Site", "Port Decca"] },
  "Roria League": { id: "Roria League", name: "Roria League", isCity: true, connections: ["Cosmeos Valley"] },
  "Tinbell Construction Site": { id: "Tinbell Construction Site", name: "Tinbell Construction Site", isCity: false, connections: ["Cosmeos Valley"] },
  "Port Decca": { id: "Port Decca", name: "Port Decca", isCity: true, connections: ["Cosmeos Valley", "Decca Beach"] },
  "Decca Beach": { id: "Decca Beach", name: "Decca Beach", isCity: false, connections: ["Port Decca", "Safari Zone", "Route 17"] },
  "Safari Zone": { id: "Safari Zone", name: "Safari Zone", isCity: false, connections: ["Decca Beach"] },
  "Route 17": { id: "Route 17", name: "Route 17", isCity: false, connections: ["Decca Beach", "Ocean's Origin", "Crescent Town"] },
  "Ocean's Origin": { id: "Ocean's Origin", name: "Ocean's Origin", isCity: false, connections: ["Route 17"] },
  "Crescent Town": { id: "Crescent Town", name: "Crescent Town", isCity: true, connections: ["Route 17", "Eclipse Base", "Route 18"] },
  "Eclipse Base": { id: "Eclipse Base", name: "Eclipse Base", isCity: false, connections: ["Crescent Town"] },
  "Route 18": { id: "Route 18", name: "Route 18", isCity: false, connections: ["Crescent Town", "Aborille Outpost"] },
  "Aborille Outpost": { id: "Aborille Outpost", name: "Aborille Outpost", isCity: false, connections: ["Route 18", "Demon's Tomb"] },
  "Demon's Tomb": { id: "Demon's Tomb", name: "Demon's Tomb", isCity: false, connections: ["Aborille Outpost"] },
};

/**
 * Normalizes location strings from the Pokedex to match the RORIA_MAP keys.
 */
export function normalizeLocation(loc: string): string {
  if (!loc) return "";
  const cleaned = loc.trim().replace(/^In\s+/i, "");
  
  // 1. Try exact match first
  const exactMatch = Object.keys(RORIA_MAP).find(
    name => name.toLowerCase() === cleaned.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // 2. Try matching the longest recognized name first to avoid partial matches (e.g., "Route 1" matching inside "Route 10")
  const sortedNames = Object.keys(RORIA_MAP).sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (cleaned.toLowerCase().includes(name.toLowerCase())) {
      return name;
    }
  }
  return cleaned;
}

/**
 * Finds the nearest flyable city/town and returns the path to it.
 * Uses a simple BFS.
 */
export function getPathToFlyable(startNode: string): string[] | null {
  if (!RORIA_MAP[startNode]) return null;
  if (RORIA_MAP[startNode].isCity) return [startNode];

  const queue: [string, string[]][] = [[startNode, [startNode]]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    visited.add(current);

    const node = RORIA_MAP[current];
    if (node.isCity) return path;

    for (const neighbor of node.connections) {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }

  return null;
}
