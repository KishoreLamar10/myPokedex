
import { getPokemonList } from "./lib/pokeapi";

async function debug() {
    console.log("Fetching Rotom forms (10000-10020)...");
    // Fetch just a few to be fast
    const forms = await getPokemonList(20, 10000);

    const rotoms = forms.filter(p => p.name.toLowerCase().includes("rotom"));
    console.log("Rotom forms found:");
    rotoms.forEach(r => {
        console.log(`ID: ${r.id}, Name: "${r.name}"`);
    });
}

debug();
