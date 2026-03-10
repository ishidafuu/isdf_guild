import type { Base, Character, Dispatch, Faction, Report, Snapshot } from "../../domain";
import { formatSequenceId } from "../mission_flow/idFactory";

export function materializeSnapshot(input: {
  base: Base;
  characters: Character[];
  factions: Faction[];
  dispatch: Dispatch;
  report: Report;
  sequence: number;
}): Snapshot {
  return {
    snapshot_id: formatSequenceId("snapshot", input.sequence) as Snapshot["snapshot_id"],
    world_pack_id: input.report.world_pack_id ?? input.base.world_pack_id,
    phase: "post_report",
    source_report_id: input.report.report_id,
    source_dispatch_id: input.dispatch.dispatch_id,
    summary: `${input.report.reason_summary} 現在地を次回用に切り出した。`,
    character_states: input.characters.map((character) => ({
      character_id: character.character_id,
      injury: character.status.injury,
      stress: character.status.stress,
      availability: character.status.availability,
      relation_tags: character.relationships?.map((relationship) => relationship.tags[0]).filter(Boolean),
    })),
    faction_states: input.factions.map((faction) => ({
      faction_id: faction.faction_id,
      relation_state: faction.guild_relation.stance,
      note: faction.guild_relation.recent_change,
    })),
    base_state: {
      base_id: input.base.base_id,
      selected_facility_ids: input.dispatch.base_state?.selected_facility_ids,
      issue_tags: input.base.active_issue_tags,
    },
    tags: ["snapshot", "post_report", input.report.state_updates?.mission_result ?? "unknown"],
  };
}
