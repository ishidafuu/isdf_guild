import type { Mission } from "../../domain";

export const cyberpunkMissions: Mission[] = [
  {
    mission_id: "mission_0001",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "delivery",
    display_name: "封鎖前ブラック便",
    category_display: "密輸搬送",
    client: {
      type: "faction",
      faction_id: "faction_port_union",
      name: "港湾労務連合",
    },
    target: {
      kind: "object",
      name: "封緘ケース",
      traits: ["重要物資", "破損注意", "検問対象"],
    },
    location: {
      from: "旧港倉庫",
      to: "北岸の荷受け小屋",
      region_tag: "港湾区",
    },
    objective: {
      summary: "封緘ケースを夜明け前に搬送する。",
      success_condition: "ケースが無傷で検問外へ届いている。",
    },
    obstacles: [
      { kind: "checkpoint", summary: "検問線の強化で経路変更が必要。" },
      { kind: "ambush", summary: "回収班が経路を張っている可能性がある。" },
    ],
    time_limit: {
      has_limit: true,
      summary: "夜明け前まで",
      pressure_level: 2,
    },
    reward: {
      summary: "クレジットと港湾側の信用",
      currency: 120,
      reputation: 1,
      resource_tags: ["安全通行ルート"],
    },
    risk: {
      summary: "失敗時は報酬減と関係悪化。",
      failure_tags: ["関係悪化", "検問強化"],
    },
    difficulty: {
      target_number: 7,
      pressure: "medium",
      danger: "medium",
    },
    participants: {
      recommended_roles: ["frontliner", "engineer", "negotiator"],
      max_party_size: 3,
    },
    state: {
      status: "open",
      accepted: false,
      result: null,
    },
    tags: ["安全寄り", "輸送", "港湾"],
  },
  {
    mission_id: "mission_0002",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "negotiation",
    display_name: "停戦線の調停",
    category_display: "取引仲裁",
    client: {
      type: "faction",
      faction_id: "faction_grey_market",
      name: "グレイマーケット",
    },
    target: {
      kind: "problem",
      name: "補給路を巡る小競り合い",
      traits: ["感情的対立", "貸し借りが絡む"],
    },
    location: {
      from: "路地裏マーケット",
      to: "高架下の停戦線",
      region_tag: "下層区",
    },
    objective: {
      summary: "二つの運び屋グループの衝突を鎮め、補給路を再開させる。",
      success_condition: "その夜の荷動きが再開し、裏市場への不信を抑える。",
    },
    obstacles: [
      { kind: "distrust", summary: "双方が相手だけでなく仲裁役も疑っている。" },
      { kind: "surveillance", summary: "企業側の監視が近く、長引くと踏み込まれる。" },
    ],
    reward: {
      summary: "裏市場の貸しと緊急逃走支援",
      reputation: 1,
      resource_tags: ["裏ルート", "貸し"],
    },
    risk: {
      summary: "交渉失敗時は現場が暴発し、裏市場の顔が潰れる。",
      failure_tags: ["関係悪化", "暴発"],
    },
    difficulty: {
      target_number: 8,
      pressure: "medium",
      danger: "low",
    },
    participants: {
      recommended_roles: ["negotiator", "scout", "support"],
      max_party_size: 3,
    },
    state: {
      status: "open",
      accepted: false,
      result: null,
    },
    tags: ["交渉寄り", "対人", "裏市場"],
  },
  {
    mission_id: "mission_0003",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "recovery",
    display_name: "監査前データ奪取",
    category_display: "データ奪取",
    client: "匿名依頼人",
    target: {
      kind: "data",
      name: "港湾監査ログ",
      traits: ["証拠性", "分割保存", "高追跡性"],
    },
    location: {
      from: "企業ビルの保守階",
      to: "港湾裏区画アジト",
      region_tag: "企業区画",
    },
    objective: {
      summary: "監査ログを企業に気取られず確保する。",
      success_condition: "必要ログを持ち帰り、追跡を最小化する。",
    },
    obstacles: [
      { kind: "surveillance", summary: "監視網が密で偽装が通りにくい。" },
      { kind: "security", summary: "企業回収班と自律防衛が稼働している。" },
      { kind: "instability", summary: "現場電力が不安定でログ抽出が乱れる。" },
    ],
    reward: {
      summary: "高額クレジットと内部資料",
      currency: 220,
      reputation: 1,
      resource_tags: ["内部資料", "アクセス権"],
    },
    risk: {
      summary: "失敗時は追跡と企業側の圧力が強まる。",
      failure_tags: ["追跡付着", "企業圧力"],
    },
    twist: {
      enabled: true,
      summary: "依頼人自身がログの一部を伏せている可能性がある。",
    },
    difficulty: {
      target_number: 10,
      pressure: "high",
      danger: "high",
    },
    participants: {
      recommended_roles: ["engineer", "scout", "frontliner"],
      max_party_size: 3,
    },
    state: {
      status: "open",
      accepted: false,
      result: null,
    },
    tags: ["危険寄り", "高難度", "企業"],
  },
];
