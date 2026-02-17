import type { TeamMember } from '@/types/team';

/**
 * Export team to Pokémon Showdown format
 */
export function exportToShowdown(team: TeamMember[]): string {
    return team
        .map((member) => {
            const lines: string[] = [];

            // Name and item
            const itemLine = member.item
                ? `${member.name} @ ${member.item}`
                : member.name;
            lines.push(itemLine);

            // Ability
            if (member.ability) {
                lines.push(`Ability: ${member.ability}`);
            }

            // EVs (if any are set)
            const evs = member.evs;
            if (evs && Object.values(evs).some(v => v > 0)) {
                const evParts: string[] = [];
                if (evs.hp) evParts.push(`${evs.hp} HP`);
                if (evs.atk) evParts.push(`${evs.atk} Atk`);
                if (evs.def) evParts.push(`${evs.def} Def`);
                if (evs.spa) evParts.push(`${evs.spa} SpA`);
                if (evs.spd) evParts.push(`${evs.spd} SpD`);
                if (evs.spe) evParts.push(`${evs.spe} Spe`);
                if (evParts.length > 0) {
                    lines.push(`EVs: ${evParts.join(' / ')}`);
                }
            }

            // Nature
            if (member.nature) {
                lines.push(`${member.nature} Nature`);
            }

            // Moves
            member.moves.forEach((move) => {
                if (move) {
                    lines.push(`- ${move}`);
                }
            });

            return lines.join('\n');
        })
        .join('\n\n');
}

/**
 * Export team to JSON format
 */
export function exportToJSON(team: TeamMember[]): string {
    return JSON.stringify(team, null, 2);
}

/**
 * Generate shareable URL with base64 encoded team data
 */
export function generateShareableURL(team: TeamMember[]): string {
    const json = JSON.stringify(team);
    const base64 = btoa(json);
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseURL}/team-builder?import=${encodeURIComponent(base64)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Download team as file
 */
export function downloadTeamFile(team: TeamMember[], format: 'showdown' | 'json'): void {
    const content = format === 'showdown' ? exportToShowdown(team) : exportToJSON(team);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-team.${format === 'showdown' ? 'txt' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
