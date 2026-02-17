export type PokemonType =
    | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
    | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
    | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface ThemeConfig {
    mode: 'light' | 'dark' | 'auto';
    accentColor: string;
    primaryType?: PokemonType;
}

export interface PokemonTag {
    id: string;
    name: string;
    color: string;
    pokemonIds: number[];
    createdAt: number;
}

export interface PokemonNote {
    pokemonId: number;
    content: string;
    updatedAt: number;
}

export interface CustomList {
    id: string;
    name: string;
    description?: string;
    pokemonIds: number[];
    createdAt: number;
    updatedAt: number;
}

export interface UserPreferences {
    version: number; // For migration support
    theme: ThemeConfig;
    tags: PokemonTag[];
    notes: Record<number, PokemonNote>;
    favorites: number[];
    customLists: CustomList[];
    lastUpdated: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    version: 1,
    theme: {
        mode: 'dark',
        accentColor: '#dc2626', // Pokédex red
    },
    tags: [],
    notes: {},
    favorites: [],
    customLists: [],
    lastUpdated: Date.now(),
};
