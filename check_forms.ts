
import { getPokemonList } from "./lib/pokeapi";

async function check() {
    console.log("Fetching Rotom forms (subset)...");
    try {
        // Rotom forms are around 10008. Fetching 10000-10020.
        const forms = await getPokemonList(20, 10000);
        console.log(`Fetched ${forms.length} forms.`);
        const rotoms = forms.filter((p: any) => p.name.toLowerCase().includes("rotom"));
        console.log("Rotom forms found:", rotoms.map((p: any) => p.name));
    } catch (err) {
        console.error("Error fetching pokemon:", err);
    }
}

check();
