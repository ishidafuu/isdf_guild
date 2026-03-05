# AI生成設計（MVP v0.1）

## 目的

- AI生成を「人格表現」と「文脈表現」に集中させる
- 成否や評判の数値判定はゲームロジック側で一貫して扱う
- 会話の自然さを保ちながら、実装可能な入出力契約を固定する

## 基本方針（責務分離）

- AIが担当するもの:
- 冒険者/依頼主の人物文、口調、会話応答、日報文
- ロジックが担当するもの:
- 受諾判定、打ち切り判定、結果4分類、評判内部値更新
- AI出力は「表示文」と「理由タグ」までに限定する
- 数値更新はAI出力に依存しない（推論の暴れをゲーム進行へ直結させない）

## 生成イベント一覧（MVP）

1. 冒険者初期生成（非同期）
- トリガー: ワールド初期化、日次応募で新規流入
- 出力: 紹介文、自己評価文、口調ルール

2. 依頼主初期生成（非同期）
- トリガー: ワールド初期化
- 出力: 人物紹介文、交渉スタイル文、申告傾向説明文

3. 依頼文生成（同期）
- トリガー: 新規依頼流入時
- 出力: 掲示板表示文、補足説明文、注意点文

4. 面談応答生成（同期・高優先）
- トリガー: 面談中の質問/提案/説得
- 出力: 冒険者返答文、意思理由要約、感情タグ

5. 出発判断コメント生成（同期）
- トリガー: 受諾/保留/辞退決定時
- 出力: 決定理由文（短文）

6. 帰還日報生成（同期）
- トリガー: 帰還処理時
- 出力: 要約3行、詳細ログ文、依頼主コメント、冒険者コメント

7. 評判反映テキスト生成（非同期）
- トリガー: 評判内部値更新後
- 出力: 街の噂、次回来訪時の台詞変化

## 面談AI呼び出し粒度（確定）

- 面談中は「冒険者の返答が必要なタイミングのみ」AIを呼ぶ
- プレイヤー操作ごとの毎回生成はしない
- 面談終了時の一括生成もしない
- 目的:
- 体感テンポ維持
- APIコスト抑制
- 必要箇所の文面品質確保

## 面談判断の提示方式（確定）

- 受諾可否の度合いはUIメーターやヒントを出さず、文面のみで表現する
- プレイヤーは返答文から「何が不満か」「どこを改善すべきか」を読み取る設計にする

## 入力コンテキスト契約（共通）

- すべての生成イベントは、以下の共通ペイロードを受け取る

```json
{
  "event_type": "INTERVIEW_REPLY",
  "day": 12,
  "tone": "readable_medieval",
  "speaker": {
    "id": "adv_012",
    "role": "adventurer",
    "profile_digest": "..."
  },
  "counterparty": {
    "id": "guild_master",
    "role": "guild"
  },
  "request": {
    "id": "req_144",
    "request_category": "護衛",
    "disclosed_info": "...",
    "status": "proposed",
    "request_style_level_disclosed": 62,
    "request_style_signal": 58,
    "expected_honor_disclosed": 70,
    "expected_honor_signal": 66,
    "dishonor_risk_disclosed": 25,
    "dishonor_risk_signal": 31,
    "public_visibility_disclosed": 78,
    "public_visibility_signal": 74
  },
  "state": {
    "decision_result": "hold",
    "decision_score": 62.4,
    "threshold_accept": 73,
    "threshold_hold": 43,
    "threshold_mode": "dynamic_v0_6",
    "decision_margin": -10.6,
    "persuasion_headroom": 10.6,
    "persuasion_locked": false,
    "persuasion_resistance": 24,
    "ineffective_streak": 1,
    "result_class": null,
    "reputation_hints": ["safety_down_small"]
  },
  "persuasion": {
    "selected_action": "応援する",
    "base_delta": 2.8,
    "factor_delta": 1.9,
    "repeat_penalty": 0.0,
    "resistance_penalty": -1.0,
    "timing_penalty": 0.0,
    "persuasion_delta_turn": 3.7,
    "persuasion_effective": 5.1
  },
  "diagnostics": {
    "blocking_factors": [
      { "factor": "risk_fit", "gap": -18 },
      { "factor": "clarity", "gap": -11 }
    ],
    "positive_factors": [
      { "factor": "reward", "gap": 9 }
    ]
  },
  "history_digest": [
    "前回は危険説明が不足していたと感じている"
  ],
  "relation_context": {
    "teammate_edges": [
      {
        "target_id": "adv_031",
        "tag": "健全ライバル",
        "affinity": 56,
        "mission_trust": 64,
        "rivalry": 74,
        "resentment": 28
      }
    ],
    "client_edge": {
      "target_id": "cli_004",
      "tag": "不信",
      "affinity": 41,
      "mission_trust": 33,
      "rivalry": 12,
      "resentment": 69
    }
  },
  "constraints": {
    "max_chars": 120,
    "style": "軽すぎない、読みやすい"
  }
}
```

## 情報公開境界（確定）

- 面談/受諾判断系イベントでは、AIへ渡す依頼メタ値は原則 `disclosed_*` のみ
- 追加ヒアリング後は、`disclosed_*` に `hearing_delta_*` を反映した `*_signal` を渡してよい
- 帰還日報イベントでは、`actual_*` と `disclosed_*` の差分を渡して露見描写に使う
- これにより、冒険前の会話で「知り得ない真実」をAIが先読みしないようにする

## 出力契約（共通）

- AI出力は必ずJSONで返す
- 最低限の必須項目は `text` と `intent_tags`

```json
{
  "text": "今回の依頼は報酬は魅力的ですが、情報が薄いのが気になります。",
  "intent_tags": ["risk_concern", "reward_interest"],
  "reason_summary": "危険情報の不確実性を重く見たため保留"
}
```

- `intent_tags` はUI表示補助と分析用に使う
- ゲーム状態更新はロジック層で実施し、AIテキストは参照のみ

## 日報生成の追加入力（確定）

- `MISSION_REPORT` では以下を入力に含める
- `scene_timeline`: シーンごとの内部展開ログ（全件、内部保持）
- `scene_highlights`: 重要シーン（表示用、最大4件）
- `failure_causes`: 失敗理由タグ配列（例: `UNDERSTATED_RISK`, `INFO_GAP`）
- `discrepancy_notes`: 申告と実態の食い違いメモ
- 目的:
- 結果文面が「なぜそうなったか」を説明できるようにする

## 判定度合いの文面反映（確定）

- AIには「判定結果」だけでなく「閾値からの距離」を渡す
- 主要入力:
- `decision_score`（最終スコア）
- `threshold_accept`
- `threshold_hold`
- `threshold_mode`（`dynamic_v0_6`）
- `decision_margin`（受諾閾値との差。正なら受諾側）
- `persuasion_headroom`（受諾までの不足量。保留時に使用）
- `persuasion_locked`（説得が効かない状態か）
- `persuasion_resistance`（説得への反発蓄積）
- `ineffective_streak`（不発説得の連続）
- 反映ルール:
- `|decision_margin| <= 6`: 迷いが強い文面（「あと一押し」感）
- `7〜15`: 中程度の確信
- `>=16`: 強い確信（受諾/辞退ともに明確）
- これにより「ギリギリ辞退」「完全NG」の差を会話上で表現する
- `threshold_accept / threshold_hold` は固定値ではなく、面談負荷・反発・信頼回復で毎往復更新される
- `style_fit` と `honor_outlook` は受諾判定スコアに含める
- AIには両要素のギャップも渡し、返答文の不満理由に反映させる
- 説得行動時は `persuasion` 内訳も渡し、「何が効いた/効かなかったか」を文面へ反映する
- `persuasion_locked=true` の場合は「これ以上この方向の説得は受けない」ニュアンスを返答へ反映する
- `relation_context` がある場合は、相棒/ライバル/不信のニュアンスを返答文に1要素だけ反映する

## 不満点の言語化ルール（確定）

- 面談返答には、`blocking_factors` 上位1〜2件を必ず自然文に反映する
- 反映形式:
- 不満理由（例: 危険情報が曖昧、依頼主への不信、疲労不安）
- 改善余地（例: 情報補足があれば再検討、休養後なら前向き）
- 禁止:
- 理由ゼロの断定文（例: 「無理です」だけ）
- 内部数値の露出（スコアや閾値の直接表示）

## `blocking_factors` 初期カテゴリ（確定）

- `risk_fit`: 危険度と実力/得意領域の不一致
- `clarity`: 依頼情報の不足・矛盾・不明瞭さ
- `client_trust`: 依頼主への不信感（申告姿勢、態度）
- `reward_balance`: 報酬と危険/手間の釣り合い不足
- `fatigue`: 疲労・体調・連戦負荷
- `ethics`: 価値観との不一致（倫理、信条）
- `style_fit`: 任務の地味さ/派手さと本人嗜好の不一致
- `honor_outlook`: 名誉が得られない、または不名誉リスクが高い

- 補足:
- `honor_outlook` は `ethics` と近いが、MVPでは「社会的評価・体面」を分離して扱う
- UI表示はコード名を出さず、自然文に変換して返答に埋め込む

## 生成順序（ミッション連動）

1. ロジック層が内部オート展開（シーン進行 + ロール）を先に実行
2. 判定結果を `state` としてAIへ渡す
3. AIが文面を返す
4. UIは「数値結果 + AI文面」を統合表示

- 例:
- `scene_timeline` と `failure_causes`、`result_class=失敗`、`damage=62` が先に確定
- AIはこの結果を受けて日報要約3行を生成

## モデルルーティング（MVP）

- 高品質モデル:
- 冒険者初期生成、依頼主初期生成、初回依頼文
- 低遅延モデル:
- 面談応答、出発判断コメント、日報文
- モデル差し替え可能なようにイベント種別でルーティングする

## キャッシュ設計

- キャッシュキー:
- `entity_id + event_type + day + context_hash + prompt_version`
- キャッシュ優先度:
- 面談応答と日報は最優先で再利用
- 無期限保持:
- 初期生成系（冒険者/依頼主プロフィール）
- 短期保持:
- 会話系（14日目安）

## リトライ・失敗時挙動（既定の具体化）

- ソフトタイムアウト: `8秒`
- ハードタイムアウト: `15秒`
- 自動再試行: `1回`（2秒後）
- 取得不能時:
- 直近キャッシュを暫定表示
- 再生成キューへ投入
- 手動再試行ボタンを表示

## 文章品質ガード

- 長さ制約:
- 面談返答 `40〜140文字`
- 日報要約1行 `30〜70文字`
- 文体制約:
- 読みやすい、軽薄すぎない、中世雰囲気を損なわない
- 禁止傾向:
- 現代ネットスラング過多
- 設定外メタ発言（「これはゲームなので」など）

## 実装インターフェース（TypeScript案）

```ts
type AiEventType =
  | "ADVENTURER_PROFILE"
  | "CLIENT_PROFILE"
  | "REQUEST_TEXT"
  | "INTERVIEW_REPLY"
  | "DEPARTURE_REASON"
  | "MISSION_REPORT"
  | "REPUTATION_FLAVOR";

type AiGenerateInput = {
  eventType: AiEventType;
  entityId?: string;
  day: number;
  payload: Record<string, unknown>;
  constraints?: { maxChars?: number; tone?: string };
};

type AiGenerateOutput = {
  text: string;
  intentTags: string[];
  reasonSummary?: string;
  cached: boolean;
};
```

## プロンプトテンプレ（MVP）

### 1. 冒険者初期生成

```txt
[system]
あなたは中世ファンタジー世界の人物設定ライターです。
出力は必ずJSONのみ。軽薄な表現は避け、読みやすく簡潔に書くこと。

[user]
event_type: ADVENTURER_PROFILE
world: {city_name}
input: {big5_values, background_tags, skill_tags, self_eval_bias}
constraints: {max_chars: 180}
required_json_keys: text, intent_tags, reason_summary
```

### 2. 面談応答生成

```txt
[system]
あなたは冒険者本人として返答する。出力はJSONのみ。
既に確定した判定結果を覆さない。文面でのみ理由を表現する。

[user]
event_type: INTERVIEW_REPLY
decision_result: {accept|hold|decline}
history_digest: {recent_events}
request_digest: {disclosed_info}
constraints: {max_chars: 120, style: "軽すぎない"}
required_json_keys: text, intent_tags, reason_summary
```

### 3. 帰還日報生成

```txt
[system]
あなたはギルド日報の記録係。要約3行と詳細短文をJSONで返す。
数値判定と矛盾する表現は禁止。

[user]
event_type: MISSION_REPORT
result: {result_class, achievement, damage, reward_rate, duration_days}
scene_highlights: {important_scene_summaries_up_to_4}
failure_causes: {cause_tags}
discrepancy_notes: {disclosed_vs_actual_notes}
party_status: {injury_band, leave_days}
required_json_keys: summary_lines, detail_text, scene_lines, cause_lines, intent_tags
```

## JSONバリデーション（最低限）

- `text`: 1〜220文字
- `intent_tags`: 1個以上、最大6個
- `reason_summary`: 1〜80文字
- 日報イベントのみ:
- `summary_lines`: 3要素固定（各 30〜70文字）
- 日報イベントのみ:
- `scene_lines`: 1〜4要素（各 20〜90文字、重要シーン順）
- `scene_lines` は各行「事実 + 冒険者感情1フレーズ」で構成する
- 感情フレーズ例: 「手応えがあった」「嫌な予感が残った」「判断に迷いがあった」
- 感情フレーズ強度は `中程度` を固定（過度に芝居がかった表現は避ける）
- 日報イベントのみ:
- `cause_lines`: `failure_causes` と同数（全件、各 20〜80文字）
- `cause_lines` の順序は `failure_causes` の重大度降順と一致させる
- `failure_causes` が空の場合、`cause_lines` は `["特筆すべき問題なし"]` を返す

## 受け入れ条件（AI生成まわり）

- 面談1往復を `2秒以内` で表示開始できる（キャッシュヒット時）
- 日報要約3行が `result_class` と矛盾しない
- `scene_lines` の各行で「事実 + 感情1フレーズ」が成立している
- 感情フレーズが `中程度` のトーンを維持している
- 同一人物の口調が連続5回の会話で大きく破綻しない
- 直近キャッシュ復帰時でも進行が止まらない
