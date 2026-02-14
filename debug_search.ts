
import { getAllPokemonForSelector } from "./lib/pokeapi";

async function debug() {
    console.log("Loading pokemon list...");
    const list = await getAllPokemonForSelector();
    console.log(`Loaded ${list.length} pokemon.`);

    const searchInput = "Rotom Wash";
    const normalizedInput = searchInput.toLowerCase().replace(/-/g, " ");
    console.log(`Searching for: "${searchInput}" (normalized: "${normalizedInput}")`);

    const results = list.filter(p => p.name.toLowerCase().includes(normalizedInput));
    console.log(`Found ${results.length} matches.`);

    // Log actual names of Rotom forms to see what they are
    const rotoms = list.filter(p => p.name.toLowerCase().includes("rotom"));
    console.log("All Rotom forms in list:", rotoms.map(p => p.name));
}

debug();
