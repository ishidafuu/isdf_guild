import type { NoteSourceKind, Phase } from "../enums";
import type { CharacterId, NoteId, ReportId } from "../ids";

export type GuildmasterNote = {
  note_id: NoteId;
  character_id: CharacterId;
  selected_text: string;
  user_note?: string;
  source_kind: NoteSourceKind;
  source_id: ReportId | `interview_${string}`;
  created_at_phase?: Phase;
  created_from_report_id?: ReportId;
  tags?: string[];
};
