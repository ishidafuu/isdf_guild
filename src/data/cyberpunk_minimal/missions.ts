import type { Mission } from "../../domain";

export const cyberpunkMissions: Mission[] = [
  {
    mission_id: "mission_0001",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "delivery",
    display_name: "封鎖前の急ぎ便",
    category_display: "急ぎの荷運び",
    client: {
      type: "faction",
      faction_id: "faction_port_union",
      name: "港運組合",
    },
    target: {
      kind: "object",
      name: "封緘された木箱",
      traits: ["割れ物", "証文付き", "差し止め前に通したい荷"],
    },
    location: {
      from: "南倉庫",
      to: "北岸の荷受け小屋",
      region_tag: "波止場",
    },
    objective: {
      summary: "封緘木箱を夜明け前に対岸へ運ぶ。",
      success_condition: "荷が無傷のまま北岸へ届き、差し止めを食わない。",
    },
    obstacles: [
      { kind: "checkpoint", summary: "港の見回りが増えていて、正面の道は通りづらい。" },
      { kind: "ambush", summary: "荷止め役がどこかで待っている可能性がある。" },
    ],
    time_limit: {
      has_limit: true,
      summary: "夜明け前まで",
      pressure_level: 2,
    },
    reward: {
      summary: "銀貨と港運組合からの顔",
      currency: 120,
      reputation: 1,
      resource_tags: ["通し札"],
    },
    risk: {
      summary: "失敗すれば手間賃が削られ、港運組合との空気も悪くなる。",
      failure_tags: ["関係悪化", "見回り強化"],
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
    tags: ["安全寄り", "輸送", "港"],
  },
  {
    mission_id: "mission_0002",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "negotiation",
    display_name: "波止場筋の仲裁",
    category_display: "揉め事仲裁",
    client: {
      type: "faction",
      faction_id: "faction_grey_market",
      name: "潮待ち市",
    },
    target: {
      kind: "problem",
      name: "魚棚通りと縄屋のいさかい",
      traits: ["感情的対立", "貸し借りが絡む"],
    },
    location: {
      from: "魚棚通り",
      to: "波止場の荷揚げ場",
      region_tag: "市",
    },
    objective: {
      summary: "二つの商い筋の衝突を鎮め、朝の荷動きを止めないようにする。",
      success_condition: "その日の荷揚げが再開し、どちらの顔も潰し切らない。",
    },
    obstacles: [
      { kind: "distrust", summary: "双方が相手だけでなく仲裁役も疑っている。" },
      { kind: "surveillance", summary: "北湾商会の見張りが近く、長引くと余計な顔が出てくる。" },
    ],
    reward: {
      summary: "潮待ち市の貸しと人足の融通",
      reputation: 1,
      resource_tags: ["裏道", "貸し"],
    },
    risk: {
      summary: "交渉を外すと、その日の商いごと止まり、市場の顔が潰れる。",
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
    tags: ["交渉寄り", "対人", "市"],
  },
  {
    mission_id: "mission_0003",
    world_pack_id: "world_pack_cyberpunk_base",
    category: "recovery",
    display_name: "帳面前の荷札回収",
    category_display: "荷札の取り戻し",
    client: "匿名の宿主",
    target: {
      kind: "object",
      name: "消えた荷札束",
      traits: ["証拠性", "持ち出しにくい", "顔が割れやすい"],
    },
    location: {
      from: "北税倉庫の裏手",
      to: "波止場裏の何でも屋",
      region_tag: "倉庫街",
    },
    objective: {
      summary: "消えた荷札束を役人や商会に気取られず取り戻す。",
      success_condition: "必要な荷札を持ち帰り、誰の差し金かを探る足がかりを残す。",
    },
    obstacles: [
      { kind: "surveillance", summary: "倉庫番と夜警の目が多く、出入りを誤魔化しにくい。" },
      { kind: "security", summary: "商会付きの用心棒が出入りを見張っている。" },
      { kind: "instability", summary: "荷札が分けて保管されており、必要なものだけ選ぶ手間がかかる。" },
    ],
    reward: {
      summary: "まとまった銀貨と古い紹介状",
      currency: 220,
      reputation: 1,
      resource_tags: ["紹介状", "帳場の内話"],
    },
    risk: {
      summary: "失敗すれば宿主の顔が潰れ、北湾商会の圧が強まる。",
      failure_tags: ["追及", "商会圧力"],
    },
    twist: {
      enabled: true,
      summary: "依頼人自身が、荷札の持ち主を全部は話していない可能性がある。",
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
    tags: ["危険寄り", "高難度", "商会"],
  },
];
