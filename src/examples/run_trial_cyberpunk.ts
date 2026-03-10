import { createCyberpunkMinimalDataset } from "../data/cyberpunk_minimal";
import { runMinimalMissionCycle } from "../core/mission_flow/runMinimalMissionCycle";
import { createStorageV2Data } from "../storage_v2/schema";
import { storageDataToState } from "../storage_v2/transaction";

function fixedRandomForResult(result: "success" | "partial" | "failure"): () => number {
  if (result === "success") {
    return (() => {
      const values = [0.75, 0.55];
      let index = 0;
      return () => values[index++] ?? 0.55;
    })();
  }

  if (result === "partial") {
    return (() => {
      const values = [0.35, 0.45];
      let index = 0;
      return () => values[index++] ?? 0.45;
    })();
  }

  return (() => {
    const values = [0.05, 0.1];
    let index = 0;
    return () => values[index++] ?? 0.1;
  })();
}

function buildState(includeStaff: boolean) {
  const dataset = createCyberpunkMinimalDataset({ include_staff: includeStaff });
  return storageDataToState(
    createStorageV2Data({
      world_pack: dataset.world_pack,
      factions: dataset.factions,
      characters: dataset.characters,
      staff: dataset.staff,
      base: dataset.base,
      facilities: dataset.facilities,
      missions: dataset.missions,
    })
  );
}

const scenarios = [
  { label: "safe_with_staff", missionId: "mission_0001" as const, includeStaff: true, result: "success" as const },
  { label: "negotiation_with_staff", missionId: "mission_0002" as const, includeStaff: true, result: "partial" as const },
  { label: "danger_without_staff", missionId: "mission_0003" as const, includeStaff: false, result: "failure" as const },
];

for (const scenario of scenarios) {
  const state = buildState(scenario.includeStaff);
  const cycle = runMinimalMissionCycle({
    state,
    mission_id: scenario.missionId,
    random: fixedRandomForResult(scenario.result),
  });

  console.log(`\n[${scenario.label}]`);
  console.log(`result=${cycle.report.state_updates?.mission_result}`);
  if (cycle.dispatch.risk_view?.staff_lines?.length) {
    console.log(`staff=${cycle.dispatch.risk_view.staff_lines.join(" / ")}`);
  }
  if (cycle.pre_mission_conversation.length > 0) {
    console.log(
      `party=${cycle.pre_mission_conversation
        .map((line) => `${line.speaker_name}:${line.text}`)
        .join(" / ")}`
    );
  }
  console.log(`report=${cycle.report.text}`);
  console.log(
    `carry_over=${cycle.snapshot.character_states
      .map((character) => `${character.character_id}:${character.injury}/${character.stress}/${character.availability}`)
      .join(", ")}`
  );
  console.log(`notes=${cycle.selected_notes.map((note) => note.selected_text).join(" | ")}`);
}
