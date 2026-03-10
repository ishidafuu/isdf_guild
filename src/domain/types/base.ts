import type { BaseStatus, FacilityStatus } from "../enums";
import type { BaseId, CharacterId, FacilityId, FactionId, WorldPackId } from "../ids";
import type { BaseStateValues, FacilityAvailabilityRule } from "./common";

export type Facility = {
  facility_id: FacilityId;
  world_pack_id: WorldPackId;
  name: string;
  category: string;
  status: FacilityStatus;
  summary: string;
  description?: string;
  effect_tags: string[];
  availability_rule?: FacilityAvailabilityRule;
  usage_examples?: string[];
  narrative_effects?: string[];
  state_flags?: string[];
  tags?: string[];
};

export type Base = {
  base_id: BaseId;
  world_pack_id: WorldPackId;
  name: string;
  status: BaseStatus;
  summary: string;
  description?: string;
  tone_tags?: string[];
  state_values?: BaseStateValues;
  staff_character_ids: CharacterId[];
  facility_ids: FacilityId[];
  active_issue_tags?: string[];
  narrative_changes?: string[];
  linked_faction_ids?: FactionId[];
  tags?: string[];
};
