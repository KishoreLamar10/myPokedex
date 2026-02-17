import type { TeamMember } from '@/types/team';

/**
 * Parse Pokémon Showdown format
 */
export function parseShowdownFormat(text: string): TeamMember[] {
    const team: TeamMember[] = [];
    const blocks = text.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) continue;

        const member: Partial<TeamMember> = {
            moves: [],
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        };

        // Parse first line (name and item)
        const firstLine = lines[0];
        const itemMatch = firstLine.match(/^(.+?)\s*@\s*(.+)$/);
        if (itemMatch) {
            member.name = itemMatch[1].trim();
            member.item = itemMatch[2].trim();
        } else {
            member.name = firstLine;
        }

        // Parse other lines
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // Ability
            if (line.startsWith('Ability:')) {
                member.ability = line.replace('Ability:', '').trim();
            }
            // EVs
            else if (line.startsWith('EVs:')) {
                const evString = line.replace('EVs:', '').trim();
                const evParts = evString.split('/').map(p => p.trim());
                evParts.forEach(part => {
                    const match = part.match(/(\d+)\s+(\w+)/);
                    if (match) {
                        const value = parseInt(match[1]);
                        const stat = match[2].toLowerCase();
                        if (stat === 'hp') member.evs!.hp = value;
                        else if (stat === 'atk') member.evs!.atk = value;
                        else if (stat === 'def') member.evs!.def = value;
                        else if (stat === 'spa') member.evs!.spa = value;
                        else if (stat === 'spd') member.evs!.spd = value;
                        else if (stat === 'spe') member.evs!.spe = value;
                    }
                });
            }
            // Nature
            else if (line.includes('Nature')) {
                member.nature = line.replace('Nature', '').trim();
            }
            // Moves
            else if (line.startsWith('-')) {
                const moveName = line.substring(1).trim();
                member.moves!.push({ name: moveName, type: '' }); // Type will be filled later
            }
        }

        // Only add if we have a valid name
        if (member.name) {
            team.push(member as TeamMember);
        }
    }

    return team;
}

/**
 * Parse JSON format
 */
export function parseJSONFormat(json: string): TeamMember[] {
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return [];
    }
}

/**
 * Parse shareable URL format
 */
export function parseURLFormat(url: string): TeamMember[] {
    try {
        const urlObj = new URL(url);
        const importParam = urlObj.searchParams.get('import');
        if (!importParam) return [];

        const decoded = atob(decodeURIComponent(importParam));
        return parseJSONFormat(decoded);
    } catch (error) {
        console.error('Failed to parse URL:', error);
        return [];
    }
}

/**
 * Auto-detect format and parse
 */
export function autoParseTeam(input: string): TeamMember[] {
    // Try URL format first
    if (input.startsWith('http')) {
        const team = parseURLFormat(input);
        if (team.length > 0) return team;
    }

    // Try JSON format
    if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        const team = parseJSONFormat(input);
        if (team.length > 0) return team;
    }

    // Default to Showdown format
    return parseShowdownFormat(input);
}

/**
 * Validate team
 */
export function validateTeam(team: TeamMember[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (team.length === 0) {
        errors.push('Team is empty');
    }

    if (team.length > 6) {
        errors.push('Team has more than 6 Pokémon');
    }

    team.forEach((member, index) => {
        if (!member.name) {
            errors.push(`Pokémon ${index + 1} has no name`);
        }
        if (!member.moves || member.moves.length === 0) {
            errors.push(`${member.name || `Pokémon ${index + 1}`} has no moves`);
        }
        if (member.moves && member.moves.length > 4) {
            errors.push(`${member.name || `Pokémon ${index + 1}`} has more than 4 moves`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
