// Smogon API integration for competitive meta data
// Note: This is a simplified implementation. Full Smogon API integration would require
// parsing their usage stats files and potentially scraping their strategy dex.

export interface SmogonUsageData {
    pokemon: string;
    tier: string;
    usagePercent: number;
    rank: number;
    abilities: { name: string; percent: number }[];
    items: { name: string; percent: number }[];
    spreads: { nature: string; evs: string; percent: number }[];
    moves: { name: string; percent: number }[];
    teammates: { name: string; percent: number }[];
    counters: { name: string; score: number }[];
}

// Simulated data - in production, this would fetch from Smogon's usage stats
// https://www.smogon.com/stats/
const MOCK_USAGE_DATA: Record<string, SmogonUsageData> = {
    'landorus-therian': {
        pokemon: 'Landorus-Therian',
        tier: 'OU',
        usagePercent: 45.2,
        rank: 1,
        abilities: [
            { name: 'Intimidate', percent: 99.8 },
            { name: 'Sheer Force', percent: 0.2 },
        ],
        items: [
            { name: 'Choice Scarf', percent: 52.3 },
            { name: 'Rocky Helmet', percent: 24.1 },
            { name: 'Leftovers', percent: 12.8 },
            { name: 'Life Orb', percent: 8.2 },
        ],
        spreads: [
            { nature: 'Jolly', evs: '252 Atk / 4 Def / 252 Spe', percent: 48.5 },
            { nature: 'Impish', evs: '252 HP / 240 Def / 16 Spe', percent: 28.3 },
            { nature: 'Careful', evs: '252 HP / 4 Def / 252 SpD', percent: 12.1 },
        ],
        moves: [
            { name: 'Earthquake', percent: 98.5 },
            { name: 'U-turn', percent: 87.2 },
            { name: 'Stealth Rock', percent: 72.4 },
            { name: 'Stone Edge', percent: 45.8 },
            { name: 'Knock Off', percent: 32.1 },
        ],
        teammates: [
            { name: 'Toxapex', percent: 38.5 },
            { name: 'Heatran', percent: 35.2 },
            { name: 'Tapu Koko', percent: 28.7 },
        ],
        counters: [
            { name: 'Weavile', score: 3.2 },
            { name: 'Kyurem', score: 2.8 },
            { name: 'Mamoswine', score: 2.5 },
        ],
    },
    'garchomp': {
        pokemon: 'Garchomp',
        tier: 'OU',
        usagePercent: 32.8,
        rank: 3,
        abilities: [
            { name: 'Rough Skin', percent: 98.5 },
            { name: 'Sand Veil', percent: 1.5 },
        ],
        items: [
            { name: 'Rocky Helmet', percent: 42.1 },
            { name: 'Life Orb', percent: 28.5 },
            { name: 'Choice Scarf', percent: 18.2 },
            { name: 'Focus Sash', percent: 8.1 },
        ],
        spreads: [
            { nature: 'Jolly', evs: '252 Atk / 4 Def / 252 Spe', percent: 52.3 },
            { nature: 'Jolly', evs: '252 HP / 200 Def / 56 Spe', percent: 24.8 },
            { nature: 'Naive', evs: '252 Atk / 4 SpA / 252 Spe', percent: 12.5 },
        ],
        moves: [
            { name: 'Earthquake', percent: 99.2 },
            { name: 'Stealth Rock', percent: 78.5 },
            { name: 'Swords Dance', percent: 58.3 },
            { name: 'Scale Shot', percent: 42.1 },
            { name: 'Stone Edge', percent: 38.7 },
        ],
        teammates: [
            { name: 'Corviknight', percent: 42.3 },
            { name: 'Clefable', percent: 38.1 },
            { name: 'Heatran', percent: 32.5 },
        ],
        counters: [
            { name: 'Weavile', score: 4.1 },
            { name: 'Kyurem', score: 3.5 },
            { name: 'Tapu Fini', score: 2.8 },
        ],
    },
    'dragapult': {
        pokemon: 'Dragapult',
        tier: 'OU',
        usagePercent: 28.5,
        rank: 5,
        abilities: [
            { name: 'Infiltrator', percent: 65.2 },
            { name: 'Clear Body', percent: 34.8 },
        ],
        items: [
            { name: 'Choice Band', percent: 38.5 },
            { name: 'Choice Specs', percent: 28.2 },
            { name: 'Life Orb', percent: 18.5 },
            { name: 'Heavy-Duty Boots', percent: 12.1 },
        ],
        spreads: [
            { nature: 'Jolly', evs: '252 Atk / 4 Def / 252 Spe', percent: 42.5 },
            { nature: 'Timid', evs: '252 SpA / 4 SpD / 252 Spe', percent: 35.8 },
            { nature: 'Adamant', evs: '252 Atk / 4 SpD / 252 Spe', percent: 12.3 },
        ],
        moves: [
            { name: 'Dragon Darts', percent: 85.2 },
            { name: 'U-turn', percent: 72.5 },
            { name: 'Phantom Force', percent: 58.3 },
            { name: 'Shadow Ball', percent: 42.1 },
            { name: 'Draco Meteor', percent: 38.5 },
        ],
        teammates: [
            { name: 'Landorus-Therian', percent: 45.2 },
            { name: 'Heatran', percent: 38.5 },
            { name: 'Toxapex', percent: 32.1 },
        ],
        counters: [
            { name: 'Tyranitar', score: 3.8 },
            { name: 'Melmetal', score: 3.2 },
            { name: 'Clefable', score: 2.5 },
        ],
    },
};

export async function getSmogonUsageData(pokemonName: string): Promise<SmogonUsageData | null> {
    // Normalize the Pokemon name
    const normalized = pokemonName.toLowerCase().replace(/\s+/g, '-');

    // In production, this would fetch from Smogon's API or parse usage stats files
    // For now, return mock data if available
    return MOCK_USAGE_DATA[normalized] || null;
}

export function getTierColor(tier: string): string {
    const colors: Record<string, string> = {
        'Uber': '#ff4444',
        'OU': '#ffaa00',
        'UU': '#ffdd55',
        'RU': '#88dd88',
        'NU': '#88ccff',
        'PU': '#cc88ff',
        'LC': '#ffaacc',
        'NFE': '#aaaaaa',
    };
    return colors[tier] || '#888888';
}

export function getTierDescription(tier: string): string {
    const descriptions: Record<string, string> = {
        'Uber': 'Uber - The most powerful Pokemon, banned from standard play',
        'OU': 'OverUsed - The standard competitive tier',
        'UU': 'UnderUsed - Strong Pokemon not quite OU level',
        'RU': 'RarelyUsed - Solid Pokemon for lower tiers',
        'NU': 'NeverUsed - Niche Pokemon with specific roles',
        'PU': 'PU - The lowest usage tier',
        'LC': 'Little Cup - Unevolved Pokemon only',
        'NFE': 'Not Fully Evolved - Pokemon with evolutions',
    };
    return descriptions[tier] || 'Untiered';
}
