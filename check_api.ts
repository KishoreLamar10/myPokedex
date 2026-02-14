
import { getAllItems, getAllMoves } from "./lib/pokeapi";

// Mock fetch for checking basic logic if real fetch is slow/stuck?
// No, I need real fetch to verify endpoint structure.

async function check() {
    console.log("Checking Items/Moves...");
    // I can't easily change the limit in function signature without editing lib/pokeapi.ts
    // But getAllItems hardcodes limit=2000.

    // Maybe it's just slow to print 2000 items?
    // My script only prints 5.

    // I will try to run just one function.
    try {
        const items = await getAllItems();
        console.log(`Items: ${items.length}`);
    } catch (e) { console.error(e); }

    try {
        const moves = await getAllMoves();
        console.log(`Moves: ${moves.length}`);
    } catch (e) { console.error(e); }
}

check();
