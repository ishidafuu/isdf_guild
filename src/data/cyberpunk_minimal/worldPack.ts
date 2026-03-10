import type { WorldPack } from "../../domain";

export const cyberpunkWorldPack: WorldPack = {
  world_pack_id: "world_pack_cyberpunk_base",
  name: "退廃サイバーパンク",
  genre: "cyberpunk",
  era: "近未来",
  scale: "港湾都市圏",
  one_liner: "企業の締め付けと裏稼業の隙間で、小規模ギルドが危険な仕事を回し続ける世界。",
  mood_tags: ["退廃", "監視社会", "港湾", "乾いた群像劇"],
  tone_profile: {
    baseline: "dry_and_tense",
    comedy_level: "low",
    cruelty_level: "medium",
    bitterness_level: "high",
  },
  world_summary: {
    summary: "企業、裏市場、地域共同体が危うい均衡を保つ港湾都市。",
    guild_role: "表と裏の境目で依頼を受ける実務ギルド。",
    main_conflict: "生存と信用維持のために危険仕事を断ち切れない。",
  },
  display_dictionary: {
    stats: {
      power: "制圧",
      tech: "技術",
      sense: "走査",
      social: "交渉",
      will: "耐性",
    },
    roles: {
      frontliner: ["制圧オペレーター", "エンフォーサー"],
      support: ["メディック", "サポートランナー"],
      scout: ["トレーサー", "ウォッチャー"],
      engineer: ["ハッカー", "システム技師"],
      negotiator: ["ブローカー", "フィクサー"],
    },
    mission_categories: {
      subjugation: ["排除任務", "制圧依頼"],
      escort: ["VIP護送", "逃走補助"],
      investigation: ["追跡調査", "ログ解析"],
      recovery: ["データ奪取", "現物確保"],
      delivery: ["密輸搬送", "ブラック便"],
      negotiation: ["取引仲裁", "権利交渉"],
      defense: ["アジト防衛", "区画保持"],
      rescue: ["身柄奪還", "脱出支援"],
    },
  },
  resource_dictionary: {
    currency: ["クレジット"],
    reputation: ["信用", "口利き"],
    rare_resources: ["暗号鍵", "アクセス権", "安全通行ルート"],
  },
  base_profile: {
    base_name: "港湾裏区画アジト",
    base_style: "古倉庫改装の寄り合い所帯",
    facility_examples: ["裏診療所", "作戦卓"],
  },
  faction_ids: ["faction_port_union", "faction_grey_market", "faction_helix_corp"],
  enemy_categories: ["企業警備部隊", "追跡ドローン", "違法改造兵", "回収班"],
  mission_generation: {
    client_pool_tags: ["港湾", "裏市場", "匿名依頼"],
    location_pool_tags: ["高架下", "検問線", "無人倉庫街"],
    obstacle_pool_tags: ["監視網", "通信傍受", "経路漏洩"],
  },
  special_flavor: {
    signature_elements: ["契約", "監視", "損耗", "アクセス権"],
    damage_terms: ["損傷", "神経負荷", "トレース付着", "装備焼損"],
  },
  intro_hook: {
    opening_text: "港湾区では締め付け強化で、裏仕事の単価と危険が同時に跳ね上がっている。",
    first_mission_seed: "封鎖前に重要貨物を検問線の外へ抜く。",
  },
  tags: ["cyberpunk", "harbor_city", "modular_world_pack"],
};
