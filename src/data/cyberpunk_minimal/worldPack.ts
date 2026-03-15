import type { WorldPack } from "../../domain";

export const cyberpunkWorldPack: WorldPack = {
  world_pack_id: "world_pack_cyberpunk_base",
  name: "港町の何でも屋ギルド",
  genre: "harbor_town_drama",
  era: "架空近世",
  scale: "港町",
  one_liner: "潮と噂と借りで回る港町で、小さな何でも屋ギルドが面倒ごとを拾って食いつなぐ世界。",
  mood_tags: ["港町", "生活感", "人情", "噂", "群像劇"],
  tone_profile: {
    baseline: "lived_in_and_tense",
    comedy_level: "medium",
    cruelty_level: "low",
    bitterness_level: "medium",
  },
  world_summary: {
    summary: "船乗り、荷運び、商人、顔役が狭い波止場でせめぎ合う港町。",
    guild_role: "荷運びから揉め事の仲裁まで拾う、小さな何でも屋ギルド。",
    main_conflict: "義理と実入りのあいだで、断りにくい仕事が増えていく。",
  },
  display_dictionary: {
    stats: {
      power: "腕っぷし",
      tech: "手際",
      sense: "勘",
      social: "口",
      will: "腹",
    },
    roles: {
      frontliner: ["用心棒", "荷役頭"],
      support: ["手当番", "世話役"],
      scout: ["見張り", "先触れ"],
      engineer: ["船大工", "細工師"],
      negotiator: ["口利き", "帳場役"],
    },
    mission_categories: {
      subjugation: ["ごろつき払い", "用心棒仕事"],
      escort: ["見送り護衛", "夜道の付き添い"],
      investigation: ["聞き込み", "行方探し"],
      recovery: ["荷の回収", "帳面の取り戻し"],
      delivery: ["急ぎ便", "抜け荷の運び"],
      negotiation: ["揉め事仲裁", "顔役同士の話つけ"],
      defense: ["店先の見張り", "倉庫の番"],
      rescue: ["身柄引き取り", "漁の遭難助け"],
    },
  },
  resource_dictionary: {
    currency: ["銀貨"],
    reputation: ["顔", "口利き"],
    rare_resources: ["通し札", "紹介状", "抜け道図"],
  },
  base_profile: {
    base_name: "波止場裏の何でも屋",
    base_style: "帳場と酒場を兼ねた古い倉庫",
    facility_examples: ["手当部屋", "帳場机"],
  },
  faction_ids: ["faction_port_union", "faction_grey_market", "faction_helix_corp"],
  enemy_categories: ["港のごろつき", "押し貸し連中", "税吏", "私兵崩れ"],
  mission_generation: {
    client_pool_tags: ["港", "市", "匿名依頼"],
    location_pool_tags: ["波止場", "倉庫街", "魚棚通り"],
    obstacle_pool_tags: ["見回り", "差し止め", "顔役の横槍"],
  },
  special_flavor: {
    signature_elements: ["潮の匂い", "借り", "口利き", "帳面"],
    damage_terms: ["打ち身", "疲れ", "借り増し", "評判傷"],
  },
  intro_hook: {
    opening_text: "朝の潮といっしょに、面倒ごともまた帳場へ流れ込んでくる。",
    first_mission_seed: "港の封鎖前に、割れ物の荷を対岸へ通す。",
  },
  tags: ["harbor_town", "odd_jobs", "modular_world_pack"],
};
