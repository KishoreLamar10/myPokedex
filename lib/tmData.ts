// TM/TR data for Pokémon Scarlet/Violet (Generation 9)
// Maps TM numbers to move names

export interface TMData {
    number: string; // e.g., "TM001", "TR045"
    moveName: string;
    type: string;
}

// Technical Machines (TMs) - Scarlet/Violet
export const TM_DATA: TMData[] = [
    { number: 'TM001', moveName: 'take-down', type: 'normal' },
    { number: 'TM002', moveName: 'charm', type: 'fairy' },
    { number: 'TM003', moveName: 'fake-tears', type: 'dark' },
    { number: 'TM004', moveName: 'agility', type: 'psychic' },
    { number: 'TM005', moveName: 'mud-slap', type: 'ground' },
    { number: 'TM006', moveName: 'scary-face', type: 'normal' },
    { number: 'TM007', moveName: 'protect', type: 'normal' },
    { number: 'TM008', moveName: 'fire-fang', type: 'fire' },
    { number: 'TM009', moveName: 'thunder-fang', type: 'electric' },
    { number: 'TM010', moveName: 'ice-fang', type: 'ice' },
    // Add more TMs as needed - this is a sample
    { number: 'TM025', moveName: 'facade', type: 'normal' },
    { number: 'TM047', moveName: 'endure', type: 'normal' },
    { number: 'TM070', moveName: 'sleep-talk', type: 'normal' },
    { number: 'TM085', moveName: 'rest', type: 'psychic' },
    { number: 'TM103', moveName: 'substitute', type: 'normal' },
];

/**
 * Get TM data by move name
 */
export function getTMByMove(moveName: string): TMData | undefined {
    return TM_DATA.find((tm) => tm.moveName === moveName);
}

/**
 * Get TM data by number
 */
export function getTMByNumber(number: string): TMData | undefined {
    return TM_DATA.find((tm) => tm.number === number);
}

/**
 * Check if a move is a TM
 */
export function isTMMove(moveName: string): boolean {
    return TM_DATA.some((tm) => tm.moveName === moveName);
}
