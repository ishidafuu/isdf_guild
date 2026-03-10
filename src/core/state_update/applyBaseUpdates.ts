import type { Base, Report } from "../../domain";

const readinessOrder = ["poor", "unstable", "steady", "ready"] as const;
const atmosphereOrder = ["calm", "lively", "strained", "fragile"] as const;
const staffMarginOrder = ["none", "tight", "normal", "ample"] as const;
const attentionOrder = ["low", "rising", "high"] as const;

function stepValue<T extends string>(order: readonly T[], current: T, delta: number): T {
  const index = Math.max(0, order.indexOf(current));
  const nextIndex = Math.min(order.length - 1, Math.max(0, index + delta));
  return order[nextIndex];
}

export function applyBaseUpdates(input: {
  base: Base;
  report: Report;
}): Base {
  if (!input.base.state_values) {
    return input.base;
  }

  const result = input.report.state_updates?.mission_result;
  const readinessDelta = result === "great_success" ? 1 : result === "failure" ? -1 : 0;
  const attentionDelta = result === "failure" ? 1 : 0;
  const atmosphereDelta = result === "failure" ? 1 : result === "great_success" ? -1 : 0;

  return {
    ...input.base,
    state_values: {
      readiness: stepValue(readinessOrder, input.base.state_values.readiness, readinessDelta),
      staff_margin: stepValue(
        staffMarginOrder,
        input.base.state_values.staff_margin,
        input.report.follow_up?.suggested_rest_targets?.length ? -1 : 0
      ),
      external_attention: stepValue(attentionOrder, input.base.state_values.external_attention, attentionDelta),
      atmosphere: stepValue(atmosphereOrder, input.base.state_values.atmosphere as (typeof atmosphereOrder)[number], atmosphereDelta),
    },
    active_issue_tags: Array.from(
      new Set([
        ...(input.base.active_issue_tags ?? []),
        ...(input.report.follow_up?.suggested_rest_targets?.length ? ["medical_strain"] : []),
      ])
    ),
  };
}
