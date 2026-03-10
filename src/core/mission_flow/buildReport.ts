import type { Dispatch, Mission, Report } from "../../domain";
import type { MissionResolution } from "./types";
import { formatSequenceId } from "./idFactory";

function buildLinkedNotes(input: {
  dispatch: Dispatch;
  resolution: MissionResolution;
  sequence: number;
}): NonNullable<Report["linked_notes"]> {
  const affectedCharacterIds =
    input.resolution.character_updates
      ?.filter((update) => update.injury_delta > 0 || update.stress_delta > 0)
      .map((update) => update.character_id) ?? [];
  const fallbackCharacterId = input.dispatch.assigned_character_ids[0];
  const targetCharacterIds =
    affectedCharacterIds.length > 0
      ? affectedCharacterIds
      : fallbackCharacterId
        ? [fallbackCharacterId]
        : [];

  return targetCharacterIds.map((characterId, index) => ({
    character_id: characterId,
    note_candidate_set_id: formatSequenceId(
      "note_candidate_set",
      input.sequence * 10 + index + 1
    ) as `note_candidate_set_${string}`,
  }));
}

function buildAftertasteLine(input: {
  mission: Mission;
  dispatch: Dispatch;
  resolution: MissionResolution;
}): string | null {
  const concerns = input.dispatch.risk_view?.concerns ?? [];
  const topConcern = concerns[0];

  if (input.resolution.mission_result === "great_success" && topConcern) {
    return `表向きは綺麗に片付いたが、${topConcern}という感触は残った。`;
  }

  if (input.resolution.mission_result === "success" && topConcern) {
    return `達成はしたが、${topConcern}という違和感までは消えていない。`;
  }

  if (
    (input.resolution.mission_result === "partial_success" || input.resolution.mission_result === "failure") &&
    typeof input.mission.client !== "string" &&
    input.mission.client.type === "faction"
  ) {
    return `${input.mission.client.name}との間には、結果以上の引っかかりが残った。`;
  }

  return null;
}

export function buildReport(input: {
  mission: Mission;
  dispatch: Dispatch;
  resolution: MissionResolution;
  sequence: number;
}): Report {
  const aftertasteLine = buildAftertasteLine(input);
  const text = aftertasteLine ? `${input.resolution.summary} ${aftertasteLine}` : input.resolution.summary;
  const summaryLines = aftertasteLine
    ? [...input.resolution.summary_lines.slice(0, 2), aftertasteLine]
    : input.resolution.summary_lines;

  return {
    report_id: formatSequenceId("report", input.sequence) as Report["report_id"],
    mission_id: input.mission.mission_id,
    dispatch_id: input.dispatch.dispatch_id,
    world_pack_id: input.mission.world_pack_id,
    kind: "mission_report",
    phase: "post_mission",
    text,
    intent_tags: input.resolution.intent_tags,
    reason_summary: input.resolution.reason_summary,
    summary_lines: summaryLines,
    fact_log: {
      outcome: input.resolution.mission_result,
      reward_change: input.resolution.reward_change,
      injury_targets: input.resolution.character_updates
        ?.filter((update) => update.injury_delta > 0)
        .map((update) => update.character_id),
      stress_targets: input.resolution.character_updates
        ?.filter((update) => update.stress_delta > 0)
        .map((update) => update.character_id),
      relation_changes: input.resolution.faction_updates?.map((update) => ({
        target_type: "faction",
        target_id: update.faction_id,
        direction: update.relation_delta > 0 ? "up" : update.relation_delta < 0 ? "down" : "unchanged",
        amount: Math.abs(update.relation_delta),
      })),
      next_hook: input.resolution.open_threads[0],
    },
    state_updates: {
      mission_result: input.resolution.mission_result,
      character_updates: input.resolution.character_updates ?? [],
      faction_updates: input.resolution.faction_updates ?? [],
    },
    follow_up: {
      suggested_rest_targets: input.resolution.character_updates
        ?.filter((update) => update.injury_delta > 0 || update.stress_delta >= 2)
        .map((update) => update.character_id),
      open_threads: input.resolution.open_threads,
    },
    linked_notes: buildLinkedNotes(input),
  };
}
