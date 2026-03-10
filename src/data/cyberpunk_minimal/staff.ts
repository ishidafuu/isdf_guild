import type { StaffCharacter } from "../../domain";

export const cyberpunkStaff: StaffCharacter[] = [
  {
    character_id: "char_staff_mirei",
    name: "ミレイ",
    member_kind: "staff",
    world_pack_id: "world_pack_cyberpunk_base",
    role: "negotiator",
    staff_role: "advisor",
    sub_staff_roles: ["clerk"],
    advice_domains: ["assignment", "fatigue", "client_trust", "policy"],
    conversation_stance: "dry_but_caring",
    visibility_phase: ["pre_mission", "post_report", "rest_phase"],
    public_digest: "人選と依頼人対応に口を出す相談役。継続可能性を何より気にする。",
    volatile_hook: "最近は無理な編成を止めきれないことを気にしている。",
    private_dossier: {
      core_identity: "元企業下請けの調整役。",
      background: "現場切り捨てに耐えきれず、今のギルドへ流れ着いた。",
      daily_texture: "帳面と端末を常に持ち歩く。",
      values: "結果より、誰を削ったかを気にする。",
      social: "甘やかさないが放ってもおけない。",
      work_view: "派手な成功より継続可能性を重視する。",
      history_hook: "無茶な配置を止められず一人を壊した記憶がある。",
      speech_rule: "短く断定する。気遣うほど言葉が辛い。",
      guild_view: "大きくするより潰れない方を優先したい。",
    },
    guildmaster_note_log: [],
    status: { injury: 0, stress: 1, availability: "active" },
    opinion_patterns: ["無理な編成に反対する", "休養を提案する", "依頼人の不信を拾う"],
    assertiveness: "steady",
    tags: ["staff", "advisor", "commentary_source"],
  },
];

export const cyberpunkStaffless: StaffCharacter[] = [];
