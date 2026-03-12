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

export type SceneStage = "briefing" | "casting" | "aftermath";

export type SceneTextPack = {
  narration_lines: string[];
  advisor_lines: string[];
  aside_lines: string[];
  character_lines: Array<{
    character_id: Character["character_id"];
    text: string;
  }>;
};

export type SceneGenerationRequest = {
  stage: SceneStage;
  scene_variant?: string;
  mission: Mission;
  advisor?: {
    character_id: Character["character_id"];
    name: string;
    public_digest?: string;
    volatile_hook?: string;
  } | null;
  characters: Array<{
    character_id: Character["character_id"];
    name: string;
    role: Character["role"];
    public_digest: Character["public_digest"];
    volatile_hook?: Character["volatile_hook"];
    condition_text?: string;
  }>;
  report?: Report;
  reward_text?: string;
  risk_text?: string;
  player_intent?: string;
  recent_notes?: string[];
  recent_reports?: string[];
  fallback: SceneTextPack;
};

export type SceneGenerationResponse = {
  output: SceneTextPack;
  meta: AiGenerationMeta;
};
