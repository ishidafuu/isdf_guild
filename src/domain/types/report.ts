import type { MissionResult, Phase, ReportKind } from "../enums";
import type { DispatchId, MissionId, WorldPackId, ReportId } from "../ids";
import type {
  LinkedNoteReference,
  ReportFactLog,
  ReportFollowUp,
  ReportStateUpdates,
} from "./common";

export type Report = {
  report_id: ReportId;
  mission_id: MissionId;
  dispatch_id: DispatchId;
  world_pack_id?: WorldPackId;
  kind: ReportKind;
  phase?: Phase;
  text: string;
  intent_tags: string[];
  reason_summary: string;
  summary_lines?: string[];
  fact_log?: ReportFactLog;
  state_updates?: ReportStateUpdates;
  follow_up?: ReportFollowUp;
  linked_notes?: LinkedNoteReference[];
};
