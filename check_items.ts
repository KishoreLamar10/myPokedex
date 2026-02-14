
import { getAllItems } from "./lib/pokeapi";

async function check() {
    console.log("Fetching items...");
    try {
        const items = await getAllItems();
        console.log(`Fetched ${items.length} items.`);
        console.log("First 5:", items.slice(0, 5));
    } catch (e) {
        console.error(e);
    }
}

check();
