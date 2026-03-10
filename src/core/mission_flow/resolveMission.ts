import type { Character, Dispatch, Faction, Mission, MissionResult } from "../../domain";
import type { MissionResolution } from "./types";

type RandomSource = () => number;

function roll2d6(random: RandomSource): number {
  const die1 = Math.floor(random() * 6) + 1;
  const die2 = Math.floor(random() * 6) + 1;
  return die1 + die2;
}

function getTargetNumber(mission: Mission): number {
  return typeof mission.difficulty === "number"
    ? mission.difficulty
    : mission.difficulty.target_number;
}

function getParty(characters: Character[], dispatch: Dispatch): Character[] {
  const assignedIds = new Set(dispatch.assigned_character_ids);
  return characters.filter((character) => assignedIds.has(character.character_id));
}

function getRoleCoverageBonus(mission: Mission, party: Character[]): number {
  const recommendedRoles = mission.participants?.recommended_roles ?? [];
  return recommendedRoles.reduce((score, role) => {
    return score + (party.some((character) => character.role === role || character.sub_roles?.includes(role)) ? 1 : 0);
  }, 0);
}

function getStatusPenalty(party: Character[]): number {
  return party.reduce((total, character) => total + character.status.injury + character.status.stress, 0);
}

function getClientFactionPenalty(mission: Mission, factions: Faction[]): number {
  const client = mission.client;

  if (typeof client === "string" || client.type !== "faction") {
    return 0;
  }

  const faction = factions.find((candidate) => candidate.faction_id === client.faction_id);
  if (!faction) {
    return 0;
  }

  if (faction.guild_relation.stance === "hostile") {
    return 2;
  }

  if (faction.guild_relation.stance === "neutral") {
    return 1;
  }

  return 0;
}

function resolveMissionResult(total: number, targetNumber: number): MissionResult {
  if (total >= targetNumber + 4) {
    return "great_success";
  }
  if (total >= targetNumber + 1) {
    return "success";
  }
  if (total >= targetNumber - 1) {
    return "partial_success";
  }
  return "failure";
}

function buildSummaryText(mission: Mission, result: MissionResult): string {
  const name = mission.display_name ?? mission.category;
  switch (result) {
    case "great_success":
      return `${name}は大成功。現場は最小限の損耗で片付き、依頼人側の評価も伸びた。`;
    case "success":
      return `${name}は成功。目的は達成され、余計な火種も増やさずに戻れた。`;
    case "partial_success":
      return `${name}は部分成功。目的は果たしたが、損耗か不信のどちらかが残った。`;
    case "failure":
      return `${name}は失敗。目的未達か、達成しても余波が重く残った。`;
  }
}

export function resolveMission(input: {
  mission: Mission;
  dispatch: Dispatch;
  characters: Character[];
  factions: Faction[];
  random?: RandomSource;
  staff_comment?: string;
}): MissionResolution {
  const random = input.random ?? Math.random;
  const party = getParty(input.characters, input.dispatch);
  const targetNumber = getTargetNumber(input.mission);
  const roleCoverageBonus = getRoleCoverageBonus(input.mission, party);
  const facilityBonus = input.dispatch.base_state?.selected_facility_ids.length ?? 0;
  const strongestStat =
    party.reduce((total, character) => {
      return (
        total +
        Math.max(
          character.stats.power,
          character.stats.tech,
          character.stats.sense,
          character.stats.social,
          character.stats.will
        )
      );
    }, 0) / Math.max(1, party.length);
  const statusPenalty = getStatusPenalty(party);
  const clientPenalty = getClientFactionPenalty(input.mission, input.factions);
  const rollTotal = roll2d6(random) + roleCoverageBonus + facilityBonus + Math.floor(strongestStat / 2) - Math.floor(statusPenalty / 2) - clientPenalty;
  const missionResult = resolveMissionResult(rollTotal, targetNumber);
  const frontline = party.filter((character) => character.role === "frontliner");
  const support = party.filter((character) => character.role !== "frontliner");
  const injuredCharacters =
    missionResult === "failure"
      ? frontline.concat(support.slice(0, 1))
      : missionResult === "partial_success"
        ? frontline
        : [];
  const stressedCharacters =
    missionResult === "great_success"
      ? []
      : missionResult === "success"
        ? support.slice(0, 1)
        : party;
  const factionDelta =
    missionResult === "great_success" ? 1 : missionResult === "success" ? 1 : missionResult === "partial_success" ? -1 : -2;
  const intentTags =
    missionResult === "great_success"
      ? ["依頼結果", "大成功", input.mission.category]
      : missionResult === "success"
        ? ["依頼結果", "成功", input.mission.category]
        : missionResult === "partial_success"
          ? ["依頼結果", "部分成功", input.mission.category, "損耗発生"]
          : ["依頼結果", "失敗", input.mission.category, "損耗発生", "関係悪化"];
  const openThreads =
    missionResult === "great_success"
      ? ["余裕があるうちに次の案件を選べる"]
      : missionResult === "success"
        ? ["軽い休養を挟めば継続可能"]
        : missionResult === "partial_success"
          ? ["負傷者の休養判断", "依頼人へのフォロー"]
          : ["態勢立て直し", "追跡や不信への対処"];

  return {
    mission_result: missionResult,
    roll_total: rollTotal,
    target_number: targetNumber,
    margin: rollTotal - targetNumber,
    assigned_character_ids: party.map((character) => character.character_id),
    primary_character_ids: frontline.map((character) => character.character_id),
    support_character_ids: support.map((character) => character.character_id),
    summary: buildSummaryText(input.mission, missionResult),
    intent_tags: intentTags,
    reason_summary:
      missionResult === "great_success"
        ? "役割分担と準備が噛み合い、余計な損耗を抑えられた。"
        : missionResult === "success"
          ? "必要な役割が揃い、危険を抑えながら目的を達成した。"
          : missionResult === "partial_success"
            ? "目的は果たしたが、損耗か対外不信を抑え切れなかった。"
            : "戦力配分か現場条件が噛み合わず、成果より余波が重くなった。",
    summary_lines: [
      buildSummaryText(input.mission, missionResult),
      injuredCharacters.length > 0
        ? `${injuredCharacters.map((character) => character.name).join("、")}に損傷が出た。`
        : "目立つ損傷は出ていない。",
      openThreads[0],
    ],
    character_updates: party.map((character) => ({
      character_id: character.character_id,
      injury_delta: injuredCharacters.some((candidate) => candidate.character_id === character.character_id)
        ? missionResult === "failure"
          ? 2
          : 1
        : 0,
      stress_delta: stressedCharacters.some((candidate) => candidate.character_id === character.character_id)
        ? missionResult === "failure"
          ? 2
          : 1
        : 0,
    })),
    faction_updates:
      typeof input.mission.client === "string" || input.mission.client.type !== "faction"
        ? []
        : [
            {
              faction_id: input.mission.client.faction_id,
              relation_delta: factionDelta,
            },
          ],
    reward_change:
      missionResult === "great_success"
        ? "bonus"
        : missionResult === "success"
          ? "maintained"
          : missionResult === "partial_success"
            ? "reduced"
            : "lost",
    open_threads: openThreads,
    relation_tags_by_character: Object.fromEntries(
      party.map((character) => [
        character.character_id,
        party
          .filter((candidate) => candidate.character_id !== character.character_id)
          .map((candidate) =>
            missionResult === "failure"
              ? `strained_after_${candidate.character_id}`
              : `worked_with_${candidate.character_id}`
          ),
      ])
    ),
    staff_comment: input.staff_comment,
  };
}
