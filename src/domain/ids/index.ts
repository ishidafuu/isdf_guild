export type CharacterId = `char_${string}`;
export type MissionId = `mission_${string}`;
export type DispatchId = `dispatch_${string}`;
export type ReportId = `report_${string}`;
export type SnapshotId = `snapshot_${string}`;
export type NoteId = `note_${string}`;
export type NoteCandidateSetId = `note_candidate_set_${string}`;
export type WorldPackId = `world_pack_${string}`;
export type FactionId = `faction_${string}`;
export type BaseId = `base_${string}`;
export type FacilityId = `facility_${string}`;
export type SkillId = `skill_${string}`;
export type TimelineEventId = `timeline_event_${string}`;
export type InterviewId = `interview_${string}`;

export type EntityId =
  | BaseId
  | CharacterId
  | DispatchId
  | FacilityId
  | FactionId
  | MissionId
  | NoteCandidateSetId
  | NoteId
  | ReportId
  | SnapshotId
  | WorldPackId;
