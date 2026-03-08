# isdf_guild

## 現在の実装プロトタイプ

- ミッション自動展開ロジック（TRPG風）:
- `src/sim/mission.ts`
- サンプル実行入力:
- `src/sim/mission.example.ts`
- IndexedDB スキーマと型定義:
- `src/storage/schema.ts`
- `src/storage/types.ts`
- 人物年表と経験反映ロジック:
- `src/sim/characterProgression.ts`
- 3日分サンプル実行:
- `src/sim/characterProgression.example.ts`

## 型チェック

```bash
npx --yes -p typescript tsc -p tsconfig.json
```

## サンプル実行

```bash
npx --yes tsx src/sim/mission.example.ts
npx --yes tsx src/sim/characterProgression.example.ts
```

詳細な仕様は `Docs/plan/` を参照してください。
