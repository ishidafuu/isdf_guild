import type { Character, Mission, StaffCharacter } from "../domain";

export type AssignmentOption = {
  option_id: string;
  label: string;
  summary: string;
  staff_note: string;
  character_ids: Character["character_id"][];
  intent: string;
};

export function getFeaturedCharactersForMission(
  mission: Mission,
  availableCharacters: Character[],
  fallbackCharacters: Character[],
  limit = 2
): Character[] {
  const recommendedRoles = mission.participants?.recommended_roles ?? [];
  const matched = availableCharacters.filter((character) => recommendedRoles.includes(character.role));
  const ordered = matched.length > 0 ? matched : availableCharacters;
  const pool = ordered.length > 0 ? ordered : fallbackCharacters;
  return pool.slice(0, limit);
}

export function getClaimCharacterForMission(
  mission: Mission,
  availableCharacters: Character[],
  fallbackCharacters: Character[]
): Character {
  const featured = getFeaturedCharactersForMission(mission, availableCharacters, fallbackCharacters, 1);
  return featured[0] ?? fallbackCharacters[0];
}

function pickCharactersForRoles(
  availableCharacters: Character[],
  roles: Character["role"][],
  limit: number,
  excluded: Character["character_id"][] = []
): Character["character_id"][] {
  const available = availableCharacters.filter((character) => !excluded.includes(character.character_id));
  const picked: Character["character_id"][] = [];

  for (const role of roles) {
    const match = available.find(
      (character) => character.role === role && !picked.includes(character.character_id)
    );
    if (match) {
      picked.push(match.character_id);
    }
  }

  for (const character of available) {
    if (picked.length >= limit) {
      break;
    }
    if (!picked.includes(character.character_id)) {
      picked.push(character.character_id);
    }
  }

  return picked.slice(0, limit);
}

export function buildAssignmentOptions(
  mission: Mission,
  advisor: StaffCharacter | null,
  availableCharacters: Character[]
): AssignmentOption[] {
  const limit = mission.participants?.max_party_size ?? 3;
  const recommended = mission.participants?.recommended_roles ?? [];
  const primary = pickCharactersForRoles(availableCharacters, recommended, limit);
  const reverse = pickCharactersForRoles(availableCharacters, [...recommended].reverse(), limit);
  const pressure = pickCharactersForRoles(
    availableCharacters,
    ["frontliner", "negotiator", "engineer", "scout", "support"],
    limit
  );
  const careful = pickCharactersForRoles(
    availableCharacters,
    ["scout", "support", "engineer", "negotiator", "frontliner"],
    limit
  );

  return [
    {
      option_id: "steady",
      label: "堅実に回す",
      summary: "相性と役割を素直に見て、無理の少ない顔ぶれで回す。",
      staff_note: advisor ? `${advisor.name}はこの案なら大崩れしにくいと見ている。` : "無難に通すならこの筋だ。",
      character_ids: primary,
      intent: "無理を押さず、役割が噛み合う顔ぶれで進めたい。",
    },
    {
      option_id: "fast",
      label: "速さを優先する",
      summary: "多少荒くても手の早い面子で押し込み、仕事を先に終わらせに行く。",
      staff_note: advisor
        ? `${advisor.name}は急ぎ筋だと認めるが、あとで誰かが疲れると見ている。`
        : "短く終わるか、短く燃えるかの二択だ。",
      character_ids: pressure,
      intent: "多少荒くても、先に動いて主導権を取りたい。",
    },
    {
      option_id: "careful",
      label: "退路を厚くする",
      summary: "危ない時に引ける形を優先し、慎重な組み方で事故を減らす。",
      staff_note: advisor
        ? `${advisor.name}はこの案なら取り返しのつかない崩れ方は避けやすいと見ている。`
        : "派手さはないが、帰ってくる確率は上がる。",
      character_ids: careful,
      intent: "派手さより、引き際と退路を優先したい。",
    },
    {
      option_id: "strained",
      label: "噛み合わせを賭ける",
      summary: "少し不安はあるが、今の流れに乗せるならこの顔ぶれだと賭ける。",
      staff_note: advisor
        ? `${advisor.name}は止めはしないが、あとで空気が荒れる可能性は見ている。`
        : "通れば大きいが、後味は読みにくい。",
      character_ids: reverse,
      intent: "多少の相性不安は飲んで、今いちばん仕事を動かせる面子に賭けたい。",
    },
  ];
}
