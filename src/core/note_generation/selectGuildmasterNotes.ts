import type { GuildmasterNote } from "../../domain";
import type { NoteCandidateSet } from "../mission_flow/types";
import { formatSequenceId } from "../mission_flow/idFactory";

export function selectGuildmasterNotes(input: {
  note_candidate_sets: NoteCandidateSet[];
  sequence: number;
}): GuildmasterNote[] {
  return input.note_candidate_sets.map((candidateSet, index) => {
    const preferredCandidate = candidateSet.candidates[1] ?? candidateSet.candidates[0];
    return {
      note_id: formatSequenceId("note", input.sequence * 10 + index + 1) as GuildmasterNote["note_id"],
      character_id: candidateSet.character_id,
      selected_text: preferredCandidate.text,
      user_note: preferredCandidate.intent_tags.includes("assignment_hint")
        ? "次回は補佐役を意識したい。"
        : "次回編成時に気に留める。",
      source_kind: "mission_report",
      source_id: candidateSet.report_id,
      created_at_phase: "post_report",
      created_from_report_id: candidateSet.report_id,
      tags: ["guildmaster_note"],
    };
  });
}
