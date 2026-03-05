export type ResultClass = "成功" | "部分成功" | "失敗" | "惨敗";

export type FailureCause =
  | "UNDERSTATED_RISK"
  | "INFO_GAP"
  | "BAD_MATCH"
  | "FATIGUE_OVERLOAD"
  | "BAD_LUCK"
  | "HONOR_MISREAD";

export type SceneKind = "travel" | "approach" | "objective" | "return" | "incident";

export type MissionInput = {
  requestId: string;
  day: number;
  request: {
    actualDifficulty: number;
    hazard: number;
    uncertainty: number;
    distance: number;
    disclosedDifficulty: number;
    disclosedHazard: number;
    actualExpectedHonor: number;
    disclosedExpectedHonor: number;
    publicVisibility: number;
  };
  party: {
    partyFit: number;
    fatigueAvg: number;
    morale: number;
    trustGuild: number;
    prepBonus: number;
    styleFit: number;
    honorOutlook: number;
  };
  ignoredWarningCount: number;
};

export type SceneResult = {
  kind: SceneKind;
  index: number;
  progSuccess: boolean;
  riskSuccess: boolean;
  progRoll: number;
  riskRoll: number;
  progCritical: boolean;
  riskCritical: boolean;
  progFumble: boolean;
  riskFumble: boolean;
  importanceScore: number;
  notes: string[];
};

export type MissionOutput = {
  resultClass: ResultClass;
  achievement: number;
  damage: number;
  durationDays: number;
  rewardRate: number;
  leaveDays: number;
  pLeave: number;
  failureCauses: FailureCause[];
  discrepancyNotes: string[];
  sceneTimeline: SceneResult[];
  sceneHighlights: SceneResult[];
  causalScoreK: number;
};

type CauseFlags = Record<FailureCause, boolean>;

type RngFn = () => number;

type Derived = {
  power: number;
  guard: number;
  focus: number;
};

type Discrepancy = {
  diffRisk: number;
  diffDifficulty: number;
  diffHonor: number;
};

type Counters = {
  progressToken: number;
  setbackToken: number;
  damageToken: number;
  stressToken: number;
  progFailCount: number;
  riskFailCount: number;
  criticalCount: number;
  fumbleCount: number;
  objectiveSuccess: 0 | 1;
  incidentCount: number;
};

const CAUSE_SEVERITY: Record<FailureCause, number> = {
  UNDERSTATED_RISK: 95,
  BAD_MATCH: 88,
  FATIGUE_OVERLOAD: 82,
  INFO_GAP: 74,
  HONOR_MISREAD: 62,
  BAD_LUCK: 56,
};

const CAUSE_SCENE_LINKS: Record<FailureCause, SceneKind[]> = {
  UNDERSTATED_RISK: ["approach", "objective", "incident"],
  INFO_GAP: ["approach", "objective", "incident"],
  BAD_MATCH: ["objective"],
  FATIGUE_OVERLOAD: ["travel", "return"],
  BAD_LUCK: ["incident"],
  HONOR_MISREAD: ["objective"],
};

const SCENE_BASE_IMPORTANCE: Record<SceneKind, number> = {
  objective: 3,
  incident: 2,
  approach: 1,
  travel: 0,
  return: 0,
};

const SCENE_MODS: Record<SceneKind, { progMod: number; riskMod: number }> = {
  travel: { progMod: 4, riskMod: 10 },
  approach: { progMod: 0, riskMod: 6 },
  objective: { progMod: 12, riskMod: 12 },
  return: { progMod: -6, riskMod: 8 },
  incident: { progMod: 8, riskMod: 10 },
};

const DISCREPANCY_NOTICE = {
  risk: 8,
  difficulty: 8,
  honor: -8,
} as const;

export function runMission(input: MissionInput, rng: RngFn = Math.random): MissionOutput {
  const derived = calcDerivedStats(input.party, input.request);
  const scenes = buildScenes(input.request.hazard, input.request.uncertainty, rng);
  const timeline: SceneResult[] = [];

  const counters: Counters = {
    progressToken: 0,
    setbackToken: 0,
    damageToken: 0,
    stressToken: 0,
    progFailCount: 0,
    riskFailCount: 0,
    criticalCount: 0,
    fumbleCount: 0,
    objectiveSuccess: 0,
    incidentCount: scenes.filter((s) => s === "incident").length,
  };

  scenes.forEach((scene, index) => {
    const result = resolveScene(scene, index, input.request, derived, rng);
    timeline.push(result);
    accumulateSceneCounters(counters, scene, result, input.request.uncertainty);
  });

  const discrepancy = calcDiscrepancies(input.request);
  const { achievement, damage } = calcAchievementDamage(input, derived, counters, rng);
  const { failureCauses, causeFlags } = computeFailureCauses(
    input,
    derived,
    counters,
    discrepancy,
    damage,
    timeline
  );

  const resultClass = classifyResult(achievement, damage);
  const durationDays = calcDurationDays(input.request, counters.incidentCount, input.party.prepBonus, rng);
  const rewardRate = calcRewardRate(resultClass, achievement);
  const { leaveDays, pLeave } = calcLeaveOutcome(
    damage,
    counters.stressToken,
    input.party.trustGuild,
    causeFlags,
    rng
  );

  const causalScoreK = calcCausalScoreK({
    actualDifficulty: input.request.actualDifficulty,
    disclosedDifficulty: input.request.disclosedDifficulty,
    damage,
    power: derived.power,
    hazard: input.request.hazard,
    uncertainty: input.request.uncertainty,
    ignoredWarningCount: input.ignoredWarningCount,
  });

  const sceneTimeline = scoreScenes(timeline, discrepancy, failureCauses);
  const sceneHighlights = selectSceneHighlights(sceneTimeline, 4);

  return {
    resultClass,
    achievement,
    damage,
    durationDays,
    rewardRate,
    leaveDays,
    pLeave,
    failureCauses,
    discrepancyNotes: buildDiscrepancyNotes(discrepancy),
    sceneTimeline,
    sceneHighlights,
    causalScoreK,
  };
}

function calcDerivedStats(
  party: MissionInput["party"],
  req: MissionInput["request"]
): Derived {
  const power = clamp(
    0.48 * party.partyFit +
      0.16 * party.morale +
      0.14 * party.trustGuild +
      0.14 * party.prepBonus +
      0.08 * party.styleFit,
    0,
    100
  );
  const guard = clamp(
    0.42 * party.partyFit +
      0.2 * party.prepBonus +
      0.18 * party.morale +
      0.12 * party.trustGuild -
      0.22 * party.fatigueAvg,
    0,
    100
  );
  const focus = clamp(
    0.45 * party.partyFit +
      0.2 * party.honorOutlook +
      0.2 * party.morale -
      0.15 * req.uncertainty,
    0,
    100
  );
  return { power, guard, focus };
}

function buildScenes(hazard: number, uncertainty: number, rng: RngFn): SceneKind[] {
  const incidentCount = clampInt(
    Math.floor((hazard + uncertainty) / 120) + randInt(0, 1, rng),
    0,
    2
  );
  const scenes: SceneKind[] = ["travel", "approach"];
  for (let i = 0; i < incidentCount; i += 1) scenes.push("incident");
  scenes.push("objective", "return");
  return scenes;
}

function resolveScene(
  scene: SceneKind,
  index: number,
  req: MissionInput["request"],
  d: Derived,
  rng: RngFn
): SceneResult {
  const { progMod, riskMod } = SCENE_MODS[scene];
  const tnProg = clamp(req.actualDifficulty + progMod + randInt(-6, 6, rng), 20, 95);
  const tnRisk = clamp(
    0.65 * req.hazard + 0.35 * req.uncertainty + riskMod + randInt(-6, 6, rng),
    15,
    98
  );
  const pProg = clamp(50 + (d.power - tnProg), 5, 95);
  const pSafe = clamp(50 + (d.guard - tnRisk), 5, 95);

  const progRoll = rollD100(rng);
  const riskRoll = rollD100(rng);

  const progCritical = progRoll <= 5;
  const riskCritical = riskRoll <= 5;
  const progFumble = progRoll >= 96;
  const riskFumble = riskRoll >= 96;
  const progSuccess = progRoll <= pProg;
  const riskSuccess = riskRoll <= pSafe;

  const notes: string[] = [];
  if (progCritical || riskCritical) notes.push("critical");
  if (progFumble || riskFumble) notes.push("fumble");
  if (!progSuccess) notes.push("progress_fail");
  if (!riskSuccess) notes.push("risk_fail");

  return {
    kind: scene,
    index,
    progSuccess,
    riskSuccess,
    progRoll,
    riskRoll,
    progCritical,
    riskCritical,
    progFumble,
    riskFumble,
    importanceScore: 0,
    notes,
  };
}

function accumulateSceneCounters(
  counters: Counters,
  scene: SceneKind,
  r: SceneResult,
  uncertainty: number
): void {
  if (r.progSuccess) {
    counters.progressToken += r.progCritical ? 2 : 1;
  } else {
    counters.progFailCount += 1;
    if (r.progFumble) counters.setbackToken += 1;
  }

  if (!r.riskSuccess) {
    counters.riskFailCount += 1;
    counters.damageToken += r.riskFumble ? 2 : 1;
    counters.stressToken += uncertainty > 60 ? 2 : 1;
  } else if (r.riskCritical) {
    counters.damageToken = Math.max(0, counters.damageToken - 1);
  }

  if (r.progCritical || r.riskCritical) counters.criticalCount += 1;
  if (r.progFumble || r.riskFumble) counters.fumbleCount += 1;
  if (scene === "objective" && r.progSuccess) counters.objectiveSuccess = 1;
}

function calcDiscrepancies(req: MissionInput["request"]): Discrepancy {
  return {
    diffRisk: req.hazard - req.disclosedHazard,
    diffDifficulty: req.actualDifficulty - req.disclosedDifficulty,
    diffHonor: req.actualExpectedHonor - req.disclosedExpectedHonor,
  };
}

function computeFailureCauses(
  input: MissionInput,
  derived: Derived,
  counters: Counters,
  discrepancy: Discrepancy,
  damage: number,
  timeline: SceneResult[]
): { failureCauses: FailureCause[]; causeFlags: CauseFlags } {
  const { request, party } = input;
  const causes: FailureCause[] = [];

  const understatedRiskScore =
    0.5 * clamp(discrepancy.diffRisk, 0, 40) + 12 * counters.riskFailCount + 0.2 * damage;
  if (discrepancy.diffRisk >= DISCREPANCY_NOTICE.risk && understatedRiskScore >= 40) {
    causes.push("UNDERSTATED_RISK");
  }

  const infoGapScore =
    0.6 * request.uncertainty + 10 * counters.progFailCount + 4 * counters.setbackToken;
  if (infoGapScore >= 62) causes.push("INFO_GAP");

  const badMatchScore =
    0.7 * Math.max(0, 50 - party.partyFit) +
    8 * Math.max(0, Math.ceil((4 + counters.incidentCount) * 0.5) - counters.progressToken) +
    0.2 * Math.max(0, 50 - derived.focus);
  if (badMatchScore >= 35) causes.push("BAD_MATCH");

  const fatigueScore =
    0.7 * Math.max(0, party.fatigueAvg - 50) +
    9 * counters.stressToken +
    5 * counters.riskFailCount;
  if (fatigueScore >= 42) causes.push("FATIGUE_OVERLOAD");

  const badLuckScore = 22 * counters.fumbleCount - 6 * counters.criticalCount;
  if (badLuckScore >= 40) causes.push("BAD_LUCK");

  const honorMisreadScore =
    0.8 * Math.max(0, -discrepancy.diffHonor) +
    0.5 * Math.max(0, 55 - party.honorOutlook) +
    0.2 * request.publicVisibility;
  if (discrepancy.diffHonor <= DISCREPANCY_NOTICE.honor && honorMisreadScore >= 38) {
    causes.push("HONOR_MISREAD");
  }

  const causeFlags: CauseFlags = {
    UNDERSTATED_RISK: causes.includes("UNDERSTATED_RISK"),
    INFO_GAP: causes.includes("INFO_GAP"),
    BAD_MATCH: causes.includes("BAD_MATCH"),
    FATIGUE_OVERLOAD: causes.includes("FATIGUE_OVERLOAD"),
    BAD_LUCK: causes.includes("BAD_LUCK"),
    HONOR_MISREAD: causes.includes("HONOR_MISREAD"),
  };

  causes.sort((a, b) => {
    const severityDiff = CAUSE_SEVERITY[b] - CAUSE_SEVERITY[a];
    if (severityDiff !== 0) return severityDiff;
    return firstSceneIndexForCause(a, timeline) - firstSceneIndexForCause(b, timeline);
  });
  return { failureCauses: causes, causeFlags };
}

function calcAchievementDamage(
  input: MissionInput,
  derived: Derived,
  counters: Counters,
  rng: RngFn
): { achievement: number; damage: number } {
  const { request, party } = input;
  const incidentPenalty = 3 * counters.incidentCount;

  const achievement = clamp(
    18 +
      10 * counters.progressToken -
      5 * counters.setbackToken +
      0.12 * derived.focus +
      0.08 * derived.power +
      8 * counters.objectiveSuccess -
      0.08 * request.uncertainty +
      randInt(-5, 5, rng),
    0,
    100
  );

  const damage = clamp(
    6 +
      10 * counters.damageToken +
      6 * counters.stressToken +
      0.16 * request.hazard +
      0.1 * Math.max(0, request.actualDifficulty - derived.power) -
      0.14 * party.prepBonus -
      0.08 * derived.guard +
      incidentPenalty +
      randInt(-4, 4, rng),
    0,
    100
  );

  return { achievement, damage };
}

function classifyResult(achievement: number, damage: number): ResultClass {
  if (achievement >= 80 && damage < 40) return "成功";
  if (damage >= 70 || (achievement < 30 && damage >= 50)) return "惨敗";
  if (achievement >= 50 && damage < 70) return "部分成功";
  return "失敗";
}

function calcDurationDays(
  req: MissionInput["request"],
  incidentCount: number,
  prepBonus: number,
  rng: RngFn
): number {
  const sceneCount = 4 + incidentCount;
  const value =
    0.55 * sceneCount +
    0.018 * req.distance +
    0.012 * req.actualDifficulty -
    0.025 * prepBonus +
    randInt(-1, 1, rng);
  return clampInt(Math.round(value), 0, 7);
}

function calcRewardRate(result: ResultClass, achievement: number): number {
  if (result === "成功") return 1;
  if (result === "部分成功") {
    const t = clamp((achievement - 50) / 50, 0, 1);
    return round3(0.55 + 0.35 * t);
  }
  if (result === "失敗") {
    const t = clamp(achievement / 50, 0, 1);
    return round3(0.05 + 0.25 * t);
  }
  return round3(clamp(achievement / 300, 0, 0.1));
}

function calcLeaveOutcome(
  damage: number,
  stressToken: number,
  trustGuild: number,
  causes: CauseFlags,
  rng: RngFn
): { leaveDays: number; pLeave: number } {
  let baseLeaveDays = 0;
  let bandBase = 0;

  if (damage < 30) {
    baseLeaveDays = 0;
    bandBase = 0;
  } else if (damage < 50) {
    baseLeaveDays = randInt(1, 3, rng);
    bandBase = 0;
  } else if (damage < 70) {
    baseLeaveDays = randInt(3, 8, rng);
    bandBase = 2;
  } else if (damage < 85) {
    baseLeaveDays = randInt(8, 16, rng);
    bandBase = 8;
  } else {
    baseLeaveDays = randInt(14, 30, rng);
    bandBase = 16;
  }

  const longLeaveBonusDays =
    Math.floor(Math.max(0, stressToken - 2) / 2) + Math.floor(Math.max(0, damage - 70) / 10);
  const leaveDays = clampInt(baseLeaveDays + longLeaveBonusDays, 0, 30);

  const causeBonus =
    8 * num(causes.UNDERSTATED_RISK) +
    6 * num(causes.BAD_MATCH) +
    5 * num(causes.FATIGUE_OVERLOAD) +
    4 * num(causes.INFO_GAP) +
    4 * num(causes.BAD_LUCK) +
    3 * num(causes.HONOR_MISREAD);

  const pLeaveRaw = clamp(
    bandBase +
      0.65 * Math.max(0, damage - 70) +
      0.35 * stressToken +
      causeBonus -
      0.25 * trustGuild +
      randInt(-4, 4, rng),
    0,
    60
  );
  const pLeave =
    leaveDays === 0 ? 0 : damage < 50 ? clamp(pLeaveRaw, 0, 20) : clamp(pLeaveRaw, 2, 60);

  return { leaveDays, pLeave: round2(pLeave) };
}

function calcCausalScoreK(input: {
  actualDifficulty: number;
  disclosedDifficulty: number;
  damage: number;
  power: number;
  hazard: number;
  uncertainty: number;
  ignoredWarningCount: number;
}): number {
  const infoHideDegree = clamp(
    Math.abs(input.actualDifficulty - input.disclosedDifficulty) * 1.2,
    0,
    100
  );
  const failureRelatedness = clamp(
    0.6 * input.damage + 0.4 * Math.max(0, (input.hazard + input.uncertainty) / 2 - input.power),
    0,
    100
  );
  const warningIgnoreDegree = clamp(input.ignoredWarningCount * 20, 0, 100);
  return round2(0.5 * infoHideDegree + 0.3 * failureRelatedness + 0.2 * warningIgnoreDegree);
}

function scoreScenes(
  timeline: SceneResult[],
  discrepancy: Discrepancy,
  failureCauses: FailureCause[]
): SceneResult[] {
  const weighted = timeline.map((scene) => {
    const rollEvent = scene.progCritical || scene.riskCritical || scene.progFumble || scene.riskFumble ? 2 : 0;

    const discrepancyBonus =
      scene.kind === "objective" || scene.kind === "incident"
        ? discrepancy.diffRisk >= DISCREPANCY_NOTICE.risk ||
          discrepancy.diffDifficulty >= DISCREPANCY_NOTICE.difficulty ||
          discrepancy.diffHonor <= DISCREPANCY_NOTICE.honor
          ? 2
          : 0
        : 0;

    const causeLinkBonus = hasCauseLink(scene.kind, failureCauses) ? 2 : 0;
    const importanceScore = SCENE_BASE_IMPORTANCE[scene.kind] + rollEvent + discrepancyBonus + causeLinkBonus;

    return { ...scene, importanceScore };
  });

  return weighted;
}

function selectSceneHighlights(timeline: SceneResult[], maxItems: number): SceneResult[] {
  return [...timeline]
    .sort((a, b) => b.importanceScore - a.importanceScore || a.index - b.index)
    .slice(0, maxItems);
}

function hasCauseLink(kind: SceneKind, causes: FailureCause[]): boolean {
  if (causes.length === 0) return false;
  return causes.some((cause) => CAUSE_SCENE_LINKS[cause].includes(kind));
}

function firstSceneIndexForCause(cause: FailureCause, timeline: SceneResult[]): number {
  const linkedKinds = CAUSE_SCENE_LINKS[cause];
  const scene = timeline.find((item) => linkedKinds.includes(item.kind));
  return scene ? scene.index : Number.POSITIVE_INFINITY;
}

function buildDiscrepancyNotes(diff: Discrepancy): string[] {
  const notes: string[] = [];
  if (diff.diffRisk >= DISCREPANCY_NOTICE.risk) notes.push("危険申告が実態より低かった。");
  if (diff.diffDifficulty >= DISCREPANCY_NOTICE.difficulty) {
    notes.push("難易度申告が実態より低かった。");
  }
  if (diff.diffHonor <= DISCREPANCY_NOTICE.honor) notes.push("名誉見込みの申告が実態より高かった。");
  if (notes.length === 0) notes.push("特筆すべき申告食い違いは確認されなかった。");
  return notes;
}

function rollD100(rng: RngFn): number {
  return randInt(1, 100, rng);
}

function randInt(min: number, max: number, rng: RngFn): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(rng() * (high - low + 1)) + low;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampInt(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function num(flag: boolean): number {
  return flag ? 1 : 0;
}

export function createSeededRng(seed: number): RngFn {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
