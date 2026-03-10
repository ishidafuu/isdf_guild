# 拠点設備データ JSON 叩き台

最終更新: 2026-03-10

この文書は、拠点で利用できる設備を `facility` データとして定義するための叩き台を置く。
`dispatch.base_state.selected_facility_ids` の参照先として使うことを前提にする。

補足:
キー名や ID の付け方は `07_JSON命名規則とID規則.md` に従う。

## 1. 方針

- プレイヤー表示は「設備一覧」で見せる
- 内部処理では、設備ごとに少数の機能タグや利用条件を持たせる
- 世界観ごとに設備名や説明は差し替えてよい
- 同じ機能でも、世界観によって見た目や語彙は変えてよい
- 初期実装では `使える / 使えない` の二値運用を基本にしてよい
- ただし将来的に `損傷中 / 混雑中 / 一時停止中` のような中間状態を載せられる前提にする

## 2. 最小設備データ

```json
{
  "facility_id": "facility_clinic",
  "world_pack_id": "world_pack_cyberpunk_base",
  "name": "裏診療所",
  "category": "medical",
  "status": "available",
  "effect_tags": ["injury_care", "post_mission_recovery"],
  "summary": "簡易治療と応急処置ができる設備。"
}
```

## 3. 推奨設備データ

```json
{
  "facility_id": "facility_briefing_room",
  "world_pack_id": "world_pack_cyberpunk_base",
  "name": "作戦卓",
  "category": "briefing",
  "status": "available",
  "summary": "依頼資料を広げ、出発前のすり合わせを行う共用卓。",
  "description": "情報の整理、役割分担、簡単な方針確認に使われる。部屋そのものより、ここで交わされる会話が重要。",
  "effect_tags": ["mission_planning", "pre_mission_talk", "risk_review"],
  "availability_rule": {
    "requires_tags": [],
    "blocked_by_tags": ["facility_damaged"]
  },
  "usage_examples": [
    "出発前の懸念共有",
    "依頼文の読み合わせ",
    "人物同士の短い会話イベント"
  ],
  "narrative_effects": [
    "会話イベント候補が増える",
    "懸念メモの精度が上がる",
    "依頼の受け止め方に厚みが出る"
  ],
  "state_flags": ["core_space"],
  "tags": ["base_facility", "conversation", "planning"]
}
```

## 4. キーごとの役割

- `facility_id`
  - 設備 ID
- `world_pack_id`
  - どの世界観用の設備か
- `name`
  - 表示名
- `category`
  - 医療、記録、工房、応接などの大分類
- `status`
  - 利用可能状態
- `summary`
  - 一文説明
- `description`
  - 詳細説明
- `effect_tags`
  - 内部的な機能タグ
- `availability_rule`
  - 利用条件や停止条件
- `usage_examples`
  - どのような場面で使うか
- `narrative_effects`
  - 物語上どういう変化を感じさせるか
- `state_flags`
  - 中核設備、損傷中などのフラグ
- `tags`
  - 検索補助

## 5. 推奨カテゴリ

- `medical`
  - 治療、休養補助
- `briefing`
  - 作戦確認、会話
- `archive`
  - 記録、依頼履歴
- `workshop`
  - 補修、工作
- `counsel`
  - 面談、相談
- `guest`
  - 来客対応
- `storage`
  - 物資保管
- `ritual`
  - 世界観固有の調整機能

## 6. 設備効果の持たせ方

設備効果は、数値上昇よりも次のような「できることの変化」で持たせると現行方針に合う。
ただし実用性だけに寄せすぎず、雰囲気や会話の発生源としても機能する説明を持たせる。

- 出発前の準備タグが増える
- 休養イベント候補が増える
- 会話の文脈が増える
- 一部の依頼に自然な説得力が出る
- 日報やメモに設備由来の痕跡が残る

## 7. 世界観差し替えの考え方

同じ機能でも、設備名や演出は差し替えてよい。

例:

- `medical`
  - ファンタジー: `医務室`
  - サイバーパンク: `裏診療所`
  - 和風怪異: `離れの療養間`
- `archive`
  - ファンタジー: `記録庫`
  - サイバーパンク: `データ保管庫`
  - 和風怪異: `古文書庫`

## 8. 最小実装で必要な設備数

最小実装では、`1 から 2 件` あればよい。

推奨:

- 休養や負傷説明に使える設備 1 件
- 出発前会話や準備説明に使える設備 1 件

## 9. 後から足してよい要素

- 設備ごとの段階成長
- 損傷や改築状態
- 特定人物との相性
- 固有イベントプール
- 依頼カテゴリ別の相性補正
