import type {
  Base,
  Character,
  Dispatch,
  Facility,
  Faction,
  GuildmasterNote,
  Mission,
  Report,
  Snapshot,
  StaffCharacter,
  WorldPack,
} from "../domain";

export type StorageV2Data = {
  world_packs: WorldPack[];
  factions: Faction[];
  characters: Character[];
  staff: StaffCharacter[];
  bases: Base[];
  facilities: Facility[];
  missions: Mission[];
  dispatches: Dispatch[];
  reports: Report[];
  snapshots: Snapshot[];
  guildmaster_notes: GuildmasterNote[];
};

export function createStorageV2Data(input: {
  world_pack: WorldPack;
  factions: Faction[];
  characters: Character[];
  staff: StaffCharacter[];
  base: Base;
  facilities: Facility[];
  missions: Mission[];
}): StorageV2Data {
  return {
    world_packs: [input.world_pack],
    factions: input.factions,
    characters: input.characters,
    staff: input.staff,
    bases: [input.base],
    facilities: input.facilities,
    missions: input.missions,
    dispatches: [],
    reports: [],
    snapshots: [],
    guildmaster_notes: [],
  };
}
