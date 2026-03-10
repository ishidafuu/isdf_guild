import type { Character, LingerFlag, Report } from "../../domain";

function createFlag(input: {
  flag: LingerFlag["flag"];
  source_mission_id?: Report["mission_id"];
  source_report_id: Report["report_id"];
  target_id?: Character["character_id"] | `faction_${string}`;
  intensity: LingerFlag["intensity"];
  remaining_cycles: number;
  visibility_hint: LingerFlag["visibility_hint"];
}): LingerFlag {
  return {
    flag: input.flag,
    source_mission_id: input.source_mission_id,
    source_report_id: input.source_report_id,
    target_id: input.target_id,
    intensity: input.intensity,
    remaining_cycles: input.remaining_cycles,
    visibility_hint: input.visibility_hint,
  };
}

function createRemainingCycles(character: Character, base: number): number {
  const neuroticism = character.big5?.neuroticism ?? 0;
  const conscientiousness = character.big5?.conscientiousness ?? 0;
  return Math.max(1, base + (neuroticism > 0 ? 1 : 0) + (conscientiousness > 1 ? 1 : 0));
}

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
    const currentLingerState = character.linger_state ?? {};
    const personalFlags = [...(currentLingerState.personal_flags ?? [])];
    const relationshipFlags = [...(currentLingerState.relationship_flags ?? [])];
    const characterUpdate = input.report.state_updates?.character_updates?.find(
      (update) => update.character_id === character.character_id
    );
    const missionResult = input.report.state_updates?.mission_result;

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

      const existingFlagEntry = relationshipFlags.find((entry) => entry.target_id === teammateId);
      const nextFlags = [...(existingFlagEntry?.flags ?? [])];

      if (missionResult === "failure") {
        nextFlags.push(
          createFlag({
            flag: "friction",
            source_mission_id: input.report.mission_id,
            source_report_id: input.report.report_id,
            target_id: teammateId,
            intensity: 1,
            remaining_cycles: createRemainingCycles(character, 2),
            visibility_hint: "dialogue",
          })
        );
      } else if (missionResult === "great_success") {
        nextFlags.push(
          createFlag({
            flag: "unexpected_fit",
            source_mission_id: input.report.mission_id,
            source_report_id: input.report.report_id,
            target_id: teammateId,
            intensity: 1,
            remaining_cycles: createRemainingCycles(character, 2),
            visibility_hint: "memo",
          })
        );
      }

      if (character.role === "support" && missionResult === "failure") {
        nextFlags.push(
          createFlag({
            flag: "protective_instinct",
            source_mission_id: input.report.mission_id,
            source_report_id: input.report.report_id,
            target_id: teammateId,
            intensity: 1,
            remaining_cycles: createRemainingCycles(character, 3),
            visibility_hint: "memo",
          })
        );
      }

      if (nextFlags.length > 0) {
        if (existingFlagEntry) {
          existingFlagEntry.flags = nextFlags;
        } else {
          relationshipFlags.push({
            target_id: teammateId,
            flags: nextFlags,
          });
        }
      }
    }

    if (characterUpdate?.injury_delta && character.role === "frontliner") {
      personalFlags.push(
        createFlag({
          flag: "overwork_risk",
          source_mission_id: input.report.mission_id,
          source_report_id: input.report.report_id,
          intensity: characterUpdate.injury_delta >= 2 ? 3 : 2,
          remaining_cycles: createRemainingCycles(character, 2),
          visibility_hint: "memo",
        })
      );
    }

    if (characterUpdate?.stress_delta && character.role === "negotiator" && missionResult !== "great_success") {
      personalFlags.push(
        createFlag({
          flag: "shaken_confidence",
          source_mission_id: input.report.mission_id,
          source_report_id: input.report.report_id,
          intensity: characterUpdate.stress_delta >= 2 ? 2 : 1,
          remaining_cycles: createRemainingCycles(character, 2),
          visibility_hint: "dialogue",
        })
      );
    }

    const factionUpdate = input.report.state_updates?.faction_updates?.[0];
    if (factionUpdate && factionUpdate.relation_delta < 0) {
      relationshipFlags.push({
        target_id: factionUpdate.faction_id,
        flags: [
          createFlag({
            flag: "client_distrust",
            source_mission_id: input.report.mission_id,
            source_report_id: input.report.report_id,
            target_id: factionUpdate.faction_id,
            intensity: Math.min(3, Math.abs(factionUpdate.relation_delta)) as LingerFlag["intensity"],
            remaining_cycles: createRemainingCycles(character, 2),
            visibility_hint: "dialogue",
          }),
        ],
      });
    }

    return {
      ...character,
      relationships: nextRelationships,
      linger_state: {
        personal_flags: personalFlags,
        relationship_flags: relationshipFlags,
      },
    };
  });
}
