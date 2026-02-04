export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
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
  megaForms?: MegaForm[];
}

export interface MegaForm {
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
  abilities: string[];
  stats: { name: string; value: number }[];
  evolutions?: Evolution[];
}
