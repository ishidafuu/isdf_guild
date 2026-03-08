# plan ディレクトリ案内

`Docs/plan/` は、構想の本文を章ごとに分割した正本です。

## 章構成

1. `00_overview.md`
- 企画の核、コアループ、世界観、MVPの大枠

2. `05_world_setting.md`
- 交易都市エンベルク、冒険者ギルド制度、世界観詳細

3. `06_regional_structure.md`
- エンベルク周辺地理、地方帯、歴史、依頼供給構造

4. `07_world_review.md`
- 世界観レビュー観点、指摘、採否記録

5. `08_request_ecology.md`
- ギルド周辺環境、依頼主カテゴリ、競合ギルド類型

6. `09_mission_framework.md`
- ミッション設計の骨格、地域別の典型案件、依頼テンプレート

7. `11_seasonal_dynamics.md`
- 季節、祭事、景気変動と依頼傾向の変化

8. `10_requirements_and_models.md`
- ヒアリングで確定した要件
- 不完全情報・評判・受諾/辞退などの判定モデル
- ミッション結果算出ロジック

9. `20_priorities_and_mvp.md`
- Must/Should/Could
- MVPの最小成立条件

10. `30_ui_drafts.md`
- 日中運用ハブ / 個別面談 / 帰還日報のUI草案

11. `40_execution_plan.md`
- 開発順序とデモシナリオ

12. `50_test_and_debug.md`
- バランス調整用テストケース
- デバッグ観測順と調整優先度

13. `60_pre_implementation.md`
- 実装前に固定した技術仕様（保存、オートセーブ、乱数、AI契約）

14. `70_ai_generation_design.md`
- AI生成の責務分離、イベント設計、入出力契約、品質ガード

15. `71_character_samples.md`
- キャラ生成サンプル、調査書の試作例

16. `99_changelog.md`
- 変更履歴

## 編集方針

- 既存章に収まる内容は、該当ファイルへ追記する
- 新しい論点群が継続的に増える場合のみ、新しい章ファイルを追加する
- 更新履歴は必ず `99_changelog.md` に追記する
