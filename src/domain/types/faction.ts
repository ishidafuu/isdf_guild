import type { FactionId, WorldPackId } from "../ids";
import type {
  FactionConflict,
  FactionDescription,
  FactionGuildRelation,
  FactionResources,
  FactionState,
  MissionRolesProfile,
  SpeechGuide,
} from "./common";

export type Faction = {
  faction_id: FactionId;
  world_pack_id: WorldPackId;
  name: string;
  kind: string;
  scale?: string;
  public_digest: string;
  description?: FactionDescription;
  guild_relation: FactionGuildRelation;
  resources?: FactionResources;
  conflicts?: FactionConflict[];
  mission_roles: MissionRolesProfile;
  speech_guide?: SpeechGuide;
  state?: FactionState;
  tags: string[];
};
