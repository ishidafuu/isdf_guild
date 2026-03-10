import type { Base, Character, Dispatch, Facility, Mission, Role, StaffCharacter } from "../../domain";
import { formatSequenceId } from "./idFactory";

function getDifficultyTargetNumber(mission: Mission): number {
  return typeof mission.difficulty === "number"
    ? mission.difficulty
    : mission.difficulty.target_number;
}

function getRecommendedRoles(mission: Mission): Role[] {
  return mission.participants?.recommended_roles ?? [];
}

function rankCharacterForMission(character: Character, mission: Mission): number {
  const recommendedRoles = getRecommendedRoles(mission);
  const roleMatch = recommendedRoles.includes(character.role) ? 3 : 0;
  const subRoleMatch = character.sub_roles?.some((role) => recommendedRoles.includes(role)) ? 1 : 0;
  const statsScore =
    character.stats.power +
    character.stats.tech +
    character.stats.sense +
    character.stats.social +
    character.stats.will;
  const readinessPenalty = character.status.injury + character.status.stress;

  return roleMatch + subRoleMatch + statsScore - readinessPenalty;
}

function chooseAssignedCharacters(characters: Character[], mission: Mission): Character[] {
  const maxPartySize = mission.participants?.max_party_size ?? 3;
  const activeCharacters = characters.filter((character) => character.status.availability === "active");
  return [...activeCharacters]
    .sort((left, right) => rankCharacterForMission(right, mission) - rankCharacterForMission(left, mission))
    .slice(0, maxPartySize);
}

function chooseFacilities(facilities: Facility[], mission: Mission): Facility[] {
  const recommendedTags =
    mission.category === "delivery"
      ? ["mission_planning", "injury_care"]
      : mission.category === "negotiation"
        ? ["risk_review", "mission_planning"]
        : ["mission_planning", "injury_care"];

  return facilities.filter((facility) =>
    facility.effect_tags.some((tag) => recommendedTags.includes(tag))
  );
}

function buildStaffComment(staff: StaffCharacter[], mission: Mission, assignedCharacters: Character[]): string | undefined {
  const advisor = staff[0];
  if (!advisor) {
    return undefined;
  }

  const highestStress = [...assignedCharacters].sort(
    (left, right) => right.status.stress - left.status.stress
  )[0];

  if (highestStress && highestStress.status.stress >= 2) {
    return `${advisor.name}は「${highestStress.name}を酷使しすぎるな」と釘を刺した。`;
  }

  if (mission.category === "negotiation") {
    return `${advisor.name}は「結果だけでなく、誰の顔を潰すかも見ておけ」と短く言った。`;
  }

  return `${advisor.name}は「今回も帰って来られる編成にしておけ」と確認した。`;
}

export function buildDispatch(input: {
  mission: Mission;
  characters: Character[];
  staff: StaffCharacter[];
  base: Base;
  facilities: Facility[];
  sequence: number;
}): Dispatch {
  const assignedCharacters = chooseAssignedCharacters(input.characters, input.mission);
  const selectedFacilities = chooseFacilities(input.facilities, input.mission);
  const targetNumber = getDifficultyTargetNumber(input.mission);
  const staffComment = buildStaffComment(input.staff, input.mission, assignedCharacters);

  return {
    dispatch_id: formatSequenceId("dispatch", input.sequence) as Dispatch["dispatch_id"],
    mission_id: input.mission.mission_id,
    world_pack_id: input.mission.world_pack_id,
    status: "accepted",
    decision: {
      accepted: true,
      priority: targetNumber >= 9 ? "high" : targetNumber >= 7 ? "medium" : "low",
      reason_summary:
        input.mission.category === "delivery"
          ? "納期と港湾側の信用維持を優先して受諾。"
          : input.mission.category === "negotiation"
            ? "対立の火種を放置すると裏市場への影響が大きい。"
            : "危険は高いが、放置したときの圧力が重い。",
    },
    assigned_character_ids: assignedCharacters.map((character) => character.character_id),
    party_roles: assignedCharacters.map((character) => ({
      character_id: character.character_id,
      role: character.role,
      assignment_reason:
        character.role === input.mission.participants?.recommended_roles?.[0]
          ? "依頼の中核を担える主担当。"
          : "不足しがちな穴を埋める補完要員。",
    })),
    risk_view: {
      expected_dangers: input.mission.obstacles.map((obstacle) => obstacle.summary),
      concerns: assignedCharacters
        .filter((character) => character.status.stress >= 2 || character.status.injury >= 1)
        .map((character) => `${character.name}の消耗が気になる`),
      fallback_plan:
        input.mission.category === "delivery"
          ? "正規経路が潰れていたら裏ルートへ切り替える。"
          : input.mission.category === "negotiation"
            ? "交渉が割れたら撤収し、裏市場に追加仲裁を頼む。"
            : "必要ログだけ確保して早めに離脱する。",
    },
    base_state: {
      base_id: input.base.base_id,
      selected_facility_ids: selectedFacilities.map((facility) => facility.facility_id),
      preparation_tags: selectedFacilities.flatMap((facility) => facility.effect_tags),
    },
    guildmaster_view: {
      short_impression: staffComment ?? "今回は無理の少ない面子で固めた。",
      confidence_level: assignedCharacters.some((character) => character.status.stress >= 2)
        ? "uneasy"
        : "steady",
    },
    dispatch_note: assignedCharacters.map((character) => character.name).join(" / "),
    created_phase: "pre_mission",
    tags: ["dispatch", input.mission.category],
  };
}
