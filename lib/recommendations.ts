export const UTILITY_MOVES = new Set([
    "recover", "roost", "soft-boiled", "slack-off", "milk-drink",
    "stealth-rock", "spikes", "toxic-spikes", "sticky-web",
    "toxic", "will-o-wisp", "thunder-wave", "glare", "spore", "yawn",
    "swords-dance", "dragon-dance", "nasty-plot", "calm-mind", "quiver-dance", "bulk-up",
    "u-turn", "volt-switch", "flip-turn", "parting-shot",
    "defog", "rapid-spin", "haze", "taunt", "encore", "substitute"
]);

export interface SimpleMove {
    name: string;
    type: string;
    power: number | null;
    damageClass: string;
    accuracy: number | null;
}

export function scoreMove(
    move: SimpleMove,
    pokemonTypes: string[],
    stats: Record<string, number>
): number {
    let score = 0;
    const name = move.name.toLowerCase().replace(/ /g, "-");
    const moveType = move.type.toLowerCase();
    const lowerTypes = pokemonTypes.map(t => t.toLowerCase());

    // 1. STAB (Same Type Attack Bonus)
    if (lowerTypes.includes(moveType)) {
        score += 100;
    }

    // 2. Power Impact
    if (move.power) {
        score += move.power;
    }

    // 3. Category Synergy
    const atk = stats["atk"] || stats["Attack"] || 0;
    const spa = stats["spa"] || stats["Special Attack"] || 0;

    if (move.damageClass === "physical") {
        if (atk > spa + 20) score += 50;
        else if (spa > atk + 20) score -= 30;
    } else if (move.damageClass === "special") {
        if (spa > atk + 20) score += 50;
        else if (atk > spa + 20) score -= 30;
    }

    // 4. Utility / Meta relevance
    if (UTILITY_MOVES.has(name)) {
        score += 150;
    }

    // 5. Accuracy penalty for low accuracy
    if (move.accuracy && move.accuracy < 80) {
        score -= (80 - move.accuracy);
    }

    // 6. Extreme low power penalty (unless utility)
    if (move.power && move.power < 40 && !UTILITY_MOVES.has(name)) {
        score -= 50;
    }

    return score;
}
