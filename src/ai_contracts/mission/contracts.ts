import type { Base, Character, Faction, Mission, Snapshot, WorldPack } from "../../domain";

export type MissionAiInput = {
  world_pack: WorldPack;
  factions: Faction[];
  characters: Character[];
  base: Base;
  latest_snapshot?: Snapshot;
};

export type MissionAiOutput = {
  missions: Mission[];
};

export function validateMissionAiOutput(output: Partial<MissionAiOutput>): output is MissionAiOutput {
  return Boolean(output.missions && Array.isArray(output.missions) && output.missions.length >= 3);
}

export function buildFallbackMissionAiOutput(missions: Mission[]): MissionAiOutput {
  return {
    missions,
  };
}
