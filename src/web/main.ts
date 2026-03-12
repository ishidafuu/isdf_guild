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
import { clearAiTextCache, requestAiGuildmasterNotes, requestAiReport, requestAiScene } from "../ai_runtime/browserClient";
import type { SceneGenerationRequest, SceneTextPack } from "../ai_runtime/types";

const STORAGE_KEY = "isdf_guild_web_state_v1";

type SceneMode = "briefing" | "casting" | "aftermath";
type BriefingStep = "morning" | "entry" | "decision";

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
  briefingStep: BriefingStep;
  selectedMissionId: Mission["mission_id"] | null;
  selectedCharacterIds: Character["character_id"][];
  briefingIntent: string;
  castingIntent: string;
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
    briefingStep: "morning",
    selectedMissionId: firstMission?.mission_id ?? null,
    selectedCharacterIds: [],
    briefingIntent: "",
    castingIntent: "",
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
  uiState.briefingIntent = "";
  uiState.castingIntent = "";
  uiState.preparedCycle = null;
  uiState.selectedNotes = {};
  uiState.userNotes = {};
  uiState.scene = "briefing";
  uiState.briefingStep = "morning";
  render();
}

function enterBriefingStep(step: BriefingStep): void {
  if (!getSelectedMission()) return;
  uiState.scene = "briefing";
  uiState.briefingStep = step;
  uiState.preparedCycle = null;
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
  uiState.briefingStep = "decision";
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
  uiState.briefingStep = reset.briefingStep;
  uiState.selectedMissionId = reset.selectedMissionId;
  uiState.selectedCharacterIds = reset.selectedCharacterIds;
  uiState.briefingIntent = reset.briefingIntent;
  uiState.castingIntent = reset.castingIntent;
  uiState.preparedCycle = reset.preparedCycle;
  uiState.selectedNotes = reset.selectedNotes;
  uiState.userNotes = reset.userNotes;
  uiState.aiStatus = undefined;
  uiState.sceneTextCache = {};
  uiState.sceneTextWarnings = {};
  uiState.sceneTextLoadingKeys = [];
  render();
}

async function clearAiCacheOnly(): Promise<void> {
  if (uiState.aiStatus?.loading) {
    return;
  }

  uiState.aiStatus = {
    loading: true,
    warning: "AI文面キャッシュを削除しています。",
  };
  render();

  try {
    await clearAiTextCache();
    uiState.sceneTextCache = {};
    uiState.sceneTextWarnings = {};
    uiState.aiStatus = {
      loading: false,
      provider: "fallback",
      warning: "AI文面キャッシュを削除しました。次回表示時に再生成されます。",
    };
  } catch (error) {
    uiState.aiStatus = {
      loading: false,
      provider: "fallback",
      warning: error instanceof Error ? error.message : "AI文面キャッシュ削除に失敗しました。",
    };
  }

  render();
}

async function fullReset(): Promise<void> {
  if (uiState.aiStatus?.loading) {
    return;
  }

  uiState.aiStatus = {
    loading: true,
    warning: "ゲーム状態とAI文面キャッシュを完全リセットしています。",
  };
  render();

  try {
    await clearAiTextCache();
  } catch {
    // ゲーム状態は常に初期化し、キャッシュ削除失敗だけ警告で残す。
  }

  resetGame();
  uiState.aiStatus = {
    loading: false,
    provider: "fallback",
    warning: "ゲーム状態とAI文面キャッシュを初期化しました。",
  };
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
  uiState.briefingIntent = "";
  uiState.castingIntent = "";
  uiState.selectedMissionId = getOpenMissions()[0]?.mission_id ?? null;
  uiState.scene = "briefing";
  uiState.briefingStep = "morning";
  uiState.aiStatus = undefined;
  render();
}

function getBriefingSceneKey(mission: Mission): string {
  return `briefing:${uiState.briefingStep}:${mission.mission_id}:${uiState.briefingIntent.trim()}`;
}

function getCastingSceneKey(mission: Mission): string {
  const memberKey = [...uiState.selectedCharacterIds].sort().join(",");
  return `casting:${mission.mission_id}:${memberKey}:${uiState.castingIntent.trim()}`;
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
    return "夜明け前までに荷を通す仕事。派手じゃないけど、止まると一気に面倒になる。";
  }
  if (mission.category === "negotiation") {
    return "揉めてる連中をなだめる仕事。誰を前に出すかで、話が早く済むか長引くかが変わる。";
  }
  return "企業区画でログを抜く仕事。うまくやっても、だいたい何かしら面倒は残る。";
}

function getMissionShadow(mission: Mission): string {
  if (mission.category === "delivery") {
    return "締切が短い。もたつくほど検問が増えて笑えなくなる。";
  }
  if (mission.category === "negotiation") {
    return "片方の顔を立てすぎると、もう片方があとでへそを曲げる。";
  }
  return "依頼人も全部は話していない。報酬だけ見て飛びつくと、あとで嫌な顔をすることになる。";
}

function getMissionEntryMode(mission: Mission): "staff_report" | "adventurer_pitch" | "client_visit" {
  if (mission.category === "delivery") {
    return "staff_report";
  }
  if (mission.category === "recovery") {
    return "adventurer_pitch";
  }
  return "client_visit";
}

function summarizeBriefingIntent(intent: string): string {
  const normalized = intent.trim();
  if (!normalized) {
    return "主はまだ返事を急がず、相手の出方を見ている。";
  }
  if (/(危|慎重|様子|急が)/.test(normalized)) {
    return "主は即答を避け、危ない筋がないか先に洗いたい顔をしている。";
  }
  if (/(金|報酬|割|見合)/.test(normalized)) {
    return "主は条件が見合うかを先に量り、安売りする気はない。";
  }
  if (/(信用|怪|胡散臭|疑)/.test(normalized)) {
    return "主は相手を丸ごと信じず、言葉の継ぎ目を確かめるつもりでいる。";
  }
  if (/(受け|やる|進め)/.test(normalized)) {
    return "主は受ける方向で考えているが、誰を出すかまではまだ決め切っていない。";
  }
  return "主は返答の角度を探っている。言い方ひとつで、場の空気が変わると知っている。";
}

function summarizeCastingIntent(intent: string): string {
  const normalized = intent.trim();
  if (!normalized) {
    return "顔ぶれの決め手はまだない。誰に声をかけるかで、空気も結果も変わる。";
  }
  if (/(休|無理|温存|疲)/.test(normalized)) {
    return "主は無理をさせない編成を考えている。足りないぶんは、別の誰かに背負わせることになる。";
  }
  if (/(速|急|押し|強引)/.test(normalized)) {
    return "主は多少荒くても、話を前へ動かす顔ぶれを探している。";
  }
  if (/(相性|組|噛み合|一緒)/.test(normalized)) {
    return "主は能力だけでなく、並べた時の空気を重く見ている。";
  }
  return "主は今回の運び方に筋を通したいと思っている。誰を前に出すかで、その筋が決まる。";
}

function getCharacterReaction(character: Character, mission: Mission): string {
  if (character.character_id === "char_shion") {
    if (mission.category === "delivery") return "短くうなずく。危ない運びでも、前に立つ役なら自分だと思っている顔だ。";
    if (mission.category === "recovery") return "表情は薄いが、企業区画と聞いた時だけ少しだけ目つきが固くなる。";
    return "相変わらず口数は少ない。ただ、断る時の空気ではない。";
  }
  if (character.character_id === "char_mina") {
    if (mission.category === "recovery") return "端末を閉じる指先が少し強い。企業絡みだと、だいたい機嫌がよくない。";
    if (mission.category === "delivery") return "荷より先に経路の雑さを気にしている。受けるなら準備はちゃんとやりたいらしい。";
    return "依頼人の名前を聞いた時だけ視線が冷える。わかりやすいと言えばわかりやすい。";
  }
  if (character.character_id === "char_gai") {
    if (mission.category === "negotiation") return "口元だけで笑う。面倒な仲裁ほど、自分の出番だとわかっている顔だ。";
    return "軽口を挟む。余裕があるというより、そうやって場を軽くする癖だ。";
  }
  if (character.character_id === "char_nora") {
    if (mission.category === "recovery") return "先に退路を気にしている。まだ現場も見ていないのに、もう出口の心配をしている。";
    return "返事は小さい。でも嫌な予感がある時ほど、逆に静かになる。";
  }
  if (character.character_id === "char_iza") {
    return "すぐには断らない。誰かの穴埋めだと、なおさら引き受けがちだ。";
  }
  return character.public_digest;
}

function getCharacterName(characterId: Character["character_id"]): string {
  return uiState.state.characters.find((character) => character.character_id === characterId)?.name ?? characterId;
}

function getSpeakerClass(characterId?: Character["character_id"] | null): string {
  if (!characterId) {
    return "";
  }

  return `speaker-${characterId.split("_").join("-")}`;
}

function getFeaturedCharactersForMission(mission: Mission, limit = 2): Character[] {
  const recommendedRoles = mission.participants?.recommended_roles ?? [];
  const available = getAvailableCharacters();
  const matched = available.filter((character) => recommendedRoles.includes(character.role));
  const ordered = matched.length > 0 ? matched : available;
  return ordered.slice(0, limit);
}

function getBriefingCharacterLine(character: Character, mission: Mission): string {
  if (character.character_id === "char_gai") {
    return mission.category === "negotiation"
      ? "椅子の背に寄りかかる。『話をまとめるだけなら軽い。軽く済めば、だけど』"
      : "肩をすくめる。『金の匂いはする。ついでに面倒の匂いもするけどな』";
  }
  if (character.character_id === "char_mina") {
    return mission.category === "recovery"
      ? "端末から目を上げる。『企業絡みなら、雑な説明を真に受けない方がいい』"
      : "資料を見て眉をひそめる。『準備不足で押すなら、誰かが後で泣く』";
  }
  if (character.character_id === "char_shion") {
    return "壁際から一度だけうなずく。『受けるなら、引き方だけ先に決めておけ』";
  }
  if (character.character_id === "char_nora") {
    return "目線は低いままだ。『嫌な感じはある。たぶん、入口より出口で困る』";
  }
  return "短く息を吐く。仕事の匂いだけは、もう十分に伝わっている。";
}

function getSelectedCharacterBanter(character: Character, mission: Mission): string {
  if (character.character_id === "char_shion") {
    return mission.category === "delivery"
      ? "腕を組んで立つ。『運ぶだけなら運ぶ。ただ、止められた時の方が面倒だ』"
      : "視線だけで返す。『前に出る役が要るならやる。無茶はさせるな』";
  }
  if (character.character_id === "char_mina") {
    return mission.category === "recovery"
      ? "端末を叩きながら言う。『抜くなら抜くでいい。雑に入るなら私は行かない』"
      : "肩越しに言葉を投げる。『準備に時間をくれるなら動ける。根性論なら却下』";
  }
  if (character.character_id === "char_gai") {
    return "笑っているが目は仕事の方を向いている。『揉めたらしゃべる。しゃべって駄目なら、その時考える』";
  }
  if (character.character_id === "char_nora") {
    return "小さく首を振る。『退路だけは先にほしい。あとで探すのは遅い』";
  }
  return "少し間を置いてから返す。『足りない穴埋めならやる。雑に投げるなら考える』";
}

function getAftermathCharacterBanter(character: Character, mission: Mission, result: string): string {
  if (character.character_id === "char_gai") {
    return result === "failure"
      ? "乾いた笑いだけが先に出る。『笑えない方の外し方だな。次はもう少しマシにやる』"
      : "片手を上げる。『ほらな、面倒は面倒でも片づかない面倒じゃなかった』";
  }
  if (character.character_id === "char_mina") {
    return result === "failure"
      ? "額を押さえる。『言った通り、雑に入るとこうなる』"
      : "端末を閉じる。『終わった。気持ちよくはないけど、終わっただけ上等』";
  }
  if (character.character_id === "char_shion") {
    return result === "failure"
      ? "短く言う。『押し切れなかった。次は押し方を変える』"
      : "壁にもたれる。『戻った。それで十分だろ』";
  }
  if (character.character_id === "char_nora") {
    return result === "failure"
      ? "声が小さい。『やっぱり出口が狭かった』"
      : "ようやく肩を落とす。『帰れた。今日はそれでいい』";
  }
  return result === "failure" ? "疲れを隠しきれない。『次はもう少し、うまくやる』" : "息をつく。『片づいたなら、それでいい』";
}

function getBriefingCrossTalk(mission: Mission, advisor: StaffCharacter | null): Array<{
  character_id?: Character["character_id"];
  speaker: string;
  text: string;
}> {
  const featured = getFeaturedCharactersForMission(mission, 2);
  const lines: Array<{ character_id?: Character["character_id"]; speaker: string; text: string }> = [];

  if (advisor) {
    lines.push({
      character_id: advisor.character_id,
      speaker: advisor.name,
      text:
        mission.category === "delivery"
          ? "急ぎの返事を欲しがってる。急いで受けるのと、雑に受けるのは別だからね。"
          : mission.category === "negotiation"
            ? "話は丸い。でも持ってきた顔が丸い時ほど、後ろで角が立ってる。"
            : "大きい額が出てる。大きい額を出す時は、向こうも急いでると思って。"
    });
  }

  for (const character of featured) {
    lines.push({
      character_id: character.character_id,
      speaker: character.name,
      text: getBriefingCharacterLine(character, mission),
    });
  }

  return lines.slice(0, 3);
}

function getCastingCrossTalk(mission: Mission, selectedCharacters: Character[]): Array<{
  character_id: Character["character_id"];
  speaker: string;
  text: string;
}> {
  const lines = selectedCharacters.map((character) => ({
    character_id: character.character_id,
    speaker: character.name,
    text: getSelectedCharacterBanter(character, mission),
  }));

  return lines.slice(0, 3);
}

function getAftermathCrossTalk(preparedCycle: PreparedCycle): Array<{
  character_id: Character["character_id"];
  speaker: string;
  text: string;
}> {
  const result = preparedCycle.report.state_updates?.mission_result ?? "unknown";
  return preparedCycle.characters_after_report
    .filter((character) => preparedCycle.dispatch.assigned_character_ids.includes(character.character_id))
    .slice(0, 3)
    .map((character) => ({
      character_id: character.character_id,
      speaker: character.name,
      text: `${getConditionText(character)} ${getAftermathCharacterBanter(character, preparedCycle.mission, result)}`,
    }));
}

function buildMorningFallbackPack(mission: Mission, advisor: StaffCharacter | null): SceneTextPack {
  const alternatives = getOpenMissions().filter((entry) => entry.mission_id !== mission.mission_id);
  const recentNotes = getRecentNotes(1);
  const featuredCharacters = getFeaturedCharactersForMission(mission, 1);

  return {
    narration_lines: [
      `${uiState.state.base.summary}。朝の空気はまだ重いが、机の上の端末だけは先に働き始めている。`,
      advisor
        ? `${advisor.name}が帳面を片手に立ち、今日は一件、先に話しておきたいとだけ言う。`
        : "通知灯が一つ点きっぱなしだ。誰かが返事を待っているらしい。",
      `今日いちばん表に出てきた話は「${mission.display_name}」だ。`,
      getMissionScaleText(mission),
    ],
    advisor_lines: advisor ? ["まずは話を聞く。受けるかどうかを決めるのは、そのあとでいい。"] : [],
    aside_lines: [
      ...(alternatives.length > 0 ? [`脇にはまだ ${alternatives.length} 件ほど話が残っている。`] : []),
      ...(recentNotes.length > 0 ? [`昨夜のメモ: ${recentNotes[0]}`] : []),
    ],
    character_lines: featuredCharacters.map((character) => ({
      character_id: character.character_id,
      text: getBriefingCharacterLine(character, mission),
    })),
  };
}

function buildEntryFallbackPack(mission: Mission, advisor: StaffCharacter | null): SceneTextPack {
  const entryMode = getMissionEntryMode(mission);
  const featuredCharacters = getFeaturedCharactersForMission(mission, 2);

  if (entryMode === "staff_report") {
    return {
      narration_lines: [
        `${advisor?.name ?? "帳場"}が机に薄いファイルを置く。港湾労務連合から、返事の早い仕事が来ている。`,
        `仕事は「${mission.display_name}」。${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}`,
        `依頼人は ${getMissionClientName(mission)}。報酬は ${getRewardText(mission)}。`,
      ],
      advisor_lines: advisor ? [getMissionLead(mission), getMissionShadow(mission)] : [],
      aside_lines: [`ざっくりした危うさ: ${getRiskText(mission)}`],
      character_lines: featuredCharacters.map((character) => ({
        character_id: character.character_id,
        text: getBriefingCharacterLine(character, mission),
      })),
    };
  }

  if (entryMode === "adventurer_pitch") {
    return {
      narration_lines: [
        `先に口を開いたのは依頼主ではない。ギルドの側から「${mission.display_name}」の話が持ち込まれる。`,
        `${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}`,
        `報酬は ${getRewardText(mission)}。額だけ見れば悪くないが、筋はだいぶきな臭い。`,
      ],
      advisor_lines: advisor ? ["拾える話ではある。ただ、拾った時点でこっちも泥をかぶる。"] : [],
      aside_lines: [`依頼人の名義は ${getMissionClientName(mission)}。${getRiskText(mission)}`],
      character_lines: featuredCharacters.map((character) => ({
        character_id: character.character_id,
        text: getBriefingCharacterLine(character, mission),
      })),
    };
  }

  return {
    narration_lines: [
      `来客用の椅子に、先方が先に腰を下ろしている。持ち込まれたのは「${mission.display_name}」。`,
      `${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}`,
      `依頼人は ${getMissionClientName(mission)}。見返りは ${getRewardText(mission)}。`,
    ],
    advisor_lines: advisor ? ["話は筋が通っている。ただ、相手が全部を出している顔ではない。"] : [],
    aside_lines: [`ざっくりした危うさ: ${getRiskText(mission)}`],
    character_lines: featuredCharacters.map((character) => ({
      character_id: character.character_id,
      text: getBriefingCharacterLine(character, mission),
    })),
  };
}

function buildDecisionFallbackPack(mission: Mission, advisor: StaffCharacter | null): SceneTextPack {
  const featuredCharacters = getFeaturedCharactersForMission(mission, 1);
  return {
    narration_lines: [
      "話の輪郭は見えた。ここで頷くか、もう少しだけ相手の腹を探るかを決める番だ。",
      summarizeBriefingIntent(uiState.briefingIntent),
      `報酬は ${getRewardText(mission)}。ただし、${getMissionShadow(mission)}`,
    ],
    advisor_lines: advisor
      ? [
          uiState.briefingIntent.trim()
            ? "言い方は任せる。ただ、引けない約束だけは先に作らないで。"
            : "返事を急ぐ理由は向こうにある。こちらまで急ぐ必要はない。",
        ]
      : [],
    aside_lines: [`この場で決めること: 受けるか、保留するか、誰の意見を聞くか。`],
    character_lines: featuredCharacters.map((character) => ({
      character_id: character.character_id,
      text: getBriefingCharacterLine(character, mission),
    })),
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
      "依頼の中身はだいたい見えた。次は誰に行ってもらうかを決める番だ。",
      `人数を増やせば安心という仕事でもない。顔ぶれは ${maxPartySize} 人までに絞る。`,
      summarizeCastingIntent(uiState.castingIntent),
    ],
    advisor_lines: advisor ? [getMissionShadow(mission)] : [],
    aside_lines: [
      `いま声をかけた顔ぶれ: ${
        selectedCharacters.length > 0 ? selectedCharacters.map((character) => character.name).join(" / ") : "まだ誰も呼んでいない"
      }`,
      selectedCharacters.length > 1 ? "空気は悪くない。あとは誰を前に立たせるかだ。" : "まだ配役は固まりきっていない。",
    ],
    character_lines: availableCharacters.map((character) => ({
      character_id: character.character_id,
      text: selectedCharacters.some((selected) => selected.character_id === character.character_id)
        ? getSelectedCharacterBanter(character, mission)
        : getCharacterReaction(character, mission),
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
        ? "数時間後、扉が開く。全員くたびれてはいるが、空気は悪くない。"
        : result === "success"
          ? "扉が開く。仕事は片づいたらしいが、楽だったとは誰も言わなさそうだ。"
        : result === "partial_success"
            ? "戻ってきた靴音に少し重さがある。片づいたことと後味の悪さが半々で混じっている。"
            : "扉が開いた瞬間、まず目に入るのは結果より疲れた顔だ。",
      `今夜の帳面に残る評価は「${resultLabel}」。`,
      preparedCycle.report.text,
      ...(preparedCycle.report.summary_lines ?? []),
    ],
    advisor_lines: advisor
      ? [
          result === "failure"
            ? "反省会はあと。まず座って、水でも飲んでからにしよう。"
            : "結果は悪くない。けど、ちゃんと帰ってきた顔を見てから安心する。",
        ]
      : [],
    aside_lines: preparedCycle.dispatch.risk_view?.staff_lines?.length
      ? preparedCycle.dispatch.risk_view.staff_lines
      : preparedCycle.pre_mission_conversation.map((line) => `${line.speaker_name}「${line.text}」`),
    character_lines: returningCharacters.map((character) => ({
      character_id: character.character_id,
      text: `${getConditionText(character)} ${getAftermathCharacterBanter(character, preparedCycle.mission, result)}`,
    })),
  };
}

function getSceneCharacterLine(scenePack: SceneTextPack | undefined, characterId: Character["character_id"]): string | null {
  return scenePack?.character_lines.find((line) => line.character_id === characterId)?.text ?? null;
}

function renderSceneLines(lines: string[]): string {
  return lines.map((line) => `<p class="story-line">${line}</p>`).join("");
}

function renderDialogueLine(speaker: string, text: string, speakerClass = ""): string {
  return `<p class="story-line dialogue"><span class="speaker ${speakerClass}">${speaker}</span>「${text}」</p>`;
}

function renderSceneLoadingNote(sceneKey: string): string {
  if (!isSceneLoading(sceneKey)) {
    return "";
  }

  return `
    <div class="scene-note loading-note">
      <strong>AI文章を生成中です。</strong>
      <div class="small muted">いま表示している文は仮の文面です。でき次第、この場面の文章を差し替えます。</div>
    </div>
  `;
}

function renderCharacterDialogueBlock(lines: SceneTextPack["character_lines"]): string {
  if (lines.length === 0) {
    return "";
  }

  return `
    <div class="line-stack chatter-stack">
      ${lines
        .map((line) =>
          renderDialogueLine(getCharacterName(line.character_id), line.text, getSpeakerClass(line.character_id))
        )
        .join("")}
    </div>
  `;
}

function renderBriefingScene(mission: Mission, advisor: StaffCharacter | null): string {
  const sceneKey = getBriefingSceneKey(mission);
  const fallbackPack =
    uiState.briefingStep === "morning"
      ? buildMorningFallbackPack(mission, advisor)
      : uiState.briefingStep === "entry"
        ? buildEntryFallbackPack(mission, advisor)
        : buildDecisionFallbackPack(mission, advisor);
  const scenePack = getCachedScenePack(sceneKey) ?? fallbackPack;
  const warning = uiState.sceneTextWarnings[sceneKey];
  const heading =
    uiState.briefingStep === "morning"
      ? "朝の導入"
      : uiState.briefingStep === "entry"
        ? "依頼の入口"
        : "受諾判断";
  const title =
    uiState.briefingStep === "morning"
      ? "今日はどこから話を聞くか"
      : uiState.briefingStep === "entry"
        ? mission.display_name
        : `${mission.display_name} をどう受けるか`;
  const crossTalk = getBriefingCrossTalk(mission, advisor);

  return `
    <div class="story-card">
      <div class="scene-label">${heading}</div>
      <h2>${title}</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      ${
        advisor
          ? scenePack.advisor_lines
              .map((line) => renderDialogueLine(advisor.name, line, getSpeakerClass(advisor.character_id)))
              .join("")
          : ""
      }
      ${
        scenePack.aside_lines.map((line) => `<div class="scene-note">${line}</div>`).join("")
      }
      <div class="line-stack chatter-stack">
        ${crossTalk
          .map((line) => renderDialogueLine(line.speaker, line.text, getSpeakerClass(line.character_id)))
          .join("")}
      </div>
      ${renderCharacterDialogueBlock(scenePack.character_lines)}
      ${
        uiState.briefingStep !== "morning"
          ? `<p class="story-line muted-line">${typeof mission.objective === "string" ? mission.objective : mission.objective.summary}</p>`
          : ""
      }
      ${
        uiState.briefingStep === "decision"
          ? `
            <section class="intent-panel">
              <div class="scene-note strong">主の返し方メモ</div>
              <p class="small muted">そのままの台詞ではなく、どう返したいかだけを書きます。</p>
              <textarea class="textarea" data-action="briefing-intent" placeholder="例: すぐには頷かず、条件だけ先に確かめたい">${uiState.briefingIntent}</textarea>
            </section>
          `
          : ""
      }
      ${renderSceneLoadingNote(sceneKey)}
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
  const crossTalk = getCastingCrossTalk(mission, selectedCharacters);

  return `
    <div class="story-card">
      <div class="scene-label">声をかける</div>
      <h2>${mission.display_name} の段取り</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      ${
        advisor
          ? scenePack.advisor_lines
              .map((line) => renderDialogueLine(advisor.name, line, getSpeakerClass(advisor.character_id)))
              .join("")
          : ""
      }
      ${scenePack.aside_lines.map((line) => `<div class="scene-note">${line}</div>`).join("")}
      <section class="intent-panel">
        <div class="scene-note strong">今回の回し方</div>
        <p class="small muted">誰を消耗させたくないか、何を優先したいかだけを短く置く。</p>
        <textarea class="textarea" data-action="casting-intent" placeholder="例: 無理を押さずに、退路を作れる顔ぶれにしたい">${uiState.castingIntent}</textarea>
      </section>
      ${renderSceneLoadingNote(sceneKey)}
      <div class="line-stack chatter-stack">
        ${crossTalk
          .map((line) => renderDialogueLine(line.speaker, line.text, getSpeakerClass(line.character_id)))
          .join("")}
      </div>
      ${renderCharacterDialogueBlock(
        scenePack.character_lines.filter((line) => selectedCharacters.some((character) => character.character_id === line.character_id))
      )}
      ${
        selectedCharacters.length > 0
          ? ""
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
  const crossTalk = getAftermathCrossTalk(preparedCycle);

  return `
    <div class="story-card">
      <div class="scene-label">帰還後</div>
      <h2>${preparedCycle.mission.display_name}</h2>
      ${renderSceneLines(scenePack.narration_lines)}
      <div class="line-stack chatter-stack">
        ${crossTalk
          .map((line) => renderDialogueLine(line.speaker, line.text, getSpeakerClass(line.character_id)))
          .join("")}
      </div>
      ${renderCharacterDialogueBlock(
        returningCharacters.map((character) => ({
          character_id: character.character_id,
          text:
            getSceneCharacterLine(scenePack, character.character_id) ??
            `${getConditionText(character)} ${getAftermathCharacterBanter(character, preparedCycle.mission, preparedCycle.report.state_updates?.mission_result ?? "unknown")}`,
        }))
      )}
      ${
        advisor
          ? scenePack.advisor_lines
              .map((line) => renderDialogueLine(advisor.name, line, getSpeakerClass(advisor.character_id)))
              .join("")
          : ""
      }
      ${scenePack.aside_lines.length > 0 ? `<div class="line-stack">${scenePack.aside_lines.map((line) => `<div class="echo-line">${line}</div>`).join("")}</div>` : ""}
      ${renderSceneLoadingNote(sceneKey)}
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
            <strong class="speaker ${getSpeakerClass(character.character_id)}">${character.name}</strong>
            <span class="tag">${character.role}</span>
          </div>
          <p>${selected ? "すでに話を通した。" : "この件を持ちかけるなら、こんな顔をする。"} ${
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
    <aside class="sidebar ledger-rail">
      <section class="sidebar-panel rail-panel">
        <div class="scene-label">帳場</div>
        <h3>${advisor?.name ?? "記録端末"}</h3>
        <p>${advisor?.public_digest ?? "今日は人の気配が薄い。"}</p>
        ${
          advisor
            ? `<p class="muted small">${advisor.private_dossier?.speech_rule}</p>`
            : ""
        }
        <div class="action-row">
          <button class="secondary" data-action="clear-ai-cache" ${uiState.aiStatus?.loading ? "disabled" : ""}>AI文面キャッシュ削除</button>
          <button class="secondary" data-action="full-reset" ${uiState.aiStatus?.loading ? "disabled" : ""}>完全リセット</button>
        </div>
      </section>
      ${
        mission
          ? `<section class="sidebar-panel rail-panel">
              <div class="scene-label">机の端メモ</div>
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
          ? `<section class="sidebar-panel rail-panel">
              <div class="scene-label">脇の話</div>
              ${otherMissions}
            </section>`
          : ""
      }
      <section class="sidebar-panel rail-panel">
        <div class="scene-label">古い記録</div>
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
    if (uiState.briefingStep === "morning") {
      return `
        <div class="action-row">
          <button data-action="open-entry" ${disabled}>今日の話を聞く</button>
          <button class="secondary" data-action="next-mission" ${disabled}>別の案件を聞く</button>
          <button class="secondary" data-action="reset-game" ${disabled}>リセット</button>
        </div>
      `;
    }

    if (uiState.briefingStep === "entry") {
      return `
        <div class="action-row">
          <button data-action="open-decision" ${disabled}>返事の段取りを決める</button>
          <button class="secondary" data-action="back-to-morning" ${disabled}>朝の導入へ戻る</button>
          <button class="secondary" data-action="next-mission" ${disabled}>別の案件を聞く</button>
        </div>
      `;
    }

    return `
      <div class="action-row">
        <button data-action="enter-casting" ${disabled}>この件を受ける方向で進める</button>
        <button class="secondary" data-action="back-to-entry" ${disabled}>もう少し話を聞く</button>
        <button class="secondary" data-action="next-mission" ${disabled}>いったん保留して別の案件を見る</button>
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
        <div class="scene-label">誰に声をかけるか</div>
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
    const fallback =
      uiState.briefingStep === "morning"
        ? buildMorningFallbackPack(mission, advisor)
        : uiState.briefingStep === "entry"
          ? buildEntryFallbackPack(mission, advisor)
          : buildDecisionFallbackPack(mission, advisor);
    return {
      key: getBriefingSceneKey(mission),
      request: {
        stage: "briefing",
        scene_variant: uiState.briefingStep,
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
        player_intent: uiState.briefingStep === "decision" ? uiState.briefingIntent.trim() : undefined,
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
        scene_variant: "assignment_consultation",
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
        player_intent: uiState.castingIntent.trim() || undefined,
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

  appRoot.querySelector("[data-action='open-entry']")?.addEventListener("click", () => enterBriefingStep("entry"));
  appRoot.querySelector("[data-action='open-decision']")?.addEventListener("click", () => enterBriefingStep("decision"));
  appRoot.querySelector("[data-action='back-to-morning']")?.addEventListener("click", () => enterBriefingStep("morning"));
  appRoot.querySelector("[data-action='back-to-entry']")?.addEventListener("click", () => enterBriefingStep("entry"));
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
  appRoot.querySelector("[data-action='clear-ai-cache']")?.addEventListener("click", () => {
    void clearAiCacheOnly();
  });
  appRoot.querySelector("[data-action='full-reset']")?.addEventListener("click", () => {
    void fullReset();
  });
  appRoot.querySelector<HTMLTextAreaElement>("[data-action='briefing-intent']")?.addEventListener("input", (event) => {
    const target = event.currentTarget as HTMLTextAreaElement | null;
    if (!target) return;
    uiState.briefingIntent = target.value;
    if (mission) {
      delete uiState.sceneTextCache[getBriefingSceneKey(mission)];
      delete uiState.sceneTextWarnings[getBriefingSceneKey(mission)];
    }
  });
  appRoot.querySelector<HTMLTextAreaElement>("[data-action='casting-intent']")?.addEventListener("input", (event) => {
    const target = event.currentTarget as HTMLTextAreaElement | null;
    if (!target) return;
    uiState.castingIntent = target.value;
    if (mission) {
      delete uiState.sceneTextCache[getCastingSceneKey(mission)];
      delete uiState.sceneTextWarnings[getCastingSceneKey(mission)];
    }
  });

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
