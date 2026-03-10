import type { WorldPack } from "../../domain";
import { upsertById } from "./helpers";

export function listWorldPacks(worldPacks: WorldPack[]): WorldPack[] {
  return [...worldPacks];
}

export function saveWorldPack(worldPacks: WorldPack[], worldPack: WorldPack): WorldPack[] {
  return upsertById(worldPacks, "world_pack_id", worldPack);
}
