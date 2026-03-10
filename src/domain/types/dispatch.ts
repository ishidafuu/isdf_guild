import type { DispatchStatus, Phase, PriorityLevel } from "../enums";
import type { CharacterId, DispatchId, MissionId, WorldPackId } from "../ids";
import type {
  DispatchBaseState,
  DispatchDecision,
  DispatchGuildmasterView,
  DispatchRiskView,
  PartyRoleAssignment,
} from "./common";

export type Dispatch = {
  dispatch_id: DispatchId;
  mission_id: MissionId;
  world_pack_id: WorldPackId;
  status: DispatchStatus;
  decision?: DispatchDecision;
  assigned_character_ids: CharacterId[];
  party_roles?: PartyRoleAssignment[];
  risk_view?: DispatchRiskView;
  base_state?: DispatchBaseState;
  guildmaster_view?: DispatchGuildmasterView;
  dispatch_note?: string;
  created_phase: Phase;
  tags?: string[];
};
