# 日報データ JSON 叩き台

最終更新: 2026-03-10

この文書は、現行仕様の日報構造を実装用 JSON へ落とす際の叩き台を置く。
日報の文例自体は `03_日報出力サンプル.md` を参照し、この文書ではデータ構造に寄せて整理する。

## 1. 方針

- 日報はまず事実ログを残す
- 表示本文と内部更新情報を分ける
- `guildmaster_note` は日報本体に埋め込まず、別の人物メモとして連動させる
- AI 出力は `text`、`intent_tags`、`reason_summary` を必須とする

## 2. 最小日報データ

```json
{
  "report_id": "report_0001",
  "mission_id": "mission_0007",
  "kind": "mission_report",
  "text": "封印箱護送は部分成功。目的物は届いたが、護衛役の一人が負傷した。",
  "intent_tags": ["依頼結果", "部分成功", "負傷発生"],
  "reason_summary": "目的達成と引き換えに人的損耗が出た。"
}
```

## 3. 推奨日報データ

```json
{
  "report_id": "report_0001",
  "mission_id": "mission_0007",
  "world_pack_id": "fantasy_base",
  "kind": "mission_report",
  "phase": "post_mission",
  "text": "旧港倉庫での封印箱護送は部分成功。箱は指定先へ届いたが、帰路でシオンが肩を負傷。港湾商会は任務達成自体は評価したものの、輸送経路の判断には不満を残した。",
  "intent_tags": [
    "依頼結果",
    "部分成功",
    "負傷発生",
    "依頼人不満"
  ],
  "reason_summary": "輸送は完了したが、人的損耗と依頼人側の不信が残った。",
  "summary_lines": [
    "封印箱護送は部分成功。目的地への搬送自体は完了。",
    "シオンが肩を負傷し、次回任務には不安が残る。",
    "港湾商会は結果を認めつつも、経路判断に不満を示した。"
  ],
  "fact_log": {
    "outcome": "partial_success",
    "reward_change": "reduced",
    "injury_targets": ["char_shion"],
    "stress_targets": ["char_mina"],
    "relation_changes": [
      {
        "target_type": "faction",
        "target_id": "faction_port_union",
        "direction": "down",
        "amount": 1
      }
    ],
    "next_hook": "別経路を提案できる人物が必要"
  },
  "state_updates": {
    "mission_result": "partial_success",
    "character_updates": [
      {
        "character_id": "char_shion",
        "injury_delta": 1,
        "stress_delta": 0
      },
      {
        "character_id": "char_mina",
        "injury_delta": 0,
        "stress_delta": 1
      }
    ],
    "faction_updates": [
      {
        "faction_id": "faction_port_union",
        "relation_delta": -1
      }
    ]
  },
  "follow_up": {
    "suggested_rest_targets": ["char_shion"],
    "open_threads": ["港湾商会との関係回復", "別経路案の検討"]
  },
  "linked_notes": [
    {
      "character_id": "char_shion",
      "note_candidate_set_id": "gmnset_0001"
    }
  ]
}
```

## 4. キーごとの役割

- `kind`
  - 日報の種類。今は `mission_report` を想定
- `phase`
  - どの段階の報告か
- `text`
  - 表示本文
- `intent_tags`
  - 検索や再利用のためのタグ
- `reason_summary`
  - 短い理由要約
- `summary_lines`
  - 要約 3 行
- `fact_log`
  - 起こった事実の簡易ログ
- `state_updates`
  - ロジック側へ渡す更新候補
- `follow_up`
  - 次回につながるフック
- `linked_notes`
  - `guildmaster_note` 生成や選択とつなぐ参照

## 5. `guildmaster_note` との分離

日報データ自体には、ギルド主の主観メモを直接埋め込まない。
代わりに以下のように扱う。

- 日報は事実を記録する
- `linked_notes` で、どの人物に仮メモを出すかを示す
- 実際の `guildmaster_note` は人物データ側の `guildmaster_note_log` に保存する

この分離により、
事実ログと主観メモを混線させずに運用できる。

## 6. 実装時に分割してもよい単位

- `report_text`
  - 本文、要約、タグ
- `report_fact`
  - 結果、損耗、関係変化
- `report_updates`
  - ロジック更新候補
- `report_links`
  - 人物メモや後続イベントへの接続

## 7. 先に固定するとよい必須キー

- `report_id`
- `mission_id`
- `kind`
- `text`
- `intent_tags`
- `reason_summary`

`summary_lines`、`fact_log`、`state_updates`、`follow_up`、`linked_notes` は順次追加してよい。
