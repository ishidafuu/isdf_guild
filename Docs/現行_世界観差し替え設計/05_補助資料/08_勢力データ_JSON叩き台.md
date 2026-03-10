# 勢力データ JSON 叩き台

最終更新: 2026-03-10

この文書は、現行仕様の勢力情報を実装用 JSON へ落とす際の叩き台を置く。
ここでいう勢力は、依頼人、敵対組織、地域共同体、宗教団体、企業、商会などを含む。

補足:
キー名や ID の付け方は `07_JSON命名規則とID規則.md` に従う。

## 1. 方針

- 勢力は世界観差し替えに耐える抽象構造で持つ
- 表示用の説明と、処理用の関係情報を分ける
- ギルドとの関係だけでなく、他勢力との火種も持てる形にする
- 依頼発生源として使える粒度を確保する

## 2. 最小勢力データ

```json
{
  "faction_id": "faction_port_union",
  "world_pack_id": "world_pack_fantasy_base",
  "name": "港湾商会",
  "kind": "merchant_union",
  "public_digest": "港湾物流を担う商会連合。金勘定に厳しいが、街の流通を支える重要勢力。",
  "stance_to_guild": "neutral",
  "relation_score": 0
}
```

## 3. 推奨勢力データ

```json
{
  "faction_id": "faction_port_union",
  "world_pack_id": "world_pack_fantasy_base",
  "name": "港湾商会",
  "kind": "merchant_union",
  "scale": "city",
  "public_digest": "港湾物流を担う商会連合。金勘定に厳しいが、街の流通を支える重要勢力。",
  "description": {
    "summary": "港湾と倉庫街の物流を実質的に支配する商会連合。",
    "position": "市政に直接は関わらないが、税収と物流の面で無視できない影響力を持つ。",
    "tone": "現実的で打算的、ただし損得が合えば協力的。"
  },
  "guild_relation": {
    "stance": "neutral",
    "relation_score": 0,
    "tags": ["取引相手", "信用重視"],
    "recent_change": "大型輸送の失敗でやや不信感がある"
  },
  "resources": {
    "offers": ["輸送依頼", "物流情報", "港湾施設の便宜"],
    "wants": ["納期厳守", "秘密保持", "損害の最小化"]
  },
  "conflicts": [
    {
      "target_faction_id": "faction_river_watch",
      "kind": "trade_conflict",
      "summary": "河川輸送の優先権を巡って対立している"
    }
  ],
  "mission_roles": {
    "can_be_client": true,
    "can_be_patron": true,
    "can_be_enemy": false,
    "can_be_complication": true
  },
  "speech_guide": {
    "style": "事務的で端的",
    "keywords": ["損得", "納期", "信用", "契約"]
  },
  "state": {
    "visibility": "public",
    "stability": "stable",
    "heat_level": 1
  },
  "tags": ["物流", "港湾", "商会", "打算的"]
}
```

## 4. キーごとの役割

- `faction_id`
  - 勢力 ID
- `world_pack_id`
  - 所属世界観パック
- `name`
  - 勢力名
- `kind`
  - 勢力種別
- `scale`
  - 都市、地域、国家などの規模
- `public_digest`
  - 短い紹介
- `description`
  - 立場や性格を含む説明
- `guild_relation`
  - ギルドとの関係
- `resources`
  - 提供できるもの、求めるもの
- `conflicts`
  - 他勢力との対立
- `mission_roles`
  - 依頼生成上の役割
- `speech_guide`
  - 会話文生成時の補助
- `state`
  - 現在状態
- `tags`
  - 検索・演出補助

## 5. よく使う列挙値の例

- `kind`
  - `merchant_union`
  - `religious_group`
  - `military_force`
  - `criminal_network`
  - `research_org`
  - `village_council`
- `stance`
  - `ally`
  - `neutral`
  - `tense`
  - `hostile`
- `visibility`
  - `public`
  - `semi_hidden`
  - `hidden`

## 6. 実装時に分割してもよい単位

- `faction_core`
  - 名前、種別、規模、短い紹介
- `faction_relation`
  - ギルドとの関係、最近の変化
- `faction_mission_profile`
  - 依頼発生源としての性格
- `faction_state`
  - 安定度、熱量、可視性

## 7. 先に固定するとよい必須キー

- `faction_id`
- `world_pack_id`
- `name`
- `kind`
- `public_digest`
- `guild_relation`
- `mission_roles`
- `tags`

`resources`、`conflicts`、`speech_guide`、`state` は後から拡張してよい。
