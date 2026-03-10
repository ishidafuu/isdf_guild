import type { Character, Mission } from "../../domain";
import type { PreMissionConversation } from "./types";

function getClientFactionId(mission: Mission): `faction_${string}` | undefined {
  if (typeof mission.client === "string" || mission.client.type !== "faction") {
    return undefined;
  }
  return mission.client.faction_id;
}

function buildLine(character: Character, mission: Mission): PreMissionConversation | null {
  const personalFlags = character.linger_state?.personal_flags ?? [];
  const relationshipFlags = character.linger_state?.relationship_flags ?? [];
  const clientFactionId = getClientFactionId(mission);

  if (
    clientFactionId &&
    relationshipFlags.some(
      (entry) =>
        entry.target_id === clientFactionId &&
        entry.flags.some((flag) => flag.flag === "client_distrust" || flag.flag === "personal_anger")
    )
  ) {
    return {
      speaker_character_id: character.character_id,
      speaker_name: character.name,
      tone: "dry",
      text: "依頼人の顔を見る前から気分が悪い。余計な交渉は任せる。",
    };
  }

  if (personalFlags.some((flag) => flag.flag === "overwork_risk")) {
    return {
      speaker_character_id: character.character_id,
      speaker_name: character.name,
      tone: "guarded",
      text: "今回は押し切る前に、一回止めてくれ。",
    };
  }

  if (personalFlags.some((flag) => flag.flag === "shaken_confidence")) {
    return {
      speaker_character_id: character.character_id,
      speaker_name: character.name,
      tone: "uneasy",
      text: "やることはやる。ただ、今日は少し慎重に進めたい。",
    };
  }

  if (mission.category === "negotiation" && character.role === "negotiator") {
    return {
      speaker_character_id: character.character_id,
      speaker_name: character.name,
      tone: "direct",
      text: "丸く収めるつもりはある。ただ、誰の顔を立てるかは間違えたくない。",
    };
  }

  return null;
}

export function buildPreMissionConversation(input: {
  mission: Mission;
  characters: Character[];
}): PreMissionConversation[] {
  return input.characters
    .map((character) => buildLine(character, input.mission))
    .filter((line): line is PreMissionConversation => line !== null)
    .slice(0, 3);
}
