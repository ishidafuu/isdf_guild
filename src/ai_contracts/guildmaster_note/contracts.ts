import type { Character, Report } from "../../domain";
import type { NoteCandidateSet } from "../../core/mission_flow/types";

export type GuildmasterNoteAiInput = {
  character: Character;
  report: Report;
};

export type GuildmasterNoteAiOutput = {
  character_id: Character["character_id"];
  report_id: Report["report_id"];
  candidates: Array<{
    text: string;
    intent_tags: string[];
  }>;
};

export function validateGuildmasterNoteAiOutput(
  output: Partial<GuildmasterNoteAiOutput>
): output is GuildmasterNoteAiOutput {
  return Boolean(
    output.character_id &&
      output.report_id &&
      output.candidates &&
      output.candidates.length >= 2 &&
      output.candidates.length <= 4 &&
      output.candidates.every((candidate) => Boolean(candidate.text))
  );
}

export function buildFallbackGuildmasterNoteAiOutput(candidateSet: NoteCandidateSet): GuildmasterNoteAiOutput {
  return {
    character_id: candidateSet.character_id,
    report_id: candidateSet.report_id,
    candidates: candidateSet.candidates.map((candidate) => ({
      text: candidate.text,
      intent_tags: candidate.intent_tags,
    })),
  };
}
