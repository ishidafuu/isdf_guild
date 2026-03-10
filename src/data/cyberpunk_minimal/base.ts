import type { Base } from "../../domain";

export const cyberpunkBase: Base = {
  base_id: "base_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  name: "港湾裏区画アジト",
  status: "active",
  summary: "港湾裏路地の古倉庫を改装した、小規模だが実務的な拠点。",
  description: "外から見れば放置倉庫だが、中では応急処置、依頼整理、短い休養がどうにか回っている。",
  tone_tags: ["rough", "lived_in", "functional"],
  state_values: {
    readiness: "steady",
    staff_margin: "tight",
    external_attention: "rising",
    atmosphere: "strained",
  },
  staff_character_ids: ["char_staff_mirei"],
  facility_ids: ["facility_clinic", "facility_briefing_table"],
  active_issue_tags: ["staff_shortage"],
  narrative_changes: ["港湾勢力との接点が強い", "少人数で無理を回している"],
  linked_faction_ids: ["faction_port_union", "faction_grey_market"],
  tags: ["guild_base", "harbor", "small_scale"],
};
