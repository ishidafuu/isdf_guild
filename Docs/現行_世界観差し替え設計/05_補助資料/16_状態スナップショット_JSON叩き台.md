# 状態スナップショット JSON 叩き台

最終更新: 2026-03-10

この文書は、ある時点の人物状態、拠点状態、勢力関係の要点をまとめた
`snapshot` データの叩き台を置く。
最小実装では必須ではないが、後から履歴比較やデバッグに使いやすい。

## 1. 方針

- 1 依頼ごとの前後比較をしやすくする
- 各データ本体を書き換えるだけでなく、「その時どうだったか」を残せるようにする
- 実装初期は軽量なまとめだけでもよい

## 2. 最小スナップショット

```json
{
  "snapshot_id": "snapshot_0001",
  "world_pack_id": "world_pack_cyberpunk_base",
  "phase": "post_report",
  "source_report_id": "report_0001",
  "summary": "任務後の状態記録。",
  "character_states": [
    {
      "character_id": "char_0001",
      "injury": 1,
      "stress": 2,
      "availability": "resting"
    }
  ]
}
```

## 3. 推奨スナップショット

```json
{
  "snapshot_id": "snapshot_0001",
  "world_pack_id": "world_pack_cyberpunk_base",
  "phase": "post_report",
  "source_report_id": "report_0001",
  "source_dispatch_id": "dispatch_0001",
  "summary": "港湾輸送任務後の状態記録。前衛に負傷、依頼人との信頼は微増。",
  "character_states": [
    {
      "character_id": "char_0001",
      "injury": 1,
      "stress": 2,
      "availability": "resting",
      "relation_tags": ["worked_well_with_char_0003"]
    },
    {
      "character_id": "char_0003",
      "injury": 0,
      "stress": 1,
      "availability": "active",
      "relation_tags": ["client_contact_strengthened"]
    }
  ],
  "faction_states": [
    {
      "faction_id": "faction_port_union",
      "relation_state": "warming",
      "note": "任務完遂で信頼が少し上がった。"
    }
  ],
  "base_state": {
    "base_id": "base_0001",
    "selected_facility_ids": ["facility_clinic"],
    "issue_tags": ["medical_strain"]
  },
  "tags": ["snapshot", "post_mission", "carry_over"]
}
```

## 4. キーごとの役割

- `snapshot_id`
  - スナップショット ID
- `world_pack_id`
  - 世界観パック ID
- `phase`
  - どの段階の記録か
- `source_report_id`
  - 元になった日報
- `source_dispatch_id`
  - 元になった出発前データ
- `summary`
  - 一文要約
- `character_states`
  - 人物の要点状態
- `faction_states`
  - 勢力側の要点状態
- `base_state`
  - 拠点側の要点状態
- `tags`
  - 検索補助

## 5. 想定フェーズ

- `pre_mission`
  - 出発前
- `post_report`
  - 日報確定後
- `rest_phase`
  - 休養や面談の後
- `session_end`
  - ひと区切りの終了時

## 6. 最小実装での扱い

最小実装では必須ではない。
ただし、次のいずれかをやりたくなった時点で導入価値が高い。

- 前回から何が変わったかを一覧したい
- AI へ要約済み状態を渡したい
- デバッグや検証で状態遷移を追いたい

## 7. 後から足してよい要素

- 差分表示用の `delta_summary`
- 休養イベント結果の要約
- 年表イベントとの接続
- スナップショット比較ビュー
