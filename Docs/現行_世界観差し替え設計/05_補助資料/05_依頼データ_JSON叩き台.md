# 依頼データ JSON 叩き台

最終更新: 2026-03-10

この文書は、現行仕様の依頼構造を実装用 JSON へ落とす際の叩き台を置く。
ここでいう JSON は厳密スキーマではなく、今の仕様を崩さず実装へ近づけるための案である。

補足:
キー名や ID の付け方は `07_JSON命名規則とID規則.md` に従う。

## 1. 方針

- 依頼カテゴリ 8 種の共通構造をそのまま保持する
- 世界観差し替えに耐えるよう、内部キーは抽象名を使う
- 表示文と内部処理用データを分ける
- 追加事情や世界観演出は任意項目として持つ

## 2. 最小依頼データ

```json
{
  "mission_id": "mission_0007",
  "world_pack_id": "fantasy_base",
  "category": "delivery",
  "client": "港湾商会",
  "target": "封印箱",
  "location": "旧港倉庫",
  "objective": "指定先へ安全に搬送する",
  "obstacle": "帰路の襲撃",
  "time_limit": "夜明けまで",
  "reward": "金銭と港湾商会からの信用",
  "risk": "報酬減少と関係悪化",
  "difficulty": 7,
  "tags": ["輸送", "港湾", "緊張感"]
}
```

## 3. 推奨依頼データ

```json
{
  "mission_id": "mission_0007",
  "world_pack_id": "fantasy_base",
  "category": "delivery",
  "display_name": "封印箱護送",
  "category_display": "輸送",
  "client": {
    "type": "faction",
    "id": "faction_port_union",
    "name": "港湾商会"
  },
  "target": {
    "kind": "object",
    "name": "封印箱",
    "traits": ["重要物資", "開封禁止", "輸送中破損注意"]
  },
  "location": {
    "from": "旧港倉庫",
    "to": "北岸の荷受け小屋",
    "region_tag": "港湾区"
  },
  "objective": {
    "summary": "封印箱を夜明けまでに指定先へ届ける",
    "success_condition": "対象物が破損なく搬送完了している"
  },
  "obstacles": [
    {
      "kind": "ambush",
      "summary": "帰路で襲撃の可能性がある"
    },
    {
      "kind": "terrain",
      "summary": "正規経路は夜間見通しが悪い"
    }
  ],
  "time_limit": {
    "has_limit": true,
    "summary": "夜明けまで",
    "pressure_level": 1
  },
  "reward": {
    "summary": "金銭と港湾商会からの信用",
    "currency": 120,
    "reputation": 1,
    "resource_tags": ["港湾商会優遇"]
  },
  "risk": {
    "summary": "報酬減少、依頼人不満、輸送失敗時の関係悪化",
    "failure_tags": ["報酬減", "関係悪化"]
  },
  "twist": {
    "enabled": true,
    "summary": "正規経路が先に敵対勢力へ漏れている可能性がある"
  },
  "difficulty": {
    "target_number": 7,
    "pressure": "medium",
    "danger": "medium"
  },
  "participants": {
    "recommended_roles": ["frontliner", "scout", "negotiator"],
    "max_party_size": 3
  },
  "state": {
    "status": "open",
    "accepted": false,
    "result": null
  },
  "tags": ["輸送", "港湾", "夜間", "関係変化あり"]
}
```

## 4. キーごとの役割

- `category`
  - 共通依頼カテゴリ
- `display_name`
  - 世界観込みの依頼名
- `client`
  - 依頼人情報
- `target`
  - 対象物、対象人物、対象問題
- `location`
  - 現場や移動区間
- `objective`
  - 成功条件の要約
- `obstacles`
  - 主な障害
- `time_limit`
  - 期限や時間圧
- `reward`
  - 報酬
- `risk`
  - 失敗や遅延時の不利益
- `twist`
  - 任意の追加事情
- `difficulty`
  - 目標値や危険度
- `participants`
  - 推奨ロールや人数目安
- `state`
  - 依頼の現在状態
- `tags`
  - 表示・検索・演出補助

## 5. カテゴリ別に差し替えやすい箇所

- `category_display`
  - ファンタジーなら「輸送」、サイバーパンクなら「密輸搬送」のように差し替える
- `target.kind`
  - `monster` / `object` / `person` / `phenomenon`
- `reward.resource_tags`
  - 金銭、縁、アクセス権、物資など世界観差
- `risk.failure_tags`
  - 負傷、穢れ、追跡フラグ、信用低下など世界観差

## 6. 実装時に分割してもよい単位

- `mission_core`
  - ID、カテゴリ、依頼人、目標、難易度
- `mission_flavor`
  - 表示名、本文、タグ、追加事情
- `mission_state`
  - 受注状態、進行中、結果
- `mission_reward`
  - 報酬とリスク

## 7. 先に固定するとよい必須キー

- `mission_id`
- `world_pack_id`
- `category`
- `client`
- `target`
- `location`
- `objective`
- `obstacle` または `obstacles`
- `reward`
- `risk`
- `difficulty`
- `tags`

`twist`、`participants`、`state` は後から拡張してもよい。
