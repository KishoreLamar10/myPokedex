import { NextRequest, NextResponse } from 'next/server';
import { getAllPokemon } from '@/lib/pokeapi';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const ability = searchParams.get('ability')?.toLowerCase();
        const move = searchParams.get('move')?.toLowerCase();

        // Get stat filters
        const minHP = parseInt(searchParams.get('minHP') || '0');
        const maxHP = parseInt(searchParams.get('maxHP') || '255');
        const minAtk = parseInt(searchParams.get('minAtk') || '0');
        const maxAtk = parseInt(searchParams.get('maxAtk') || '255');
        const minDef = parseInt(searchParams.get('minDef') || '0');
        const maxDef = parseInt(searchParams.get('maxDef') || '255');
        const minSpA = parseInt(searchParams.get('minSpA') || '0');
        const maxSpA = parseInt(searchParams.get('maxSpA') || '255');
        const minSpD = parseInt(searchParams.get('minSpD') || '0');
        const maxSpD = parseInt(searchParams.get('maxSpD') || '255');
        const minSpe = parseInt(searchParams.get('minSpe') || '0');
        const maxSpe = parseInt(searchParams.get('maxSpe') || '255');
        const minBST = parseInt(searchParams.get('minBST') || '0');
        const maxBST = parseInt(searchParams.get('maxBST') || '800');

        // Get all Pokemon
        const allPokemon = await getAllPokemon();

        // Filter by ability
        let filtered = allPokemon;

        if (ability) {
            filtered = filtered.filter(pokemon =>
                pokemon.abilities?.some(a => a.toLowerCase().includes(ability))
            );
        }

        // Filter by move
        if (move) {
            filtered = filtered.filter(pokemon =>
                pokemon.moves?.some(m => m.toLowerCase().includes(move))
            );
        }

        // Filter by stats
        filtered = filtered.filter(pokemon => {
            if (!pokemon.stats) return false;

            const hp = pokemon.stats.find(s => s.name === 'hp')?.value || 0;
            const atk = pokemon.stats.find(s => s.name === 'attack')?.value || 0;
            const def = pokemon.stats.find(s => s.name === 'defense')?.value || 0;
            const spa = pokemon.stats.find(s => s.name === 'special attack')?.value || 0;
            const spd = pokemon.stats.find(s => s.name === 'special defense')?.value || 0;
            const spe = pokemon.stats.find(s => s.name === 'speed')?.value || 0;
            const bst = hp + atk + def + spa + spd + spe;

            return (
                hp >= minHP && hp <= maxHP &&
                atk >= minAtk && atk <= maxAtk &&
                def >= minDef && def <= maxDef &&
                spa >= minSpA && spa <= maxSpA &&
                spd >= minSpD && spd <= maxSpD &&
                spe >= minSpe && spe <= maxSpe &&
                bst >= minBST && bst <= maxBST
            );
        });

        return NextResponse.json({
            pokemon: filtered,
            count: filtered.length,
            filters: { ability, move, stats: { minHP, maxHP, minAtk, maxAtk, minDef, maxDef, minSpA, maxSpA, minSpD, maxSpD, minSpe, maxSpe, minBST, maxBST } }
        });
    } catch (error) {
        console.error('Advanced filter error:', error);
        return NextResponse.json(
            { error: 'Failed to filter Pokemon' },
            { status: 500 }
        );
    }
}
