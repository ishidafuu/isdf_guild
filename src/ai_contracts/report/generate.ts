import {
  buildFallbackReportAiOutput,
  type ReportAiInput,
  type ReportAiOutput,
  validateReportAiOutput,
} from "./contracts";
import type { ReportGenerationResponse } from "../../ai_runtime/types";
import { runCodexCliJson } from "../../ai_runtime/codexCli";
import { buildSharedStylePrompt } from "../shared/stylePrompt";

const REPORT_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["text", "intent_tags", "reason_summary", "summary_lines"],
  properties: {
    text: { type: "string" },
    intent_tags: { type: "array", items: { type: "string" } },
    reason_summary: { type: "string" },
    summary_lines: { type: "array", items: { type: "string" } },
  },
} as const;

export async function generateReportViaCodexCli(input: ReportAiInput): Promise<ReportGenerationResponse> {
  const fallback = buildFallbackReportAiOutput(input);

  try {
    const output = await runCodexCliJson<Partial<ReportAiOutput>>({
      prompt: buildReportPrompt(input, fallback),
      schema: REPORT_OUTPUT_SCHEMA,
    });

    if (!validateReportAiOutput(output)) {
      return {
        output: fallback,
        meta: {
          provider: "fallback",
          used_fallback: true,
          warning: "report AI 出力の必須項目が不足したためテンプレートへ戻しました。",
        },
      };
    }

    return {
      output: {
        ...fallback,
        ...output,
        fact_log: fallback.fact_log,
        follow_up: fallback.follow_up,
      },
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
        warning: error instanceof Error ? error.message : "report AI 生成に失敗しました。",
      },
    };
  }
}

function buildReportPrompt(input: ReportAiInput, fallback: ReportAiOutput): string {
  return `
あなたは世界観差し替え型ギルドゲームの文章生成担当です。
ライトで読みやすい文体で、短く、事実と余波を分けて日報文を整えてください。

${buildSharedStylePrompt()}

重要:
- JSONのみを返してください
- report は事実ベースです
- guildmaster_note のような主観断定は避けてください
- 誇張しすぎず、まず何が起きたかを明確にしてください
- その上で現場の空気や後味を少しだけ残してください
- 必須項目 text / intent_tags / reason_summary は必ず埋めてください
- 少し人間味があってもよいですが、冗談に寄せすぎないでください
- 報告書の体裁を保ちながらも、文章として自然につながるようにしてください

入力:
${JSON.stringify(input, null, 2)}

フォールバック案:
${JSON.stringify(fallback, null, 2)}

制約:
- text は3〜6文
- summary_lines は最大3行
- 既にある事実関係を壊さない
- 結果段階、損耗、対外関係、次の火種がわかる範囲で反映する
- 読んですぐ状況がつかめる文にする
- 文ごとに事実を切り離して箇条書き風にしない
`.trim();
}
