import {
  buildFallbackGuildmasterNoteAiOutput,
  type GuildmasterNoteAiInput,
  type GuildmasterNoteAiOutput,
  validateGuildmasterNoteAiOutput,
} from "./contracts";
import { runCodexCliJson } from "../../ai_runtime/codexCli";
import type {
  GuildmasterNoteCandidateGeneration,
  GuildmasterNoteGenerationRequest,
  GuildmasterNoteGenerationResponse,
} from "../../ai_runtime/types";
import type { NoteCandidateSet } from "../../core/mission_flow/types";
import { formatSequenceId } from "../../core/mission_flow/idFactory";
import { buildSharedStylePrompt } from "../shared/stylePrompt";

const NOTE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["character_id", "report_id", "candidates"],
  properties: {
    character_id: { type: "string" },
    report_id: { type: "string" },
    candidates: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "intent_tags"],
        properties: {
          text: { type: "string" },
          intent_tags: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function generateGuildmasterNotesViaCodexCli(
  input: GuildmasterNoteGenerationRequest
): Promise<GuildmasterNoteGenerationResponse> {
  const results: Array<{
    candidate_set: NoteCandidateSet;
    meta: GuildmasterNoteCandidateGeneration["meta"];
  }> = [];

  for (const [index, candidateSet] of input.fallback_candidate_sets.entries()) {
    const character = input.characters.find((item) => item.character_id === candidateSet.character_id);
    if (!character) {
      results.push({
        candidate_set: candidateSet,
        meta: {
          provider: "fallback",
          used_fallback: true,
          warning: `character が見つかりません: ${candidateSet.character_id}`,
        },
      });
      continue;
    }

    const generated = await generateOneGuildmasterNoteViaCodexCli({
      character,
      report: input.report,
      fallback_candidate_set: candidateSet,
    });

    results.push({
      candidate_set: materializeCandidateSet(candidateSet, generated.output, index),
      meta: generated.meta,
    });
  }

  const firstWarning = results.find((result) => result.meta.warning)?.meta.warning;
  return {
    candidate_sets: results.map((result) => result.candidate_set),
    meta: {
      provider: results.some((result) => !result.meta.used_fallback) ? "codex_cli" : "fallback",
      used_fallback: results.some((result) => result.meta.used_fallback),
      warning: firstWarning,
    },
  };
}

async function generateOneGuildmasterNoteViaCodexCli(input: {
  character: GuildmasterNoteAiInput["character"];
  report: GuildmasterNoteAiInput["report"];
  fallback_candidate_set: NoteCandidateSet;
}): Promise<GuildmasterNoteCandidateGeneration> {
  const fallback = buildFallbackGuildmasterNoteAiOutput(input.fallback_candidate_set);

  try {
    const output = await runCodexCliJson<Partial<GuildmasterNoteAiOutput>>({
      prompt: buildGuildmasterNotePrompt(
        {
          character: input.character,
          report: input.report,
        },
        fallback
      ),
      schema: NOTE_OUTPUT_SCHEMA,
    });

    if (!validateGuildmasterNoteAiOutput(output)) {
      return {
        output: fallback,
        meta: {
          provider: "fallback",
          used_fallback: true,
          warning: `${input.character.name} のメモ候補AI出力が不足したためテンプレートへ戻しました。`,
        },
      };
    }

    return {
      output,
      meta: {
        provider: "codex_cli",
        used_fallback: false,
      },
    };
  } catch (error) {
    return {
      output: fallback,
      meta: {
        provider: "fallback",
        used_fallback: true,
        warning: error instanceof Error ? error.message : `${input.character.name} のメモ候補AI生成に失敗しました。`,
      },
    };
  }
}

function materializeCandidateSet(
  fallbackCandidateSet: NoteCandidateSet,
  generated: GuildmasterNoteAiOutput,
  index: number
): NoteCandidateSet {
  return {
    ...fallbackCandidateSet,
    candidates: generated.candidates.map((candidate, candidateIndex) => ({
      candidate_id: formatSequenceId(
        "note_candidate",
        index * 10 + candidateIndex + 1
      ) as `note_candidate_${string}`,
      text: candidate.text,
      intent_tags: candidate.intent_tags,
    })),
  };
}

function buildGuildmasterNotePrompt(
  input: GuildmasterNoteAiInput,
  fallback: GuildmasterNoteAiOutput
): string {
  return `
あなたはギルド主メモ候補の下書きを行います。
読みやすく人間味のある筆致で、人物への観察メモ候補を2〜4件返してください。

${buildSharedStylePrompt()}

重要:
- JSONのみを返してください
- これは report ではなく guildmaster_note 候補です
- 主観は含めてよいですが、見えていない事実は断定しないでください
- 候補同士は少し観点を変えてください
- 少し笑える人間臭さや、困った癖への軽い苦笑が入っても構いません
- 断片的なメモ用語ではなく、短くても文章として読める形にしてください

入力:
${JSON.stringify(input, null, 2)}

フォールバック案:
${JSON.stringify(fallback, null, 2)}

制約:
- 候補数は2〜4件
- 1候補は2〜4文でよい
- 観察、懸念、次回配置の示唆が混ざってよい
- 人物固有の口調や癖が見える内容にする
- 読めばすぐに人物像が伝わるようにする
- 一文だけで言い切って終えるより、少し余韻や見え方の流れを持たせる
`.trim();
}
