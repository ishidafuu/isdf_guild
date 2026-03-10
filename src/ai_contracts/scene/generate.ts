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
退廃サイバーパンクの短いサウンドノベル場面文を書きます。

重要:
- JSONのみを返してください
- 地の文は短く、空気と含みを優先してください
- report 本文をそのまま書き直すのではなく、場面として見せてください
- 大げさな演出や過剰な詩性は避けてください
- キャラごとの喋り方や観察の差は出してください

入力:
${JSON.stringify(input, null, 2)}

制約:
- narration_lines は2〜5行
- advisor_lines は0〜2行
- aside_lines は0〜2行
- character_lines は入力 characters のうち必要なものだけ返してよい
- 1行は長くしすぎない
- fallback の情報を壊さない
`.trim();
}
