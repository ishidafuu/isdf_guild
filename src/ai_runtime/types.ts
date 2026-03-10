import type { GuildmasterNoteAiOutput } from "../ai_contracts/guildmaster_note/contracts";
import type { ReportAiOutput } from "../ai_contracts/report/contracts";
import type { NoteCandidateSet } from "../core/mission_flow/types";
import type { Character, Dispatch, Mission, Report } from "../domain";
import type { MissionResolution } from "../core/mission_flow/types";

export type AiProviderKind = "codex_cli" | "fallback";

export type AiGenerationMeta = {
  provider: AiProviderKind;
  used_fallback: boolean;
  warning?: string;
};

export type ReportGenerationRequest = {
  mission: Mission;
  dispatch: Dispatch;
  resolution: MissionResolution;
};

export type ReportGenerationResponse = {
  output: ReportAiOutput;
  meta: AiGenerationMeta;
};

export type GuildmasterNoteGenerationRequest = {
  report: Report;
  characters: Character[];
  fallback_candidate_sets: NoteCandidateSet[];
};

export type GuildmasterNoteGenerationResponse = {
  candidate_sets: NoteCandidateSet[];
  meta: AiGenerationMeta;
};

export type GuildmasterNoteCandidateGeneration = {
  output: GuildmasterNoteAiOutput;
  meta: AiGenerationMeta;
};
