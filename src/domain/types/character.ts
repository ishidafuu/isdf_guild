import type { Phase } from "../enums";
import type { WorldPackId } from "../ids";
import type {
  Big5Profile,
  CharacterCore,
  CharacterStatus,
  GuildmasterNoteBase,
  PrivateDossier,
  Skill,
  Stats,
  TimelineEvent,
  TraitSet,
} from "./common";

export type Character = CharacterCore & {
  member_kind: "adventurer";
  stats: Stats;
  big5?: Big5Profile;
  traits?: TraitSet;
  skills?: Skill[];
  private_dossier?: PrivateDossier;
  guildmaster_note_log?: GuildmasterNoteBase[];
  timeline?: TimelineEvent[];
};

export type StaffRole = "advisor" | "clerk" | "caretaker" | "operator" | "quartermaster";

export type StaffCharacter = Omit<CharacterCore, "member_kind" | "role" | "sub_roles"> & {
  member_kind: "staff";
  role: "negotiator" | "support" | "engineer";
  world_pack_id: WorldPackId;
  staff_role: StaffRole;
  sub_staff_roles?: StaffRole[];
  advice_domains?: string[];
  conversation_stance?: string;
  visibility_phase?: Phase[];
  opinion_patterns?: string[];
  assertiveness?: string;
  status: CharacterStatus;
  private_dossier?: PrivateDossier;
  guildmaster_note_log?: GuildmasterNoteBase[];
  tags?: string[];
};
