# framework ディレクトリ案内

最終更新: 2026-03-10

`Docs/framework/` は、中世ファンタジー世界観の正本とは分離した「世界観差し替え型ギルドゲーム」の共通フレームワーク設計を置くディレクトリです。

## 目的

- コアループと世界観レイヤーを分離して整理する
- 世界観パック追加や自動生成に耐える共通仕様を保持する
- 既存の中世ファンタジー文書と混線させず、再利用可能な設計だけを蓄積する

## ファイル一覧

- `00_one_pager.md`
  - 企画書風の1ページ版
- `01_framework_spec.md`
  - コアループ固定、世界観パック責務、生成前提を含む仕様草案
- `02_world_pack_template.md`
  - 世界観パック記入テンプレートと自動生成表
- `03_request_category_tables.md`
  - 依頼カテゴリ8種の共通構造と生成表
- `04_character_framework.md`
  - 能力値、特技、欠点、成長、キャラシート骨格を含むキャラクター設計仕様
- `05_world_dictionary_fantasy.md`
  - 王道ファンタジー向け辞書
- `06_world_dictionary_cyberpunk.md`
  - サイバーパンク向け辞書
- `07_world_dictionary_japanese_occult.md`
  - 和風怪異向け辞書
- `08_review_notes.md`
  - 内部レビュー観点の検討メモと採用方針
- `09_questions_for_user.md`
  - 仕様を次段階に進めるための確認質問集
- `99_changelog.md`
  - 更新履歴

## 編集方針

- 世界観固有の内容は書かない
- 共通化できる構造、辞書、テンプレートのみを扱う
- 既存の `Docs/plan/` にある中世ファンタジー固有の設定は参照先として扱い、重複記述しない
