import { createCyberpunkMinimalDataset } from "../data/cyberpunk_minimal";
import { runMinimalMissionCycle } from "../core/mission_flow/runMinimalMissionCycle";
import { loadStorageV2FromFile, saveStorageV2ToFile } from "../storage_v2/fileSystem";
import { createStorageV2Data } from "../storage_v2/schema";
import { stateToStorageData, storageDataToState } from "../storage_v2/transaction";

function createFixedRandom(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    index += 1;
    return value;
  };
}

function createInitialState(includeStaff: boolean) {
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

function printCycle(label: string, result: ReturnType<typeof runMinimalMissionCycle>): void {
  console.log(`\n[${label}]`);
  console.log(`mission: ${result.selected_mission.display_name}`);
  console.log(`dispatch: ${result.dispatch.dispatch_id} -> ${result.dispatch.assigned_character_ids.join(", ")}`);
  console.log(`report: ${result.report.text}`);
  console.log(`snapshot: ${result.snapshot.summary}`);
  console.log(
    `notes: ${result.selected_notes.map((note) => `${note.character_id}:${note.selected_text}`).join(" / ")}`
  );
}

async function main(): Promise<void> {
  const storagePath = "/tmp/isdf_guild/cyberpunk_minimal_state.json";
  const stateWithStaff = createInitialState(true);

  const firstCycle = runMinimalMissionCycle({
    state: stateWithStaff,
    mission_id: "mission_0001",
    random: createFixedRandom([0.75, 0.75]),
  });
  printCycle("cycle_1", firstCycle);

  await saveStorageV2ToFile(storagePath, stateToStorageData(firstCycle.next_state));
  const reloaded = await loadStorageV2FromFile(storagePath);
  if (!reloaded) {
    throw new Error("保存後の reload に失敗しました");
  }

  const secondState = storageDataToState(reloaded);
  const secondCycle = runMinimalMissionCycle({
    state: secondState,
    mission_id: "mission_0002",
    random: createFixedRandom([0.45, 0.35]),
  });
  printCycle("cycle_2", secondCycle);

  const stateWithoutStaff = createInitialState(false);
  const thirdCycle = runMinimalMissionCycle({
    state: stateWithoutStaff,
    mission_id: "mission_0003",
    random: createFixedRandom([0.1, 0.15]),
  });
  printCycle("cycle_3_staffless", thirdCycle);

  console.log(`\nstorage_path: ${storagePath}`);
  console.log(
    `latest_availability: ${secondCycle.next_state.characters
      .map((character) => `${character.name}=${character.status.availability}`)
      .join(", ")}`
  );
}

void main();
