import type { Base, Character, Facility, Faction, Mission, StaffCharacter, WorldPack } from "../../domain";
import { cyberpunkBase } from "./base";
import { cyberpunkCharacters } from "./characters";
import { cyberpunkFacilities } from "./facilities";
import { cyberpunkFactions } from "./factions";
import { cyberpunkMissions } from "./missions";
import { cyberpunkStaff, cyberpunkStaffless } from "./staff";
import { cyberpunkWorldPack } from "./worldPack";

export type CyberpunkMinimalDataset = {
  world_pack: WorldPack;
  factions: Faction[];
  characters: Character[];
  staff: StaffCharacter[];
  base: Base;
  facilities: Facility[];
  missions: Mission[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createCyberpunkMinimalDataset(options?: {
  include_staff?: boolean;
}): CyberpunkMinimalDataset {
  const includeStaff = options?.include_staff ?? true;
  const staff = includeStaff ? cyberpunkStaff : cyberpunkStaffless;
  const base = clone(cyberpunkBase);

  base.staff_character_ids = includeStaff ? clone(cyberpunkBase.staff_character_ids) : [];

  return {
    world_pack: clone(cyberpunkWorldPack),
    factions: clone(cyberpunkFactions),
    characters: clone(cyberpunkCharacters),
    staff: clone(staff),
    base,
    facilities: clone(cyberpunkFacilities),
    missions: clone(cyberpunkMissions),
  };
}

export {
  cyberpunkBase,
  cyberpunkCharacters,
  cyberpunkFacilities,
  cyberpunkFactions,
  cyberpunkMissions,
  cyberpunkStaff,
  cyberpunkStaffless,
  cyberpunkWorldPack,
};
