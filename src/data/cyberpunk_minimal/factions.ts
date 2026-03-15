import type { Faction } from "../../domain";

export const cyberpunkFactions: Faction[] = [
  {
    faction_id: "faction_port_union",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "港運組合",
    kind: "merchant_union",
    scale: "city",
    public_digest: "荷運びと人足の差配を握る組合。締切にも面子にも厳しい。",
    description: {
      summary: "船着き場の人足と荷の流れを差配する港の実務組合。",
      position: "大商会に頭は下げるが、現場の筋は通したい現実派。",
      tone: "口は荒いが、使える相手はきちんと覚える。",
    },
    guild_relation: {
      stance: "neutral",
      relation_score: 1,
      tags: ["取引相手", "締切重視"],
      recent_change: "最近の遅れで、帳場ではこのギルドの名が少し引っ掛かるようになった。",
    },
    resources: {
      offers: ["荷運びの仕事", "波止場の噂", "見回りの癖"],
      wants: ["締切厳守", "荷傷みなし", "口の堅さ"],
    },
    mission_roles: {
      can_be_client: true,
      can_be_patron: true,
      can_be_enemy: false,
      can_be_complication: true,
    },
    speech_guide: {
      style: "端的で値踏みが露骨",
      keywords: ["締切", "荷傷み", "手間賃", "面子"],
    },
    state: {
      visibility: "public",
      stability: "stable",
      heat_level: "rising",
    },
    tags: ["港", "荷運び", "依頼元"],
  },
  {
    faction_id: "faction_grey_market",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "潮待ち市",
    kind: "criminal_network",
    scale: "district",
    public_digest: "波止場裏の露店と仲買を束ねる緩い寄り合い。金にも義理にも動く。",
    description: {
      summary: "露店、仲買、手当師、夜の渡し守がゆるく繋がる寄り合い市場。",
      position: "表の帳面には載らないが、困った時には誰かが世話を焼く。",
      tone: "軽口混じりだが、貸し借りは忘れない。",
    },
    guild_relation: {
      stance: "ally",
      relation_score: 2,
      tags: ["裏口", "融通"],
      recent_change: "港の締め付けがきつくなり、最近は顔を立てる順番でも揉めやすい。",
    },
    resources: {
      offers: ["裏道", "夜船の手配", "急場の口利き"],
      wants: ["貸しの回収", "余計な注目を避けること"],
    },
    conflicts: [
      {
        target_faction_id: "faction_helix_corp",
        kind: "suppression",
        summary: "北湾商会と港役人から継続的な締め付けを受けている。",
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
      keywords: ["抜け道", "貸し", "顔", "潮時"],
    },
    state: {
      visibility: "semi_hidden",
      stability: "unstable",
      heat_level: "high",
    },
    tags: ["裏市", "中立寄り", "抜け道"],
  },
  {
    faction_id: "faction_helix_corp",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "北湾商会",
    kind: "merchant_union",
    scale: "regional",
    public_digest: "港の表仕事を握る大商会。役人と用心棒を抱え、厄介事を金で片づける。",
    description: {
      summary: "港の大口荷を押さえ、倉庫と船宿にまで口を出す大商会。",
      position: "表向きは町の流れを整える顔だが、実態は自分の縄張りを広げている。",
      tone: "物腰は柔らかいが、退く時を相手に選ばせない。",
    },
    guild_relation: {
      stance: "hostile",
      relation_score: -2,
      tags: ["締め付け", "見張りの目"],
      recent_change: "波止場裏の小さな帳場にも、商会付きの見張りが顔を出すようになった。",
    },
    resources: {
      offers: ["高額案件", "船便の口", "役所への話通し"],
      wants: ["従属", "情報", "独占"],
    },
    mission_roles: {
      can_be_client: true,
      can_be_patron: false,
      can_be_enemy: true,
      can_be_complication: true,
    },
    speech_guide: {
      style: "丁寧だが威圧的",
      keywords: ["手配", "差し止め", "便宜", "取り分"],
    },
    state: {
      visibility: "public",
      stability: "solid",
      heat_level: "high",
    },
    tags: ["商会", "圧力源", "敵対"],
  },
];
