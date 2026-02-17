export type MoveCategory = 'physical' | 'special' | 'status';
export type MoveLearnMethod = 'level-up' | 'tm' | 'tr' | 'egg' | 'tutor' | 'machine';

export interface Move {
    id: number;
    name: string;
    type: string;
    category: MoveCategory;
    power: number | null;
    accuracy: number | null;
    pp: number;
    priority: number;
    effect: string;
    effectChance: number | null;
    damageClass: string;
    generation: number;
}

export interface LearnedMove {
    move: Move;
    method: MoveLearnMethod;
    level?: number;
    machine?: string; // TM01, TR45, etc.
    versionGroup?: string;
}

export interface PokemonMoveSet {
    pokemonId: number;
    pokemonName: string;
    moves: LearnedMove[];
}

export interface MoveSearchFilters {
    type?: string;
    category?: MoveCategory;
    method?: MoveLearnMethod;
    minPower?: number;
    maxPower?: number;
    generation?: number;
}
