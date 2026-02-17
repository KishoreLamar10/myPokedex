import type { Move, LearnedMove, PokemonMoveSet, MoveCategory } from '@/types/move';

// Cache for move data
const moveCache = new Map<number, Move>();
const pokemonMovesCache = new Map<number, PokemonMoveSet>();

/**
 * Fetch move data from PokéAPI
 */
export async function fetchMoveData(moveId: number): Promise<Move | null> {
    // Check cache first
    if (moveCache.has(moveId)) {
        return moveCache.get(moveId)!;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${moveId}`);
        if (!response.ok) return null;

        const data = await response.json();

        const move: Move = {
            id: data.id,
            name: data.name,
            type: data.type.name,
            category: mapDamageClass(data.damage_class.name),
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            priority: data.priority,
            effect: parseMoveEffect(data.effect_entries),
            effectChance: data.effect_chance,
            damageClass: data.damage_class.name,
            generation: data.generation.url.split('/').slice(-2, -1)[0],
        };

        // Cache the result
        moveCache.set(moveId, move);
        return move;
    } catch (error) {
        console.error(`Failed to fetch move ${moveId}:`, error);
        return null;
    }
}

/**
 * Fetch all moves a Pokémon can learn
 */
export async function fetchPokemonMoves(pokemonId: number): Promise<PokemonMoveSet | null> {
    // Check cache first
    if (pokemonMovesCache.has(pokemonId)) {
        return pokemonMovesCache.get(pokemonId)!;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!response.ok) return null;

        const data = await response.json();
        const moves: LearnedMove[] = [];

        // Process each move
        for (const moveEntry of data.moves) {
            const moveUrl = moveEntry.move.url;
            const moveId = parseInt(moveUrl.split('/').slice(-2, -1)[0]);

            // Fetch move details
            const move = await fetchMoveData(moveId);
            if (!move) continue;

            // Process learn methods
            for (const versionDetail of moveEntry.version_group_details) {
                const method = mapLearnMethod(versionDetail.move_learn_method.name);
                const level = versionDetail.level_learned_at;

                moves.push({
                    move,
                    method,
                    level: level > 0 ? level : undefined,
                    versionGroup: versionDetail.version_group.name,
                });
            }
        }

        const moveSet: PokemonMoveSet = {
            pokemonId,
            pokemonName: data.name,
            moves,
        };

        // Cache the result
        pokemonMovesCache.set(pokemonId, moveSet);
        return moveSet;
    } catch (error) {
        console.error(`Failed to fetch moves for Pokémon ${pokemonId}:`, error);
        return null;
    }
}

/**
 * Parse move effect text from API response
 */
function parseMoveEffect(effectEntries: any[]): string {
    const englishEffect = effectEntries.find(
        (entry) => entry.language.name === 'en'
    );

    if (!englishEffect) return 'No effect description available.';

    // Use short effect if available, otherwise use full effect
    return englishEffect.short_effect || englishEffect.effect || 'No effect description available.';
}

/**
 * Map API damage class to our category type
 */
function mapDamageClass(damageClass: string): MoveCategory {
    switch (damageClass) {
        case 'physical':
            return 'physical';
        case 'special':
            return 'special';
        case 'status':
            return 'status';
        default:
            return 'status';
    }
}

/**
 * Map API learn method to our type
 */
function mapLearnMethod(method: string): LearnedMove['method'] {
    switch (method) {
        case 'level-up':
            return 'level-up';
        case 'machine':
            return 'machine';
        case 'egg':
            return 'egg';
        case 'tutor':
            return 'tutor';
        default:
            return 'machine';
    }
}

/**
 * Categorize moves by type
 */
export function categorizeMoves(moves: LearnedMove[]): Record<string, LearnedMove[]> {
    const categorized: Record<string, LearnedMove[]> = {};

    for (const learnedMove of moves) {
        const type = learnedMove.move.type;
        if (!categorized[type]) {
            categorized[type] = [];
        }
        categorized[type].push(learnedMove);
    }

    return categorized;
}

/**
 * Filter moves by learn method
 */
export function filterByMethod(moves: LearnedMove[], method: LearnedMove['method']): LearnedMove[] {
    return moves.filter((m) => m.method === method);
}

/**
 * Get level-up moves sorted by level
 */
export function getLevelUpMoves(moves: LearnedMove[]): LearnedMove[] {
    return moves
        .filter((m) => m.method === 'level-up' && m.level !== undefined)
        .sort((a, b) => (a.level || 0) - (b.level || 0));
}

/**
 * Clear move caches (useful for testing or memory management)
 */
export function clearMoveCache(): void {
    moveCache.clear();
    pokemonMovesCache.clear();
}
