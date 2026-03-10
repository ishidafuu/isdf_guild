import type { Facility } from "../../domain";
import { upsertById } from "./helpers";

export function listFacilities(facilities: Facility[]): Facility[] {
  return [...facilities];
}

export function saveFacility(facilities: Facility[], facility: Facility): Facility[] {
  return upsertById(facilities, "facility_id", facility);
}
