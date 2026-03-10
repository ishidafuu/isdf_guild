# AGENTS.md

このファイルは、`/Users/ishidafuu/Documents/repository/isdf_guild` で作業するエージェント向けの運用ルールです。

## 基本ルール

- 日本語で対話してください。
- コミットメッセージは日本語で書いてください。
- 依頼への対応が完了したら、毎回コミットしてください。
- ドキュメント編集だけで終わる場合でも、完了したらコミットしてください。
- 実装作業の完了後は、必ずコードレビューを行い、不備があれば修正してから完了としてください。
- 既存のユーザー変更は勝手に巻き戻さないでください。

## このプロジェクトの現状

- このプロジェクトは「世界観差し替え型ギルドゲーム」です。
- 現在は仕様設計がかなり固まり、実装前段階から実装初期段階へ移るところです。
- 最初に実装する対象世界観は `退廃サイバーパンク` です。
- 最初に通すべき主ループは `mission -> dispatch -> report -> snapshot -> guildmaster_note` です。

## 正本ドキュメント

現行の正本は以下です。

- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/00_案内.md`

旧案は以下へ退避済みです。

- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/退避_旧世界観案/`

世界観差し替えの現行仕様を扱うときは、原則として `Docs/現行_世界観差し替え設計/` 側だけを参照してください。
旧案は必要な要素を拾うときだけ確認してください。

## 実装準備ドキュメント

実装に入る前、または実装中に方針確認が必要な場合は、まず以下を見てください。

- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/01_実装全体プラン.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/02_実装タスク表.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/03_ディレクトリ案.md`

各フェーズの詳細は以下です。

- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/04_フェーズ1_型と正準データ構造の固定.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/05_フェーズ2_最小実装用の実データ作成.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/06_フェーズ3_最小縦切りの通し実装.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/07_フェーズ4_状態更新の実装.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/08_フェーズ5_永続化の導入.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/09_フェーズ6_AI入出力の接続.md`
- `/Users/ishidafuu/Documents/repository/isdf_guild/Docs/現行_世界観差し替え設計/07_実装準備/10_フェーズ7_試運転と調整.md`

## 実装時の優先順位

実装の優先順位は以下です。

1. 型定義
2. サンプルデータ
3. 最小縦切り
4. 状態更新
5. 永続化
6. AI 接続
7. 試運転

この順を崩す場合は、崩す理由を明確にしてください。

## 推奨ディレクトリ方針

新仕様は以下のような責務分離を前提に進めてください。

- `src/domain/`
  - ID 規則、列挙値、型定義
- `src/data/`
  - 最小実装用の固定データ
- `src/core/`
  - 主ループ、状態更新、メモ候補生成
- `src/ai_contracts/`
  - AI 入出力契約
- `src/storage_v2/`
  - 新仕様用の保存層
- `src/examples/`
  - 通し確認用サンプル

## 旧実装の扱い

- 既存の `src/sim/` と `src/storage/` は旧プロトタイプです。
- 旧実装へ新仕様を直接ねじ込まないでください。
- 新仕様は別系統で最小縦切りを通してから、必要な要素だけ旧実装から移してください。
- `src/storage/types.ts` や `src/storage/schema.ts` を、最初から全面改修しないでください。

## まず最初に作るべきもの

実装着手時は、まず以下を優先してください。

- `src/domain/types/`
- `src/data/cyberpunk_minimal/`
- `src/core/mission_flow/`
- `src/core/state_update/`
- `src/examples/run_minimal_cyberpunk.ts`

## このプロジェクトで重要な設計原則

- 世界観差し替えを前提に、内部キーは抽象名で保つ
- 主役は数値育成ではなく、依頼・人物・ギルドが絡み合ってできる全体の物語
- 判定は軽く、物語の継続性を重視する
- `report` は事実、`guildmaster_note` は主観として分ける
- `snapshot` は `post_report` で切り、次回への現在地として使う
- スタッフは数値補助より、口出し・所感・提案の発生源として扱う

## 実装時に気をつけるべき仕様上の固定点

- 判定方式は `2D6`
- 結果段階は `大成功 / 成功 / 部分成功 / 失敗`
- 戦闘は独立サブゲームではなく、依頼中の障害の一種
- 短編依頼 1 本は軽めで、複数依頼の積み重ねを重視する
- 能力値は 5 種
- ロールは固定職ではなく、ゆるい得意分野ラベル
- 欠点や性格は判定や運用判断に効く
- BIG5 相当の内部性格骨格を持つ
- `guildmaster_note` は `AI 下書き + 選択 + 短文補足`

## 仕様と実装がぶつかったとき

- まず正本ドキュメントを確認してください。
- 正本同士で矛盾している場合は、現行の `07_実装準備/` と JSON 叩き台を優先してください。
- 判断しきれない場合は、勝手に広げず、論点を整理してユーザーへ確認してください。

## レビューや確認のとき

- 仕様漏れ
- 命名規則の揺れ
- 参照 ID の不整合
- 正本ドキュメントとのズレ
- 最小縦切りを阻害する過剰実装

を優先して見てください。

## 避けたいこと

- UI 前提で先に複雑化する
- 長期政治変動から手を付ける
- 複数世界観同時対応を最初からやる
- `report` と `guildmaster_note` を混ぜる
- `mission` と `dispatch` を混ぜる
- `snapshot` をなくして状態比較を都度再計算で済ませる
