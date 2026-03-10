import type { Dispatch, Mission, Report } from "../../domain";
import type { MissionResolution } from "../../core/mission_flow/types";

export type ReportAiInput = {
  mission: Mission;
  dispatch: Dispatch;
  resolution: MissionResolution;
};

export type ReportAiOutput = Pick<
  Report,
  "text" | "intent_tags" | "reason_summary" | "summary_lines" | "fact_log" | "follow_up"
>;

export function validateReportAiOutput(output: Partial<ReportAiOutput>): output is ReportAiOutput {
  return Boolean(
    output.text &&
      output.reason_summary &&
      output.intent_tags &&
      Array.isArray(output.intent_tags)
  );
}

export function buildFallbackReportAiOutput(input: ReportAiInput): ReportAiOutput {
  return {
    text: input.resolution.summary,
    intent_tags: input.resolution.intent_tags,
    reason_summary: input.resolution.reason_summary,
    summary_lines: input.resolution.summary_lines,
    fact_log: {
      outcome: input.resolution.mission_result,
      reward_change: input.resolution.reward_change,
      injury_targets: input.resolution.character_updates
        ?.filter((update) => update.injury_delta > 0)
        .map((update) => update.character_id),
      stress_targets: input.resolution.character_updates
        ?.filter((update) => update.stress_delta > 0)
        .map((update) => update.character_id),
      next_hook: input.resolution.open_threads[0],
    },
    follow_up: {
      suggested_rest_targets: input.resolution.character_updates
        ?.filter((update) => update.injury_delta > 0)
        .map((update) => update.character_id),
      open_threads: input.resolution.open_threads,
    },
  };
}
