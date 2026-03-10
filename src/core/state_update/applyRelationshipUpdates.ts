import type { Character, Report } from "../../domain";

export function applyRelationshipUpdates(input: {
  characters: Character[];
  report: Report;
}): Character[] {
  const affectedIds = new Set(input.report.state_updates?.character_updates?.map((update) => update.character_id) ?? []);
  const positive = input.report.state_updates?.mission_result === "great_success" || input.report.state_updates?.mission_result === "success";
  const delta = positive ? 1 : input.report.state_updates?.mission_result === "failure" ? -1 : 0;

  return input.characters.map((character) => {
    if (!affectedIds.has(character.character_id)) {
      return character;
    }

    const nextRelationships = [...(character.relationships ?? [])];
    const teammateIds = input.report.state_updates?.character_updates
      ?.map((update) => update.character_id)
      .filter((characterId) => characterId !== character.character_id) ?? [];

    for (const teammateId of teammateIds) {
      const existing = nextRelationships.find(
        (relationship) => relationship.target_type === "character" && relationship.target_id === teammateId
      );

      if (existing) {
        existing.score += delta;
        existing.tags = Array.from(new Set([...existing.tags, positive ? "共同任務" : "軋み"]));
      } else {
        nextRelationships.push({
          target_type: "character",
          target_id: teammateId,
          score: delta,
          tags: [positive ? "共同任務" : "軋み"],
        });
      }
    }

    return {
      ...character,
      relationships: nextRelationships,
    };
  });
}
