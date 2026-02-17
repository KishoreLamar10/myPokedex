import type { TeamMember } from '@/types/team';
import { getEffectivenessData } from './typeEffectiveness';

export interface RoleAnalysis {
    role: string;
    count: number;
    members: string[];
}

export interface SynergyScore {
    overall: number;
    typeCoverage: number;
    roleBalance: number;
    weaknessCoverage: number;
    speedTiers: number;
    moveCoverage: number;
}

export interface WeaknessOverlap {
    type: string;
    count: number;
    affectedMembers: string[];
}

/**
 * Detect role based on stats
 */
export function detectRole(member: TeamMember): string {
    const stats = member.baseStats;
    if (!stats) return 'Unknown';

    const totalStats = stats.hp + stats.attack + stats.defense + stats.spAttack + stats.spDefense + stats.speed;
    const avgStat = totalStats / 6;

    // Physical Sweeper
    if (stats.attack > avgStat * 1.3 && stats.speed > avgStat * 1.2) {
        return 'Physical Sweeper';
    }

    // Special Sweeper
    if (stats.spAttack > avgStat * 1.3 && stats.speed > avgStat * 1.2) {
        return 'Special Sweeper';
    }

    // Physical Wall
    if (stats.defense > avgStat * 1.3 && stats.hp > avgStat * 1.1) {
        return 'Physical Wall';
    }

    // Special Wall
    if (stats.spDefense > avgStat * 1.3 && stats.hp > avgStat * 1.1) {
        return 'Special Wall';
    }

    // Tank
    if (stats.hp > avgStat * 1.2 && (stats.defense > avgStat || stats.spDefense > avgStat)) {
        return 'Tank';
    }

    // Fast Support
    if (stats.speed > avgStat * 1.2) {
        return 'Fast Support';
    }

    // Bulky Support
    if (stats.hp > avgStat * 1.1) {
        return 'Bulky Support';
    }

    return 'Balanced';
}

/**
 * Analyze team roles
 */
export function analyzeRoles(team: TeamMember[]): RoleAnalysis[] {
    const roleCounts: Record<string, { count: number; members: string[] }> = {};

    team.forEach(member => {
        const role = detectRole(member);
        if (!roleCounts[role]) {
            roleCounts[role] = { count: 0, members: [] };
        }
        roleCounts[role].count++;
        roleCounts[role].members.push(member.name);
    });

    return Object.entries(roleCounts).map(([role, data]) => ({
        role,
        count: data.count,
        members: data.members,
    }));
}

/**
 * Find weakness overlaps
 */
export function findWeaknessOverlap(team: TeamMember[]): WeaknessOverlap[] {
    const weaknessCounts: Record<string, string[]> = {};

    team.forEach(member => {
        const effectiveness = getEffectivenessData(member.types);
        effectiveness.weak.forEach(weakType => {
            if (!weaknessCounts[weakType.type]) {
                weaknessCounts[weakType.type] = [];
            }
            weaknessCounts[weakType.type].push(member.name);
        });
    });

    return Object.entries(weaknessCounts)
        .map(([type, members]) => ({
            type,
            count: members.length,
            affectedMembers: members,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Calculate type coverage diversity
 */
function calculateTypeCoverage(team: TeamMember[]): number {
    const uniqueTypes = new Set<string>();
    team.forEach(member => {
        member.types.forEach(type => uniqueTypes.add(type));
    });

    // Score based on unique types (max 18 types)
    return Math.min((uniqueTypes.size / 18) * 100, 100);
}

/**
 * Calculate role balance
 */
function calculateRoleBalance(roles: RoleAnalysis[]): number {
    if (roles.length === 0) return 0;

    // Ideal: 2 sweepers, 2 walls, 2 support/balanced
    const idealDistribution = {
        sweeper: 2,
        wall: 2,
        support: 2,
    };

    const actual = {
        sweeper: 0,
        wall: 0,
        support: 0,
    };

    roles.forEach(role => {
        if (role.role.includes('Sweeper')) {
            actual.sweeper += role.count;
        } else if (role.role.includes('Wall')) {
            actual.wall += role.count;
        } else {
            actual.support += role.count;
        }
    });

    // Calculate deviation from ideal
    const deviation =
        Math.abs(actual.sweeper - idealDistribution.sweeper) +
        Math.abs(actual.wall - idealDistribution.wall) +
        Math.abs(actual.support - idealDistribution.support);

    // Lower deviation = better balance
    return Math.max(0, 100 - (deviation * 15));
}

/**
 * Calculate weakness coverage
 */
function calculateWeaknessCoverage(weaknesses: WeaknessOverlap[]): number {
    // Penalize shared weaknesses
    let penalty = 0;
    weaknesses.forEach(weakness => {
        if (weakness.count >= 4) {
            penalty += 30; // Critical weakness
        } else if (weakness.count === 3) {
            penalty += 15; // Major weakness
        } else if (weakness.count === 2) {
            penalty += 5; // Minor weakness
        }
    });

    return Math.max(0, 100 - penalty);
}

/**
 * Calculate speed tier distribution
 */
function calculateSpeedTiers(team: TeamMember[]): number {
    const speeds = team.map(m => m.baseStats?.spe || 0);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    const fast = speeds.filter(s => s > avgSpeed * 1.2).length;
    const slow = speeds.filter(s => s < avgSpeed * 0.8).length;
    const mid = speeds.length - fast - slow;

    // Good distribution: mix of fast and slow
    const balance = Math.min(fast, slow, mid);
    return (balance / speeds.length) * 100;
}

/**
 * Calculate move coverage
 */
function calculateMoveCoverage(team: TeamMember[]): number {
    const uniqueMoveTypes = new Set<string>();
    team.forEach(member => {
        if (member.moveTypes) {
            Object.values(member.moveTypes).forEach(type => {
                uniqueMoveTypes.add(type);
            });
        }
    });

    // Score based on unique move types
    return Math.min((uniqueMoveTypes.size / 18) * 100, 100);
}

/**
 * Calculate overall synergy score
 */
export function calculateSynergyScore(team: TeamMember[]): SynergyScore {
    if (team.length === 0) {
        return {
            overall: 0,
            typeCoverage: 0,
            roleBalance: 0,
            weaknessCoverage: 0,
            speedTiers: 0,
            moveCoverage: 0,
        };
    }

    const roles = analyzeRoles(team);
    const weaknesses = findWeaknessOverlap(team);

    const typeCoverage = calculateTypeCoverage(team);
    const roleBalance = calculateRoleBalance(roles);
    const weaknessCoverage = calculateWeaknessCoverage(weaknesses);
    const speedTiers = calculateSpeedTiers(team);
    const moveCoverage = calculateMoveCoverage(team);

    // Weighted average
    const overall =
        typeCoverage * 0.20 +
        roleBalance * 0.20 +
        weaknessCoverage * 0.30 +
        speedTiers * 0.15 +
        moveCoverage * 0.15;

    return {
        overall: Math.round(overall),
        typeCoverage: Math.round(typeCoverage),
        roleBalance: Math.round(roleBalance),
        weaknessCoverage: Math.round(weaknessCoverage),
        speedTiers: Math.round(speedTiers),
        moveCoverage: Math.round(moveCoverage),
    };
}

/**
 * Generate improvement suggestions
 */
export function suggestImprovements(team: TeamMember[]): string[] {
    const suggestions: string[] = [];
    const roles = analyzeRoles(team);
    const weaknesses = findWeaknessOverlap(team);
    const synergy = calculateSynergyScore(team);

    // Role suggestions
    const sweepers = roles.filter(r => r.role.includes('Sweeper')).reduce((sum, r) => sum + r.count, 0);
    const walls = roles.filter(r => r.role.includes('Wall')).reduce((sum, r) => sum + r.count, 0);

    if (sweepers === 0) {
        suggestions.push('Add an offensive sweeper for more attacking pressure');
    } else if (sweepers > 3) {
        suggestions.push('Too many sweepers - consider adding defensive support');
    }

    if (walls === 0) {
        suggestions.push('Add a defensive wall to handle threats');
    }

    // Weakness suggestions
    const criticalWeaknesses = weaknesses.filter(w => w.count >= 4);
    if (criticalWeaknesses.length > 0) {
        criticalWeaknesses.forEach(w => {
            suggestions.push(`Critical ${w.type} weakness - ${w.count} Pokémon affected`);
        });
    }

    // Coverage suggestions
    if (synergy.moveCoverage < 50) {
        suggestions.push('Improve move type coverage for better offensive options');
    }

    // Speed suggestions
    if (synergy.speedTiers < 40) {
        suggestions.push('Consider better speed tier distribution');
    }

    if (suggestions.length === 0) {
        suggestions.push('Team looks well-balanced!');
    }

    return suggestions;
}
