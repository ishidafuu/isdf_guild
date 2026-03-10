export const MEMBER_KINDS = ["adventurer", "staff"] as const;
export type MemberKind = (typeof MEMBER_KINDS)[number];

export const ROLES = ["frontliner", "support", "scout", "engineer", "negotiator"] as const;
export type Role = (typeof ROLES)[number];

export const MISSION_CATEGORIES = [
  "subjugation",
  "escort",
  "investigation",
  "recovery",
  "delivery",
  "negotiation",
  "defense",
  "rescue",
] as const;
export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

export const MISSION_CLIENT_TYPES = ["faction", "individual", "group"] as const;
export type MissionClientType = (typeof MISSION_CLIENT_TYPES)[number];

export const MISSION_STATUSES = ["open", "accepted", "in_progress", "closed", "withdrawn"] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export const DISPATCH_STATUSES = ["accepted", "hold", "declined"] as const;
export type DispatchStatus = (typeof DISPATCH_STATUSES)[number];

export const REPORT_KINDS = ["mission_report", "interview_report", "rest_report"] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

export const NOTE_SOURCE_KINDS = ["mission_report", "interview"] as const;
export type NoteSourceKind = (typeof NOTE_SOURCE_KINDS)[number];

export const PHASES = ["pre_mission", "post_mission", "post_report", "rest_phase", "session_end"] as const;
export type Phase = (typeof PHASES)[number];

export const AVAILABILITIES = ["active", "resting", "limited", "unavailable"] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const MISSION_RESULTS = ["great_success", "success", "partial_success", "failure"] as const;
export type MissionResult = (typeof MISSION_RESULTS)[number];

export const FACTION_STANCES = ["ally", "neutral", "tense", "hostile"] as const;
export type FactionStance = (typeof FACTION_STANCES)[number];

export const FACTION_VISIBILITIES = ["public", "semi_hidden", "hidden"] as const;
export type FactionVisibility = (typeof FACTION_VISIBILITIES)[number];

export const FACILITY_STATUSES = ["available", "unavailable", "damaged", "busy"] as const;
export type FacilityStatus = (typeof FACILITY_STATUSES)[number];

export const BASE_STATUSES = ["active", "strained", "inactive"] as const;
export type BaseStatus = (typeof BASE_STATUSES)[number];

export const PRIORITY_LEVELS = ["low", "medium", "high"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const CONFIDENCE_LEVELS = ["low", "uneasy", "steady", "high"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const RELATION_DIRECTIONS = ["up", "down", "unchanged"] as const;
export type RelationDirection = (typeof RELATION_DIRECTIONS)[number];

export const REWARD_CHANGES = ["maintained", "reduced", "lost", "bonus"] as const;
export type RewardChange = (typeof REWARD_CHANGES)[number];

export const PRESSURE_LEVELS = ["low", "medium", "high"] as const;
export type PressureLevel = (typeof PRESSURE_LEVELS)[number];

export const HEAT_LEVELS = ["low", "rising", "high"] as const;
export type HeatLevel = (typeof HEAT_LEVELS)[number];

export const STABILITY_LEVELS = ["unstable", "stable", "solid"] as const;
export type StabilityLevel = (typeof STABILITY_LEVELS)[number];

export const BASE_READINESS_LEVELS = ["poor", "unstable", "steady", "ready"] as const;
export type BaseReadiness = (typeof BASE_READINESS_LEVELS)[number];

export const STAFF_MARGIN_LEVELS = ["none", "tight", "normal", "ample"] as const;
export type StaffMargin = (typeof STAFF_MARGIN_LEVELS)[number];

export const ATMOSPHERE_LEVELS = ["calm", "strained", "lively", "fragile"] as const;
export type Atmosphere = (typeof ATMOSPHERE_LEVELS)[number];
