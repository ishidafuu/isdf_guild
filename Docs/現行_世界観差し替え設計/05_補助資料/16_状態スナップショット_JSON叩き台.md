# 状態スナップショット JSON 叩き台

最終更新: 2026-03-10

この文書は、ある時点の人物状態、拠点状態、勢力関係の要点をまとめた
`snapshot` データの叩き台を置く。
現時点では、軽量な状態保存として最小実装に含めてよい。
また、デバッグ用途だけでなく、プレイヤーが後から振り返る記録としても使えるようにしてよい。

## 1. 方針

- 1 依頼ごとの前後比較をしやすくする
- 各データ本体を書き換えるだけでなく、「その時どうだったか」を残せるようにする
- 実装初期は軽量なまとめだけでもよい
- 主用途は、次回へ渡す現在地の要約、状態遷移のデバッグ確認、後からの振り返りの3つとする

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

現時点の標準:

- まずは `post_report` を標準フェーズとして採用する
- 理由は、結果反映後の状態が最も自然にまとまり、次回へ持ち越す現在地として使いやすいため
- `pre_mission` と `session_end` は後から追加してよい

## 6. 最小実装での扱い

最小実装では、軽量版を入れてよい。
特に次の用途で価値が高い。

- 前回から何が変わったかを一覧したい
- AI へ要約済み状態を渡したい
- デバッグや検証で状態遷移を追いたい
- プレイヤーが次回開始時の現在地を掴みたい
- プレイヤーが後から「この時点ではどうなっていたか」を振り返りたい

## 7. 後から足してよい要素

- 差分表示用の `delta_summary`
- 休養イベント結果の要約
- 年表イベントとの接続
- スナップショット比較ビュー
