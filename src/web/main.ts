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
import { requestAiGuildmasterNotes, requestAiReport, requestAiScene } from "../ai_runtime/browserClient";
import type { SceneGenerationRequest, SceneTextPack } from "../ai_runtime/types";

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
  aiStatus?: {
    loading: boolean;
    phase?: "report" | "guildmaster_note";
    provider?: "codex_cli" | "fallback";
    warning?: string;
  };
  sceneTextCache: Record<string, SceneTextPack | undefined>;
  sceneTextWarnings: Record<string, string | undefined>;
  sceneTextLoadingKeys: string[];
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
    aiStatus: undefined,
    sceneTextCache: {},
    sceneTextWarnings: {},
    sceneTextLoadingKeys: [],
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

function getRewardText(mission: Mission): string {
  const reward = mission.reward;
  if (typeof reward === "string") {
    return reward;
  }
  const chunks: string[] = [];
  if (reward.currency) {
    chunks.push(`${reward.currency}cr`);
  }
  if (reward.reputation) {
    chunks.push("信用の上積み");
  }
  if (reward.resource_tags?.length) {
    chunks.push(reward.resource_tags.join(" / "));
  }
  return chunks.join(" / ") || reward.summary;
}

function getRiskText(mission: Mission): string {
  return typeof mission.risk === "string" ? mission.risk : mission.risk.summary;
}

function getResultLabel(result: Report["state_updates"] extends infer T
  ? T extends { mission_result?: infer U }
    ? U | "不明"
    : "不明"
  : "不明"): string {
  switch (result) {
    case "great_success":
      return "大成功";
    case "success":
      return "成功";
    case "partial_success":
      return "部分成功";
    case "failure":
      return "失敗";
    default:
      return "不明";
  }
}

function getMissionScaleText(mission: Mission): string {
  const target = getMissionDifficulty(mission);
  if (target <= 7) {
    return "額は控えめだが、街の流れを止めないための仕事だ。";
  }
  if (target <= 8) {
    return "そこそこの報酬がつく。軽く受けていい筋ではない。";
  }
  return "額が大きい。金額のぶんだけ、後で払うものも重い。";
}

function getConditionText(character: Character): string {
  const { stress, injury } = character.status;
  if (injury >= 2 || stress >= 3) {
    return "立ってはいるが、無理を重ねたのが見て取れる。";
  }
  if (injury >= 1 || stress >= 2) {
    return "返事はできる。ただ、疲れはまだ身体に残っている。";
  }
  return "表向きは静かだ。少なくとも今は、まだ切れていない。";
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
  uiState.aiStatus = undefined;
  uiState.sceneTextCache = {};
  uiState.sceneTextWarnings = {};
  uiState.sceneTextLoadingKeys = [];
  render();
}

async function prepareCycle(): Promise<void> {
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
  const fallbackReport = buildReport({
    mission,
    dispatch,
    resolution,
    sequence,
  });
  uiState.aiStatus = {
    loading: true,
    phase: "report",
  };
  render();

  let report = fallbackReport;
  const warnings: string[] = [];

  try {
    const aiReport = await requestAiReport({
      mission,
      dispatch,
      resolution,
    });
    report = {
      ...fallbackReport,
      ...aiReport.output,
    };
    if (aiReport.meta.warning) {
      warnings.push(aiReport.meta.warning);
    }
    uiState.aiStatus = {
      loading: true,
      phase: "guildmaster_note",
      provider: aiReport.meta.provider,
      warning: aiReport.meta.warning,
    };
    render();
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "report AI 接続に失敗しました。");
    uiState.aiStatus = {
      loading: true,
      phase: "guildmaster_note",
      provider: "fallback",
      warning: warnings[warnings.length - 1],
    };
    render();
  }

  const charactersAfterReport = applyRelationshipUpdates({
    characters: applyCharacterUpdates({
      characters: decayedCharacters,
      report,
    }),
    report,
  });
  const fallbackNoteCandidates = buildNoteCandidates({
    characters: charactersAfterReport,
    report,
  });
  let noteCandidates = fallbackNoteCandidates;

  try {
    const aiNotes = await requestAiGuildmasterNotes({
      report,
      characters: charactersAfterReport,
      fallback_candidate_sets: fallbackNoteCandidates,
    });
    noteCandidates = aiNotes.candidate_sets;
    if (aiNotes.meta.warning) {
      warnings.push(aiNotes.meta.warning);
    }
    uiState.aiStatus = {
      loading: false,
      phase: "guildmaster_note",
      provider: aiNotes.meta.provider,
      warning: warnings[0],
    };
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "guildmaster_note AI 接続に失敗しました。");
    uiState.aiStatus = {
      loading: false,
      phase: "guildmaster_note",
      provider: "fallback",
      warning: warnings[0],
    };
  }

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
  uiState.aiStatus = undefined;
  render();
}

function getBriefingSceneKey(mission: Mission): string {
  return `briefing:${mission.mission_id}`;
}

function getCastingSceneKey(mission: Mission): string {
  const memberKey = [...uiState.selectedCharacterIds].sort().join(",");
  return `casting:${mission.mission_id}:${memberKey}`;
}

function getAftermathSceneKey(preparedCycle: PreparedCycle): string {
  return `aftermath:${preparedCycle.report.report_id}`;
}

function isSceneLoading(key: string): boolean {
  return uiState.sceneTextLoadingKeys.includes(key);
}

function getCachedScenePack(key: string): SceneTextPack | undefined {
  return uiState.sceneTextCache[key];
}

async function ensureSceneText(input: { key: string; request: SceneGenerationRequest }): Promise<void> {
  if (uiState.sceneTextCache[input.key] || isSceneLoading(input.key)) {
    return;
  }

  uiState.sceneTextLoadingKeys = [...uiState.sceneTextLoadingKeys, input.key];
  render();

  try {
    const response = await requestAiScene(input.request);
    uiState.sceneTextCache[input.key] = response.output;
    if (response.meta.warning) {
      uiState.sceneTextWarnings[input.key] = response.meta.warning;
    }
  } catch (error) {
    uiState.sceneTextWarnings[input.key] =
      error instanceof Error ? error.message : "scene AI 接続に失敗しました。";
  } finally {
    uiState.sceneTextLoadingKeys = uiState.sceneTextLoadingKeys.filter((key) => key !== input.key);
    render();
  }
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
  if (character.character_id === "char_shion") {
    if (mission.category === "delivery") return "短くうなずく。危険な搬送でも、盾役が要るなら自分だという顔をする。";
    if (mission.category === "recovery") return "表情は薄いが、企業区画と聞いた時だけ視線が少し硬くなる。";
    return "言葉は少ない。だが断る時の間合いではない。";
  }
  if (character.character_id === "char_mina") {
    if (mission.category === "recovery") return "端末を閉じる指先がわずかに強い。企業絡みだと、皮肉が先に立つ。";
    if (mission.category === "delivery") return "搬送経路の雑さを先に気にする。受けるなら準備は詰めたい顔だ。";
    return "依頼人の名前を聞いた時にだけ、視線が少し冷える。";
  }
  if (character.character_id === "char_gai") {
    if (mission.category === "negotiation") return "口元だけで笑う。面倒な仲裁ほど、自分の出番だと知っている顔だ。";
    return "軽口を挟む余裕を見せる。余裕があるというより、そう見せる癖だ。";
  }
  if (character.character_id === "char_nora") {
    if (mission.category === "recovery") return "先に退路を気にしている。現場の匂いをまだ嗅いでいないのに、もう出口を探している。";
    return "返事は小さい。だが嫌な予感を飲み込む時ほど、かえって静かになる。";
  }
  if (character.character_id === "char_iza") {
    return "すぐには断らない。誰かの穴を埋める形なら、なおさら引きにくい。";
  }
  return character.public_digest;
}

function buildBriefingFallbackPack(mission: Mission, advisor: StaffCharacter | null): SceneTextPack {
  const alternatives = getOpenMissions().filter((entry) => entry.mission_id !== mission.mission_id);
  const recentNotes = getRecentNotes(1);

  return {
    narration_lines: [
      `${uiState.state.base.summary}。換気扇の音が低く回り、夜勤明けの湿気がまだ部屋に残っている。`,
      advisor
        ? `${advisor.name}は帳面の端を指で弾き、端末に積まれた案件のうち一件だけをこちらへ寄せた。`
        : "古い端末の通知だけが、今日の仕事の気配を告げている。",
      `表に出てきたのは「${mission.display_name}」。依頼人は${getMissionClientName(mission)}、報酬は ${getRewardText(mission)}。`,
      getMissionScaleText(mission),
    ],
    advisor_lines: advisor
      ? [getMissionLead(mission), `見返りは ${getRewardText(mission)}。ただ、${getMissionShadow(mission)}`]
      : [],
    aside_lines: [
      ...(alternatives.length > 0
        ? [`ほかにも ${alternatives.length} 件、保留の案件がある。${alternatives[0]?.display_name ?? ""} もまだ残っている。`]
        : []),
      ...(recentNotes.length > 0 ? [`昨夜のメモ: ${recentNotes[0]}`] : []),
    ],
    character_lines: [],
  };
}

function buildCastingFallbackPack(mission: Mission, advisor: StaffCharacter | null): SceneTextPack {
  const maxPartySize = mission.participants?.max_party_size ?? 3;
  const selectedCharacters = getAvailableCharacters().filter((character) =>
    uiState.selectedCharacterIds.includes(character.character_id)
  );
  const availableCharacters = getAvailableCharacters();

  return {
    narration_lines: [
      "依頼の輪郭は見えた。ここからは、誰にこの仕事を持たせるかだ。",
      `多く連れて行けばいい仕事でもない。顔ぶれは ${maxPartySize} 人までに絞る。`,
    ],
    advisor_lines: advisor ? [getMissionShadow(mission)] : [],
    aside_lines: [
      `いま声をかけた顔ぶれ: ${
        selectedCharacters.length > 0 ? selectedCharacters.map((character) => character.name).join(" / ") : "まだ誰も呼んでいない"
      }`,
    ],
    character_lines: availableCharacters.map((character) => ({
      character_id: character.character_id,
      text: getCharacterReaction(character, mission),
    })),
  };
}

function buildAftermathFallbackPack(preparedCycle: PreparedCycle, advisor: StaffCharacter | null): SceneTextPack {
  const result = preparedCycle.report.state_updates?.mission_result ?? "不明";
  const resultLabel = getResultLabel(result);
  const returningCharacters = preparedCycle.characters_after_report.filter((character) =>
    preparedCycle.dispatch.assigned_character_ids.includes(character.character_id)
  );

  return {
    narration_lines: [
      result === "great_success"
        ? "数時間後、扉が開く。空気は張っているが、崩れてはいない。"
        : result === "success"
          ? "扉が開く。片づいた仕事の顔をしているが、軽く終わった気配ではない。"
          : result === "partial_success"
            ? "戻ってきた靴音に、少しだけ重さがある。片づいたものと残ったものが半端に混じっている。"
            : "扉が開いた瞬間、先に伝わるのは結果より消耗だ。",
      `今夜の帳面に残る評価は「${resultLabel}」。`,
      preparedCycle.report.text,
      ...(preparedCycle.report.summary_lines ?? []),
    ],
    advisor_lines: advisor
      ? [
          result === "failure"
            ? "結果は結果だ。まず座らせる。話はそのあとでいい。"
            : "数字より先に顔を見る。うまくいったなら、なおさらね。",
        ]
      : [],
    aside_lines: preparedCycle.dispatch.risk_view?.staff_lines?.length
      ? preparedCycle.dispatch.risk_view.staff_lines
      : preparedCycle.pre_mission_conversation.map((line) => `${line.speaker_name}「${line.text}」`),
    character_lines: returningCharacters.map((character) => ({
      character_id: character.character_id,
      text: `${getConditionText(character)} ${getCharacterReaction(character, preparedCycle.mission)}`,
    })),
  };
}

function getSceneCharacterLine(scenePack: SceneTextPack | undefined, characterId: Character["character_id"]): string | null {
  return scenePack?.character_lines.find((line) => line.character_id === characterId)?.text ?? null;
}

function renderSceneLines(lines: string[]): string {
  return lines.map((line) => `<p class="story-line">${line}</p>`).join("");
}

function renderDialogueLine(speaker: string, text: string): string {
  return `<p class="story-line dialogue"><span class="speaker">${speaker}</span>「${text}」</p>`;
}

function renderBriefingScene(mission: Mission, advisor: StaffCharacter | null): string {
  const sceneKey = getBriefingSceneKey(mission);
  const fallbackPack = buildBriefingFallbackPack(mission, advisor);
  const scenePack = getCachedScenePack(sceneKey) ?? fallbackPack;
  const warning = uiState.sceneTextWarnings[sceneKey];

  return `
    <div class="story-card">
      <div class="scene-label">朝の机</div>
      <h2>${mission.display_name}</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      ${
        advisor ? scenePack.advisor_lines.map((line) => renderDialogueLine(advisor.name, line)).join("") : ""
      }
      ${
        scenePack.aside_lines.map((line) => `<div class="scene-note">${line}</div>`).join("")
      }
      <p class="story-line muted-line">${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}</p>
      ${warning ? `<div class="small muted">${warning}</div>` : ""}
    </div>
  `;
}

function renderCastingScene(mission: Mission, advisor: StaffCharacter | null): string {
  const sceneKey = getCastingSceneKey(mission);
  const fallbackPack = buildCastingFallbackPack(mission, advisor);
  const scenePack = getCachedScenePack(sceneKey) ?? fallbackPack;
  const selectedCharacters = getAvailableCharacters().filter((character) =>
    uiState.selectedCharacterIds.includes(character.character_id)
  );
  const warning = uiState.sceneTextWarnings[sceneKey];

  return `
    <div class="story-card">
      <div class="scene-label">声をかける</div>
      <h2>${mission.display_name} の段取り</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      ${advisor ? scenePack.advisor_lines.map((line) => renderDialogueLine(advisor.name, line)).join("") : ""}
      ${scenePack.aside_lines.map((line) => `<div class="scene-note">${line}</div>`).join("")}
      ${
        selectedCharacters.length > 0
          ? `<div class="line-stack">${selectedCharacters
              .map((character) =>
                renderDialogueLine(
                  character.name,
                  getSceneCharacterLine(scenePack, character.character_id) ?? getCharacterReaction(character, mission)
                )
              )
              .join("")}</div>`
          : ""
      }
      ${warning ? `<div class="small muted">${warning}</div>` : ""}
    </div>
  `;
}

function renderAftermathScene(preparedCycle: PreparedCycle, advisor: StaffCharacter | null): string {
  const sceneKey = getAftermathSceneKey(preparedCycle);
  const fallbackPack = buildAftermathFallbackPack(preparedCycle, advisor);
  const scenePack = getCachedScenePack(sceneKey) ?? fallbackPack;
  const returningCharacters = preparedCycle.characters_after_report.filter((character) =>
    preparedCycle.dispatch.assigned_character_ids.includes(character.character_id)
  );
  const warning = uiState.sceneTextWarnings[sceneKey];

  return `
    <div class="story-card">
      <div class="scene-label">帰還後</div>
      <h2>${preparedCycle.mission.display_name}</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      <div class="line-stack">
        ${returningCharacters
          .map((character) =>
            renderDialogueLine(
              character.name,
              getSceneCharacterLine(scenePack, character.character_id) ??
                `${getConditionText(character)} ${getCharacterReaction(character, preparedCycle.mission)}`
            )
          )
          .join("")}
      </div>
      ${advisor ? scenePack.advisor_lines.map((line) => renderDialogueLine(advisor.name, line)).join("") : ""}
      ${scenePack.aside_lines.length > 0 ? `<div class="line-stack">${scenePack.aside_lines.map((line) => `<div class="echo-line">${line}</div>`).join("")}</div>` : ""}
      ${warning ? `<div class="small muted">${warning}</div>` : ""}
    </div>
  `;
}

function renderRoster(mission: Mission): string {
  const maxPartySize = mission.participants?.max_party_size ?? 3;
  const disabled = uiState.aiStatus?.loading ? "disabled" : "";
  const scenePack = getCachedScenePack(getCastingSceneKey(mission));
  return getAvailableCharacters()
    .map((character) => {
      const selected = uiState.selectedCharacterIds.includes(character.character_id);
      return `
        <button class="choice-card ${selected ? "selected" : ""}" data-action="toggle-character" data-character-id="${character.character_id}" ${disabled}>
          <div class="choice-head">
            <strong>${character.name}</strong>
            <span class="tag">${character.role}</span>
          </div>
          <p>${selected ? "声をかけた。" : "まだ呼んでいない。"} ${
            getSceneCharacterLine(scenePack, character.character_id) ?? getCharacterReaction(character, mission)
          }</p>
          <div class="small muted">${getConditionText(character)} / 顔ぶれは ${maxPartySize} 人まで</div>
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
              <div class="small muted">依頼人: ${getMissionClientName(mission)}</div>
              <div class="scene-note">報酬: ${getRewardText(mission)}</div>
              <p class="small muted">${getRiskText(mission)}</p>
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
  const disabled = uiState.aiStatus?.loading ? "disabled" : "";

  if (!mission) {
    return `
      <div class="action-row">
        <button class="secondary" data-action="reset-game" ${disabled}>リセット</button>
      </div>
    `;
  }

  if (uiState.scene === "briefing") {
    return `
      <div class="action-row">
        <button data-action="enter-casting" ${disabled}>この件の段取りを詰める</button>
        <button class="secondary" data-action="next-mission" ${disabled}>別の案件を聞く</button>
        <button class="secondary" data-action="reset-game" ${disabled}>リセット</button>
      </div>
    `;
  }

  if (uiState.scene === "casting") {
    return `
      <div class="action-row">
        <button data-action="prepare-cycle" ${disabled}>この顔ぶれで送り出す</button>
        <button class="secondary" data-action="back-to-briefing" ${disabled}>机に戻る</button>
        <button class="secondary" data-action="next-mission" ${disabled}>別の案件を聞く</button>
      </div>
    `;
  }

  return `
    <div class="action-row">
      <button data-action="confirm-cycle" ${disabled}>記録して次の朝へ進む</button>
      <button class="secondary" data-action="back-to-casting" ${disabled}>メモを見直す</button>
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

function buildSceneRequestForCurrentView(): { key: string; request: SceneGenerationRequest } | null {
  const mission = getSelectedMission();
  const advisor = getAdvisor();

  if (!mission) {
    return null;
  }

  if (uiState.scene === "briefing") {
    const fallback = buildBriefingFallbackPack(mission, advisor);
    return {
      key: getBriefingSceneKey(mission),
      request: {
        stage: "briefing",
        mission,
        advisor: advisor
          ? {
              character_id: advisor.character_id,
              name: advisor.name,
              public_digest: advisor.public_digest,
              volatile_hook: advisor.volatile_hook,
            }
          : null,
        characters: [],
        reward_text: getRewardText(mission),
        risk_text: getRiskText(mission),
        recent_notes: getRecentNotes(2),
        recent_reports: getRecentReports(2).map((report) => report.text),
        fallback,
      },
    };
  }

  if (uiState.scene === "casting") {
    const fallback = buildCastingFallbackPack(mission, advisor);
    return {
      key: getCastingSceneKey(mission),
      request: {
        stage: "casting",
        mission,
        advisor: advisor
          ? {
              character_id: advisor.character_id,
              name: advisor.name,
              public_digest: advisor.public_digest,
              volatile_hook: advisor.volatile_hook,
            }
          : null,
        characters: getAvailableCharacters().map((character) => ({
          character_id: character.character_id,
          name: character.name,
          role: character.role,
          public_digest: character.public_digest,
          volatile_hook: character.volatile_hook,
          condition_text: getConditionText(character),
        })),
        reward_text: getRewardText(mission),
        risk_text: getRiskText(mission),
        fallback,
      },
    };
  }

  if (uiState.scene === "aftermath" && uiState.preparedCycle) {
    const fallback = buildAftermathFallbackPack(uiState.preparedCycle, advisor);
    return {
      key: getAftermathSceneKey(uiState.preparedCycle),
      request: {
        stage: "aftermath",
        mission,
        advisor: advisor
          ? {
              character_id: advisor.character_id,
              name: advisor.name,
              public_digest: advisor.public_digest,
              volatile_hook: advisor.volatile_hook,
            }
          : null,
        characters: uiState.preparedCycle.characters_after_report
          .filter((character) => uiState.preparedCycle?.dispatch.assigned_character_ids.includes(character.character_id))
          .map((character) => ({
            character_id: character.character_id,
            name: character.name,
            role: character.role,
            public_digest: character.public_digest,
            volatile_hook: character.volatile_hook,
            condition_text: getConditionText(character),
          })),
        report: uiState.preparedCycle.report,
        reward_text: getRewardText(mission),
        risk_text: getRiskText(mission),
        fallback,
      },
    };
  }

  return null;
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
          <div class="small muted">空気: ${uiState.state.base.state_values?.atmosphere ?? "unknown"}</div>
          <div class="small muted">外からの視線: ${uiState.state.base.state_values?.external_attention ?? "unknown"}</div>
        </div>
      </header>

      <main class="stage-layout">
        <section class="main-stage">
          ${
            uiState.aiStatus
              ? `<div class="scene-note">
                  ${
                    uiState.aiStatus.loading
                      ? `AI文章を生成中です (${uiState.aiStatus.phase === "report" ? "日報" : "ギルド主メモ"})`
                      : `AI生成: ${uiState.aiStatus.provider === "codex_cli" ? "codex CLI" : "テンプレート fallback"}`
                  }
                  ${uiState.aiStatus.warning ? `<div class="small muted">${uiState.aiStatus.warning}</div>` : ""}
                </div>`
              : ""
          }
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

  const sceneRequest = buildSceneRequestForCurrentView();
  if (sceneRequest) {
    void ensureSceneText(sceneRequest);
  }
}

render();
