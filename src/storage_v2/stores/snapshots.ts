import type { Snapshot } from "../../domain";
import { upsertById } from "./helpers";

export function listSnapshots(snapshots: Snapshot[]): Snapshot[] {
  return [...snapshots];
}

export function saveSnapshot(snapshots: Snapshot[], snapshot: Snapshot): Snapshot[] {
  return upsertById(snapshots, "snapshot_id", snapshot);
}
