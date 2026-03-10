import type { Phase } from "../enums";
import type { DispatchId, SnapshotId, ReportId, WorldPackId } from "../ids";
import type {
  SnapshotBaseState,
  SnapshotCharacterState,
  SnapshotFactionState,
} from "./common";

export type Snapshot = {
  snapshot_id: SnapshotId;
  world_pack_id: WorldPackId;
  phase: Phase;
  source_report_id: ReportId;
  source_dispatch_id?: DispatchId;
  summary: string;
  character_states: SnapshotCharacterState[];
  faction_states?: SnapshotFactionState[];
  base_state?: SnapshotBaseState;
  tags?: string[];
};
