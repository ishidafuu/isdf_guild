import { runCodexCliJson } from "../../ai_runtime/codexCli";
import type { SceneGenerationRequest, SceneGenerationResponse, SceneTextPack } from "../../ai_runtime/types";
import { buildSharedStylePrompt } from "../shared/stylePrompt";

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

${buildSharedStylePrompt()}

重要:
- JSONのみを返してください
- まず「何が起きているか」「誰が何をしようとしているか」を明確にしてください
- scene_variant がある場合は、その場面の役割を優先してください
- player_intent がある場合は、その文をそのまま引用せず、ギルド主の態度や返答方針として噛み砕いて反映してください
- その上で、人物の人間味や軽い冗談、気安さを少し入れてください
- 地の文と会話が、ひとつの短い場面として流れるようにしてください
- 複数キャラクターが出る場合は、相手の言葉を受けた返しや横槍を入れてください
- キャラごとに一言ずつ順番に並べるより、短い会話の塊として見せてください
- report 本文をそのまま書き直すのではなく、場面として見せてください
- キャラごとの喋り方や観察の差は出してください
- 重すぎず、少し笑える抜けや人間臭さがあって構いません
- ただし世界観が軽薄になりすぎないようにしてください

入力:
${JSON.stringify(input, null, 2)}

制約:
- narration_lines は3〜6行
- advisor_lines は0〜3行
- aside_lines は0〜2行
- character_lines は入力 characters のうち必要なものだけ返してよい
- narration_lines は段落としてつながる内容にする
- character_lines の各 text は1〜3文でよい
- 同じ情報を短く刻んで複数欄にばらまかない
- fallback の情報を壊さない
- 雰囲気より状況説明を優先する
- 読者が「いま何をやっている場面か」をすぐ理解できるようにする
- player_intent がある場合でも、説教調や不自然な独白にしない
- ぶつ切りの台詞一覧や、箇条書きのような進み方にしない
`.trim();
}
