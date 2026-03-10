import type {
  Availability,
  Atmosphere,
  BaseReadiness,
  ConfidenceLevel,
  FactionVisibility,
  FactionStance,
  HeatLevel,
  MemberKind,
  MissionClientType,
  MissionResult,
  MissionStatus,
  Phase,
  PressureLevel,
  PriorityLevel,
  RelationDirection,
  RewardChange,
  Role,
  StaffMargin,
  StabilityLevel,
} from "../enums";
import type {
  BaseId,
  CharacterId,
  DispatchId,
  FacilityId,
  FactionId,
  MissionId,
  NoteCandidateSetId,
  NoteId,
  ReportId,
  SkillId,
  TimelineEventId,
  InterviewId,
  WorldPackId,
} from "../ids";

export type StatKey = "power" | "tech" | "sense" | "social" | "will";
export type Stats = Record<StatKey, number>;

export type Big5Key =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";
export type Big5Profile = Record<Big5Key, number>;

export type PrivateDossier = {
  core_identity: string;
  background: string;
  daily_texture: string;
  values: string;
  social: string;
  work_view: string;
  history_hook: string;
  speech_rule: string;
  guild_view?: string;
};

export type TraitSet = {
  strengths?: string[];
  flaws?: string[];
  personality_tags?: string[];
};

export type CharacterStatus = {
  injury: number;
  stress: number;
  availability: Availability;
  recovery_note?: string;
};

export type RelationshipTargetType = "character" | "faction";

export type Relationship = {
  target_type: RelationshipTargetType;
  target_id: CharacterId | FactionId;
  score: number;
  tags: string[];
};

export type TimelineEventKind = "backstory" | "mission_aftermath" | "relationship_shift" | "rest_event";

export type TimelineEvent = {
  event_id: TimelineEventId;
  kind: TimelineEventKind;
  summary: string;
};

export type Skill = {
  skill_id: SkillId;
  name: string;
  kind: string;
};

export type DisplayDictionary = {
  stats: Record<StatKey, string>;
  roles: Record<Role, string[]>;
  mission_categories: Record<string, string[]>;
};

export type ResourceDictionary = {
  currency: string[];
  reputation: string[];
  rare_resources?: string[];
};

export type ToneProfile = {
  baseline: string;
  comedy_level: string;
  cruelty_level: string;
  bitterness_level: string;
};

export type WorldSummary = {
  summary: string;
  guild_role: string;
  main_conflict: string;
};

export type BaseProfile = {
  base_name: string;
  base_style: string;
  facility_examples: string[];
};

export type MissionGenerationProfile = {
  client_pool_tags?: string[];
  location_pool_tags?: string[];
  obstacle_pool_tags?: string[];
};

export type SpecialFlavor = {
  signature_elements?: string[];
  forbidden_elements?: string[];
  damage_terms?: string[];
};

export type IntroHook = {
  opening_text: string;
  first_mission_seed: string;
};

export type FactionDescription = {
  summary: string;
  position: string;
  tone: string;
};

export type FactionGuildRelation = {
  stance: FactionStance;
  relation_score: number;
  tags: string[];
  recent_change?: string;
};

export type FactionResources = {
  offers?: string[];
  wants?: string[];
};

export type FactionConflict = {
  target_faction_id: FactionId;
  kind: string;
  summary: string;
};

export type MissionRolesProfile = {
  can_be_client: boolean;
  can_be_patron: boolean;
  can_be_enemy: boolean;
  can_be_complication: boolean;
};

export type SpeechGuide = {
  style: string;
  keywords: string[];
};

export type FactionState = {
  visibility: FactionVisibility;
  stability: StabilityLevel;
  heat_level: HeatLevel;
};

export type MissionClient =
  | string
  | {
      type: "faction";
      faction_id: FactionId;
      name: string;
    }
  | {
      type: Exclude<MissionClientType, "faction">;
      name: string;
    };

export type MissionTarget = string | { kind: string; name: string; traits?: string[] };

export type MissionLocation =
  | string
  | {
      from?: string;
      to?: string;
      region_tag?: string;
    };

export type MissionObjective =
  | string
  | {
      summary: string;
      success_condition?: string;
    };

export type MissionObstacle = {
  kind: string;
  summary: string;
};

export type TimeLimit =
  | string
  | {
      has_limit: boolean;
      summary: string;
      pressure_level?: number;
    };

export type MissionReward =
  | string
  | {
      summary: string;
      currency?: number;
      reputation?: number;
      resource_tags?: string[];
    };

export type MissionRisk =
  | string
  | {
      summary: string;
      failure_tags?: string[];
    };

export type MissionTwist = {
  enabled: boolean;
  summary: string;
};

export type MissionDifficulty =
  | number
  | {
      target_number: number;
      pressure?: PressureLevel;
      danger?: PressureLevel;
    };

export type MissionParticipants = {
  recommended_roles?: Role[];
  max_party_size?: number;
};

export type MissionState = {
  status: MissionStatus;
  accepted?: boolean;
  result?: MissionResult | null;
};

export type PartyRoleAssignment = {
  character_id: CharacterId;
  role: Role;
  assignment_reason: string;
};

export type DispatchDecision = {
  accepted: boolean;
  priority: PriorityLevel;
  reason_summary: string;
};

export type DispatchRiskView = {
  expected_dangers?: string[];
  concerns?: string[];
  fallback_plan?: string;
};

export type DispatchBaseState = {
  base_id: BaseId;
  selected_facility_ids: FacilityId[];
  preparation_tags?: string[];
};

export type DispatchGuildmasterView = {
  short_impression: string;
  confidence_level: ConfidenceLevel;
};

export type ReportFactLogRelationChange = {
  target_type: "character" | "faction";
  target_id: CharacterId | FactionId;
  direction: RelationDirection;
  amount: number;
};

export type ReportFactLog = {
  outcome?: MissionResult;
  reward_change?: RewardChange;
  injury_targets?: CharacterId[];
  stress_targets?: CharacterId[];
  relation_changes?: ReportFactLogRelationChange[];
  next_hook?: string;
};

export type CharacterStateUpdate = {
  character_id: CharacterId;
  injury_delta: number;
  stress_delta: number;
};

export type FactionStateUpdate = {
  faction_id: FactionId;
  relation_delta: number;
};

export type ReportStateUpdates = {
  mission_result: MissionResult;
  character_updates?: CharacterStateUpdate[];
  faction_updates?: FactionStateUpdate[];
};

export type ReportFollowUp = {
  suggested_rest_targets?: CharacterId[];
  open_threads?: string[];
};

export type LinkedNoteReference = {
  character_id: CharacterId;
  note_candidate_set_id: NoteCandidateSetId;
};

export type SnapshotCharacterState = {
  character_id: CharacterId;
  injury: number;
  stress: number;
  availability: Availability;
  relation_tags?: string[];
};

export type SnapshotFactionState = {
  faction_id: FactionId;
  relation_state: string;
  note?: string;
};

export type SnapshotBaseState = {
  base_id: BaseId;
  selected_facility_ids?: FacilityId[];
  issue_tags?: string[];
};

export type BaseStateValues = {
  readiness: BaseReadiness;
  staff_margin: StaffMargin;
  external_attention: HeatLevel;
  atmosphere: Atmosphere;
};

export type FacilityAvailabilityRule = {
  requires_tags?: string[];
  blocked_by_tags?: string[];
};

export type GuildmasterNoteSourceId = ReportId | InterviewId;

export type GuildmasterNoteBase = {
  note_id: NoteId;
  character_id: CharacterId;
  selected_text: string;
  user_note?: string;
  source_kind: "mission_report" | "interview";
  source_id: GuildmasterNoteSourceId;
  created_at_phase?: Phase;
  created_from_report_id?: ReportId;
  tags?: string[];
};

export type CharacterCore = {
  character_id: CharacterId;
  name: string;
  member_kind: MemberKind;
  world_pack_id: WorldPackId;
  role: Role;
  sub_roles?: Role[];
  public_digest: string;
  volatile_hook: string;
  private_dossier?: PrivateDossier;
  guildmaster_note_log?: GuildmasterNoteBase[];
  relationships?: Relationship[];
  status: CharacterStatus;
};
