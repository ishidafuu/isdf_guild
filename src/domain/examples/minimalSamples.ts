import type { Base, Character, Dispatch, Facility, Faction, GuildmasterNote, Mission, Report, Snapshot, StaffCharacter, WorldPack } from "../types";

export const sampleWorldPack = {
  world_pack_id: "world_pack_cyberpunk_base",
  name: "退廃サイバーパンク",
  genre: "cyberpunk",
  era: "近未来",
  scale: "港湾区",
  one_liner: "崩れた都市の隙間で、ギルドが危険な依頼を継いで生き延びる世界。",
  mood_tags: ["退廃", "港湾", "非正規労働"],
  world_summary: {
    summary: "企業、密輸業者、地域共同体が不安定な均衡を保つ港湾都市。",
    guild_role: "表と裏の境目で依頼を回す小規模ギルド。",
    main_conflict: "生存と信用維持のため、危険な仕事を断ち切れない。",
  },
  display_dictionary: {
    stats: {
      power: "出力",
      tech: "技術",
      sense: "察知",
      social: "交渉",
      will: "意志",
    },
    roles: {
      frontliner: ["前衛", "用心棒"],
      support: ["支援役"],
      scout: ["斥候", "追跡役"],
      engineer: ["技師", "解析役"],
      negotiator: ["交渉役", "口利き"],
    },
    mission_categories: {
      delivery: ["密輸搬送", "危険物輸送"],
      investigation: ["追跡調査"],
      escort: ["護送"],
      rescue: ["回収救助"],
      subjugation: ["排除"],
      recovery: ["奪還"],
      negotiation: ["仲介"],
      defense: ["防衛"],
    },
  },
  resource_dictionary: {
    currency: ["クレジット"],
    reputation: ["信用", "口利き"],
    rare_resources: ["偽造通行証", "企業端末アクセス権"],
  },
  base_profile: {
    base_name: "港湾裏区画アジト",
    base_style: "古倉庫改装",
    facility_examples: ["裏診療所", "作戦卓"],
  },
  faction_ids: ["faction_port_union"],
  enemy_categories: ["回収屋", "企業警備", "港湾荒らし"],
  mission_generation: {
    client_pool_tags: ["港湾", "密輸", "下請け"],
    location_pool_tags: ["旧倉庫", "埠頭", "検問線"],
    obstacle_pool_tags: ["襲撃", "検問", "経路漏洩"],
  },
  special_flavor: {
    signature_elements: ["違法改造", "企業残滓", "港湾物流"],
    damage_terms: ["負傷", "過負荷", "神経疲労"],
  },
  intro_hook: {
    opening_text: "港湾区では企業の締め付け強化で、裏仕事の単価と危険が同時に跳ねている。",
    first_mission_seed: "封鎖前に重要貨物を抜け道から搬送する。",
  },
  tags: ["cyberpunk", "modular_world_pack"],
} satisfies WorldPack;

export const sampleFaction = {
  faction_id: "faction_port_union",
  world_pack_id: "world_pack_cyberpunk_base",
  name: "港湾労務連合",
  kind: "merchant_union",
  scale: "city",
  public_digest: "港湾物流を握る実務連合。利益には冷徹だが物流停止は嫌う。",
  guild_relation: {
    stance: "neutral",
    relation_score: 0,
    tags: ["取引相手", "納期重視"],
  },
  mission_roles: {
    can_be_client: true,
    can_be_patron: true,
    can_be_enemy: false,
    can_be_complication: true,
  },
  tags: ["港湾", "物流"],
} satisfies Faction;

export const sampleNote = {
  note_id: "note_0001",
  character_id: "char_shion",
  selected_text: "痛みを隠してでも前に出る。単独前衛は避けたい。",
  user_note: "少なくとも次回は補佐役をつける。",
  source_kind: "mission_report",
  source_id: "report_0001",
  created_at_phase: "post_report",
  created_from_report_id: "report_0001",
  tags: ["care", "assignment"],
} satisfies GuildmasterNote;

export const sampleCharacter = {
  character_id: "char_shion",
  name: "シオン",
  member_kind: "adventurer",
  world_pack_id: "world_pack_cyberpunk_base",
  role: "frontliner",
  sub_roles: ["scout"],
  stats: {
    power: 2,
    tech: 0,
    sense: 1,
    social: 1,
    will: 2,
  },
  big5: {
    openness: 0,
    conscientiousness: 2,
    extraversion: -1,
    agreeableness: 0,
    neuroticism: 1,
  },
  traits: {
    strengths: ["粘り強い"],
    flaws: ["無理を押す"],
    personality_tags: ["寡黙", "実直"],
  },
  skills: [
    {
      skill_id: "skill_guard_line",
      name: "護りの踏み込み",
      kind: "common",
    },
  ],
  public_digest: "寡黙な前衛役。危険な搬送で盾になる。",
  volatile_hook: "結果優先で無茶をしがち。",
  private_dossier: {
    core_identity: "港湾区育ちの若い護衛役。",
    background: "幼少期から危険仕事で家計を支えてきた。",
    daily_texture: "空き時間でも装備整備をしている。",
    values: "約束破りを嫌う。",
    social: "年少には不器用に世話を焼く。",
    work_view: "撤退自体は認めるが、自分だけ下がるのは苦手。",
    history_hook: "護衛失敗の記憶が残っている。",
    speech_rule: "短文で話す。",
    guild_view: "今のギルドを居場所と感じ始めている。",
  },
  guildmaster_note_log: [sampleNote],
  relationships: [
    {
      target_type: "faction",
      target_id: "faction_port_union",
      score: -1,
      tags: ["警戒"],
    },
  ],
  status: {
    injury: 1,
    stress: 2,
    availability: "active",
    recovery_note: "次の依頼前に休養推奨。",
  },
  timeline: [
    {
      event_id: "timeline_event_0001",
      kind: "backstory",
      summary: "護衛失敗を経験している。",
    },
  ],
} satisfies Character;

export const sampleStaffCharacter = {
  character_id: "char_staff_0001",
  name: "ミレイ",
  member_kind: "staff",
  world_pack_id: "world_pack_cyberpunk_base",
  role: "negotiator",
  staff_role: "advisor",
  sub_staff_roles: ["clerk"],
  advice_domains: ["assignment", "fatigue", "client_trust"],
  conversation_stance: "dry_but_caring",
  visibility_phase: ["pre_mission", "post_report"],
  public_digest: "人選と依頼人対応に口を出す相談役。",
  volatile_hook: "前衛の無理を止めきれないことを気にしている。",
  private_dossier: {
    core_identity: "元企業下請けの調整役。",
    background: "切り捨てに耐えきれず現ギルドへ流れ着いた。",
    daily_texture: "帳面と端末を常に持ち歩く。",
    values: "無理で回す組織を嫌う。",
    social: "不用意に甘やかさない。",
    work_view: "派手な成功より継続可能性を重視する。",
    history_hook: "無茶な配置を止められなかった過去がある。",
    speech_rule: "短く断定する。",
    guild_view: "大きくするより潰れない方を優先したい。",
  },
  guildmaster_note_log: [],
  status: {
    injury: 0,
    stress: 1,
    availability: "active",
  },
  opinion_patterns: ["無理な編成に反対する", "休養を提案する"],
  assertiveness: "variable_by_personality",
  tags: ["staff", "advisor"],
} satisfies StaffCharacter;

export const sampleFacility = {
  facility_id: "facility_clinic",
  world_pack_id: "world_pack_cyberpunk_base",
  name: "裏診療所",
  category: "medical",
  status: "available",
  summary: "簡易治療と応急処置ができる設備。",
  effect_tags: ["injury_care", "post_mission_recovery"],
} satisfies Facility;

export const sampleBase = {
  base_id: "base_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  name: "港湾裏区画アジト",
  status: "active",
  summary: "港湾地区の裏路地にある、小規模だが実務的な拠点。",
  staff_character_ids: ["char_staff_0001"],
  facility_ids: ["facility_clinic"],
  linked_faction_ids: ["faction_port_union"],
} satisfies Base;

export const sampleMission = {
  mission_id: "mission_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  category: "delivery",
  display_name: "検問前危険物搬送",
  client: {
    type: "faction",
    faction_id: "faction_port_union",
    name: "港湾労務連合",
  },
  target: {
    kind: "object",
    name: "封緘ケース",
    traits: ["重要物資", "破損注意"],
  },
  location: {
    from: "旧港倉庫",
    to: "北岸の荷受け小屋",
    region_tag: "港湾区",
  },
  objective: {
    summary: "封緘ケースを封鎖前に搬送する。",
    success_condition: "ケースが無傷で届いている。",
  },
  obstacles: [
    {
      kind: "ambush",
      summary: "帰路で回収屋の襲撃がありうる。",
    },
    {
      kind: "checkpoint",
      summary: "検問線の強化で経路変更が必要。",
    },
  ],
  time_limit: {
    has_limit: true,
    summary: "夜明け前まで",
    pressure_level: 1,
  },
  reward: {
    summary: "クレジットと港湾側の信用",
    currency: 120,
    reputation: 1,
    resource_tags: ["港湾優先窓口"],
  },
  risk: {
    summary: "輸送失敗時は関係悪化と報酬減。",
    failure_tags: ["報酬減", "関係悪化"],
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
  tags: ["輸送", "港湾", "検問"],
} satisfies Mission;

export const sampleDispatch = {
  dispatch_id: "dispatch_0001",
  mission_id: "mission_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  status: "accepted",
  decision: {
    accepted: true,
    priority: "medium",
    reason_summary: "港湾側との関係維持に意味がある。",
  },
  assigned_character_ids: ["char_shion"],
  party_roles: [
    {
      character_id: "char_shion",
      role: "frontliner",
      assignment_reason: "搬送中の襲撃対応。",
    },
  ],
  base_state: {
    base_id: "base_0001",
    selected_facility_ids: ["facility_clinic"],
    preparation_tags: ["医療準備"],
  },
  guildmaster_view: {
    short_impression: "無理はあるが外せない編成だ。",
    confidence_level: "uneasy",
  },
  created_phase: "pre_mission",
  tags: ["dispatch", "港湾"],
} satisfies Dispatch;

export const sampleReport = {
  report_id: "report_0001",
  mission_id: "mission_0001",
  dispatch_id: "dispatch_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  kind: "mission_report",
  phase: "post_mission",
  text: "危険物搬送は部分成功。貨物は届いたが、シオンが肩を負傷した。",
  intent_tags: ["依頼結果", "部分成功", "負傷発生"],
  reason_summary: "搬送は完了したが人的損耗が出た。",
  state_updates: {
    mission_result: "partial_success",
    character_updates: [
      {
        character_id: "char_shion",
        injury_delta: 1,
        stress_delta: 0,
      },
    ],
    faction_updates: [
      {
        faction_id: "faction_port_union",
        relation_delta: -1,
      },
    ],
  },
  linked_notes: [
    {
      character_id: "char_shion",
      note_candidate_set_id: "note_candidate_set_0001",
    },
  ],
} satisfies Report;

export const sampleSnapshot = {
  snapshot_id: "snapshot_0001",
  world_pack_id: "world_pack_cyberpunk_base",
  phase: "post_report",
  source_report_id: "report_0001",
  source_dispatch_id: "dispatch_0001",
  summary: "搬送任務後の状態記録。",
  character_states: [
    {
      character_id: "char_shion",
      injury: 2,
      stress: 2,
      availability: "resting",
    },
  ],
  faction_states: [
    {
      faction_id: "faction_port_union",
      relation_state: "tense",
      note: "任務完遂はしたが損耗を問題視された。",
    },
  ],
  base_state: {
    base_id: "base_0001",
    selected_facility_ids: ["facility_clinic"],
    issue_tags: ["medical_strain"],
  },
  tags: ["snapshot", "post_mission"],
} satisfies Snapshot;

export const phase1CanonicalSamples = {
  world_pack: sampleWorldPack,
  faction: sampleFaction,
  character: sampleCharacter,
  staff_character: sampleStaffCharacter,
  base: sampleBase,
  facility: sampleFacility,
  mission: sampleMission,
  dispatch: sampleDispatch,
  report: sampleReport,
  snapshot: sampleSnapshot,
  guildmaster_note: sampleNote,
};
