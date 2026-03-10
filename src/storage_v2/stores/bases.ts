import type { Base } from "../../domain";
import { upsertById } from "./helpers";

export function listBases(bases: Base[]): Base[] {
  return [...bases];
}

export function saveBase(bases: Base[], base: Base): Base[] {
  return upsertById(bases, "base_id", base);
}
