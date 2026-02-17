import { TYPE_CHART } from './typeEffectiveness';

export interface DamageCalcOptions {
    level?: number;
    weather?: 'sun' | 'rain' | 'sand' | 'snow' | 'none';
    terrain?: 'electric' | 'grassy' | 'misty' | 'psychic' | 'none';
    isCritical?: boolean;
    attackerItem?: string;
    defenderItem?: string;
    attackerAbility?: string;
    defenderAbility?: string;
}

export interface DamageResult {
    min: number;
    max: number;
    minPercent: number;
    maxPercent: number;
    koChance: string;
}

/**
 * Calculate STAB (Same Type Attack Bonus)
 */
export function getSTAB(moveType: string, attackerTypes: string[]): number {
    const hasSTAB = attackerTypes.some(t => t.toLowerCase() === moveType.toLowerCase());
    return hasSTAB ? 1.5 : 1.0;
}

/**
 * Get type effectiveness multiplier
 */
export function getTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
    let multiplier = 1.0;

    for (const defType of defenderTypes) {
        const effectiveness = TYPE_CHART[moveType.toLowerCase()]?.[defType.toLowerCase()];
        if (effectiveness !== undefined) {
            multiplier *= effectiveness;
        }
    }

    return multiplier;
}

/**
 * Get weather modifier
 */
export function getWeatherModifier(moveType: string, weather: string): number {
    if (weather === 'none') return 1.0;

    const weatherBoosts: Record<string, string[]> = {
        sun: ['fire'],
        rain: ['water'],
    };

    const weatherNerfs: Record<string, string[]> = {
        sun: ['water'],
        rain: ['fire'],
    };

    if (weatherBoosts[weather]?.includes(moveType.toLowerCase())) {
        return 1.5;
    }

    if (weatherNerfs[weather]?.includes(moveType.toLowerCase())) {
        return 0.5;
    }

    return 1.0;
}

/**
 * Get item modifier
 */
export function getItemModifier(item: string, moveType: string, isPhysical: boolean): number {
    const itemLower = item.toLowerCase();

    // Life Orb
    if (itemLower.includes('life orb')) {
        return 1.3;
    }

    // Choice items
    if (itemLower.includes('choice band') && isPhysical) {
        return 1.5;
    }
    if (itemLower.includes('choice specs') && !isPhysical) {
        return 1.5;
    }

    // Type-boosting items (e.g., Charcoal for Fire)
    // Simplified - would need full item database

    return 1.0;
}

/**
 * Calculate damage using Gen 9 formula
 */
export function calculateDamage(
    attackerLevel: number,
    attackerStat: number,
    defenderStat: number,
    movePower: number,
    moveType: string,
    attackerTypes: string[],
    defenderTypes: string[],
    defenderHP: number,
    options: DamageCalcOptions = {}
): DamageResult {
    const {
        weather = 'none',
        isCritical = false,
        attackerItem = '',
        defenderItem = '',
    } = options;

    // Base damage calculation
    const levelMultiplier = (2 * attackerLevel / 5 + 2);
    const baseDamage = levelMultiplier * movePower * (attackerStat / defenderStat) / 50 + 2;

    // Apply modifiers
    let damage = baseDamage;

    // STAB
    const stab = getSTAB(moveType, attackerTypes);
    damage *= stab;

    // Type effectiveness
    const typeEffectiveness = getTypeEffectiveness(moveType, defenderTypes);
    damage *= typeEffectiveness;

    // Weather
    const weatherMod = getWeatherModifier(moveType, weather);
    damage *= weatherMod;

    // Critical hit
    if (isCritical) {
        damage *= 1.5;
    }

    // Item modifier (simplified)
    const isPhysical = true; // Would need to check move category
    const itemMod = getItemModifier(attackerItem, moveType, isPhysical);
    damage *= itemMod;

    // Random factor (85% - 100%)
    const minDamage = Math.floor(damage * 0.85);
    const maxDamage = Math.floor(damage);

    // Calculate percentages
    const minPercent = (minDamage / defenderHP) * 100;
    const maxPercent = (maxDamage / defenderHP) * 100;

    // Determine KO chance
    let koChance = 'No KO';
    if (minDamage >= defenderHP) {
        koChance = 'Guaranteed OHKO';
    } else if (maxDamage >= defenderHP) {
        koChance = 'Possible OHKO';
    } else if (minDamage * 2 >= defenderHP) {
        koChance = 'Guaranteed 2HKO';
    } else if (maxDamage * 2 >= defenderHP) {
        koChance = 'Possible 2HKO';
    } else if (minDamage * 3 >= defenderHP) {
        koChance = 'Guaranteed 3HKO';
    } else if (maxDamage * 3 >= defenderHP) {
        koChance = 'Possible 3HKO';
    }

    return {
        min: minDamage,
        max: maxDamage,
        minPercent,
        maxPercent,
        koChance,
    };
}

/**
 * Calculate stat with EVs, IVs, and nature
 */
export function calculateStat(
    base: number,
    level: number,
    ev: number = 0,
    iv: number = 31,
    natureMod: number = 1.0,
    isHP: boolean = false
): number {
    if (isHP) {
        return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
    } else {
        return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureMod);
    }
}

/**
 * Get nature modifier for a stat
 */
export function getNatureModifier(nature: string, stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe'): number {
    const natureChart: Record<string, { plus?: string; minus?: string }> = {
        adamant: { plus: 'atk', minus: 'spa' },
        bold: { plus: 'def', minus: 'atk' },
        brave: { plus: 'atk', minus: 'spe' },
        calm: { plus: 'spd', minus: 'atk' },
        careful: { plus: 'spd', minus: 'spa' },
        gentle: { plus: 'spd', minus: 'def' },
        hasty: { plus: 'spe', minus: 'def' },
        impish: { plus: 'def', minus: 'spa' },
        jolly: { plus: 'spe', minus: 'spa' },
        lax: { plus: 'def', minus: 'spd' },
        lonely: { plus: 'atk', minus: 'def' },
        mild: { plus: 'spa', minus: 'def' },
        modest: { plus: 'spa', minus: 'atk' },
        naive: { plus: 'spe', minus: 'spd' },
        naughty: { plus: 'atk', minus: 'spd' },
        quiet: { plus: 'spa', minus: 'spe' },
        rash: { plus: 'spa', minus: 'spd' },
        relaxed: { plus: 'def', minus: 'spe' },
        sassy: { plus: 'spd', minus: 'spe' },
        timid: { plus: 'spe', minus: 'atk' },
    };

    const natureLower = nature.toLowerCase();
    const natureData = natureChart[natureLower];

    if (!natureData) return 1.0;

    if (natureData.plus === stat) return 1.1;
    if (natureData.minus === stat) return 0.9;

    return 1.0;
}
