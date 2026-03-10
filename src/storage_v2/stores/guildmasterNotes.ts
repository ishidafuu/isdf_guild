import type { GuildmasterNote } from "../../domain";
import { upsertById } from "./helpers";

export function listGuildmasterNotes(notes: GuildmasterNote[]): GuildmasterNote[] {
  return [...notes];
}

export function saveGuildmasterNote(notes: GuildmasterNote[], note: GuildmasterNote): GuildmasterNote[] {
  return upsertById(notes, "note_id", note);
}
