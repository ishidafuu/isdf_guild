import "./styles.css";
import type { Character, Dispatch, Mission, Report, StaffCharacter } from "../domain";
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

type SceneMode = "briefing" | "casting" | "aftermath";

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
  scene: SceneMode;
  selectedMissionId: Mission["mission_id"] | null;
  selectedCharacterIds: Character["character_id"][];
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
    scene: "briefing",
    selectedMissionId: firstMission?.mission_id ?? null,
    selectedCharacterIds: [],
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

function getAdvisor(): StaffCharacter | null {
  return uiState.state.staff[0] ?? null;
}

function getOpenMissions(): Mission[] {
  return openMissions(uiState.state);
}

function getSelectedMission(): Mission | null {
  return uiState.state.missions.find((mission) => mission.mission_id === uiState.selectedMissionId) ?? null;
}

function getAvailableCharacters(): Character[] {
  return uiState.state.characters.filter((character) => character.status.availability !== "unavailable");
}

function getMissionClientName(mission: Mission): string {
  return typeof mission.client === "string" ? mission.client : mission.client.name;
}

function getMissionDifficulty(mission: Mission): number {
  return typeof mission.difficulty === "number" ? mission.difficulty : mission.difficulty.target_number;
}

function cycleMission(direction: 1 | -1): void {
  const missions = getOpenMissions();
  if (missions.length === 0) return;
  const currentIndex = missions.findIndex((mission) => mission.mission_id === uiState.selectedMissionId);
  const baseIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (baseIndex + direction + missions.length) % missions.length;
  uiState.selectedMissionId = missions[nextIndex]?.mission_id ?? null;
  uiState.selectedCharacterIds = [];
  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  uiState.scene = "briefing";
  render();
}

function enterCasting(): void {
  if (!getSelectedMission()) return;
  uiState.scene = "casting";
  uiState.preparedCycle = null;
  render();
}

function returnToBriefing(): void {
  uiState.scene = "briefing";
  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  render();
}

function toggleCharacter(characterId: Character["character_id"]): void {
  const mission = getSelectedMission();
  if (!mission) return;

  const maxPartySize = mission.participants?.max_party_size ?? 3;
  const exists = uiState.selectedCharacterIds.includes(characterId);
  if (exists) {
    uiState.selectedCharacterIds = uiState.selectedCharacterIds.filter((id) => id !== characterId);
  } else if (uiState.selectedCharacterIds.length < maxPartySize) {
    uiState.selectedCharacterIds = [...uiState.selectedCharacterIds, characterId];
  }

  uiState.preparedCycle = null;
  render();
}

function resetGame(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  const reset = createDefaultUiState();
  uiState.state = reset.state;
  uiState.scene = reset.scene;
  uiState.selectedMissionId = reset.selectedMissionId;
  uiState.selectedCharacterIds = reset.selectedCharacterIds;
  uiState.preparedCycle = reset.preparedCycle;
  uiState.selectedNotes = reset.selectedNotes;
  uiState.userNotes = reset.userNotes;
  render();
}

function prepareCycle(): void {
  const mission = getSelectedMission();
  if (!mission) return;
  if (uiState.selectedCharacterIds.length === 0) {
    window.alert("まず何人かに声をかけてください。");
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
    selected_facility_ids: uiState.state.base.facility_ids ?? [],
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
  uiState.scene = "aftermath";
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
  uiState.selectedMissionId = getOpenMissions()[0]?.mission_id ?? null;
  uiState.scene = "briefing";
  render();
}

function getRecentNotes(limit = 3): string[] {
  return uiState.state.guildmaster_notes
    .slice(-limit)
    .reverse()
    .map((note) => note.selected_text);
}

function getRecentReports(limit = 3): Report[] {
  return uiState.state.reports.slice(-limit).reverse();
}

function getMissionLead(mission: Mission): string {
  if (mission.category === "delivery") {
    return "夜明け前に線を抜く。静かだが、止まると面倒になる類いだ。";
  }
  if (mission.category === "negotiation") {
    return "刃物より先に感情が飛ぶ。誰を前に出すかで現場の空気が変わる。";
  }
  return "企業区画だ。うまくやっても、何かしらは残ると思っておいた方がいい。";
}

function getMissionShadow(mission: Mission): string {
  if (mission.category === "delivery") {
    return "納期は短い。遅らせるほど検問が厚くなる。";
  }
  if (mission.category === "negotiation") {
    return "片方を立てすぎると、もう片方が後で噛む。";
  }
  return "依頼人も全部は見せていない。報酬だけ見て拾う仕事じゃない。";
}

function getCharacterReaction(character: Character, mission: Mission): string {
  if (mission.category === "delivery" && character.role === "frontliner") {
    return "短くうなずく。危険な搬送だとわかっていても、断る顔はしない。";
  }
  if (mission.category === "negotiation" && character.role === "negotiator") {
    return "口元だけで笑う。面倒な仲裁ほど、自分の出番だと知っている顔だ。";
  }
  if (mission.category === "recovery" && character.role === "engineer") {
    return "端末を閉じる音が少し強い。企業絡みだと機嫌は隠しきれない。";
  }
  if (character.status.stress >= 2) {
    return "返事はするが、目の下の色は薄くない。少し休ませる案も頭をよぎる。";
  }
  return `${character.private_dossier?.speech_rule ?? character.public_digest}`;
}

function renderSceneLines(lines: string[]): string {
  return lines.map((line) => `<p class="story-line">${line}</p>`).join("");
}

function renderDialogueLine(speaker: string, text: string): string {
  return `<p class="story-line dialogue"><span class="speaker">${speaker}</span>「${text}」</p>`;
}

function renderBriefingScene(mission: Mission, advisor: StaffCharacter | null): string {
  const alternatives = getOpenMissions().filter((entry) => entry.mission_id !== mission.mission_id);
  const recentNotes = getRecentNotes(1);
  const lines = [
    `${uiState.state.base.summary}。換気扇の音が低く回り、夜勤明けの湿気がまだ部屋に残っている。`,
    advisor
      ? `${advisor.name}は帳面の端を指で弾き、端末に積まれた案件のうち一件だけをこちらへ寄せた。`
      : "古い端末の通知だけが、今日の仕事の気配を告げている。",
    `表に出てきたのは「${mission.display_name}」。依頼人は${getMissionClientName(mission)}、難度は${getMissionDifficulty(mission)}。`,
  ];

  return `
    <div class="story-card">
      <div class="scene-label">朝の机</div>
      <h2>${mission.display_name}</h2>
      ${renderSceneLines(lines)}
      ${
        advisor
          ? renderDialogueLine(advisor.name, getMissionLead(mission))
          : ""
      }
      <p class="story-line muted-line">${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}</p>
      ${
        alternatives.length > 0
          ? `<div class="scene-note">ほかにも ${alternatives.length} 件、保留の案件がある。${alternatives[0]?.display_name ?? ""} もまだ残っている。</div>`
          : ""
      }
      ${
        recentNotes.length > 0
          ? `<div class="scene-note">昨夜のメモ: ${recentNotes[0]}</div>`
          : ""
      }
    </div>
  `;
}

function renderCastingScene(mission: Mission, advisor: StaffCharacter | null): string {
  const maxPartySize = mission.participants?.max_party_size ?? 3;
  const selectedCharacters = getAvailableCharacters().filter((character) =>
    uiState.selectedCharacterIds.includes(character.character_id)
  );

  return `
    <div class="story-card">
      <div class="scene-label">声をかける</div>
      <h2>${mission.display_name} の段取り</h2>
      <p class="story-line">依頼の輪郭は見えた。ここからは、誰にこの仕事を持たせるかだ。</p>
      ${advisor ? renderDialogueLine(advisor.name, getMissionShadow(mission)) : ""}
      <p class="story-line muted-line">選べるのは ${maxPartySize} 人まで。設備の段取りは裏でミレイが通す。</p>
      <div class="scene-note">いま声をかけた顔ぶれ: ${selectedCharacters.length > 0 ? selectedCharacters.map((character) => character.name).join(" / ") : "まだ誰も呼んでいない"}</div>
    </div>
  `;
}

function renderAftermathScene(preparedCycle: PreparedCycle, advisor: StaffCharacter | null): string {
  const result = preparedCycle.report.state_updates?.mission_result ?? "不明";
  const returnLines = [
    `数時間後、扉が開く。戻ってきた空気は「${result}」の顔をしている。`,
    preparedCycle.report.text,
    ...(preparedCycle.report.summary_lines ?? []),
  ];

  return `
    <div class="story-card">
      <div class="scene-label">帰還後</div>
      <h2>${preparedCycle.mission.display_name}</h2>
      ${renderSceneLines(returnLines)}
      ${
        preparedCycle.dispatch.risk_view?.staff_lines?.length
          ? `<div class="line-stack">${preparedCycle.dispatch.risk_view.staff_lines
              .map((line) => `<div class="echo-line">${line}</div>`)
              .join("")}</div>`
          : ""
      }
      ${
        !advisor && preparedCycle.pre_mission_conversation.length > 0
          ? `<div class="line-stack">${preparedCycle.pre_mission_conversation
              .map((line) => `<div class="echo-line">${line.speaker_name}「${line.text}」</div>`)
              .join("")}</div>`
          : ""
      }
    </div>
  `;
}

function renderRoster(mission: Mission): string {
  const maxPartySize = mission.participants?.max_party_size ?? 3;
  return getAvailableCharacters()
    .map((character) => {
      const selected = uiState.selectedCharacterIds.includes(character.character_id);
      return `
        <button class="choice-card ${selected ? "selected" : ""}" data-action="toggle-character" data-character-id="${character.character_id}">
          <div class="choice-head">
            <strong>${character.name}</strong>
            <span class="tag">${character.role}</span>
          </div>
          <p>${selected ? "声をかけた。" : "まだ呼んでいない。"} ${getCharacterReaction(character, mission)}</p>
          <div class="small muted">負傷 ${character.status.injury} / ストレス ${character.status.stress} / 上限 ${maxPartySize} 人</div>
        </button>
      `;
    })
    .join("");
}

function renderNoteSelection(preparedCycle: PreparedCycle): string {
  return preparedCycle.note_candidates
    .map((candidateSet) => {
      const character = uiState.state.characters.find((item) => item.character_id === candidateSet.character_id);
      const choices = candidateSet.candidates
        .map((candidate) => {
          const checked = uiState.selectedNotes[candidateSet.note_candidate_set_id] === candidate.candidate_id ? "checked" : "";
          return `
            <label class="note-option ${checked ? "selected" : ""}">
              <input type="radio" name="${candidateSet.note_candidate_set_id}" value="${candidate.candidate_id}" data-action="select-note" data-set-id="${candidateSet.note_candidate_set_id}" ${checked} />
              <span>${candidate.text}</span>
            </label>
          `;
        })
        .join("");

      return `
        <section class="note-block">
          <div class="scene-note strong">${character?.name ?? candidateSet.character_id} を見た印象</div>
          <p class="small muted">${candidateSet.reason_summary}</p>
          <div class="choice-stack">${choices}</div>
          <textarea class="textarea" data-action="note-text" data-set-id="${candidateSet.note_candidate_set_id}" placeholder="補足を短く残す">${uiState.userNotes[candidateSet.note_candidate_set_id] ?? ""}</textarea>
        </section>
      `;
    })
    .join("");
}

function renderSidebar(mission: Mission | null, advisor: StaffCharacter | null): string {
  const history = getRecentReports(3)
    .map((report) => `<div class="archive-entry"><strong>${report.state_updates?.mission_result ?? "記録"}</strong><p>${report.text}</p></div>`)
    .join("");
  const otherMissions = getOpenMissions()
    .filter((entry) => entry.mission_id !== mission?.mission_id)
    .slice(0, 2)
    .map((entry) => `<div class="archive-entry"><strong>${entry.display_name}</strong><p>${getMissionShadow(entry)}</p></div>`)
    .join("");

  return `
    <aside class="sidebar">
      <section class="sidebar-panel">
        <div class="scene-label">案内役</div>
        <h3>${advisor?.name ?? "記録端末"}</h3>
        <p>${advisor?.public_digest ?? "今日は人の気配が薄い。"}</p>
        ${
          advisor
            ? `<p class="muted small">${advisor.private_dossier?.speech_rule}</p>`
            : ""
        }
      </section>
      ${
        mission
          ? `<section class="sidebar-panel">
              <div class="scene-label">今日の案件</div>
              <h3>${mission.display_name}</h3>
              <p>${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}</p>
              <div class="small muted">依頼人: ${getMissionClientName(mission)} / 難度 ${getMissionDifficulty(mission)}</div>
            </section>`
          : ""
      }
      ${
        otherMissions
          ? `<section class="sidebar-panel">
              <div class="scene-label">脇にある話</div>
              ${otherMissions}
            </section>`
          : ""
      }
      <section class="sidebar-panel">
        <div class="scene-label">記録</div>
        ${history || `<p class="muted">まだ何も残っていない。</p>`}
      </section>
    </aside>
  `;
}

function renderActions(mission: Mission | null): string {
  if (!mission) {
    return `
      <div class="action-row">
        <button class="secondary" data-action="reset-game">リセット</button>
      </div>
    `;
  }

  if (uiState.scene === "briefing") {
    return `
      <div class="action-row">
        <button data-action="enter-casting">この件の段取りを詰める</button>
        <button class="secondary" data-action="next-mission">別の案件を聞く</button>
        <button class="secondary" data-action="reset-game">リセット</button>
      </div>
    `;
  }

  if (uiState.scene === "casting") {
    return `
      <div class="action-row">
        <button data-action="prepare-cycle">この顔ぶれで送り出す</button>
        <button class="secondary" data-action="back-to-briefing">机に戻る</button>
        <button class="secondary" data-action="next-mission">別の案件を聞く</button>
      </div>
    `;
  }

  return `
    <div class="action-row">
      <button data-action="confirm-cycle">記録して次の朝へ進む</button>
      <button class="secondary" data-action="back-to-casting">メモを見直す</button>
    </div>
  `;
}

function renderMainStage(): string {
  const mission = getSelectedMission();
  const advisor = getAdvisor();

  if (!mission) {
    return `
      <div class="story-card">
        <div class="scene-label">静かな朝</div>
        <h2>残っている案件はない</h2>
        <p class="story-line">いまは机の上が片づいている。必要ならリセットして最初の朝に戻れる。</p>
      </div>
    `;
  }

  if (uiState.scene === "briefing") {
    return renderBriefingScene(mission, advisor);
  }

  if (uiState.scene === "casting") {
    return `
      ${renderCastingScene(mission, advisor)}
      <section class="roster-panel">
        <div class="scene-label">呼びかけ先</div>
        <div class="choice-stack">
          ${renderRoster(mission)}
        </div>
      </section>
    `;
  }

  if (!uiState.preparedCycle) {
    return `<div class="story-card"><p class="story-line">結果がまだありません。</p></div>`;
  }

  return `
    ${renderAftermathScene(uiState.preparedCycle, advisor)}
    <section class="roster-panel">
      <div class="scene-label">ギルド主メモ</div>
      ${renderNoteSelection(uiState.preparedCycle)}
    </section>
  `;
}

function render(): void {
  const mission = getSelectedMission();

  appRoot.innerHTML = `
    <div class="novel-shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">INTERACTIVE LOG</div>
          <h1>${uiState.state.world_pack.name}</h1>
          <p>${uiState.state.world_pack.one_liner}</p>
        </div>
        <div class="top-meta">
          <div class="small muted">記録 ${uiState.state.reports.length} 件</div>
          <div class="small muted">open ${getOpenMissions().length} 件</div>
        </div>
      </header>

      <main class="stage-layout">
        <section class="main-stage">
          ${renderMainStage()}
          ${renderActions(mission)}
        </section>
        ${renderSidebar(mission, getAdvisor())}
      </main>
    </div>
  `;

  appRoot.querySelector("[data-action='enter-casting']")?.addEventListener("click", enterCasting);
  appRoot.querySelector("[data-action='back-to-briefing']")?.addEventListener("click", returnToBriefing);
  appRoot.querySelector("[data-action='back-to-casting']")?.addEventListener("click", () => {
    uiState.scene = "casting";
    render();
  });
  appRoot.querySelector("[data-action='next-mission']")?.addEventListener("click", () => cycleMission(1));
  appRoot.querySelector("[data-action='prepare-cycle']")?.addEventListener("click", prepareCycle);
  appRoot.querySelector("[data-action='confirm-cycle']")?.addEventListener("click", confirmCycle);
  appRoot.querySelector("[data-action='reset-game']")?.addEventListener("click", resetGame);

  appRoot.querySelectorAll<HTMLElement>("[data-action='toggle-character']").forEach((button) => {
    button.addEventListener("click", () => toggleCharacter(button.dataset.characterId as Character["character_id"]));
  });
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
