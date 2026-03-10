# メモ候補セット JSON 叩き台

最終更新: 2026-03-10

この文書は、`guildmaster_note` を作る前に AI が提示する仮メモ 3 件を
`note_candidate_set` として保持するための叩き台を置く。

## 1. 方針

- AI は人物ごとに仮メモ候補を 3 件出す
- ユーザーは近いものを 1 件選び、必要なら短文補足する
- 選ばれなかった候補も、その時点の AI の見立てとして短期間保持してよい

## 2. 最小候補セット

```json
{
  "note_candidate_set_id": "note_candidate_set_0001",
  "character_id": "char_0002",
  "report_id": "report_0001",
  "candidates": [
    {
      "candidate_id": "note_candidate_0001",
      "text": "任務はこなしたが、明らかに無理を押していた。"
    },
    {
      "candidate_id": "note_candidate_0002",
      "text": "冷静に見えたが、依頼人への不信感を隠せていなかった。"
    },
    {
      "candidate_id": "note_candidate_0003",
      "text": "次は補佐役を付けた方がよさそうだ。"
    }
  ]
}
```

## 3. 推奨候補セット

```json
{
  "note_candidate_set_id": "note_candidate_set_0001",
  "character_id": "char_0002",
  "report_id": "report_0001",
  "source_kind": "post_mission_note_prompt",
  "reason_summary": "依頼人との応対と負傷の受け止め方に、本人の性格が強く出ていた。",
  "candidates": [
    {
      "candidate_id": "note_candidate_0001",
      "text": "任務はこなしたが、明らかに無理を押していた。",
      "intent_tags": ["concern", "overwork"]
    },
    {
      "candidate_id": "note_candidate_0002",
      "text": "冷静に見えたが、依頼人への不信感を隠せていなかった。",
      "intent_tags": ["distance", "distrust"]
    },
    {
      "candidate_id": "note_candidate_0003",
      "text": "次は補佐役を付けた方がよさそうだ。",
      "intent_tags": ["future_assignment", "support_needed"]
    }
  ],
  "selection_state": {
    "selected_candidate_id": "note_candidate_0003",
    "user_short_note": "単独で無理をさせない方がいい。",
    "saved_note_id": "note_0012"
  },
  "tags": ["guildmaster_note", "candidate_set"]
}
```

## 4. キーごとの役割

- `note_candidate_set_id`
  - 候補セット ID
- `character_id`
  - 対象人物
- `report_id`
  - 参照元の日報
- `source_kind`
  - どの場面で作られた候補か
- `reason_summary`
  - なぜこの候補群が出たか
- `candidates`
  - 仮メモ候補の配列
- `selection_state`
  - どれを選び、何を補足し、どのノートとして保存したか
- `tags`
  - 検索補助

## 5. `guildmaster_note` との関係

- `note_candidate_set` は一時的な候補
- `guildmaster_note` は人物データ側に保存される確定メモ
- 日報は `linked_notes[].note_candidate_set_id` などで候補セットを参照してよい

## 6. 最小実装で必要な項目

- `note_candidate_set_id`
- `character_id`
- `report_id`
- `candidates`

`selection_state` は最初から持ってもよいが、実装初期は保存先ノートとの接続だけでもよい。

## 7. 後から足してよい要素

- 候補ごとの信頼度
- 候補が参照したログ断片
- 面談時の候補セット
- 候補生成失敗時の代替文
