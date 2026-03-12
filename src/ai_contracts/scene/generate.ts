import { runCodexCliJson } from "../../ai_runtime/codexCli";
import type { SceneGenerationRequest, SceneGenerationResponse, SceneTextPack } from "../../ai_runtime/types";

const SCENE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["narration_lines", "advisor_lines", "aside_lines", "character_lines"],
  properties: {
    narration_lines: { type: "array", items: { type: "string" } },
    advisor_lines: { type: "array", items: { type: "string" } },
    aside_lines: { type: "array", items: { type: "string" } },
    character_lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["character_id", "text"],
        properties: {
          character_id: { type: "string" },
          text: { type: "string" },
        },
      },
    },
  },
} as const;

export async function generateSceneTextViaCodexCli(
  input: SceneGenerationRequest
): Promise<SceneGenerationResponse> {
  try {
    const output = await runCodexCliJson<SceneTextPack>({
      prompt: buildScenePrompt(input),
      schema: SCENE_OUTPUT_SCHEMA,
    });

    return {
      output: sanitizeScenePack(output, input.fallback),
      meta: {
        provider: "codex_cli",
        used_fallback: false,
      },
    };
  } catch (error) {
    return {
      output: input.fallback,
      meta: {
        provider: "fallback",
        used_fallback: true,
        warning: error instanceof Error ? error.message : "scene AI 生成に失敗しました。",
      },
    };
  }
}

function sanitizeScenePack(output: SceneTextPack, fallback: SceneTextPack): SceneTextPack {
  return {
    narration_lines: output.narration_lines.length > 0 ? output.narration_lines : fallback.narration_lines,
    advisor_lines: output.advisor_lines,
    aside_lines: output.aside_lines,
    character_lines: output.character_lines,
  };
}

function buildScenePrompt(input: SceneGenerationRequest): string {
  return `
あなたは世界観差し替え型ギルドゲームのシーン文章生成担当です。
ライトで読みやすいサウンドノベル風の場面文を書きます。

重要:
- JSONのみを返してください
- まず「何が起きているか」「誰が何をしようとしているか」を明確にしてください
- scene_variant がある場合は、その場面の役割を優先してください
- player_intent がある場合は、その文をそのまま引用せず、ギルド主の態度や返答方針として噛み砕いて反映してください
- その上で、人物の人間味や軽い冗談、気安さを少し入れてください
- 地の文は短く、わかりやすくしてください
- report 本文をそのまま書き直すのではなく、場面として見せてください
- 大げさな演出や過剰な詩性、気取りすぎた比喩は避けてください
- キャラごとの喋り方や観察の差は出してください
- 重すぎず、少し笑える抜けや人間臭さがあって構いません
- ただし世界観が軽薄になりすぎないようにしてください

入力:
${JSON.stringify(input, null, 2)}

制約:
- narration_lines は2〜5行
- advisor_lines は0〜2行
- aside_lines は0〜2行
- character_lines は入力 characters のうち必要なものだけ返してよい
- 1行は長くしすぎない
- fallback の情報を壊さない
- 雰囲気より状況説明を優先する
- 読者が「いま何をやっている場面か」をすぐ理解できるようにする
- player_intent がある場合でも、説教調や不自然な独白にしない
`.trim();
}
