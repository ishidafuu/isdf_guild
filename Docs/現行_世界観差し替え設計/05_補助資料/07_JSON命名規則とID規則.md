# JSON 命名規則と ID 規則

最終更新: 2026-03-10

この文書は、現行の JSON 叩き台と日報サンプルで使うキー名、列挙値、ID の付け方を揃えるための基準を置く。

## 1. 基本方針

- キー名は `snake_case`
- ID は `接頭辞_識別子` の形を基本とする
- 列挙値は英小文字の `snake_case`
- 表示文は日本語でよいが、内部キーは英字で固定する
- 同じ意味には同じキー名を使う

## 2. キー名の基本ルール

推奨:

- `character_id`
- `mission_id`
- `report_id`
- `dispatch_id`
- `world_pack_id`
- `faction_id`
- `facility_id`
- `note_id`
- `source_id`
- `target_id`
- `note_candidate_set_id`

避けたいもの:

- 同じ意味なのに `id` と `character_id` が混在する
- `camelCase`
- 省略しすぎたキー名
  - 例: `gmnset_0001`

## 3. ID 規則

ID は原則として以下の接頭辞を使う。

- `char_0001`
  - キャラクター
- `mission_0001`
  - 依頼
- `report_0001`
  - 日報
- `dispatch_0001`
  - 出発前データ
- `faction_0001`
  - 勢力
- `facility_0001`
  - 拠点設備
- `note_0001`
  - 単体メモ
- `note_candidate_set_0001`
  - メモ候補セット
- `interview_0001`
  - 面談イベント
- `timeline_event_0001`
  - 人物年表イベント
- `skill_0001`
  - 特技
- `world_pack_0001`
  - 世界観パック

補足:
サンプル段階では、意味が見える ID も許容する。

- `char_shion`
- `faction_port_union`
- `world_pack_fantasy_base`

ただし、同一実装では
`連番型`
または
`意味付き固定文字列型`
のどちらかへ寄せた方がよい。

## 4. 参照系キーの統一

参照を持つキーは以下へ寄せる。

- `character_id`
- `mission_id`
- `report_id`
- `dispatch_id`
- `faction_id`
- `facility_id`
- `world_pack_id`
- `source_id`
- `target_id`
- `note_candidate_set_id`

ネストされたオブジェクト内でも、意味が明確なら `id` 単体ではなく `faction_id` や `character_id` を優先する。

## 5. 列挙値の書き方

列挙値は英小文字の `snake_case` で揃える。

例:

- `mission_report`
- `post_mission`
- `partial_success`
- `active`
- `open`
- `backstory`
- `mission_aftermath`

## 6. 共通で使う語の揃え方

状態:

- `status`
  - 現在状態
- `availability`
  - 参加可能状態
- `result`
  - 任務結果

変化量:

- `injury_delta`
- `stress_delta`
- `relation_delta`

要約:

- `summary`
  - 単一の短い要約
- `reason_summary`
  - 理由要約
- `summary_lines`
  - 複数行の要約

## 7. ドキュメント間で特に揃えるべき項目

人物:

- `character_id`
- `world_pack_id`
- `role`
- `stats`
- `status`
- `guildmaster_note_log`

依頼:

- `mission_id`
- `world_pack_id`
- `category`
- `client`
- `target`
- `location`
- `difficulty`
- `state`

日報:

- `report_id`
- `mission_id`
- `dispatch_id`
- `kind`
- `text`
- `intent_tags`
- `reason_summary`
- `linked_notes`

出発前データ:

- `dispatch_id`
- `mission_id`
- `world_pack_id`
- `assigned_character_ids`
- `base_state.selected_facility_ids`

## 8. 現時点の推奨

- キー名はすべて `snake_case`
- 参照キーは `対象名 + _id`
- 列挙値は英小文字 `snake_case`
- `gmnset_` のような省略接頭辞は使わず、`note_candidate_set_` のように意味が読める形にする
