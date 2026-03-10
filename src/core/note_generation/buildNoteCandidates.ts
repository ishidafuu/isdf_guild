import type { Character, Report } from "../../domain";
import type { NoteCandidateSet } from "../mission_flow/types";
import { formatSequenceId } from "../mission_flow/idFactory";

function buildCandidateTexts(character: Character, report: Report): string[] {
  const injuryTriggered = report.fact_log?.injury_targets?.includes(character.character_id) ?? false;
  const stressTriggered = report.fact_log?.stress_targets?.includes(character.character_id) ?? false;

  if (injuryTriggered) {
    return [
      `${character.name}は結果を持ち帰ったが、明らかに無理を押している。`,
      `${character.name}は痛みを隠してでも前に出たがる。しばらく単独行は避けたい。`,
      `${character.name}には補佐役を付けた方が、次の任務は安定する。`,
    ];
  }

  if (stressTriggered) {
    return [
      `${character.name}は表面上は平静でも、かなり消耗している。`,
      `${character.name}は今回の件を飲み込めていない。少し距離を置かせたい。`,
      `${character.name}は仕事はこなすが、余計な負荷を抱え込みやすい。`,
    ];
  }

  return [
    `${character.name}は今回も役割を外さなかった。`,
    `${character.name}は目立たなくても任務の流れを整えていた。`,
    `${character.name}は次も同じ働きを期待できるが、甘えすぎない方がいい。`,
  ];
}

export function buildNoteCandidates(input: {
  characters: Character[];
  report: Report;
}): NoteCandidateSet[] {
  return (input.report.linked_notes ?? []).map((linkedNote, index) => {
    const character = input.characters.find((candidate) => candidate.character_id === linkedNote.character_id);
    if (!character) {
      throw new Error(`character が見つかりません: ${linkedNote.character_id}`);
    }

    const texts = buildCandidateTexts(character, input.report);
    return {
      note_candidate_set_id: linkedNote.note_candidate_set_id,
      character_id: character.character_id,
      report_id: input.report.report_id,
      reason_summary: `${character.name}の今回の働きと消耗を踏まえた人物メモ候補。`,
      candidates: texts.map((text, candidateIndex) => ({
        candidate_id: formatSequenceId(
          "note_candidate",
          index * 10 + candidateIndex + 1
        ) as `note_candidate_${string}`,
        text,
        intent_tags:
          candidateIndex === 0
            ? ["observation"]
            : candidateIndex === 1
              ? ["concern"]
              : ["assignment_hint"],
      })),
    };
  });
}
