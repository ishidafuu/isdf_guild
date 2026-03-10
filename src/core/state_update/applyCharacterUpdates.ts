import type { Character, GuildmasterNote, Report } from "../../domain";

function nextAvailability(character: Character): Character["status"]["availability"] {
  if (character.status.injury >= 3 || character.status.stress >= 4) {
    return "unavailable";
  }
  if (character.status.injury >= 2 || character.status.stress >= 3) {
    return "resting";
  }
  return "active";
}

export function applyCharacterUpdates(input: {
  characters: Character[];
  report: Report;
  selected_notes?: GuildmasterNote[];
}): Character[] {
  const notesByCharacterId = new Map<string, GuildmasterNote[]>();
  for (const note of input.selected_notes ?? []) {
    const existing = notesByCharacterId.get(note.character_id) ?? [];
    existing.push(note);
    notesByCharacterId.set(note.character_id, existing);
  }

  return input.characters.map((character) => {
    const update = input.report.state_updates?.character_updates?.find(
      (candidate) => candidate.character_id === character.character_id
    );
    const nextCharacter: Character = {
      ...character,
      status: {
        ...character.status,
        injury: Math.max(0, character.status.injury + (update?.injury_delta ?? 0)),
        stress: Math.max(0, character.status.stress + (update?.stress_delta ?? 0)),
      },
      guildmaster_note_log: [
        ...(character.guildmaster_note_log ?? []),
        ...(notesByCharacterId.get(character.character_id) ?? []),
      ],
    };

    nextCharacter.status.availability = nextAvailability(nextCharacter);
    nextCharacter.status.recovery_note =
      nextCharacter.status.availability !== "active"
        ? "次回前に休養か軽任務へ回したい。"
        : undefined;

    return nextCharacter;
  });
}

export function appendGuildmasterNotes(characters: Character[], selectedNotes: GuildmasterNote[]): Character[] {
  const notesByCharacterId = new Map<string, GuildmasterNote[]>();
  for (const note of selectedNotes) {
    const existing = notesByCharacterId.get(note.character_id) ?? [];
    existing.push(note);
    notesByCharacterId.set(note.character_id, existing);
  }

  return characters.map((character) => ({
    ...character,
    guildmaster_note_log: [
      ...(character.guildmaster_note_log ?? []),
      ...(notesByCharacterId.get(character.character_id) ?? []),
    ],
  }));
}
