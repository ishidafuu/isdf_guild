import type { GuildmasterNote } from "../../domain";
import type { NoteCandidateSet } from "../mission_flow/types";
import { formatSequenceId } from "../mission_flow/idFactory";

export type NoteSelection = {
  note_candidate_set_id: NoteCandidateSet["note_candidate_set_id"];
  candidate_id: NoteCandidateSet["candidates"][number]["candidate_id"];
  user_note?: string;
};

export function materializeGuildmasterNotes(input: {
  note_candidate_sets: NoteCandidateSet[];
  selections: NoteSelection[];
  sequence: number;
}): GuildmasterNote[] {
  const selectionMap = new Map(
    input.selections.map((selection) => [selection.note_candidate_set_id, selection])
  );

  return input.note_candidate_sets.flatMap((candidateSet, index) => {
    const selection = selectionMap.get(candidateSet.note_candidate_set_id);
    if (!selection) {
      return [];
    }

    const selectedCandidate = candidateSet.candidates.find(
      (candidate) => candidate.candidate_id === selection.candidate_id
    );
    if (!selectedCandidate) {
      return [];
    }

    return [
      {
        note_id: formatSequenceId("note", input.sequence * 10 + index + 1) as GuildmasterNote["note_id"],
        character_id: candidateSet.character_id,
        selected_text: selectedCandidate.text,
        user_note:
          selection.user_note ??
          (selectedCandidate.intent_tags.includes("assignment_hint")
            ? "次回は補佐役を意識したい。"
            : "次回編成時に気に留める。"),
        source_kind: "mission_report",
        source_id: candidateSet.report_id,
        created_at_phase: "post_report",
        created_from_report_id: candidateSet.report_id,
        tags: ["guildmaster_note"],
      },
    ];
  });
}

export function selectGuildmasterNotes(input: {
  note_candidate_sets: NoteCandidateSet[];
  sequence: number;
}): GuildmasterNote[] {
  return materializeGuildmasterNotes({
    note_candidate_sets: input.note_candidate_sets,
    sequence: input.sequence,
    selections: input.note_candidate_sets.map((candidateSet) => {
      const preferredCandidate = candidateSet.candidates[1] ?? candidateSet.candidates[0];
      return {
        note_candidate_set_id: candidateSet.note_candidate_set_id,
        candidate_id: preferredCandidate.candidate_id,
      };
    }),
  });
}
