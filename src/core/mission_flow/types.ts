import type {
  Base,
  Character,
  Dispatch,
  Facility,
  Faction,
  GuildmasterNote,
  Mission,
  MissionResult,
  Report,
  Snapshot,
  StaffCharacter,
  WorldPack,
} from "../../domain";

export type NoteCandidate = {
  candidate_id: `note_candidate_${string}`;
  text: string;
  intent_tags: string[];
};

export type NoteCandidateSet = {
  note_candidate_set_id: `note_candidate_set_${string}`;
  character_id: Character["character_id"];
  report_id: Report["report_id"];
  candidates: NoteCandidate[];
  reason_summary: string;
};

export type MissionCycleState = {
  world_pack: WorldPack;
  factions: Faction[];
  characters: Character[];
  staff: StaffCharacter[];
  base: Base;
  facilities: Facility[];
  missions: Mission[];
  dispatches: Dispatch[];
  reports: Report[];
  snapshots: Snapshot[];
  guildmaster_notes: GuildmasterNote[];
};

export type MissionResolution = {
  mission_result: MissionResult;
  roll_total: number;
  target_number: number;
  margin: number;
  assigned_character_ids: Character["character_id"][];
  primary_character_ids: Character["character_id"][];
  support_character_ids: Character["character_id"][];
  summary: string;
  intent_tags: string[];
  reason_summary: string;
  summary_lines: string[];
  character_updates: Report["state_updates"] extends infer T
    ? T extends { character_updates?: infer U }
      ? U
      : never
    : never;
  faction_updates: Report["state_updates"] extends infer T
    ? T extends { faction_updates?: infer U }
      ? U
      : never
    : never;
  reward_change: "maintained" | "reduced" | "lost" | "bonus";
  open_threads: string[];
  relation_tags_by_character: Partial<Record<Character["character_id"], string[]>>;
  staff_comment?: string;
};

export type MissionCycleResult = {
  selected_mission: Mission;
  dispatch: Dispatch;
  report: Report;
  snapshot: Snapshot;
  note_candidates: NoteCandidateSet[];
  selected_notes: GuildmasterNote[];
  next_state: MissionCycleState;
};
