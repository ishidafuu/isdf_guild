import type { Facility } from "../../domain";

export const cyberpunkFacilities: Facility[] = [
  {
    facility_id: "facility_clinic",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "裏診療所",
    category: "medical",
    status: "available",
    summary: "簡易治療と応急処置ができる設備。",
    description: "裏市場の医療品と現場知識で、荒いが早い処置を回す。",
    effect_tags: ["injury_care", "post_mission_recovery"],
    usage_examples: ["負傷者の応急処置", "出発前の携行医療確認"],
    narrative_effects: ["負傷の説明に説得力が出る", "休養判断の会話が発生しやすい"],
    state_flags: ["core_space"],
    tags: ["base_facility", "medical"],
  },
  {
    facility_id: "facility_briefing_table",
    world_pack_id: "world_pack_cyberpunk_base",
    name: "作戦卓",
    category: "briefing",
    status: "available",
    summary: "依頼資料と地図を広げる共用卓。",
    description: "経路、検問、貸し借りをすり合わせるための小さな卓。会話の温度が出やすい。",
    effect_tags: ["mission_planning", "risk_review", "pre_mission_talk"],
    usage_examples: ["経路確認", "懸念共有", "人選の口論"],
    narrative_effects: ["懸念の明文化", "スタッフの口出し", "作戦理由の補強"],
    state_flags: ["core_space"],
    tags: ["base_facility", "briefing"],
  },
];
