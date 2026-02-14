import { formatName, getBestArtwork, isSmogonRecommended, getSmogonNature, POKEAPI, MegaForm } from "./pokeapi.ts"; // Check imports

// Wait, I can't easily extract this function into a separate file if it relies on internal helpers of `pokeapi.ts` that aren't exported.
// I should add the helper function `fetchForms` INSIDE `pokeapi.ts` or make the helpers exported.
// The `multi_replace` above tried to call `fetchForms` which didn't exist yet.
// I need to add `fetchForms` definition to `pokeapi.ts`.
