import type { Faction } from "../../domain";
import { upsertById } from "./helpers";

export function listFactions(factions: Faction[]): Faction[] {
  return [...factions];
}

export function saveFaction(factions: Faction[], faction: Faction): Faction[] {
  return upsertById(factions, "faction_id", faction);
}
