import type { ResultClass } from "./mission";
import {
  BIG5_AXES,
  computeBig5Effective,
  createZeroBig5Vector,
  type AdventurerRecord,
  type Big5Axis,
  type Big5Vector,
  type CareerEval,
  type CategoryConfidenceMap,
  type CharacterJournalRecord,
  type CharacterJournalRelatedIds,
  type ExperienceState,
  type ExperienceStateDelta,
  type JournalEventKind,
  type JournalStateDelta,
  type PartialBig5Vector,
  type RequestCategoryId,
} from "../storage/types";

type DeltaTemplate = {
  importance: number;
  experienceDelta: ExperienceStateDelta;
  careerDelta: Partial<CareerEval>;
  traitVector: PartialBig5Vector;
  lessonTags: string[];
};

type InterviewOutcome = "accept" | "hold" | "decline" | "cutoff";
type ExplanationQuality = "good" | "mixed" | "poor";
type PressureStyle = "supportive" | "neutral" | "pushy";
type Transparency = "honest" | "evasive" | "hidden";
type InjurySeverity = "minor" | "major" | "long_leave";
type FeedbackTone = "praise" | "neutral" | "complaint" | "reoffer";
type Fairness = "fair" | "unfair";
type RelationShiftType = "partner_gain" | "healthy_rivalry" | "distrust" | "resentment";
type RelationIntensity = "small" | "medium" | "large";
type GuildCareStrength = "small" | "medium" | "large";
type GuildCareType = "visit" | "encourage" | "wait" | "fair_reassignment";

export type MissionResultEventInput = {
  eventKind: "MISSION_RESULT";
  day: number;
  requestCategory: RequestCategoryId;
  resultClass: ResultClass;
  roleMatch: boolean;
  publicVisibility: number;
  longLeave?: boolean;
  informationBetrayal?: boolean;
  contractViolationComplicity?: boolean;
  missionId?: string;
  assignmentId?: string;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type InjuryOrLeaveEventInput = {
  eventKind: "INJURY_OR_LEAVE";
  day: number;
  severity: InjurySeverity;
  leaveDays: number;
  supportedByTeammate?: boolean;
  missionId?: string;
  assignmentId?: string;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type InterviewSummaryEventInput = {
  eventKind: "INTERVIEW_SUMMARY";
  day: number;
  outcome: InterviewOutcome;
  explanationQuality: ExplanationQuality;
  pressureStyle: PressureStyle;
  transparency: Transparency;
  assignmentId?: string;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type ClientFeedbackEventInput = {
  eventKind: "CLIENT_FEEDBACK";
  day: number;
  tone: FeedbackTone;
  fairness: Fairness;
  publicVisibility: number;
  missionId?: string;
  assignmentId?: string;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type RelationShiftEventInput = {
  eventKind: "RELATION_SHIFT";
  day: number;
  shiftType: RelationShiftType;
  intensity: RelationIntensity;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type GuildCareEventInput = {
  eventKind: "GUILD_CARE";
  day: number;
  careType: GuildCareType;
  strength: GuildCareStrength;
  relatedIds?: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  importance?: number;
};

export type JournalEventInput =
  | MissionResultEventInput
  | InjuryOrLeaveEventInput
  | InterviewSummaryEventInput
  | ClientFeedbackEventInput
  | RelationShiftEventInput
  | GuildCareEventInput;

export type ProgressionResult = {
  adventurer: AdventurerRecord;
  journalEntry: CharacterJournalRecord;
  arcTags: string[];
  careerEvalTags: string[];
};

export const DELTA_EVENT_TABLE = {
  MISSION_RESULT: {
    成功: template(64, { selfEfficacy: 8, gloryDrive: 2, injuryCaution: -2 }, { reliability: 6, growth: 4 }, { E: 8, C: 4, N: -5 }, ["earned_confidence", "completed_work"]),
    部分成功: template(56, { selfEfficacy: 3, gloryDrive: 1 }, { reliability: 2, growth: 2 }, { C: 2, E: 1, N: -1 }, ["mixed_result", "unfinished_business"]),
    失敗: template(74, { selfEfficacy: -6, injuryCaution: 6, principleRigidity: 2 }, { reliability: -5, growth: 1 }, { C: 2, N: 5 }, ["painful_lesson", "risk_memory"]),
    惨敗: template(88, { selfEfficacy: -12, injuryCaution: 12, gloryDrive: -4, principleRigidity: 4 }, { reliability: -10, safety: -8, growth: -2 }, { O: -6, E: -5, N: 12 }, ["deep_scar", "hard_retreat"]),
  },
  INJURY_OR_LEAVE: {
    minor: template(60, { injuryCaution: 10, selfEfficacy: -4, gloryDrive: -1 }, { safety: -2 }, { N: 4 }, ["body_memory"]),
    major: template(76, { injuryCaution: 18, selfEfficacy: -8, gloryDrive: -4 }, { safety: -6, growth: -1 }, { E: -2, N: 8 }, ["painful_recovery"]),
    long_leave: template(90, { injuryCaution: 22, selfEfficacy: -12, gloryDrive: -6, principleRigidity: 2 }, { safety: -10, growth: -2 }, { O: -6, E: -5, N: 12 }, ["long_recovery", "scarred_memory"]),
  },
  INTERVIEW_SUMMARY: {
    accept: template(34, { guildBond: 4, selfEfficacy: 2 }, {}, { A: 1, C: 1 }, ["guild_alignment"]),
    hold: template(28, { principleRigidity: 1 }, {}, {}, ["still_weighing"]),
    decline: template(38, { guildBond: -2, principleRigidity: 2, selfEfficacy: -1 }, {}, { A: -1, N: 1 }, ["distance_from_offer"]),
    cutoff: template(48, { guildBond: -5, principleRigidity: 4, selfEfficacy: -2 }, {}, { A: -3, N: 3 }, ["conversation_fatigue"]),
  },
  CLIENT_FEEDBACK: {
    praise: template(42, { selfEfficacy: 4 }, { reliability: 4, growth: 2 }, {}, ["trusted_by_client"]),
    neutral: template(24, {}, {}, {}, ["routine_closure"]),
    complaint: template(46, { selfEfficacy: -3 }, { reliability: -4 }, {}, ["client_friction"]),
    reoffer: template(52, { selfEfficacy: 3 }, { reliability: 5, growth: 2 }, {}, ["repeat_request"]),
  },
  RELATION_SHIFT: {
    partner_gain: template(50, { guildBond: 2, selfEfficacy: 3 }, {}, { A: 4, E: 2, N: -2 }, ["found_partner"]),
    healthy_rivalry: template(44, { gloryDrive: 4, selfEfficacy: 2 }, {}, { E: 2, C: 1 }, ["competitive_fire"]),
    distrust: template(58, { guildBond: -1, selfEfficacy: -2, principleRigidity: 4 }, {}, { A: -3, N: 4 }, ["watchful_against_others"]),
    resentment: template(54, { injuryCaution: 2, selfEfficacy: -2, principleRigidity: 2 }, {}, { A: -2, N: 3 }, ["bad_aftertaste"]),
  },
  GUILD_CARE: {
    small: template(34, { guildBond: 4, selfEfficacy: 2, injuryCaution: -1 }, {}, { A: 1, N: -1 }, ["guild_noticed_me"]),
    medium: template(46, { guildBond: 7, selfEfficacy: 4, injuryCaution: -3 }, {}, { A: 2, N: -2 }, ["guild_has_my_back"]),
    large: template(58, { guildBond: 10, selfEfficacy: 6, injuryCaution: -4 }, {}, { A: 3, N: -3 }, ["supported_to_return"]),
  },
} as const;

export function applyJournalEvent(
  adventurer: AdventurerRecord,
  event: JournalEventInput,
  journalHistory: readonly CharacterJournalRecord[] = []
): ProgressionResult {
  const resolved = resolveEvent(event);
  const nextExperienceState = applyExperienceDelta(
    adventurer.experienceState,
    {
      ...resolved.experienceDelta,
      traitPressure: resolved.traitVector,
    },
    resolved.importance
  );
  const nextCareerEval = applyCareerDelta(adventurer.careerEval, resolved.careerDelta);
  const nextBig5Drift = deriveBig5Drift(nextExperienceState.traitPressure);
  const nextAdventurer = applyRecordUpdates(adventurer, event, nextExperienceState, nextCareerEval, nextBig5Drift);
  const journalEntry = createJournalEntry(adventurer, event, resolved, nextExperienceState, nextCareerEval, nextBig5Drift);
  const nextHistory = [...journalHistory, journalEntry];

  nextAdventurer.volatileHook = deriveVolatileHook(nextHistory, event.day);

  return {
    adventurer: nextAdventurer,
    journalEntry,
    arcTags: deriveArcTags(nextAdventurer),
    careerEvalTags: deriveCareerEvalTags(nextAdventurer.careerEval),
  };
}

export function deriveArcTags(adventurer: Pick<AdventurerRecord, "experienceState" | "careerEval" | "status">): string[] {
  const tags: string[] = [];
  const { experienceState, careerEval, status } = adventurer;

  if (experienceState.injuryCaution >= 62) {
    tags.push("慎重化");
  }
  if (experienceState.gloryDrive >= 62) {
    tags.push("名誉志向");
  }
  if (experienceState.guildBond >= 60) {
    tags.push("ギルド寄り");
  }
  if (experienceState.selfEfficacy >= 62) {
    tags.push("自信上向き");
  } else if (experienceState.selfEfficacy <= 40) {
    tags.push("自信喪失");
  }
  if (experienceState.principleRigidity >= 62) {
    tags.push("筋を通したがる");
  }
  if (careerEval.growth >= 62) {
    tags.push("伸び盛り");
  }
  if (status === "LONG_LEAVE") {
    tags.push("療養中");
  }

  return tags;
}

export function deriveCareerEvalTags(careerEval: CareerEval): string[] {
  const tags: string[] = [];

  if (careerEval.reliability >= 65) {
    tags.push("堅実");
  } else if (careerEval.reliability <= 35) {
    tags.push("不安定");
  }

  if (careerEval.safety >= 65) {
    tags.push("安定して帰る");
  } else if (careerEval.safety <= 35) {
    tags.push("危なっかしい");
  }

  if (careerEval.flashiness >= 65) {
    tags.push("華がある");
  }

  if (careerEval.ethics >= 65) {
    tags.push("筋を通す");
  } else if (careerEval.ethics <= 35) {
    tags.push("食えない");
  }

  if (careerEval.growth >= 65) {
    tags.push("伸び盛り");
  } else if (careerEval.growth <= 35) {
    tags.push("伸び悩み");
  }

  return tags;
}

type ResolvedEffect = {
  importance: number;
  experienceDelta: ExperienceStateDelta;
  careerDelta: Partial<CareerEval>;
  traitVector: PartialBig5Vector;
  lessonTags: string[];
};

function resolveEvent(event: JournalEventInput): ResolvedEffect {
  switch (event.eventKind) {
    case "MISSION_RESULT":
      return resolveMissionResultEvent(event);
    case "INJURY_OR_LEAVE":
      return resolveInjuryEvent(event);
    case "INTERVIEW_SUMMARY":
      return resolveInterviewEvent(event);
    case "CLIENT_FEEDBACK":
      return resolveClientFeedbackEvent(event);
    case "RELATION_SHIFT":
      return resolveRelationShiftEvent(event);
    case "GUILD_CARE":
      return resolveGuildCareEvent(event);
  }
}

function resolveMissionResultEvent(event: MissionResultEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.MISSION_RESULT[event.resultClass]);
  const resultDelta = getCategoryResultDelta(event.resultClass);
  const roleMatchBonus = event.roleMatch ? 2 : -2;

  mergeExperienceDelta(base.experienceDelta, {
    categoryConfidence: {
      [event.requestCategory]: resultDelta + roleMatchBonus,
    },
  });

  if (event.longLeave) {
    mergeExperienceDelta(base.experienceDelta, {
      categoryConfidence: { [event.requestCategory]: -8 },
      injuryCaution: 8,
      selfEfficacy: -6,
    });
    mergeCareerDelta(base.careerDelta, { safety: -4 });
    mergeTraitVector(base.traitVector, { N: 6, E: -2 });
    base.lessonTags.push("respect_for_recovery");
    base.importance += 10;
  }

  if (event.publicVisibility >= 70) {
    if (event.resultClass === "成功") {
      mergeExperienceDelta(base.experienceDelta, { gloryDrive: 4 });
      mergeCareerDelta(base.careerDelta, { flashiness: 8 });
      base.lessonTags.push("public_praise");
      base.importance += 4;
    } else if (event.resultClass === "部分成功") {
      mergeExperienceDelta(base.experienceDelta, { gloryDrive: 2 });
      mergeCareerDelta(base.careerDelta, { flashiness: 4 });
      base.lessonTags.push("public_attention");
      base.importance += 2;
    }
  }

  if (event.informationBetrayal) {
    mergeExperienceDelta(base.experienceDelta, { principleRigidity: 8, injuryCaution: 4 });
    mergeTraitVector(base.traitVector, { A: -8, C: 5, N: 9 });
    base.lessonTags.push("information_betrayal");
    base.importance += 8;
  }

  if (event.contractViolationComplicity) {
    mergeCareerDelta(base.careerDelta, { ethics: -8 });
    base.lessonTags.push("ethics_stain");
    base.importance += 6;
  }

  base.importance = clamp(Math.round(base.importance), 0, 100);
  return base;
}

function resolveInjuryEvent(event: InjuryOrLeaveEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.INJURY_OR_LEAVE[event.severity]);

  if (event.supportedByTeammate) {
    mergeExperienceDelta(base.experienceDelta, { guildBond: 1 });
    mergeTraitVector(base.traitVector, { A: 6, E: 3, N: -4 });
    base.lessonTags.push("saved_by_teammate");
    base.importance += 4;
  }

  return {
    ...base,
    importance: event.importance ?? clamp(Math.round(base.importance), 0, 100),
  };
}

function resolveInterviewEvent(event: InterviewSummaryEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.INTERVIEW_SUMMARY[event.outcome]);

  mergeExperienceDelta(base.experienceDelta, explanationQualityDelta(event.explanationQuality));
  mergeExperienceDelta(base.experienceDelta, pressureDelta(event.pressureStyle).experienceDelta);
  mergeTraitVector(base.traitVector, pressureDelta(event.pressureStyle).traitVector);
  mergeExperienceDelta(base.experienceDelta, transparencyDelta(event.transparency).experienceDelta);
  mergeTraitVector(base.traitVector, transparencyDelta(event.transparency).traitVector);
  base.lessonTags.push(...pressureDelta(event.pressureStyle).lessonTags, ...transparencyDelta(event.transparency).lessonTags);
  base.importance += pressureDelta(event.pressureStyle).importanceBonus + transparencyDelta(event.transparency).importanceBonus;

  return {
    ...base,
    lessonTags: dedupe(base.lessonTags),
    importance: event.importance ?? clamp(Math.round(base.importance), 0, 100),
  };
}

function resolveClientFeedbackEvent(event: ClientFeedbackEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.CLIENT_FEEDBACK[event.tone]);

  if (event.fairness === "unfair") {
    mergeExperienceDelta(base.experienceDelta, { principleRigidity: 4 });
    mergeTraitVector(base.traitVector, { A: -1, N: 3 });
    if (event.tone === "complaint") {
      mergeCareerDelta(base.careerDelta, { reliability: 2 });
    }
    base.lessonTags.push("unfair_treatment");
    base.importance += 6;
  }

  if (event.publicVisibility >= 70 && (event.tone === "praise" || event.tone === "reoffer")) {
    mergeCareerDelta(base.careerDelta, { flashiness: 6 });
    base.lessonTags.push("name_spread");
    base.importance += 4;
  }

  return {
    ...base,
    lessonTags: dedupe(base.lessonTags),
    importance: event.importance ?? clamp(Math.round(base.importance), 0, 100),
  };
}

function resolveRelationShiftEvent(event: RelationShiftEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.RELATION_SHIFT[event.shiftType]);
  const factor = relationIntensityFactor(event.intensity);

  scaleExperienceDelta(base.experienceDelta, factor);
  scaleCareerDelta(base.careerDelta, factor);
  scaleTraitVector(base.traitVector, factor);
  base.importance = clamp(Math.round(base.importance * factor), 0, 100);

  return {
    ...base,
    importance: event.importance ?? base.importance,
  };
}

function resolveGuildCareEvent(event: GuildCareEventInput): ResolvedEffect {
  const base = cloneTemplate(DELTA_EVENT_TABLE.GUILD_CARE[event.strength]);

  if (event.careType === "fair_reassignment") {
    mergeExperienceDelta(base.experienceDelta, { guildBond: 2 });
    base.lessonTags.push("fair_treatment");
  } else if (event.careType === "wait") {
    mergeExperienceDelta(base.experienceDelta, { selfEfficacy: 1 });
    base.lessonTags.push("not_rushed");
  }

  return {
    ...base,
    lessonTags: dedupe(base.lessonTags),
    importance: event.importance ?? clamp(Math.round(base.importance), 0, 100),
  };
}

function applyExperienceDelta(
  previous: ExperienceState,
  delta: ExperienceStateDelta,
  importance: number
): ExperienceState {
  const next: ExperienceState = {
    categoryConfidence: { ...previous.categoryConfidence },
    injuryCaution: evolveMemory(previous.injuryCaution, delta.injuryCaution ?? 0),
    gloryDrive: evolveMemory(previous.gloryDrive, delta.gloryDrive ?? 0),
    guildBond: evolveMemory(previous.guildBond, delta.guildBond ?? 0),
    selfEfficacy: evolveMemory(previous.selfEfficacy, delta.selfEfficacy ?? 0),
    principleRigidity: evolveMemory(previous.principleRigidity, delta.principleRigidity ?? 0),
    traitPressure: { ...previous.traitPressure },
  };

  if (delta.categoryConfidence) {
    for (const [categoryId, categoryDelta] of Object.entries(delta.categoryConfidence) as [
      RequestCategoryId,
      number,
    ][]) {
      next.categoryConfidence[categoryId] = evolveCategoryConfidence(
        previous.categoryConfidence[categoryId],
        categoryDelta
      );
    }
  }

  for (const axis of BIG5_AXES) {
    next.traitPressure[axis] = evolveTraitPressure(
      previous.traitPressure[axis],
      delta.traitPressure?.[axis] ?? 0,
      importance
    );
  }

  return next;
}

function applyCareerDelta(previous: CareerEval, delta: Partial<CareerEval>): CareerEval {
  return {
    reliability: clamp(previous.reliability + (delta.reliability ?? 0), 0, 100),
    safety: clamp(previous.safety + (delta.safety ?? 0), 0, 100),
    flashiness: clamp(previous.flashiness + (delta.flashiness ?? 0), 0, 100),
    ethics: clamp(previous.ethics + (delta.ethics ?? 0), 0, 100),
    growth: clamp(previous.growth + (delta.growth ?? 0), 0, 100),
  };
}

function deriveBig5Drift(traitPressure: Big5Vector): Big5Vector {
  return {
    O: clamp(Math.round(0.12 * traitPressure.O), -12, 12),
    C: clamp(Math.round(0.12 * traitPressure.C), -12, 12),
    E: clamp(Math.round(0.12 * traitPressure.E), -12, 12),
    A: clamp(Math.round(0.12 * traitPressure.A), -12, 12),
    N: clamp(Math.round(0.12 * traitPressure.N), -12, 12),
  };
}

function applyRecordUpdates(
  previous: AdventurerRecord,
  event: JournalEventInput,
  nextExperienceState: ExperienceState,
  nextCareerEval: CareerEval,
  nextBig5Drift: Big5Vector
): AdventurerRecord {
  const nextStatus =
    event.eventKind === "INJURY_OR_LEAVE" && event.leaveDays > 0 ? "LONG_LEAVE" : previous.status;
  const nextAvailableDay =
    event.eventKind === "INJURY_OR_LEAVE" ? Math.max(previous.availableDay, event.day + event.leaveDays) : previous.availableDay;

  return {
    ...previous,
    status: nextStatus,
    availableDay: nextAvailableDay,
    experienceState: nextExperienceState,
    careerEval: nextCareerEval,
    big5Drift: nextBig5Drift,
    big5Effective: computeBig5Effective(previous.big5Base, nextBig5Drift),
  };
}

function createJournalEntry(
  previous: AdventurerRecord,
  event: JournalEventInput,
  resolved: ResolvedEffect,
  nextExperienceState: ExperienceState,
  nextCareerEval: CareerEval,
  nextBig5Drift: Big5Vector
): CharacterJournalRecord {
  return {
    journalId: createJournalId(previous.adventurerId, event.day, event.eventKind, event.headline),
    adventurerId: previous.adventurerId,
    day: event.day,
    eventKind: event.eventKind,
    importance: resolved.importance,
    missionId: "missionId" in event ? event.missionId : undefined,
    assignmentId: "assignmentId" in event ? event.assignmentId : undefined,
    relatedIds: event.relatedIds ?? {},
    headline: event.headline,
    factDigest: event.factDigest,
    emotionDigest: event.emotionDigest,
    lessonTags: resolved.lessonTags,
    traitVector: normalizeBig5Vector(resolved.traitVector),
    stateDelta: buildStateDelta(previous, nextExperienceState, nextCareerEval, nextBig5Drift),
  };
}

function buildStateDelta(
  previous: AdventurerRecord,
  nextExperienceState: ExperienceState,
  nextCareerEval: CareerEval,
  nextBig5Drift: Big5Vector
): JournalStateDelta {
  const categoryConfidenceDelta: Partial<CategoryConfidenceMap> = {};

  for (const categoryId of Object.keys(nextExperienceState.categoryConfidence) as RequestCategoryId[]) {
    const diff = nextExperienceState.categoryConfidence[categoryId] - previous.experienceState.categoryConfidence[categoryId];
    if (diff !== 0) {
      categoryConfidenceDelta[categoryId] = round(diff);
    }
  }

  const traitPressureDelta: PartialBig5Vector = {};
  const big5DriftDelta: PartialBig5Vector = {};

  for (const axis of BIG5_AXES) {
    const pressureDiff = nextExperienceState.traitPressure[axis] - previous.experienceState.traitPressure[axis];
    if (pressureDiff !== 0) {
      traitPressureDelta[axis] = round(pressureDiff);
    }

    const driftDiff = nextBig5Drift[axis] - previous.big5Drift[axis];
    if (driftDiff !== 0) {
      big5DriftDelta[axis] = round(driftDiff);
    }
  }

  return {
    experienceStateDelta: {
      categoryConfidence: Object.keys(categoryConfidenceDelta).length > 0 ? categoryConfidenceDelta : undefined,
      injuryCaution: diffOrUndefined(nextExperienceState.injuryCaution, previous.experienceState.injuryCaution),
      gloryDrive: diffOrUndefined(nextExperienceState.gloryDrive, previous.experienceState.gloryDrive),
      guildBond: diffOrUndefined(nextExperienceState.guildBond, previous.experienceState.guildBond),
      selfEfficacy: diffOrUndefined(nextExperienceState.selfEfficacy, previous.experienceState.selfEfficacy),
      principleRigidity: diffOrUndefined(nextExperienceState.principleRigidity, previous.experienceState.principleRigidity),
      traitPressure: Object.keys(traitPressureDelta).length > 0 ? traitPressureDelta : undefined,
    },
    careerEvalDelta: {
      reliability: diffOrUndefined(nextCareerEval.reliability, previous.careerEval.reliability),
      safety: diffOrUndefined(nextCareerEval.safety, previous.careerEval.safety),
      flashiness: diffOrUndefined(nextCareerEval.flashiness, previous.careerEval.flashiness),
      ethics: diffOrUndefined(nextCareerEval.ethics, previous.careerEval.ethics),
      growth: diffOrUndefined(nextCareerEval.growth, previous.careerEval.growth),
    },
    big5DriftDelta,
  };
}

function createJournalId(adventurerId: string, day: number, eventKind: JournalEventKind, headline: string): string {
  const slug = slugify(headline) || "entry";

  return [
    "jrnl",
    adventurerId,
    String(day).padStart(4, "0"),
    eventKind.toLowerCase(),
    slug.slice(0, 24),
  ].join("_");
}

function deriveVolatileHook(history: readonly CharacterJournalRecord[], currentDay: number): string {
  const candidate = [...history]
    .filter((entry) => currentDay - entry.day <= 30)
    .sort((left, right) => right.importance - left.importance || right.day - left.day)[0];

  if (!candidate) {
    return "";
  }

  return candidate.emotionDigest || candidate.headline;
}

function evolveMemory(previous: number, deltaEvent: number): number {
  return clamp(50 + 0.88 * (previous - 50) + deltaEvent, 0, 100);
}

function evolveCategoryConfidence(previous: number, deltaEvent: number): number {
  return clamp(50 + 0.82 * (previous - 50) + deltaEvent, 0, 100);
}

function evolveTraitPressure(previous: number, traitVectorEvent: number, importance: number): number {
  const impactScale = 0.6 + importance / 100;
  return clamp(0.94 * previous + traitVectorEvent * impactScale, -100, 100);
}

function getCategoryResultDelta(resultClass: ResultClass): number {
  switch (resultClass) {
    case "成功":
      return 8;
    case "部分成功":
      return 3;
    case "失敗":
      return -6;
    case "惨敗":
      return -12;
  }
}

function explanationQualityDelta(quality: ExplanationQuality): ExperienceStateDelta {
  switch (quality) {
    case "good":
      return { guildBond: 3 };
    case "mixed":
      return {};
    case "poor":
      return { guildBond: -3, principleRigidity: 2, selfEfficacy: -1 };
  }
}

function pressureDelta(style: PressureStyle): {
  experienceDelta: ExperienceStateDelta;
  traitVector: PartialBig5Vector;
  importanceBonus: number;
  lessonTags: string[];
} {
  switch (style) {
    case "supportive":
      return {
        experienceDelta: { guildBond: 2, selfEfficacy: 1 },
        traitVector: {},
        importanceBonus: 0,
        lessonTags: ["felt_supported"],
      };
    case "neutral":
      return {
        experienceDelta: {},
        traitVector: {},
        importanceBonus: 0,
        lessonTags: [],
      };
    case "pushy":
      return {
        experienceDelta: { guildBond: -4, principleRigidity: 3, selfEfficacy: -1 },
        traitVector: { A: -2, N: 2 },
        importanceBonus: 4,
        lessonTags: ["pressure_resisted"],
      };
  }
}

function transparencyDelta(transparency: Transparency): {
  experienceDelta: ExperienceStateDelta;
  traitVector: PartialBig5Vector;
  importanceBonus: number;
  lessonTags: string[];
} {
  switch (transparency) {
    case "honest":
      return {
        experienceDelta: { guildBond: 2 },
        traitVector: {},
        importanceBonus: 0,
        lessonTags: ["clear_explanation"],
      };
    case "evasive":
      return {
        experienceDelta: { principleRigidity: 2 },
        traitVector: { N: 2 },
        importanceBonus: 2,
        lessonTags: ["evasive_answer"],
      };
    case "hidden":
      return {
        experienceDelta: { guildBond: -5, principleRigidity: 5 },
        traitVector: { A: -3, N: 4 },
        importanceBonus: 10,
        lessonTags: ["hidden_information"],
      };
  }
}

function relationIntensityFactor(intensity: RelationIntensity): number {
  switch (intensity) {
    case "small":
      return 0.7;
    case "medium":
      return 1.0;
    case "large":
      return 1.3;
  }
}

function template(
  importance: number,
  experienceDelta: ExperienceStateDelta,
  careerDelta: Partial<CareerEval>,
  traitVector: PartialBig5Vector,
  lessonTags: string[]
): DeltaTemplate {
  return {
    importance,
    experienceDelta,
    careerDelta,
    traitVector,
    lessonTags,
  };
}

function cloneTemplate(templateValue: DeltaTemplate): DeltaTemplate {
  return {
    importance: templateValue.importance,
    experienceDelta: {
      ...templateValue.experienceDelta,
      categoryConfidence: templateValue.experienceDelta.categoryConfidence
        ? { ...templateValue.experienceDelta.categoryConfidence }
        : undefined,
      traitPressure: templateValue.experienceDelta.traitPressure
        ? { ...templateValue.experienceDelta.traitPressure }
        : undefined,
    },
    careerDelta: { ...templateValue.careerDelta },
    traitVector: { ...templateValue.traitVector },
    lessonTags: [...templateValue.lessonTags],
  };
}

function mergeExperienceDelta(target: ExperienceStateDelta, source: ExperienceStateDelta): void {
  if (source.categoryConfidence) {
    target.categoryConfidence = {
      ...(target.categoryConfidence ?? {}),
      ...sumObjects(target.categoryConfidence ?? {}, source.categoryConfidence),
    };
  }

  target.injuryCaution = sumMaybe(target.injuryCaution, source.injuryCaution);
  target.gloryDrive = sumMaybe(target.gloryDrive, source.gloryDrive);
  target.guildBond = sumMaybe(target.guildBond, source.guildBond);
  target.selfEfficacy = sumMaybe(target.selfEfficacy, source.selfEfficacy);
  target.principleRigidity = sumMaybe(target.principleRigidity, source.principleRigidity);

  if (source.traitPressure) {
    target.traitPressure = {
      ...(target.traitPressure ?? {}),
      ...sumObjects(target.traitPressure ?? {}, source.traitPressure),
    };
  }
}

function mergeCareerDelta(target: Partial<CareerEval>, source: Partial<CareerEval>): void {
  target.reliability = sumMaybe(target.reliability, source.reliability);
  target.safety = sumMaybe(target.safety, source.safety);
  target.flashiness = sumMaybe(target.flashiness, source.flashiness);
  target.ethics = sumMaybe(target.ethics, source.ethics);
  target.growth = sumMaybe(target.growth, source.growth);
}

function mergeTraitVector(target: PartialBig5Vector, source: PartialBig5Vector): void {
  target.O = sumMaybe(target.O, source.O);
  target.C = sumMaybe(target.C, source.C);
  target.E = sumMaybe(target.E, source.E);
  target.A = sumMaybe(target.A, source.A);
  target.N = sumMaybe(target.N, source.N);
}

function scaleExperienceDelta(target: ExperienceStateDelta, factor: number): void {
  if (target.categoryConfidence) {
    for (const key of Object.keys(target.categoryConfidence) as RequestCategoryId[]) {
      target.categoryConfidence[key] = round(target.categoryConfidence[key]! * factor);
    }
  }

  target.injuryCaution = scaleMaybe(target.injuryCaution, factor);
  target.gloryDrive = scaleMaybe(target.gloryDrive, factor);
  target.guildBond = scaleMaybe(target.guildBond, factor);
  target.selfEfficacy = scaleMaybe(target.selfEfficacy, factor);
  target.principleRigidity = scaleMaybe(target.principleRigidity, factor);

  if (target.traitPressure) {
    for (const axis of Object.keys(target.traitPressure) as Big5Axis[]) {
      target.traitPressure[axis] = round(target.traitPressure[axis]! * factor);
    }
  }
}

function scaleCareerDelta(target: Partial<CareerEval>, factor: number): void {
  target.reliability = scaleMaybe(target.reliability, factor);
  target.safety = scaleMaybe(target.safety, factor);
  target.flashiness = scaleMaybe(target.flashiness, factor);
  target.ethics = scaleMaybe(target.ethics, factor);
  target.growth = scaleMaybe(target.growth, factor);
}

function scaleTraitVector(target: PartialBig5Vector, factor: number): void {
  target.O = scaleMaybe(target.O, factor);
  target.C = scaleMaybe(target.C, factor);
  target.E = scaleMaybe(target.E, factor);
  target.A = scaleMaybe(target.A, factor);
  target.N = scaleMaybe(target.N, factor);
}

function normalizeBig5Vector(vector: PartialBig5Vector): PartialBig5Vector {
  const next = createZeroBig5Vector();
  for (const axis of BIG5_AXES) {
    next[axis] = vector[axis] ?? 0;
  }

  return next;
}

function sumObjects<T extends string>(left: Partial<Record<T, number>>, right: Partial<Record<T, number>>): Partial<Record<T, number>> {
  const next: Partial<Record<T, number>> = { ...left };
  for (const key of Object.keys(right) as T[]) {
    next[key] = (left[key] ?? 0) + (right[key] ?? 0);
  }

  return next;
}

function sumMaybe(current: number | undefined, incoming: number | undefined): number | undefined {
  if (incoming == null) {
    return current;
  }

  return (current ?? 0) + incoming;
}

function scaleMaybe(value: number | undefined, factor: number): number | undefined {
  return value == null ? value : round(value * factor);
}

function diffOrUndefined(next: number, previous: number): number | undefined {
  const diff = round(next - previous);
  return diff === 0 ? undefined : diff;
}

function dedupe(items: readonly string[]): string[] {
  return [...new Set(items)];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
