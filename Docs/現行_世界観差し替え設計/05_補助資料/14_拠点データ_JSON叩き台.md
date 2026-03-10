# 拠点データ JSON 叩き台

最終更新: 2026-03-10

この文書は、ギルド拠点そのものを `base` データとして表すための叩き台を置く。
設備単体ではなく、「今のギルドがどんな場か」をまとめて保持するための層である。

補足:
設備単体は `13_拠点設備データ_JSON叩き台.md` を参照する。

## 1. 方針

- プレイヤーには「拠点の雰囲気」や「今ある設備」を主に見せる
- 内部では少数の状態値や状態タグを持ってよい
- 数字を主役にせず、変化や使える選択肢の変化を重視する
- `readiness / staff_margin / external_attention / atmosphere` の 4 軸を標準案としてよい
- 状態値は実用性の説明だけでなく、拠点の空気感や会話の方向にもつながるように扱う

## 2. 最小拠点データ

```json
{
  "base_id": "base_0001",
  "world_pack_id": "world_pack_cyberpunk_base",
  "name": "港湾裏区画アジト",
  "status": "active",
  "facility_ids": ["facility_clinic", "facility_briefing_room"],
  "summary": "港湾地区の裏路地にある、小規模だが実務的な拠点。"
}
```

## 3. 推奨拠点データ

```json
{
  "base_id": "base_0001",
  "world_pack_id": "world_pack_cyberpunk_base",
  "name": "港湾裏区画アジト",
  "status": "active",
  "summary": "仕事帰りの面子が自然に集まる、小さな港湾拠点。",
  "description": "外から見れば古い倉庫だが、中では応急治療、依頼整理、短い休養が回る。派手ではないが、無理の利く空気がある。",
  "tone_tags": ["rough", "lived_in", "functional"],
  "state_values": {
    "readiness": "steady",
    "staff_margin": "tight",
    "external_attention": "low",
    "atmosphere": "strained"
  },
  "facility_ids": ["facility_clinic", "facility_briefing_room"],
  "active_issue_tags": ["staff_shortage", "medical_strain"],
  "narrative_changes": [
    "休養イベントが起きやすい",
    "無理を通す空気がある",
    "港湾勢力との接点が強い"
  ],
  "linked_faction_ids": ["faction_port_union", "faction_street_clinic"],
  "tags": ["guild_base", "small_scale", "harbor"]
}
```

## 4. キーごとの役割

- `base_id`
  - 拠点 ID
- `world_pack_id`
  - 世界観パック ID
- `name`
  - 拠点名
- `status`
  - 現在状態
- `summary`
  - 一文説明
- `description`
  - 詳細説明
- `tone_tags`
  - 拠点の空気感
- `state_values`
  - 内部状態の少数ステータス
- `facility_ids`
  - 所有設備一覧
- `active_issue_tags`
  - 今抱えている問題
- `narrative_changes`
  - 今の拠点から感じられる変化
- `linked_faction_ids`
  - 拠点と関係の強い勢力
- `tags`
  - 検索補助

## 5. 推奨状態値

状態値は数値よりも段階語の方が現行仕様に合う。

- `readiness`
  - `poor / unstable / steady / ready`
- `staff_margin`
  - `none / tight / normal / ample`
- `external_attention`
  - `low / rising / high`
- `atmosphere`
  - `calm / strained / lively / fragile`

## 6. `facility` との関係

- `base` は設備一覧を抱える
- `facility` は個別の説明と機能を抱える
- `dispatch.base_state.selected_facility_ids` は、その依頼で実際に使った設備だけを指す

## 7. 物語上の役割

拠点データは、以下を説明するための基盤になる。

- どんな依頼を受けられそうか
- どんな会話イベントが起きやすいか
- 今のギルドが無理できるのか
- 最近の仕事の余波がどこに出ているか

## 8. 最小実装で持てば十分な項目

- `base_id`
- `world_pack_id`
- `name`
- `status`
- `facility_ids`
- `summary`

## 9. 後から足してよい要素

- 拠点の履歴
- 施設増設ログ
- 拠点ごとの会話プール
- 長期的な対外印象
- 規模拡張フェーズ
