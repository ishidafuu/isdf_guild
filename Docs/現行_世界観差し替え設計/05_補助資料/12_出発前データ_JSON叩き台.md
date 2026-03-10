# 出発前データ JSON 叩き台

最終更新: 2026-03-10

この文書は、依頼データを受けてギルドがどう判断し、誰を出し、どんな懸念や方針を持って出発したかを記録する
`dispatch` データの叩き台を置く。

補足:
キー名や ID の付け方は `07_JSON命名規則とID規則.md` に従う。

## 1. 方針

- `mission` は AI が生成した客観的依頼データ
- `dispatch` はギルドがその依頼をどう受け取ったかを記録する出発前データ
- `report` は実際の結果
- `guildmaster_note` は人物への主観メモ

この分離により、依頼そのものと、ギルドの判断や編成を混線させずに保持できる。

## 2. 最小出発前データ

```json
{
  "dispatch_id": "dispatch_0001",
  "mission_id": "mission_0007",
  "world_pack_id": "world_pack_cyberpunk_base",
  "status": "accepted",
  "assigned_character_ids": ["char_0001", "char_0002", "char_0003"],
  "dispatch_note": "輸送担当と前衛を優先して編成。",
  "created_phase": "pre_mission"
}
```

## 3. 推奨出発前データ

```json
{
  "dispatch_id": "dispatch_0001",
  "mission_id": "mission_0007",
  "world_pack_id": "world_pack_cyberpunk_base",
  "status": "accepted",
  "decision": {
    "accepted": true,
    "priority": "medium",
    "reason_summary": "報酬は高くないが、港湾商会との関係維持に意味がある。"
  },
  "assigned_character_ids": ["char_0001", "char_0002", "char_0003"],
  "party_roles": [
    {
      "character_id": "char_0001",
      "role": "frontliner",
      "assignment_reason": "襲撃対応と前衛維持"
    },
    {
      "character_id": "char_0002",
      "role": "engineer",
      "assignment_reason": "封印箱の安定確認と輸送補助"
    },
    {
      "character_id": "char_0003",
      "role": "negotiator",
      "assignment_reason": "検問や依頼人対応の保険"
    }
  ],
  "risk_view": {
    "expected_dangers": ["襲撃", "経路不安", "依頼人不満"],
    "concerns": ["前衛の負傷リスク", "別経路判断の難しさ"],
    "fallback_plan": "正規経路が潰れていたら裏航路へ切り替える"
  },
  "base_state": {
    "selected_facility_ids": ["facility_clinic", "facility_briefing_room"],
    "preparation_tags": ["医療準備", "経路確認"]
  },
  "guildmaster_view": {
    "short_impression": "無理をさせる編成だが、この依頼にはこの面子しかない。",
    "confidence_level": "uneasy"
  },
  "created_phase": "pre_mission",
  "tags": ["dispatch", "輸送任務", "港湾", "不安あり"]
}
```

## 4. キーごとの役割

- `dispatch_id`
  - 出発前データ ID
- `mission_id`
  - 対応する依頼
- `world_pack_id`
  - 世界観パック
- `status`
  - 受諾、保留、見送りなど
- `decision`
  - なぜその判断をしたか
- `assigned_character_ids`
  - 実際に出す人物
- `party_roles`
  - 各人物の担当理由
- `risk_view`
  - 出発前に見えていた危険
- `base_state`
  - 拠点側でどの設備や準備を使ったか
- `guildmaster_view`
  - ギルド主としての短い見立て
- `created_phase`
  - どの段階で記録されたか
- `tags`
  - 検索・演出補助

## 5. `mission → dispatch → report → guildmaster_note` の流れ

### `mission`

- AI が生成した依頼そのもの
- まだ誰を出すかは決まっていない

### `dispatch`

- ギルドが受諾したか
- 誰を出したか
- 何を懸念していたか
- どういう準備をしたか

### `report`

- 実際にどうなったか
- 人物や勢力に何が起こったか

### `guildmaster_note`

- 結果を見て、ギルド主が人物をどう見たか
- 人物データ側へ積む

## 6. 実装時に分割してもよい単位

- `dispatch_core`
  - 依頼参照、受諾状態、参加人物
- `dispatch_plan`
  - 人選理由、懸念、方針
- `dispatch_base_use`
  - 拠点設備や準備
- `dispatch_view`
  - ギルド主視点の短い見立て

## 7. 先に固定するとよい必須キー

- `dispatch_id`
- `mission_id`
- `world_pack_id`
- `status`
- `assigned_character_ids`
- `created_phase`

`decision`、`party_roles`、`risk_view`、`base_state`、`guildmaster_view`、`tags` は順次追加してよい。
