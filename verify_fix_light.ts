
import { getPokemonList } from "./lib/pokeapi";

async function verify() {
    console.log("Fetching forms starting at offset 1025...");
    try {
        const forms = await getPokemonList(50, 1025);
        console.log(`Fetched ${forms.length} forms.`);
        const rotoms = forms.filter(p => p.name.toLowerCase().includes("rotom"));
        console.log("Rotom forms found:");
        rotoms.forEach(r => console.log(`- ${r.name} (ID: ${r.id})`));
    } catch (err) {
        console.error("Error:", err);
    }
}

verify();
