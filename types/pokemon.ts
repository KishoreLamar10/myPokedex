export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface Evolution {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonExtended {
  id: number;
  name: string;
  sprite: string;
  animatedSprite: string;
  officialArtwork: string;
  shinyArtwork: string;
  types: string[];
  abilities: {
    normal: string[];
    hidden: string[];
  };
  evolutions: Evolution[];
}

export interface PokemonDetail extends PokemonListItem {
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  evolutions?: Evolution[];
}
