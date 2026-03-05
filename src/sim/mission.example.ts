import { createSeededRng, runMission, type MissionInput } from "./mission";

const input: MissionInput = {
  requestId: "req_001",
  day: 1,
  request: {
    actualDifficulty: 64,
    hazard: 58,
    uncertainty: 46,
    distance: 40,
    disclosedDifficulty: 52,
    disclosedHazard: 44,
    actualExpectedHonor: 52,
    disclosedExpectedHonor: 66,
    publicVisibility: 72,
  },
  party: {
    partyFit: 61,
    fatigueAvg: 38,
    morale: 57,
    trustGuild: 63,
    prepBonus: 12,
    styleFit: 68,
    honorOutlook: 49,
  },
  ignoredWarningCount: 1,
};

const rng = createSeededRng(20260305);
const result = runMission(input, rng);

// eslint-disable-next-line no-console
console.log(JSON.stringify(result, null, 2));
