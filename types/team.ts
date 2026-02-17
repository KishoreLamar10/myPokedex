export interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  [key: string]: number;
}

export const MAX_EVS = 510;
export const MAX_SINGLE_EV = 252;
export const MAX_IV = 31;

export interface TeamMember {
  id: number; // Pokemon ID
  instanceId: string; // Unique ID for this specific team member (to allow duplicates)
  name: string;
  nickname?: string;
  sprite: string;
  types: string[];
  ability: string;
  availableAbilities?: { name: string; isHidden: boolean }[]; // List of possible abilities
  nature: string;
  item: string;
  moves: string[]; // Array of move names
  moveTypes?: Record<string, string>; // Optional mapping for coloring
  ivs: StatBlock;
  evs: StatBlock;
  baseStats?: StatBlock; // Optional for backward compatibility
  shiny: boolean;
  teraType?: string; // Optional for Gen 9
}

export interface Team {
  id: string; // UUID from Supabase
  user_id: string;
  name: string;
  pokemon: TeamMember[];
  updated_at: string;
}

export const DEFAULT_IVS: StatBlock = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
export const DEFAULT_EVS: StatBlock = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
