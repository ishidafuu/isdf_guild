import type { FactionId, WorldPackId } from "../ids";
import type {
  BaseProfile,
  DisplayDictionary,
  IntroHook,
  MissionGenerationProfile,
  ResourceDictionary,
  SpecialFlavor,
  ToneProfile,
  WorldSummary,
} from "./common";

export type WorldPack = {
  world_pack_id: WorldPackId;
  name: string;
  genre: string;
  era?: string;
  scale?: string;
  one_liner: string;
  mood_tags: string[];
  tone_profile?: ToneProfile;
  world_summary: WorldSummary;
  display_dictionary: DisplayDictionary;
  resource_dictionary: ResourceDictionary;
  base_profile: BaseProfile;
  faction_ids?: FactionId[];
  enemy_categories?: string[];
  mission_generation?: MissionGenerationProfile;
  special_flavor?: SpecialFlavor;
  intro_hook?: IntroHook;
  tags: string[];
};
