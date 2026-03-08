import {
  applyJournalEvent,
  deriveArcTags,
  deriveCareerEvalTags,
  type JournalEventInput,
} from "./characterProgression";
import {
  computeBig5Effective,
  createNeutralCareerEval,
  createNeutralExperienceState,
  createZeroBig5Vector,
  type AdventurerRecord,
  type Big5Vector,
  type CharacterJournalRecord,
} from "../storage/types";

type Scenario = {
  name: string;
  adventurer: AdventurerRecord;
  days: Array<{
    day: number;
    events: JournalEventInput[];
  }>;
};

const edda = createSampleAdventurer({
  adventurerId: "adv_edda",
  name: "エッダ・グラウベル",
  big5Base: { O: 38, C: 82, E: 34, A: 61, N: 57 },
  publicDigest:
    "几帳面で口数は少ないが、危険の見積もりに関しては誰よりもしつこい槍手。無茶な英雄譚より、全員が帰る仕事を良しとする。",
  privateDossier: "街道警備あがり。誤情報と責任逃れを嫌う。",
  volatileHook: "今月の仕送り額が足りず、割の悪い依頼に苛立っている。",
  trustGuildBase: 54,
  mood: 48,
  fatigue: 24,
});

const marlo = createSampleAdventurer({
  adventurerId: "adv_marlo",
  name: "マルロ・フェイン",
  big5Base: { O: 79, C: 41, E: 76, A: 47, N: 32 },
  publicDigest:
    "大仰な口上と軽い足取りで場をさらう若手。火遊びめいた危うさはあるが、空気を動かす才能は本物。",
  privateDossier: "旅回り一座育ち。拍手と野次の両方に依存している。",
  volatileHook: "最近、自分より評判を集める新顔を妙に意識している。",
  trustGuildBase: 58,
  mood: 62,
  fatigue: 18,
});

const scenarios: Scenario[] = [
  {
    name: "エッダ・グラウベル",
    adventurer: edda,
    days: [
      {
        day: 1,
        events: [
          {
            eventKind: "INTERVIEW_SUMMARY",
            day: 1,
            outcome: "accept",
            explanationQuality: "good",
            pressureStyle: "supportive",
            transparency: "honest",
            assignmentId: "asg_edda_guard_01",
            headline: "危険説明が通り、護衛依頼を受けた",
            factDigest: "依頼の経路、人数、退路を細かく確認し、納得して受諾した。",
            emotionDigest: "話が筋立っていたので、今回は預けられる。",
          },
          {
            eventKind: "MISSION_RESULT",
            day: 1,
            requestCategory: "guard",
            resultClass: "成功",
            roleMatch: true,
            publicVisibility: 38,
            missionId: "mis_edda_guard_01",
            assignmentId: "asg_edda_guard_01",
            relatedIds: { clientId: "cli_caravan_01", teammateIds: ["adv_ward_01"] },
            headline: "街道護衛を無傷で完遂",
            factDigest: "退路確保を優先し、荷と依頼主を予定通り届けた。",
            emotionDigest: "派手さはないが、こういう仕事でいい。",
          },
          {
            eventKind: "CLIENT_FEEDBACK",
            day: 1,
            tone: "reoffer",
            fairness: "fair",
            publicVisibility: 38,
            missionId: "mis_edda_guard_01",
            assignmentId: "asg_edda_guard_01",
            relatedIds: { clientId: "cli_caravan_01" },
            headline: "依頼主が次回の護衛も打診",
            factDigest: "荷主は到着後すぐ、次便もエッダに任せたいと伝えた。",
            emotionDigest: "正当に見てもらえるなら、付き合う価値はある。",
          },
        ],
      },
      {
        day: 2,
        events: [
          {
            eventKind: "RELATION_SHIFT",
            day: 2,
            shiftType: "partner_gain",
            intensity: "medium",
            relatedIds: { teammateIds: ["adv_ward_01"], relationId: "rel_edda_ward_01" },
            headline: "若手斥候との連携が噛み合い始める",
            factDigest: "索敵の呼吸が合い、護衛中の視線配りが楽になった。",
            emotionDigest: "次も背中を任せてもよさそうだ。",
          },
        ],
      },
      {
        day: 3,
        events: [
          {
            eventKind: "MISSION_RESULT",
            day: 3,
            requestCategory: "guard",
            resultClass: "部分成功",
            roleMatch: true,
            publicVisibility: 42,
            informationBetrayal: true,
            missionId: "mis_edda_guard_02",
            assignmentId: "asg_edda_guard_02",
            relatedIds: { clientId: "cli_minor_noble_02", teammateIds: ["adv_ward_01"] },
            headline: "護衛先で伏せられた襲撃情報に遭遇",
            factDigest: "申告より敵数が多く、荷は守ったが隊列が崩れて消耗が出た。",
            emotionDigest: "黙っていたなら話は別だ。次はもっと詰める。",
          },
          {
            eventKind: "CLIENT_FEEDBACK",
            day: 3,
            tone: "complaint",
            fairness: "unfair",
            publicVisibility: 42,
            missionId: "mis_edda_guard_02",
            assignmentId: "asg_edda_guard_02",
            relatedIds: { clientId: "cli_minor_noble_02" },
            headline: "依頼主は損傷分だけを責めた",
            factDigest: "護衛対象は守られたが、依頼主は破れた荷袋ばかりを非難した。",
            emotionDigest: "守るものは守ったのに、その言い草か。",
          },
        ],
      },
    ],
  },
  {
    name: "マルロ・フェイン",
    adventurer: marlo,
    days: [
      {
        day: 1,
        events: [
          {
            eventKind: "INTERVIEW_SUMMARY",
            day: 1,
            outcome: "accept",
            explanationQuality: "good",
            pressureStyle: "supportive",
            transparency: "honest",
            assignmentId: "asg_marlo_inv_01",
            headline: "見栄えのある調査依頼に乗り気になる",
            factDigest: "夜市潜入の目的と見せ場を説明され、勢いよく受諾した。",
            emotionDigest: "こういう舞台なら、オレの出番だ。",
          },
          {
            eventKind: "MISSION_RESULT",
            day: 1,
            requestCategory: "investigate",
            resultClass: "成功",
            roleMatch: true,
            publicVisibility: 82,
            missionId: "mis_marlo_inv_01",
            assignmentId: "asg_marlo_inv_01",
            relatedIds: { clientId: "cli_night_market_01", teammateIds: ["adv_bow_07"] },
            headline: "夜市の潜入調査を派手に決める",
            factDigest: "人目を引いて囮になりつつ、裏帳簿の持ち出しまで通した。",
            emotionDigest: "拍手はなくても、視線は全部こっちだった。",
          },
          {
            eventKind: "CLIENT_FEEDBACK",
            day: 1,
            tone: "praise",
            fairness: "fair",
            publicVisibility: 82,
            missionId: "mis_marlo_inv_01",
            assignmentId: "asg_marlo_inv_01",
            relatedIds: { clientId: "cli_night_market_01" },
            headline: "夜市の世話役が名指しで礼を述べる",
            factDigest: "依頼主は人前でマルロの即興対応を褒め、次も呼ぶと約束した。",
            emotionDigest: "名前が広がる感触は悪くない。",
          },
        ],
      },
      {
        day: 2,
        events: [
          {
            eventKind: "RELATION_SHIFT",
            day: 2,
            shiftType: "healthy_rivalry",
            intensity: "medium",
            relatedIds: { teammateIds: ["adv_bow_07"], relationId: "rel_marlo_bow_07" },
            headline: "同世代の弓手を強く意識し始める",
            factDigest: "潜入後の報告で弓手の冷静さが目立ち、妙に競争心を煽られた。",
            emotionDigest: "次は先に見せ場を取る。",
          },
          {
            eventKind: "MISSION_RESULT",
            day: 2,
            requestCategory: "transport",
            resultClass: "惨敗",
            roleMatch: false,
            publicVisibility: 30,
            longLeave: true,
            missionId: "mis_marlo_trans_02",
            assignmentId: "asg_marlo_trans_02",
            relatedIds: { clientId: "cli_warehouse_02", teammateIds: ["adv_bow_07"] },
            headline: "運搬中に無理な見せ場を作って崩れる",
            factDigest: "地味な運搬で焦れ、荷馬車前方へ飛び出した結果、伏兵への反応が遅れた。",
            emotionDigest: "退屈を嫌って踏み込みすぎた。今回は笑えない。",
          },
          {
            eventKind: "INJURY_OR_LEAVE",
            day: 2,
            severity: "long_leave",
            leaveDays: 10,
            supportedByTeammate: true,
            missionId: "mis_marlo_trans_02",
            assignmentId: "asg_marlo_trans_02",
            relatedIds: { teammateIds: ["adv_bow_07"] },
            headline: "脚を深く痛め、十日単位の療養へ",
            factDigest: "退避は仲間に支えられ、本人はしばらく現場復帰できない見込みになった。",
            emotionDigest: "笑ってごまかせる痛みじゃない。",
          },
        ],
      },
      {
        day: 3,
        events: [
          {
            eventKind: "GUILD_CARE",
            day: 3,
            careType: "encourage",
            strength: "large",
            relatedIds: { teammateIds: ["adv_bow_07"] },
            headline: "見舞いと復帰後の再配置案を受ける",
            factDigest: "ギルドは療養中も切り捨てず、復帰後は撹乱寄りの依頼を優先すると伝えた。",
            emotionDigest: "まだ切られていないなら、戻る舞台はある。",
          },
        ],
      },
    ],
  },
];

for (const scenario of scenarios) {
  runScenario(scenario);
}

function runScenario(scenario: Scenario): void {
  let current = scenario.adventurer;
  const journal: CharacterJournalRecord[] = [];

  console.log(`\n=== ${scenario.name} ===`);
  console.log("初期状態");
  console.log(JSON.stringify(summarize(current), null, 2));

  for (const block of scenario.days) {
    console.log(`\nDay ${block.day}`);
    for (const event of block.events) {
      const result = applyJournalEvent(current, event, journal);
      current = result.adventurer;
      journal.push(result.journalEntry);
      console.log(`- ${event.headline}`);
      console.log(`  ${event.emotionDigest}`);
    }

    console.log(JSON.stringify(summarize(current), null, 2));
  }
}

function createSampleAdventurer(input: {
  adventurerId: string;
  name: string;
  big5Base: Big5Vector;
  publicDigest: string;
  privateDossier: string;
  volatileHook: string;
  trustGuildBase: number;
  mood: number;
  fatigue: number;
}): AdventurerRecord {
  const big5Drift = createZeroBig5Vector();

  return {
    adventurerId: input.adventurerId,
    name: input.name,
    big5Base: input.big5Base,
    big5Drift,
    big5Effective: computeBig5Effective(input.big5Base, big5Drift),
    experienceState: createNeutralExperienceState(),
    careerEval: createNeutralCareerEval(),
    status: "WAITING",
    fatigue: input.fatigue,
    mood: input.mood,
    trustGuildBase: input.trustGuildBase,
    publicDigest: input.publicDigest,
    privateDossier: input.privateDossier,
    volatileHook: input.volatileHook,
    availableDay: 1,
    createdDay: 1,
  };
}

function summarize(adventurer: AdventurerRecord): Record<string, unknown> {
  return {
    status: adventurer.status,
    availableDay: adventurer.availableDay,
    big5Effective: adventurer.big5Effective,
    experienceState: {
      injuryCaution: adventurer.experienceState.injuryCaution,
      gloryDrive: adventurer.experienceState.gloryDrive,
      guildBond: adventurer.experienceState.guildBond,
      selfEfficacy: adventurer.experienceState.selfEfficacy,
      principleRigidity: adventurer.experienceState.principleRigidity,
      categoryConfidence: adventurer.experienceState.categoryConfidence,
    },
    careerEval: adventurer.careerEval,
    arcTags: deriveArcTags(adventurer),
    careerEvalTags: deriveCareerEvalTags(adventurer.careerEval),
    volatileHook: adventurer.volatileHook,
  };
}
