import type { Faction, Report } from "../../domain";

function nextStance(relationScore: number): Faction["guild_relation"]["stance"] {
  if (relationScore >= 2) {
    return "ally";
  }
  if (relationScore <= -2) {
    return "hostile";
  }
  if (relationScore < 0) {
    return "tense";
  }
  return "neutral";
}

export function applyFactionUpdates(input: {
  factions: Faction[];
  report: Report;
}): Faction[] {
  return input.factions.map((faction) => {
    const update = input.report.state_updates?.faction_updates?.find(
      (candidate) => candidate.faction_id === faction.faction_id
    );

    if (!update) {
      return faction;
    }

    const relationScore = faction.guild_relation.relation_score + update.relation_delta;

    return {
      ...faction,
      guild_relation: {
        ...faction.guild_relation,
        relation_score: relationScore,
        stance: nextStance(relationScore),
        recent_change:
          update.relation_delta > 0
            ? "最近の案件でやや信頼を得た。"
            : "最近の案件で不信を買った。",
      },
    };
  });
}
