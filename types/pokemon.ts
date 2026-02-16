export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height?: number;
  weight?: number;
  baseStatTotal?: number;
  obtainingMethod?: string;
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
  smogonNature?: string;
  abilities: {
    normal: string[];
    hidden: string[];
  };
  evolutions: Evolution[];
  varieties?: PokemonVariety[];
}

export interface PokemonVariety {
  id: number;
  slug: string;
  name: string;
  sprite: string;
  officialArtwork: string;
  shinyArtwork: string;
  types: string[];
  stats: { name: string; value: number }[];
  smogonNature?: string;
  abilities: {
    normal: string[];
    hidden: string[];
  };
  smogonRecommended?: boolean;
}

export interface PokemonDetail extends PokemonListItem {
  height: number;
  weight: number;
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: string; value: number }[];
  evolutions?: Evolution[];
}
