# 世界観パック JSON 叩き台

最終更新: 2026-03-10

この文書は、現行仕様の世界観パックを実装用 JSON へ落とす際の叩き台を置く。
世界観パックはゲームルール本体を変えるものではなく、表示、語彙、依頼生成辞書、勢力、雰囲気を差し替えるレイヤーとして扱う。

補足:
キー名や ID の付け方は `07_JSON命名規則とID規則.md` に従う。

## 1. 方針

- 世界観パックは「完全に別世界」として持てるようにする
- コアルールに触らず、辞書と演出を差し替える
- 依頼、人物、勢力、拠点、報酬を生成する辞書の入口とする
- 人間可読な文と、AI 実装向けの構造化情報を両方持つ

## 2. 最小世界観パックデータ

```json
{
  "world_pack_id": "world_pack_fantasy_base",
  "name": "王道ファンタジー",
  "genre": "fantasy",
  "one_liner": "剣と魔法の時代、街と荒野をまたいで依頼をこなす冒険者世界。",
  "mood_tags": ["王道冒険", "伝承", "旅"],
  "guild_role": "公認冒険者組合",
  "main_threat": "魔物",
  "reward_style": "金貨と名声"
}
```

## 3. 推奨世界観パックデータ

```json
{
  "world_pack_id": "world_pack_fantasy_base",
  "name": "王道ファンタジー",
  "genre": "fantasy",
  "era": "中世風",
  "scale": "地方都市圏",
  "one_liner": "剣と魔法の時代、街と荒野をまたいで依頼をこなす冒険者世界。",
  "mood_tags": ["王道冒険", "伝承", "旅"],
  "tone_profile": {
    "baseline": "冒険寄り",
    "comedy_level": "low",
    "cruelty_level": "medium",
    "bitterness_level": "medium"
  },
  "world_summary": {
    "summary": "王国、商会、教団、魔物圏がせめぎ合う世界。",
    "guild_role": "各地の依頼を請け負う半公認組織。",
    "main_conflict": "人類圏の秩序維持と荒野の脅威、そして古代遺産の争奪。"
  },
  "display_dictionary": {
    "stats": {
      "power": "武勇",
      "tech": "技巧",
      "sense": "察知",
      "social": "話術",
      "will": "信念"
    },
    "roles": {
      "frontliner": ["剣士", "騎士"],
      "support": ["神官", "助祭", "支援魔術師"],
      "scout": ["斥候", "狩人", "野伏"],
      "engineer": ["工匠", "錬金術師", "魔導技師"],
      "negotiator": ["交渉人", "吟遊詩人", "口利き"]
    },
    "mission_categories": {
      "subjugation": ["魔物討伐", "害獣退治"],
      "escort": ["隊商護衛", "巡礼護衛"],
      "investigation": ["異変調査", "真相探り"],
      "recovery": ["遺物回収", "呪具奪還"],
      "delivery": ["物資運搬", "供物搬送"],
      "negotiation": ["領主折衝", "商談仲裁"],
      "defense": ["村落防衛", "結界守護"],
      "rescue": ["遭難者救出", "迷い人捜索"]
    }
  },
  "resource_dictionary": {
    "currency": ["金貨", "銀貨"],
    "reputation": ["名誉", "信用"],
    "rare_resources": ["魔石", "希少素材", "推薦状"]
  },
  "base_profile": {
    "base_name": "ギルド酒場",
    "base_style": "酒場兼ギルドホール",
    "facility_examples": ["医務室", "記録庫", "工房", "客間"]
  },
  "faction_ids": [
    "faction_port_union",
    "faction_temple_order",
    "faction_old_kingdom_remnant"
  ],
  "enemy_categories": [
    "魔狼",
    "洞窟鬼",
    "野盗団",
    "呪われた騎士",
    "暴走古代守護像"
  ],
  "mission_generation": {
    "client_pool_tags": ["村落", "商会", "神殿", "貴族"],
    "location_pool_tags": ["街道", "森", "遺跡", "港湾"],
    "obstacle_pool_tags": ["夜間", "地形不利", "情報秘匿", "競合勢力"]
  },
  "special_flavor": {
    "signature_elements": ["祝福", "呪い", "古代遺跡", "土地の伝承"],
    "forbidden_elements": [],
    "damage_terms": ["負傷", "出血", "呪い", "疲弊"]
  },
  "intro_hook": {
    "opening_text": "街道沿いで行方不明が増え、周辺の村々が不安に包まれている。",
    "first_mission_seed": "巡礼路で消えた護衛隊の行方を追う。"
  },
  "tags": ["fantasy", "adventure", "modular_world_pack"]
}
```

## 4. キーごとの役割

- `world_pack_id`
  - 世界観パック ID
- `name`
  - パック名
- `genre`
  - ジャンル
- `era`
  - 時代感
- `scale`
  - 舞台規模
- `one_liner`
  - 一文説明
- `mood_tags`
  - 雰囲気タグ
- `tone_profile`
  - 物語トーンの初期値
- `world_summary`
  - 世界の要約
- `display_dictionary`
  - 表示語彙の辞書
- `resource_dictionary`
  - 通貨や名声などの呼称
- `base_profile`
  - 拠点の呼び方や雰囲気
- `faction_ids`
  - 参照する勢力群
- `enemy_categories`
  - 敵カテゴリ
- `mission_generation`
  - 依頼生成に使うプール
- `special_flavor`
  - 固有要素
- `intro_hook`
  - 導入フック
- `tags`
  - 検索・演出補助

## 5. 実装時に分割してもよい単位

- `world_pack_core`
  - 名前、ジャンル、時代感、要約
- `world_pack_dictionary`
  - 表示名辞書、通貨、資源名
- `world_pack_generation`
  - 依頼生成や敵カテゴリのプール
- `world_pack_flavor`
  - トーン、固有フレーバー、導入文

## 6. 先に固定するとよい必須キー

- `world_pack_id`
- `name`
- `genre`
- `one_liner`
- `mood_tags`
- `world_summary`
- `display_dictionary`
- `resource_dictionary`
- `base_profile`
- `tags`

`faction_ids`、`enemy_categories`、`mission_generation`、`special_flavor`、`intro_hook` は後から広げてよい。
