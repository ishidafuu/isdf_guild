import type { Mission, MissionId } from "../../domain";

export function listOpenMissions(missions: Mission[]): Mission[] {
  return missions.filter((mission) => (mission.state?.status ?? "open") === "open");
}

export function selectMission(missions: Mission[], missionId?: MissionId): Mission {
  const openMissions = listOpenMissions(missions);

  if (openMissions.length === 0) {
    throw new Error("open な mission がありません");
  }

  if (missionId) {
    const selected = openMissions.find((mission) => mission.mission_id === missionId);
    if (!selected) {
      throw new Error(`mission が見つかりません: ${missionId}`);
    }
    return selected;
  }

  return openMissions[0];
}
