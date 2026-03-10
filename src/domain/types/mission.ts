import type { MissionCategory, MissionStatus, MissionResult } from "../enums";
import type { MissionId, WorldPackId } from "../ids";
import type {
  MissionClient,
  MissionDifficulty,
  MissionLocation,
  MissionObjective,
  MissionObstacle,
  MissionParticipants,
  MissionReward,
  MissionRisk,
  MissionState,
  MissionTarget,
  MissionTwist,
  TimeLimit,
} from "./common";

export type Mission = {
  mission_id: MissionId;
  world_pack_id: WorldPackId;
  category: MissionCategory;
  display_name?: string;
  category_display?: string;
  client: MissionClient;
  target: MissionTarget;
  location: MissionLocation;
  objective: MissionObjective;
  obstacles: MissionObstacle[];
  time_limit?: TimeLimit;
  reward: MissionReward;
  risk: MissionRisk;
  twist?: MissionTwist;
  difficulty: MissionDifficulty;
  participants?: MissionParticipants;
  state?: MissionState;
  tags: string[];
};
