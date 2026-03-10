# 実装前固定仕様

最終更新: 2026-03-09

## 23. 実装前固定仕様（WebローカルMVP）

### 画面遷移（固定）

- 基本は `日中運用ハブ` 1画面常駐
- 冒険者クリックで `個別面談` モーダルを開く
- `次の日` 押下時、未読日報があれば `日報要約モーダル` を必須表示
- 日報要約確認後に日付更新処理を実行し、必要に応じて詳細を展開
- すべての操作終了後は `日中運用ハブ` に戻る

### 時間進行順序（固定）

1. 未読日報要約の確認
2. 日付更新
3. 依頼終了条件の解決（期限切れ / 他ギルド達成 / 依頼主都合）
4. 出発待ちキュー処理（`ACCEPT_PENDING` の再判定）
5. 帰還判定（同日帰還あり）
6. 新規依頼流入
7. 日次応募発生

### 次の日キュー（固定）

- キュー種別:
- `departure_queue`（出発待ち）
- `mission_queue`（進行中。保存実体は `mission_runs(state=RUNNING)`）
- `report_queue`（帰還済み未読。保存実体は `reports(unread=true)`）
- 面談で `受諾` になった案件のみ `departure_queue` に入る
- `保留` はキューに入れず、再提案待ちのまま維持する
- `report_queue` が1件でも未読なら次の `次の日` はブロックする

### 保存方式

- メイン保存は `IndexedDB`（履歴・ログ量が多いため）
- 軽量設定は `localStorage`（UI設定など）
- 保存データはローカル端末内のみ

### IndexedDBスキーマ（MVP固定）

- DB名: `isdfGuildMvp`
- バージョン: `1`
- 文字列IDはすべて `prefix_uuid` 形式（例: `adv_...`, `req_...`, `asg_...`）
- 実装コード（TypeScript型/IndexedDB投入オブジェクト）は `camelCase` を採用する
- この章の `snake_case` 表記は永続概念名であり、コード上では `adventurer_id -> adventurerId`, `event_kind -> eventKind` のように1:1対応する

| store | keyPath | 主なフィールド | index |
| --- | --- | --- | --- |
| `meta` | `key` | `value`（`current_day`, `world_seed`, `last_auto_save_at` など） | なし |
| `clients` | `client_id` | `name`, `type`, `trust_axes`, `error_profile`, `public_digest`, `private_dossier`, `volatile_hook`, `created_day` | `type`, `created_day` |
| `adventurers` | `adventurer_id` | `name`, `big5_base`, `big5_drift`, `big5_effective`, `experience_state`, `career_eval`, `status`, `fatigue`, `mood`, `trust_guild_base`, `public_digest`, `private_dossier`, `volatile_hook`, `available_day` | `status`, `available_day`, `created_day` |
| `requests` | `request_id` | `client_id`, `status`, `board_scope`, `disclosed_*`, `actual_*`, `expires_day`, `created_day` | `status`, `board_scope`, `expires_day`, `client_id` |
| `assignments` | `assignment_id` | `request_id`, `adventurer_id`, `assignment_state`, `decision_state`, `interview_state`, `prep_bonus`, `updated_day` | `request_id`, `adventurer_id`, `assignment_state`, `updated_day` |
| `relations` | `relation_id` | `source_type`, `source_id`, `target_type`, `target_id`, `affinity`, `mission_trust`, `rivalry`, `resentment`, `pair_synergy`, `pair_tension`, `last_updated_day`, `last_event_id` | `source_id`, `target_id`, `source_type`, `target_type`, `last_updated_day` |
| `relation_events` | `event_id` | `relation_id`, `day`, `event_type`, `delta`, `mission_id`, `assignment_id`, `note_digest` | `relation_id`, `day`, `event_type` |
| `departure_queue` | `assignment_id` | `adventurer_id`, `request_id`, `due_day`, `pending_days`, `retry_count`, `created_day` | `due_day`, `adventurer_id` |
| `mission_runs` | `mission_id` | `assignment_id`, `depart_day`, `return_due_day`, `duration_days`, `result_snapshot`, `state` | `assignment_id`（unique）, `return_due_day`, `state` |
| `reports` | `report_id` | `mission_id`, `returned_day`, `unread`, `summary3`, `detail_payload` | `unread`, `returned_day`, `mission_id` |
| `interview_logs` | `log_id` | `assignment_id`, `adventurer_id`, `day`, `turn`, `action`, `decision_state`, `summary_text`, `internal_digest` | `assignment_id`, `day`, `adventurer_id` |
| `character_journal` | `journal_id` | `adventurer_id`, `day`, `event_kind`, `importance`, `mission_id`, `assignment_id`, `related_ids`, `headline`, `fact_digest`, `emotion_digest`, `lesson_tags`, `trait_vector`, `state_delta` | `adventurer_id`, `day`, `event_kind`, `importance` |
| `reputation_daily` | `rep_id` | `day`, `client_axes`, `adventurer_axes`, `delta_reason` | `day` |
| `ai_cache` | `cache_key` | `event_type`, `entity_id`, `day`, `context_hash`, `text_json`, `created_at`, `expires_at` | `event_type`, `entity_id`, `expires_at` |
| `debug_metrics` | `metric_id` | `day`, `category`, `payload`, `created_at` | `day`, `category` |

- ネストオブジェクト定義（固定）:
- `adventurers.big5_base / big5_drift / big5_effective`: `{ O, C, E, A, N }`
- `adventurers.experience_state`: `{ category_confidence: { slay, guard, investigate, gather, transport, negotiate }, injury_caution, glory_drive, guild_bond, self_efficacy, principle_rigidity, trait_pressure: { O, C, E, A, N } }`
- `adventurers.career_eval`: `{ reliability, safety, flashiness, ethics, growth }`
- `character_journal.related_ids`: `{ client_id?, teammate_ids?, relation_id?, report_id? }`
- `character_journal.state_delta`: `{ experience_state_delta, career_eval_delta, big5_drift_delta }`
- `big5_effective` は検索/表示用のマテリアライズ値とし、保存時に `big5_base + big5_drift` から再計算する

- 状態値（固定）:
- `requests.status`: `NEW / POSTED / WITHDRAWN / EXPIRED / CLOSED`
- `assignments.assignment_state`: `INTERVIEWING / HOLD / DECLINED / ACCEPT_PENDING / IN_MISSION / RETURNED_UNREAD / CLOSED`
- `mission_runs.state`: `RUNNING / RETURNED / CLOSED`
- `relations.source_type/target_type`: `ADVENTURER / CLIENT`
- `character_journal.event_kind`: `MISSION_RESULT / INJURY_OR_LEAVE / INTERVIEW_SUMMARY / CLIENT_FEEDBACK / RELATION_SHIFT / GUILD_CARE`

- 参照整合（アプリ側保証）:
- `assignments.request_id -> requests.request_id`
- `assignments.adventurer_id -> adventurers.adventurer_id`
- `relations.source_id -> adventurers.adventurer_id`（`source_type=ADVENTURER`）
- `relations.target_id -> adventurers.adventurer_id | clients.client_id`
- `relation_events.relation_id -> relations.relation_id`
- `departure_queue.assignment_id -> assignments.assignment_id`
- `mission_runs.assignment_id -> assignments.assignment_id`（1:1）
- `reports.mission_id -> mission_runs.mission_id`
- `character_journal.adventurer_id -> adventurers.adventurer_id`

- `次の日` 処理のトランザクション境界（readwrite一括）:
- 対象ストア: `meta`, `requests`, `assignments`, `relations`, `relation_events`, `departure_queue`, `mission_runs`, `reports`, `adventurers`, `character_journal`, `reputation_daily`, `debug_metrics`
- 失敗時はロールバックして `current_day` を進めない
- 成功時のみ `meta.current_day` と `last_auto_save_at` を更新

- データ圧縮（既定）:
- `interview_logs` と `debug_metrics` は最新30日を高粒度保持
- 31日以前は日単位サマリへ圧縮し、詳細ペイロードを削除して容量を抑制
- `character_journal` はプレイヤーの人物史閲覧に使うため原則フル保持する
- ただし `importance < 35` の `INTERVIEW_SUMMARY` は120日以降、週次要約へ圧縮可能

### オートセーブ方針

- イベント発生時に自動保存（デバウンス `300ms`）
- 保存トリガー:
- 依頼の受理/掲示変更
- 面談終了（受諾/保留/辞退/打ち切り）
- `次の日` 押下直前
- 日付更新完了直後
- 日報要約確認完了時

### 乱数方針

- 再現性固定は不要（セーブ再読込で同結果を保証しない）
- 乱数シードは実行時に初期化し、自然揺らぎを優先

### UI負荷対策（上限なし運用前提）

- 依頼件数に上限は置かない
- ただし表示は常に `要対応優先`（新着依頼 / 未対応質問 / 帰還報告）
- 初期ソート:
- 依頼: 締切近い順 -> 危険度高い順
- 冒険者: 待機中優先 -> 疲労低い順
- `次の日` ボタン付近に未処理件数を集約表示

### AI呼び出し契約（MVP）

- 詳細仕様は `23_ai_generation_design.md` を正本として参照する
- 用途:
- 冒険者生成テキスト（初回）
- 依頼主生成テキスト（初回）
- 面談応答文
- 日報コメント文
- 応答時間:
- ソフトタイムアウト `8秒`
- ハードタイムアウト `15秒`
- 再試行:
- 自動再試行 `1回`（2秒後）
- 失敗時は手動再試行ボタンを表示
- フォールバック:
- 固定テンプレ文への置換はしない（AI前提）
- 直近キャッシュがあればそれを暫定表示し、再生成キューに積む
- キャッシュキー:
- `entity_id + event_type + day + context_hash`

### ログ保存

- 開発中は数値ログを常時保存する
- 日次ローテーションで古いログを圧縮（最新30日を高粒度で保持）

### 初期データ件数（固定）

- 依頼主: `10`
- 冒険者: `20`
- 初期依頼プール: `40`（日中表示は条件に応じて抽出）
