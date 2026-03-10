import type { Character, StaffCharacter } from "../../domain";
import { upsertById } from "./helpers";

export function listCharacters(characters: Character[]): Character[] {
  return [...characters];
}

export function saveCharacter(characters: Character[], character: Character): Character[] {
  return upsertById(characters, "character_id", character);
}

export function listStaff(staff: StaffCharacter[]): StaffCharacter[] {
  return [...staff];
}

export function saveStaff(staff: StaffCharacter[], member: StaffCharacter): StaffCharacter[] {
  return upsertById(staff, "character_id", member);
}
