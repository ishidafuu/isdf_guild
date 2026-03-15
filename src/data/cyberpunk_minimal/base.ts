import type { Base } from "../../domain";

export const cyberpunkBase: Base = {
  base_id: "base_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  name: "波止場裏の何でも屋",
  status: "active",
  summary: "波止場の裏手にある古倉庫を使った、小さな何でも屋の帳場。",
  description: "昼は荷札と相談が積み上がり、夜は帰ってきた連中が椅子を引きずって酒と愚痴を回す。",
  tone_tags: ["rough", "lived_in", "functional"],
  state_values: {
    readiness: "steady",
    staff_margin: "tight",
    external_attention: "rising",
    atmosphere: "lively",
  },
  staff_character_ids: ["char_staff_mirei"],
  facility_ids: ["facility_clinic", "facility_briefing_table"],
  active_issue_tags: ["staff_shortage"],
  narrative_changes: ["港の人脈で話が流れ込む", "少人数でやりくりしている"],
  linked_faction_ids: ["faction_port_union", "faction_grey_market"],
  tags: ["guild_base", "harbor", "small_scale"],
};
