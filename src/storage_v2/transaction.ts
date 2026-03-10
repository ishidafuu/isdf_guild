import type { MissionCycleState } from "../core/mission_flow/types";
import type { StorageV2Data } from "./schema";

export function stateToStorageData(state: MissionCycleState): StorageV2Data {
  return {
    world_packs: [state.world_pack],
    factions: state.factions,
    characters: state.characters,
    staff: state.staff,
    bases: [state.base],
    facilities: state.facilities,
    missions: state.missions,
    dispatches: state.dispatches,
    reports: state.reports,
    snapshots: state.snapshots,
    guildmaster_notes: state.guildmaster_notes,
  };
}

export function storageDataToState(data: StorageV2Data): MissionCycleState {
  const worldPack = data.world_packs[0];
  const base = data.bases[0];

  if (!worldPack || !base) {
    throw new Error("storage_v2 data に world_pack または base がありません");
  }

  return {
    world_pack: worldPack,
    factions: data.factions,
    characters: data.characters,
    staff: data.staff,
    base,
    facilities: data.facilities,
    missions: data.missions,
    dispatches: data.dispatches,
    reports: data.reports,
    snapshots: data.snapshots,
    guildmaster_notes: data.guildmaster_notes,
  };
}
