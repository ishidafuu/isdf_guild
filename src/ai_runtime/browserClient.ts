import type {
  GuildmasterNoteGenerationRequest,
  GuildmasterNoteGenerationResponse,
  ReportGenerationRequest,
  ReportGenerationResponse,
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
