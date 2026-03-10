import type { Faction } from "../../domain";

export const cyberpunkFactions: Faction[] = [
  {
    faction_id: "faction_port_union",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "港湾労務連合",
    kind: "merchant_union",
    scale: "city",
    public_digest: "港湾物流の現場を握る実務連合。納期と損耗に厳しい。",
    description: {
      summary: "港湾の人員手配と荷動きを握る労務連合。",
      position: "企業に完全従属はしないが、正面衝突も避ける現実派。",
      tone: "事務的で短気。使える相手は使う。",
    },
    guild_relation: {
      stance: "neutral",
      relation_score: 1,
      tags: ["取引相手", "納期重視"],
      recent_change: "小さな遅配が続き、現場では不満が溜まり始めている。",
    },
    resources: {
      offers: ["輸送依頼", "物流情報", "検問の癖"],
      wants: ["納期厳守", "損耗抑制", "秘密保持"],
    },
    mission_roles: {
      can_be_client: true,
      can_be_patron: true,
      can_be_enemy: false,
      can_be_complication: true,
    },
    speech_guide: {
      style: "端的で値踏みが露骨",
      keywords: ["納期", "損耗", "手間賃", "契約"],
    },
    state: {
      visibility: "public",
      stability: "stable",
      heat_level: "rising",
    },
    tags: ["港湾", "物流", "依頼元"],
  },
  {
    faction_id: "faction_grey_market",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "グレイマーケット",
    kind: "criminal_network",
    scale: "district",
    public_digest: "港湾裏市場を束ねる緩い網。金にも義理にも動く。",
    description: {
      summary: "仲介屋、運び屋、闇医者がゆるく連なる裏市場ネットワーク。",
      position: "表からは切られているが、現場では頼られる。",
      tone: "軽口混じりだが、貸し借りは忘れない。",
    },
    guild_relation: {
      stance: "ally",
      relation_score: 2,
      tags: ["裏口", "融通"],
      recent_change: "最近は企業監査で動きが窮屈になっている。",
    },
    resources: {
      offers: ["裏ルート", "匿名口座", "臨時の逃走支援"],
      wants: ["貸しの回収", "余計な注目を避けること"],
    },
    conflicts: [
      {
        target_faction_id: "faction_helix_corp",
        kind: "suppression",
        summary: "企業監査局から継続的な締め付けを受けている。",
      },
    ],
    mission_roles: {
      can_be_client: true,
      can_be_patron: true,
      can_be_enemy: true,
      can_be_complication: true,
    },
    speech_guide: {
      style: "砕けているが勘定は厳密",
      keywords: ["抜け道", "貸し", "匿名", "潮時"],
    },
    state: {
      visibility: "semi_hidden",
      stability: "unstable",
      heat_level: "high",
    },
    tags: ["裏市場", "中立寄り", "逃走路"],
  },
  {
    faction_id: "faction_helix_corp",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "ヘリックス・ロジスティクス",
    kind: "research_org",
    scale: "regional",
    public_digest: "港湾再編を進める企業物流部門。監視と回収を日常化している。",
    description: {
      summary: "物流と監視インフラを抱える企業部門。",
      position: "表向きは再開発支援だが、実態は支配域の拡張。",
      tone: "冷静で礼儀正しいが、容赦がない。",
    },
    guild_relation: {
      stance: "hostile",
      relation_score: -2,
      tags: ["監視対象", "締め付け"],
      recent_change: "港湾裏区画への監査が強化された。",
    },
    resources: {
      offers: ["高額案件", "通行権", "機材"],
      wants: ["従属", "証拠隠滅", "独占"],
    },
    mission_roles: {
      can_be_client: true,
      can_be_patron: false,
      can_be_enemy: true,
      can_be_complication: true,
    },
    speech_guide: {
      style: "丁寧だが威圧的",
      keywords: ["最適化", "監査", "回収", "規約"],
    },
    state: {
      visibility: "public",
      stability: "solid",
      heat_level: "high",
    },
    tags: ["企業", "圧力源", "敵対"],
  },
];
