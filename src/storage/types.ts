import type { MissionOutput } from "../sim/mission";

export const BIG5_AXES = ["O", "C", "E", "A", "N"] as const;
export type Big5Axis = (typeof BIG5_AXES)[number];
export type Big5Vector = Record<Big5Axis, number>;
export type PartialBig5Vector = Partial<Big5Vector>;

export const REQUEST_CATEGORY_IDS = [
  "slay",
  "guard",
  "investigate",
  "gather",
  "transport",
  "negotiate",
] as const;
export type RequestCategoryId = (typeof REQUEST_CATEGORY_IDS)[number];
export type CategoryConfidenceMap = Record<RequestCategoryId, number>;

export type ExperienceState = {
  categoryConfidence: CategoryConfidenceMap;
  injuryCaution: number;
  gloryDrive: number;
  guildBond: number;
  selfEfficacy: number;
  principleRigidity: number;
  traitPressure: Big5Vector;
};

export type CareerEval = {
  reliability: number;
  safety: number;
  flashiness: number;
  ethics: number;
  growth: number;
};

export type ExperienceStateDelta = {
  categoryConfidence?: Partial<CategoryConfidenceMap>;
  injuryCaution?: number;
  gloryDrive?: number;
  guildBond?: number;
  selfEfficacy?: number;
  principleRigidity?: number;
  traitPressure?: PartialBig5Vector;
};

export type JournalStateDelta = {
  experienceStateDelta: ExperienceStateDelta;
  careerEvalDelta: Partial<CareerEval>;
  big5DriftDelta: PartialBig5Vector;
};

export type MetaValue = string | number | boolean | null | Record<string, unknown>;
export type MetaRecord = {
  key: string;
  value: MetaValue;
};

export type ClientTrustAxes = {
  appropriateness: number;
  ethics: number;
  profitability: number;
};

export type AdventurerReputationAxes = {
  safety: number;
  fairness: number;
  growth: number;
};

export type ClientType =
  | "INDIVIDUAL"
  | "MERCHANT"
  | "NOBLE"
  | "TEMPLE"
  | "CIVIC"
  | "GUILD"
  | "OTHER";

export type ClientRecord = {
  clientId: string;
  name: string;
  type: ClientType;
  trustAxes: ClientTrustAxes;
  errorProfile: Record<string, number>;
  publicDigest: string;
  privateDossier: string;
  volatileHook: string;
  createdDay: number;
};

export type AdventurerStatus = "WAITING" | "IN_MISSION" | "LONG_LEAVE" | "LEFT_GUILD";

export type AdventurerRecord = {
  adventurerId: string;
  name: string;
  big5Base: Big5Vector;
  big5Drift: Big5Vector;
  big5Effective: Big5Vector;
  experienceState: ExperienceState;
  careerEval: CareerEval;
  status: AdventurerStatus;
  fatigue: number;
  mood: number;
  trustGuildBase: number;
  publicDigest: string;
  privateDossier: string;
  volatileHook: string;
  availableDay: number;
  createdDay: number;
};

export type RequestStatus = "NEW" | "POSTED" | "WITHDRAWN" | "EXPIRED" | "CLOSED";
export type BoardScope = "PUBLIC" | "LIMITED" | "PRIVATE";

export type RequestRecord = {
  requestId: string;
  clientId: string;
  status: RequestStatus;
  boardScope: BoardScope;
  categoryId: RequestCategoryId;
  disclosedDifficulty: number;
  disclosedHazard: number;
  disclosedExpectedHonor: number;
  disclosedDishonorRisk: number;
  disclosedPublicVisibility: number;
  disclosedStyleLevel: number;
  actualDifficulty: number;
  actualHazard: number;
  actualUncertainty: number;
  actualDistance: number;
  actualExpectedHonor: number;
  actualDishonorRisk: number;
  actualPublicVisibility: number;
  actualStyleLevel: number;
  expiresDay: number;
  createdDay: number;
};

export type AssignmentState =
  | "INTERVIEWING"
  | "HOLD"
  | "DECLINED"
  | "ACCEPT_PENDING"
  | "IN_MISSION"
  | "RETURNED_UNREAD"
  | "CLOSED";

export type AssignmentDecisionState = "PENDING" | "ACCEPT" | "HOLD" | "DECLINE";

export type AssignmentRecord = {
  assignmentId: string;
  requestId: string;
  adventurerId: string;
  assignmentState: AssignmentState;
  decisionState: AssignmentDecisionState;
  interviewState: Record<string, unknown>;
  prepBonus: number;
  updatedDay: number;
};

export type RelationEntityType = "ADVENTURER" | "CLIENT";

export type RelationRecord = {
  relationId: string;
  sourceType: RelationEntityType;
  sourceId: string;
  targetType: RelationEntityType;
  targetId: string;
  affinity: number;
  missionTrust: number;
  rivalry: number;
  resentment: number;
  pairSynergy: number;
  pairTension: number;
  lastUpdatedDay: number;
  lastEventId: string | null;
};

export type RelationEventRecord = {
  eventId: string;
  relationId: string;
  day: number;
  eventType: string;
  delta: Record<string, number>;
  missionId?: string;
  assignmentId?: string;
  noteDigest: string;
};

export type DepartureQueueRecord = {
  assignmentId: string;
  adventurerId: string;
  requestId: string;
  dueDay: number;
  pendingDays: number;
  retryCount: number;
  createdDay: number;
};

export type MissionResultSnapshot = MissionOutput & {
  requestCategory: RequestCategoryId;
  adventurerIds: string[];
};

export type MissionRunState = "RUNNING" | "RETURNED" | "CLOSED";

export type MissionRunRecord = {
  missionId: string;
  assignmentId: string;
  departDay: number;
  returnDueDay: number;
  durationDays: number;
  resultSnapshot: MissionResultSnapshot;
  state: MissionRunState;
};

export type ReportRecord = {
  reportId: string;
  missionId: string;
  returnedDay: number;
  unread: boolean;
  summary3: [string, string, string];
  detailPayload: Record<string, unknown>;
};

export type InterviewLogRecord = {
  logId: string;
  assignmentId: string;
  adventurerId: string;
  day: number;
  turn: number;
  action: string;
  decisionState: AssignmentDecisionState;
  summaryText: string;
  internalDigest: Record<string, unknown>;
};

export type JournalEventKind =
  | "MISSION_RESULT"
  | "INJURY_OR_LEAVE"
  | "INTERVIEW_SUMMARY"
  | "CLIENT_FEEDBACK"
  | "RELATION_SHIFT"
  | "GUILD_CARE";

export type CharacterJournalRelatedIds = {
  clientId?: string;
  teammateIds?: string[];
  relationId?: string;
  reportId?: string;
};

export type CharacterJournalRecord = {
  journalId: string;
  adventurerId: string;
  day: number;
  eventKind: JournalEventKind;
  importance: number;
  missionId?: string;
  assignmentId?: string;
  relatedIds: CharacterJournalRelatedIds;
  headline: string;
  factDigest: string;
  emotionDigest: string;
  lessonTags: string[];
  traitVector: PartialBig5Vector;
  stateDelta: JournalStateDelta;
};

export type ReputationDailyRecord = {
  repId: string;
  day: number;
  clientAxes: ClientTrustAxes;
  adventurerAxes: AdventurerReputationAxes;
  deltaReason: string[];
};

export type AiCacheRecord = {
  cacheKey: string;
  eventType: string;
  entityId: string;
  day: number;
  contextHash: string;
  textJson: string;
  createdAt: string;
  expiresAt: string;
};

export type DebugMetricRecord = {
  metricId: string;
  day: number;
  category: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type StoreRecordMap = {
  meta: MetaRecord;
  clients: ClientRecord;
  adventurers: AdventurerRecord;
  requests: RequestRecord;
  assignments: AssignmentRecord;
  relations: RelationRecord;
  relation_events: RelationEventRecord;
  departure_queue: DepartureQueueRecord;
  mission_runs: MissionRunRecord;
  reports: ReportRecord;
  interview_logs: InterviewLogRecord;
  character_journal: CharacterJournalRecord;
  reputation_daily: ReputationDailyRecord;
  ai_cache: AiCacheRecord;
  debug_metrics: DebugMetricRecord;
};

export type StoreName = keyof StoreRecordMap;

export function createZeroBig5Vector(): Big5Vector {
  return { O: 0, C: 0, E: 0, A: 0, N: 0 };
}

export function createNeutralBig5Vector(value = 50): Big5Vector {
  return { O: value, C: value, E: value, A: value, N: value };
}

export function createNeutralCategoryConfidence(value = 50): CategoryConfidenceMap {
  return {
    slay: value,
    guard: value,
    investigate: value,
    gather: value,
    transport: value,
    negotiate: value,
  };
}

export function createNeutralExperienceState(): ExperienceState {
  return {
    categoryConfidence: createNeutralCategoryConfidence(),
    injuryCaution: 50,
    gloryDrive: 50,
    guildBond: 50,
    selfEfficacy: 50,
    principleRigidity: 50,
    traitPressure: createZeroBig5Vector(),
  };
}

export function createNeutralCareerEval(): CareerEval {
  return {
    reliability: 50,
    safety: 50,
    flashiness: 50,
    ethics: 50,
    growth: 50,
  };
}

export function computeBig5Effective(base: Big5Vector, drift: Big5Vector): Big5Vector {
  return {
    O: clamp(base.O + drift.O, 0, 100),
    C: clamp(base.C + drift.C, 0, 100),
    E: clamp(base.E + drift.E, 0, 100),
    A: clamp(base.A + drift.A, 0, 100),
    N: clamp(base.N + drift.N, 0, 100),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
