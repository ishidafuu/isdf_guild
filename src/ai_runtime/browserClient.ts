import type {
  GuildmasterNoteGenerationRequest,
  GuildmasterNoteGenerationResponse,
  ReportGenerationRequest,
  ReportGenerationResponse,
  SceneGenerationRequest,
  SceneGenerationResponse,
} from "./types";

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${url} ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function requestAiReport(
  request: ReportGenerationRequest
): Promise<ReportGenerationResponse> {
  return await postJson<ReportGenerationResponse>("/api/ai/report", request);
}

export async function requestAiGuildmasterNotes(
  request: GuildmasterNoteGenerationRequest
): Promise<GuildmasterNoteGenerationResponse> {
  return await postJson<GuildmasterNoteGenerationResponse>("/api/ai/guildmaster-note", request);
}

export async function requestAiScene(
  request: SceneGenerationRequest
): Promise<SceneGenerationResponse> {
  return await postJson<SceneGenerationResponse>("/api/ai/scene", request);
}

export async function clearAiTextCache(): Promise<void> {
  const response = await fetch("/api/ai/cache/clear", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`/api/ai/cache/clear ${response.status}`);
  }
}
