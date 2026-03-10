import "./styles.css";
import type {
  Character,
  Dispatch,
  Facility,
  Mission,
  Report,
} from "../domain";
import { createCyberpunkMinimalDataset } from "../data/cyberpunk_minimal";
import { buildManualDispatch } from "../core/mission_flow/buildDispatch";
import { buildPreMissionConversation } from "../core/mission_flow/buildPreMissionConversation";
import { buildReport } from "../core/mission_flow/buildReport";
import { resolveMission } from "../core/mission_flow/resolveMission";
import { buildNoteCandidates } from "../core/note_generation/buildNoteCandidates";
import {
  materializeGuildmasterNotes,
  type NoteSelection,
} from "../core/note_generation/selectGuildmasterNotes";
import { appendGuildmasterNotes, applyCharacterUpdates } from "../core/state_update/applyCharacterUpdates";
import { decayLingerFlags } from "../core/state_update/decayLingerFlags";
import { applyRelationshipUpdates } from "../core/state_update/applyRelationshipUpdates";
import { applyFactionUpdates } from "../core/state_update/applyFactionUpdates";
import { applyBaseUpdates } from "../core/state_update/applyBaseUpdates";
import { buildSnapshot } from "../core/mission_flow/buildSnapshot";
import { createStorageV2Data } from "../storage_v2/schema";
import { stateToStorageData, storageDataToState } from "../storage_v2/transaction";
import type { MissionCycleState, NoteCandidateSet, PreMissionConversation } from "../core/mission_flow/types";

const STORAGE_KEY = "isdf_guild_web_state_v1";

type PreparedCycle = {
  mission: Mission;
  dispatch: Dispatch;
  report: Report;
  pre_mission_conversation: PreMissionConversation[];
  note_candidates: NoteCandidateSet[];
  characters_after_report: Character[];
};

type UiState = {
  state: MissionCycleState;
  selectedMissionId: Mission["mission_id"] | null;
  selectedCharacterIds: Character["character_id"][];
  selectedFacilityIds: Facility["facility_id"][];
  preparedCycle: PreparedCycle | null;
  selectedNotes: Record<string, string>;
  userNotes: Record<string, string>;
};

function initializeState(): MissionCycleState {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return storageDataToState(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const dataset = createCyberpunkMinimalDataset({ include_staff: true });
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

function saveState(state: MissionCycleState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStorageData(state)));
}

function openMissions(state: MissionCycleState): Mission[] {
  return state.missions.filter((mission) => (mission.state?.status ?? "open") === "open");
}

function createDefaultUiState(): UiState {
  const state = initializeState();
  const firstMission = openMissions(state)[0] ?? null;
  return {
    state,
    selectedMissionId: firstMission?.mission_id ?? null,
    selectedCharacterIds: [],
    selectedFacilityIds: [...(state.base.facility_ids ?? [])],
    preparedCycle: null,
    selectedNotes: {},
    userNotes: {},
  };
}

const uiState: UiState = createDefaultUiState();
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("#app が見つかりません");
}

const appRoot = app;

function getSelectedMission(): Mission | null {
  return uiState.state.missions.find((mission) => mission.mission_id === uiState.selectedMissionId) ?? null;
}

function getAvailableCharacters(): Character[] {
  return uiState.state.characters.filter((character) => character.status.availability !== "unavailable");
}

function toggleCharacter(characterId: Character["character_id"]): void {
  const selectedMission = getSelectedMission();
  if (!selectedMission) return;
  const maxPartySize = selectedMission.participants?.max_party_size ?? 3;
  const exists = uiState.selectedCharacterIds.includes(characterId);
  if (exists) {
    uiState.selectedCharacterIds = uiState.selectedCharacterIds.filter((id) => id !== characterId);
  } else if (uiState.selectedCharacterIds.length < maxPartySize) {
    uiState.selectedCharacterIds = [...uiState.selectedCharacterIds, characterId];
  }
  uiState.preparedCycle = null;
  render();
}

function toggleFacility(facilityId: Facility["facility_id"]): void {
  const exists = uiState.selectedFacilityIds.includes(facilityId);
  uiState.selectedFacilityIds = exists
    ? uiState.selectedFacilityIds.filter((id) => id !== facilityId)
    : [...uiState.selectedFacilityIds, facilityId];
  uiState.preparedCycle = null;
  render();
}

function selectMission(missionId: Mission["mission_id"]): void {
  uiState.selectedMissionId = missionId;
  uiState.selectedCharacterIds = [];
  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  render();
}

function prepareCycle(): void {
  const mission = getSelectedMission();
  if (!mission) return;
  if (uiState.selectedCharacterIds.length === 0) {
    window.alert("少なくとも1人は選択してください。");
    return;
  }

  const sequence = uiState.state.dispatches.length + 1;
  const decayedCharacters = decayLingerFlags(uiState.state.characters);
  const dispatch = buildManualDispatch({
    mission,
    characters: decayedCharacters,
    staff: uiState.state.staff,
    base: uiState.state.base,
    facilities: uiState.state.facilities,
    sequence,
    selected_character_ids: uiState.selectedCharacterIds,
    selected_facility_ids: uiState.selectedFacilityIds,
  });
  const assignedCharacters = decayedCharacters.filter((character) =>
    dispatch.assigned_character_ids.includes(character.character_id)
  );
  const preMissionConversation =
    uiState.state.staff.length === 0
      ? buildPreMissionConversation({
          mission,
          characters: assignedCharacters,
        })
      : [];
  const resolution = resolveMission({
    mission,
    dispatch,
    characters: decayedCharacters,
    factions: uiState.state.factions,
  });
  const report = buildReport({
    mission,
    dispatch,
    resolution,
    sequence,
  });
  const charactersAfterReport = applyRelationshipUpdates({
    characters: applyCharacterUpdates({
      characters: decayedCharacters,
      report,
    }),
    report,
  });
  const noteCandidates = buildNoteCandidates({
    characters: charactersAfterReport,
    report,
  });

  uiState.preparedCycle = {
    mission,
    dispatch,
    report,
    pre_mission_conversation: preMissionConversation,
    note_candidates: noteCandidates,
    characters_after_report: charactersAfterReport,
  };
  uiState.selectedNotes = Object.fromEntries(
    noteCandidates.map((set) => [set.note_candidate_set_id, set.candidates[0]?.candidate_id ?? ""])
  );
  render();
}

function confirmCycle(): void {
  if (!uiState.preparedCycle) return;

  const selections: NoteSelection[] = uiState.preparedCycle.note_candidates
    .map((candidateSet) => ({
      note_candidate_set_id: candidateSet.note_candidate_set_id,
      candidate_id: uiState.selectedNotes[candidateSet.note_candidate_set_id] as `note_candidate_${string}`,
      user_note: uiState.userNotes[candidateSet.note_candidate_set_id],
    }))
    .filter((selection) => selection.candidate_id);

  const selectedNotes = materializeGuildmasterNotes({
    note_candidate_sets: uiState.preparedCycle.note_candidates,
    selections,
    sequence: uiState.state.dispatches.length + 1,
  });

  const factions = applyFactionUpdates({
    factions: uiState.state.factions,
    report: uiState.preparedCycle.report,
  });
  const base = applyBaseUpdates({
    base: uiState.state.base,
    report: uiState.preparedCycle.report,
  });
  const characters = appendGuildmasterNotes(uiState.preparedCycle.characters_after_report, selectedNotes);
  const snapshot = buildSnapshot({
    base,
    characters,
    factions,
    dispatch: uiState.preparedCycle.dispatch,
    report: uiState.preparedCycle.report,
    sequence: uiState.state.dispatches.length + 1,
  });

  const missions = uiState.state.missions.map((mission) =>
    mission.mission_id === uiState.preparedCycle?.mission.mission_id
      ? {
          ...mission,
          state: {
            status: "closed" as const,
            accepted: true,
            result: uiState.preparedCycle.report.state_updates?.mission_result ?? null,
          },
        }
      : mission
  );

  uiState.state = {
    ...uiState.state,
    characters,
    factions,
    base,
    missions,
    dispatches: [...uiState.state.dispatches, uiState.preparedCycle.dispatch],
    reports: [...uiState.state.reports, uiState.preparedCycle.report],
    snapshots: [...uiState.state.snapshots, snapshot],
    guildmaster_notes: [...uiState.state.guildmaster_notes, ...selectedNotes],
  };
  saveState(uiState.state);

  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  uiState.selectedCharacterIds = [];
  uiState.selectedMissionId = openMissions(uiState.state)[0]?.mission_id ?? null;
  render();
}

function resetGame(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  const reset = createDefaultUiState();
  uiState.state = reset.state;
  uiState.selectedMissionId = reset.selectedMissionId;
  uiState.selectedCharacterIds = reset.selectedCharacterIds;
  uiState.selectedFacilityIds = reset.selectedFacilityIds;
  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  render();
}

function tagList(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) {
    return "";
  }
  return tags.map((tag) => `<span class="mini-tag">${tag}</span>`).join("");
}

function renderMissionList(): string {
  const missions = openMissions(uiState.state);
  if (missions.length === 0) {
    return `<p class="muted">現在 open な依頼はありません。リセットして再開してください。</p>`;
  }

  return missions
    .map((mission) => {
      const selected = mission.mission_id === uiState.selectedMissionId ? "selected" : "";
      const clientName =
        typeof mission.client === "string" ? mission.client : mission.client.name;
      return `
        <button class="mission-card ${selected}" data-action="select-mission" data-mission-id="${mission.mission_id}">
          <div class="panel-head">
            <h3>${mission.display_name ?? mission.mission_id}</h3>
            <span class="status-chip">${mission.category_display ?? mission.category}</span>
          </div>
          <p>${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}</p>
          <div class="inline-meta small muted">
            <span>依頼人: ${clientName}</span>
            <span>難度: ${typeof mission.difficulty === "number" ? mission.difficulty : mission.difficulty.target_number}</span>
          </div>
          <div>${tagList(mission.tags)}</div>
        </button>
      `;
    })
    .join("");
}

function renderCharacters(): string {
  const selectedMission = getSelectedMission();
  const maxPartySize = selectedMission?.participants?.max_party_size ?? 3;
  return getAvailableCharacters()
    .map((character) => {
      const checked = uiState.selectedCharacterIds.includes(character.character_id);
      return `
        <button class="character-card ${checked ? "selected" : ""}" data-action="toggle-character" data-character-id="${character.character_id}">
          <div class="panel-head">
            <h3>${character.name}</h3>
            <span class="tag">${character.role}</span>
          </div>
          <p>${character.public_digest}</p>
          <div class="small muted">負傷 ${character.status.injury} / ストレス ${character.status.stress} / ${character.status.availability}</div>
          <div class="small muted">上限 ${maxPartySize} 人 / 選択中 ${uiState.selectedCharacterIds.length} 人</div>
        </button>
      `;
    })
    .join("");
}

function renderFacilities(): string {
  return uiState.state.facilities
    .map((facility) => {
      const checked = uiState.selectedFacilityIds.includes(facility.facility_id);
      return `
        <button class="character-card ${checked ? "selected" : ""}" data-action="toggle-facility" data-facility-id="${facility.facility_id}">
          <div class="panel-head">
            <h3>${facility.name}</h3>
            <span class="tag">${facility.category}</span>
          </div>
          <p>${facility.summary}</p>
          <div>${tagList(facility.effect_tags)}</div>
        </button>
      `;
    })
    .join("");
}

function renderPreparedCycle(): string {
  if (!uiState.preparedCycle) {
    return `<p class="muted">依頼と編成を決めて「編成を確定して判定」してください。</p>`;
  }

  const dispatch = uiState.preparedCycle.dispatch;
  const report = uiState.preparedCycle.report;
  const noteBlocks = uiState.preparedCycle.note_candidates
    .map((candidateSet) => {
      const character = uiState.state.characters.find((item) => item.character_id === candidateSet.character_id);
      const radios = candidateSet.candidates
        .map((candidate) => {
          const checked = uiState.selectedNotes[candidateSet.note_candidate_set_id] === candidate.candidate_id ? "checked" : "";
          return `
            <label class="note-card ${checked ? "selected" : ""}">
              <span class="radio-row">
                <input type="radio" name="${candidateSet.note_candidate_set_id}" value="${candidate.candidate_id}" data-action="select-note" data-set-id="${candidateSet.note_candidate_set_id}" ${checked} />
                <span>
                  <strong>${candidate.text}</strong>
                  <span class="small muted">${candidate.intent_tags.join(", ")}</span>
                </span>
              </span>
            </label>
          `;
        })
        .join("");

      return `
        <div class="panel">
          <h4>${character?.name ?? candidateSet.character_id} のメモ候補</h4>
          <p class="small muted">${candidateSet.reason_summary}</p>
          <div class="card-grid">${radios}</div>
          <textarea class="textarea" data-action="note-text" data-set-id="${candidateSet.note_candidate_set_id}" placeholder="補足メモ（任意）">${uiState.userNotes[candidateSet.note_candidate_set_id] ?? ""}</textarea>
        </div>
      `;
    })
    .join("");

  return `
    <div class="summary">
      <h3>出発前</h3>
      ${dispatch.risk_view?.staff_lines?.length ? `<div class="line-list">${dispatch.risk_view.staff_lines.map((line) => `<div class="log-entry">${line}</div>`).join("")}</div>` : ""}
      ${uiState.preparedCycle.pre_mission_conversation.length ? `<div class="line-list">${uiState.preparedCycle.pre_mission_conversation.map((line) => `<div class="log-entry">${line.speaker_name}「${line.text}」</div>`).join("")}</div>` : ""}
      <div class="small muted">編成: ${dispatch.assigned_character_ids.join(", ")}</div>
      <div class="small muted">設備: ${dispatch.base_state?.selected_facility_ids.join(", ") ?? "なし"}</div>
    </div>
    <div class="summary">
      <h3>日報</h3>
      <p>${report.text}</p>
      <div class="line-list">${(report.summary_lines ?? []).map((line) => `<div class="log-entry">${line}</div>`).join("")}</div>
    </div>
    ${noteBlocks}
    <div class="button-row">
      <button data-action="confirm-cycle">この結果を保存する</button>
    </div>
  `;
}

function renderHistory(): string {
  if (uiState.state.reports.length === 0) {
    return `<p class="muted">まだ記録はありません。</p>`;
  }

  return uiState.state.reports
    .slice()
    .reverse()
    .map((report, index) => {
      const notes = uiState.state.guildmaster_notes.filter((note) => note.source_id === report.report_id);
      return `
        <div class="log-entry">
          <div class="panel-head">
            <strong>${uiState.state.dispatches.length - index}回目</strong>
            <span class="tag">${report.state_updates?.mission_result ?? "unknown"}</span>
          </div>
          <p>${report.text}</p>
          <div class="small muted">${notes.map((note) => note.selected_text).join(" / ")}</div>
        </div>
      `;
    })
    .join("");
}

function render(): void {
  const mission = getSelectedMission();
  const openMissionCount = openMissions(uiState.state).length;

  appRoot.innerHTML = `
    <div class="shell">
      <section class="hero">
        <div class="hero-top">
          <div>
            <h1>${uiState.state.world_pack.name}</h1>
            <p>${uiState.state.world_pack.one_liner}</p>
          </div>
          <div class="button-row">
            <button class="secondary" data-action="reset-game">リセット</button>
          </div>
        </div>
        <div class="hero-grid">
          <div class="panel">
            <h3>現在地</h3>
            <p>${uiState.state.base.summary}</p>
            <div class="small muted">open 依頼 ${openMissionCount} 件 / 日報 ${uiState.state.reports.length} 件</div>
          </div>
          <div class="panel">
            <h3>空気</h3>
            <p>${uiState.state.base.state_values?.atmosphere ?? "unknown"} / external ${uiState.state.base.state_values?.external_attention ?? "unknown"}</p>
            <div>${tagList(uiState.state.base.active_issue_tags)}</div>
          </div>
        </div>
      </section>

      <section class="two-col">
        <div class="panel">
          <div class="panel-head">
            <h2>依頼</h2>
            <span class="status-chip">${mission?.display_name ?? "未選択"}</span>
          </div>
          <div class="card-grid">${renderMissionList()}</div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h2>操作</h2>
            <span class="muted small">人選と設備を選んで判定</span>
          </div>
          <div class="button-row">
            <button data-action="prepare-cycle" ${mission ? "" : "disabled"}>編成を確定して判定</button>
          </div>
          <p class="small muted">依頼を選んだあと、キャラクターと設備を選択してください。</p>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>人選</h2>
          <span class="muted small">${mission?.participants?.max_party_size ?? 3}人まで</span>
        </div>
        <div class="character-grid">${renderCharacters()}</div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>使用設備</h2>
          <span class="muted small">複数選択可</span>
        </div>
        <div class="character-grid">${renderFacilities()}</div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>結果</h2>
          <span class="muted small">メモを選んで保存</span>
        </div>
        ${renderPreparedCycle()}
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>履歴</h2>
          <span class="muted small">保存済みの依頼結果</span>
        </div>
        <div class="history">${renderHistory()}</div>
      </section>
    </div>
  `;

  appRoot.querySelectorAll<HTMLElement>("[data-action='select-mission']").forEach((button) => {
    button.addEventListener("click", () => selectMission(button.dataset.missionId as Mission["mission_id"]));
  });
  appRoot.querySelectorAll<HTMLElement>("[data-action='toggle-character']").forEach((button) => {
    button.addEventListener("click", () => toggleCharacter(button.dataset.characterId as Character["character_id"]));
  });
  appRoot.querySelectorAll<HTMLElement>("[data-action='toggle-facility']").forEach((button) => {
    button.addEventListener("click", () => toggleFacility(button.dataset.facilityId as Facility["facility_id"]));
  });
  appRoot.querySelector("[data-action='prepare-cycle']")?.addEventListener("click", prepareCycle);
  appRoot.querySelector("[data-action='confirm-cycle']")?.addEventListener("click", confirmCycle);
  appRoot.querySelector("[data-action='reset-game']")?.addEventListener("click", resetGame);

  appRoot.querySelectorAll<HTMLInputElement>("[data-action='select-note']").forEach((radio) => {
    radio.addEventListener("change", () => {
      uiState.selectedNotes[radio.dataset.setId ?? ""] = radio.value;
    });
  });
  appRoot.querySelectorAll<HTMLTextAreaElement>("[data-action='note-text']").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      uiState.userNotes[textarea.dataset.setId ?? ""] = textarea.value;
    });
  });
}

render();
