export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonDetail extends PokemonListItem {
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
}
