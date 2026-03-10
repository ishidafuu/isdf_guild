# 人物データ JSON 叩き台

最終更新: 2026-03-10

この文書は、現行仕様のキャラクター情報を実装用 JSON へ落とす際の叩き台を置く。
ここでいう JSON は厳密スキーマではなく、今の仕様を崩さず実装へ近づけるための案である。

## 1. 方針

- 表示用要約と内部設定を分ける
- 世界観差し替えに耐えるよう、内部キーは抽象名を使う
- 数値、タグ、短文メモを混在させる
- `guildmaster_note` は事実ログと別に持つ

## 2. 最小人物データ

```json
{
  "character_id": "char_0001",
  "name": "シオン",
  "world_pack_id": "fantasy_base",
  "role": "frontliner",
  "stats": {
    "power": 2,
    "tech": 0,
    "sense": 1,
    "social": 1,
    "will": 2
  },
  "public_digest": "寡黙な前衛役。護衛任務では信頼されるが、自分を削る癖がある。",
  "volatile_hook": "最近は無理を押してでも結果を優先しがち。",
  "status": {
    "injury": 1,
    "stress": 2,
    "availability": "active"
  }
}
```

## 3. 推奨人物データ

```json
{
  "character_id": "char_0001",
  "name": "シオン",
  "world_pack_id": "fantasy_base",
  "role": "frontliner",
  "sub_roles": ["scout"],
  "stats": {
    "power": 2,
    "tech": 0,
    "sense": 1,
    "social": 1,
    "will": 2
  },
  "big5": {
    "openness": 1,
    "conscientiousness": 2,
    "extraversion": -1,
    "agreeableness": 0,
    "neuroticism": 1
  },
  "traits": {
    "strengths": ["粘り強い", "護衛向き"],
    "flaws": ["無理を押す", "痛みを隠す"],
    "personality_tags": ["寡黙", "実直", "自己犠牲気味"]
  },
  "skills": [
    {
      "skill_id": "skill_guard_line",
      "name": "護りの踏み込み",
      "kind": "common"
    },
    {
      "skill_id": "skill_hold_pain",
      "name": "痛みへの耐え",
      "kind": "common"
    }
  ],
  "public_digest": "寡黙な前衛役。護衛任務では信頼されるが、自分を削る癖がある。",
  "volatile_hook": "最近は無理を押してでも結果を優先しがち。",
  "private_dossier": {
    "core_identity": "地方出身の若い護衛士。目立たないが、立っているだけで張りつめた印象を与える。",
    "background": "代々傭兵まがいの家に育ち、家計を支えるため早くから危険な仕事に出ていた。家族とは不仲ではないが、仕送りの義務感が今も重い。",
    "daily_texture": "食事は早い。休むのが下手で、空いた時間も装備の手入れをしている。",
    "values": "約束を破ることを極端に嫌う。弱い立場の者を見捨てる判断には強く反発する。",
    "social": "年長者には必要以上に反論しない。年少者には不器用に世話を焼く。",
    "work_view": "護衛や防衛は得意だが、裏切り前提の仕事を嫌う。撤退そのものは恥とは思わないが、自分だけ下がるのは苦手。",
    "history_hook": "かつて護衛失敗で一人を喪っており、それ以来『守れなかった側』に強く反応する。",
    "speech_rule": "短文で話す。感情が強くなるほど言葉数は減る。",
    "guild_view": "今のギルドを居場所と感じ始めているが、長く頼り切る資格が自分にあるかは迷っている。"
  },
  "guildmaster_note_log": [
    {
      "note_id": "gmn_0001",
      "selected_text": "痛みを隠しているが、次も前に出たがるタイプだ。",
      "user_note": "しばらく単独前衛は避けたい。",
      "source_kind": "mission_report",
      "source_id": "report_0001"
    }
  ],
  "relationships": [
    {
      "target_type": "character",
      "target_id": "char_0002",
      "score": 1,
      "tags": ["信頼", "世話焼き"]
    },
    {
      "target_type": "faction",
      "target_id": "faction_port_union",
      "score": -1,
      "tags": ["警戒", "借りがある"]
    }
  ],
  "status": {
    "injury": 1,
    "stress": 2,
    "availability": "active",
    "recovery_note": "次の依頼前に軽い休養推奨"
  },
  "timeline": [
    {
      "event_id": "te_0001",
      "kind": "backstory",
      "summary": "護衛失敗で守れなかった経験を持つ。"
    },
    {
      "event_id": "te_0002",
      "kind": "mission_aftermath",
      "summary": "旧港倉庫の護送任務で肩を負傷。港湾商会への印象も悪化。"
    }
  ]
}
```

## 4. キーごとの役割

- `role`
  - 主ロール。固定職ではなく得意分野ラベル
- `sub_roles`
  - 副次的に担える役割
- `stats`
  - 共通能力値5種
- `big5`
  - 内部的な性格骨格
- `traits`
  - プレイヤーが把握しやすい性格や欠点
- `public_digest`
  - 表向きに読む短い紹介
- `volatile_hook`
  - 最近の揺れ
- `private_dossier`
  - 内部参照用の人物調書
- `guildmaster_note_log`
  - ギルド主が残した印象メモの履歴
- `relationships`
  - 対人・対勢力の関係
- `status`
  - 負傷、ストレス、参加可否など
- `timeline`
  - 過去と現在をつなぐ出来事ログ

## 5. 実装時に分割してもよい単位

人物データは 1 オブジェクトにまとめてもよいが、実装時には以下のように分けてもよい。

- `character_core`
  - 名前、ロール、能力値、基本タグ
- `character_private`
  - `private_dossier`、BIG5、年表
- `character_state`
  - 負傷、ストレス、参加可否
- `character_relations`
  - 関係値
- `character_notes`
  - `guildmaster_note_log`

## 6. 先に固定するとよい必須キー

今の段階で先に固定するとよいのは以下。

- `character_id`
- `name`
- `world_pack_id`
- `role`
- `stats`
- `public_digest`
- `volatile_hook`
- `private_dossier`
- `status`

`guildmaster_note_log`、`timeline`、`relationships` はこの後の実装方針に応じて増やしていけばよい。
