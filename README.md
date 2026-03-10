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

## Web UI

最小UIをローカルで起動するには次を実行します。

```bash
npm install
npm run dev
```

起動後、表示されるローカルURLをブラウザで開いてください。

ローカルAI文章生成の試作を使う場合は、事前に `codex login` 済みである必要があります。
この連携は開発サーバー上のローカルCLIブリッジを使うため、`npm run dev` での利用を前提にしています。

## 型チェック

```bash
npm run typecheck
```

## サンプル実行

```bash
npx --yes tsx src/sim/mission.example.ts
npx --yes tsx src/sim/characterProgression.example.ts
```

詳細な仕様は `Docs/plan/` を参照してください。
