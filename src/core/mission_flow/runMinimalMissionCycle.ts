import type { MissionCycleState } from "./types";
import type { MissionCycleResult } from "./types";
import { buildDispatch } from "./buildDispatch";
import { buildReport } from "./buildReport";
import { buildSnapshot } from "./buildSnapshot";
import { resolveMission } from "./resolveMission";
import { selectMission } from "./selectMission";
import { buildNoteCandidates } from "../note_generation/buildNoteCandidates";
import { selectGuildmasterNotes } from "../note_generation/selectGuildmasterNotes";
import { applyBaseUpdates } from "../state_update/applyBaseUpdates";
import { appendGuildmasterNotes, applyCharacterUpdates } from "../state_update/applyCharacterUpdates";
import { decayLingerFlags } from "../state_update/decayLingerFlags";
import { applyFactionUpdates } from "../state_update/applyFactionUpdates";
import { applyRelationshipUpdates } from "../state_update/applyRelationshipUpdates";
import { buildPreMissionConversation } from "./buildPreMissionConversation";

export function runMinimalMissionCycle(input: {
  state: MissionCycleState;
  mission_id?: `mission_${string}`;
  random?: () => number;
}): MissionCycleResult {
  const sequenceBase = input.state.dispatches.length + 1;
  const decayedCharacters = decayLingerFlags(input.state.characters);
  const selectedMission = selectMission(input.state.missions, input.mission_id);
  const dispatch = buildDispatch({
    mission: selectedMission,
    characters: decayedCharacters,
    staff: input.state.staff,
    base: input.state.base,
    facilities: input.state.facilities,
    sequence: sequenceBase,
  });
  const assignedCharacters = decayedCharacters.filter((character) =>
    dispatch.assigned_character_ids.includes(character.character_id)
  );
  const preMissionConversation =
    input.state.staff.length === 0
      ? buildPreMissionConversation({
          mission: selectedMission,
          characters: assignedCharacters,
        })
      : [];
  const resolution = resolveMission({
    mission: selectedMission,
    dispatch,
    characters: decayedCharacters,
    factions: input.state.factions,
    random: input.random,
    staff_comment: dispatch.guildmaster_view?.short_impression,
  });
  const report = buildReport({
    mission: selectedMission,
    dispatch,
    resolution,
    sequence: sequenceBase,
  });
  const charactersWithState = applyCharacterUpdates({
    characters: decayedCharacters,
    report,
  });
  const charactersWithRelationships = applyRelationshipUpdates({
    characters: charactersWithState,
    report,
  });
  const noteCandidates = buildNoteCandidates({
    characters: charactersWithRelationships,
    report,
  });
  const selectedNotes = selectGuildmasterNotes({
    note_candidate_sets: noteCandidates,
    sequence: sequenceBase,
  });
  const charactersFinal = appendGuildmasterNotes(charactersWithRelationships, selectedNotes);
  const factions = applyFactionUpdates({
    factions: input.state.factions,
    report,
  });
  const base = applyBaseUpdates({
    base: input.state.base,
    report,
  });
  const snapshot = buildSnapshot({
    base,
    characters: charactersFinal,
    factions,
    dispatch,
    report,
    sequence: sequenceBase,
  });

  const missions = input.state.missions.map((mission) =>
    mission.mission_id === selectedMission.mission_id
      ? {
          ...mission,
          state: {
            status: "closed" as const,
            accepted: true,
            result: report.state_updates?.mission_result ?? null,
          },
        }
      : mission
  );

  return {
    selected_mission: selectedMission,
    dispatch,
    report,
    snapshot,
    pre_mission_conversation: preMissionConversation,
    note_candidates: noteCandidates,
    selected_notes: selectedNotes,
    next_state: {
      ...input.state,
      characters: charactersFinal,
      factions,
      base,
      missions,
      dispatches: [...input.state.dispatches, dispatch],
      reports: [...input.state.reports, report],
      snapshots: [...input.state.snapshots, snapshot],
      guildmaster_notes: [...input.state.guildmaster_notes, ...selectedNotes],
    },
  };
}
