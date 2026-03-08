# plan ディレクトリ案内

`Docs/plan/` は、構想の本文を章ごとに分割した正本です。

## 章構成

1. `00_overview.md`
- 企画の核、コアループ、世界観、MVPの大枠

2. `05_world_setting.md`
- 交易都市エンベルク、冒険者ギルド制度、世界観詳細

3. `10_requirements_and_models.md`
- ヒアリングで確定した要件
- 不完全情報・評判・受諾/辞退などの判定モデル
- ミッション結果算出ロジック

4. `20_priorities_and_mvp.md`
- Must/Should/Could
- MVPの最小成立条件

5. `30_ui_drafts.md`
- 日中運用ハブ / 個別面談 / 帰還日報のUI草案

6. `40_execution_plan.md`
- 開発順序とデモシナリオ

7. `50_test_and_debug.md`
- バランス調整用テストケース
- デバッグ観測順と調整優先度

8. `60_pre_implementation.md`
- 実装前に固定した技術仕様（保存、オートセーブ、乱数、AI契約）

9. `70_ai_generation_design.md`
- AI生成の責務分離、イベント設計、入出力契約、品質ガード

10. `71_character_samples.md`
- キャラ生成サンプル、調査書の試作例

11. `99_changelog.md`
- 変更履歴

## 編集方針

- 既存章に収まる内容は、該当ファイルへ追記する
- 新しい論点群が継続的に増える場合のみ、新しい章ファイルを追加する
- 更新履歴は必ず `99_changelog.md` に追記する
