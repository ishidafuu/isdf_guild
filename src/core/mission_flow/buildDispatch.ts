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

function chooseAssignedCharactersById(
  characters: Character[],
  selectedCharacterIds: Character["character_id"][]
): Character[] {
  const idSet = new Set(selectedCharacterIds);
  return characters.filter((character) => idSet.has(character.character_id));
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

function chooseFacilitiesById(
  facilities: Facility[],
  selectedFacilityIds: Facility["facility_id"][]
): Facility[] {
  const idSet = new Set(selectedFacilityIds);
  return facilities.filter((facility) => idSet.has(facility.facility_id));
}

function collectConcerns(mission: Mission, assignedCharacters: Character[]): string[] {
  const concerns: string[] = [];
  const clientFactionId =
    typeof mission.client === "string" || mission.client.type !== "faction"
      ? undefined
      : mission.client.faction_id;

  for (const character of assignedCharacters) {
    if (character.status.stress >= 2 || character.status.injury >= 1) {
      concerns.push(`${character.name}の消耗が抜けきっていない`);
    }

    const personalFlags = character.linger_state?.personal_flags ?? [];
    if (personalFlags.some((flag) => flag.flag === "overwork_risk")) {
      concerns.push(`${character.name}は押し切る形になると止まりにくい`);
    }
    if (personalFlags.some((flag) => flag.flag === "shaken_confidence")) {
      concerns.push(`${character.name}は慎重に寄りすぎるかもしれない`);
    }

    if (
      clientFactionId &&
      character.linger_state?.relationship_flags?.some(
        (entry) =>
          entry.target_id === clientFactionId &&
          entry.flags.some((flag) => flag.flag === "client_distrust" || flag.flag === "personal_anger")
      )
    ) {
      concerns.push(`${character.name}は依頼人側への感情を残している`);
    }
  }

  for (let index = 0; index < assignedCharacters.length - 1; index += 1) {
    const left = assignedCharacters[index];
    const right = assignedCharacters[index + 1];
    const pairFlags =
      left.linger_state?.relationship_flags?.find((entry) => entry.target_id === right.character_id)?.flags ?? [];
    if (pairFlags.some((flag) => flag.flag === "friction" || flag.flag === "judgment_distrust")) {
      concerns.push(`${left.name}と${right.name}は判断の噛み合わせに不安がある`);
    }
    if (pairFlags.some((flag) => flag.flag === "unexpected_fit")) {
      concerns.push(`${left.name}と${right.name}は噛み合うが、片方に負荷が寄りやすい`);
    }
  }

  return Array.from(new Set(concerns));
}

function buildStaffLines(staff: StaffCharacter[], concerns: string[]): string[] {
  const advisor = staff[0];
  if (!advisor || concerns.length === 0) {
    return [];
  }

  return concerns.slice(0, 4).map((concern, index) => {
    if (advisor.conversation_stance === "dry_but_caring") {
      return index === 0
        ? `${advisor.name}は「悪くない面子だが、${concern}」と冷たく言った。`
        : `${advisor.name}は「それと、${concern}」と手短に付け加えた。`;
    }
    return `${advisor.name}は「${concern}」とだけ告げた。`;
  });
}

function buildStaffComment(staffLines: string[], mission: Mission): string | undefined {
  if (staffLines.length > 0) {
    return staffLines[0];
  }

  if (mission.category === "negotiation") {
    return "顔を潰す相手を間違えたくない。";
  }

  return undefined;
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
  return buildDispatchFromSelection({
    ...input,
    assigned_characters: assignedCharacters,
    selected_facilities: selectedFacilities,
  });
}

export function buildDispatchFromSelection(input: {
  mission: Mission;
  staff: StaffCharacter[];
  base: Base;
  sequence: number;
  assigned_characters: Character[];
  selected_facilities: Facility[];
}): Dispatch {
  const targetNumber = getDifficultyTargetNumber(input.mission);
  const concerns = collectConcerns(input.mission, input.assigned_characters);
  const staffLines = buildStaffLines(input.staff, concerns);
  const staffComment = buildStaffComment(staffLines, input.mission);

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
    assigned_character_ids: input.assigned_characters.map((character) => character.character_id),
    party_roles: input.assigned_characters.map((character) => ({
      character_id: character.character_id,
      role: character.role,
      assignment_reason:
        character.role === input.mission.participants?.recommended_roles?.[0]
          ? "依頼の中核を担える主担当。"
          : "不足しがちな穴を埋める補完要員。",
    })),
    risk_view: {
      expected_dangers: input.mission.obstacles.map((obstacle) => obstacle.summary),
      concerns,
      fallback_plan:
        input.mission.category === "delivery"
          ? "正規経路が潰れていたら裏ルートへ切り替える。"
          : input.mission.category === "negotiation"
            ? "交渉が割れたら撤収し、裏市場に追加仲裁を頼む。"
            : "必要ログだけ確保して早めに離脱する。",
      staff_lines: staffLines,
    },
    base_state: {
      base_id: input.base.base_id,
      selected_facility_ids: input.selected_facilities.map((facility) => facility.facility_id),
      preparation_tags: input.selected_facilities.flatMap((facility) => facility.effect_tags),
    },
    guildmaster_view: {
      short_impression: staffComment ?? "今回は見えている範囲では収まりがよさそうだ。",
      confidence_level: concerns.length > 1 ? "uneasy" : "steady",
    },
    dispatch_note: input.assigned_characters.map((character) => character.name).join(" / "),
    created_phase: "pre_mission",
    tags: ["dispatch", input.mission.category],
  };
}

export function buildManualDispatch(input: {
  mission: Mission;
  characters: Character[];
  staff: StaffCharacter[];
  base: Base;
  facilities: Facility[];
  sequence: number;
  selected_character_ids: Character["character_id"][];
  selected_facility_ids: Facility["facility_id"][];
}): Dispatch {
  const assignedCharacters = chooseAssignedCharactersById(input.characters, input.selected_character_ids);
  const selectedFacilities = chooseFacilitiesById(input.facilities, input.selected_facility_ids);

  if (assignedCharacters.length === 0) {
    throw new Error("少なくとも1人は選択してください");
  }

  return buildDispatchFromSelection({
    mission: input.mission,
    staff: input.staff,
    base: input.base,
    sequence: input.sequence,
    assigned_characters: assignedCharacters,
    selected_facilities: selectedFacilities,
  });
}
