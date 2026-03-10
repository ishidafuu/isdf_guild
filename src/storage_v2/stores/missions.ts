import type { Mission } from "../../domain";
import { upsertById } from "./helpers";

export function listMissions(missions: Mission[]): Mission[] {
  return [...missions];
}

export function saveMission(missions: Mission[], mission: Mission): Mission[] {
  return upsertById(missions, "mission_id", mission);
}
