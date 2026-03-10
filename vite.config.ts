import { defineConfig } from "vite";
import { generateGuildmasterNotesViaCodexCli } from "./src/ai_contracts/guildmaster_note/generate";
import { generateReportViaCodexCli } from "./src/ai_contracts/report/generate";
import { generateSceneTextViaCodexCli } from "./src/ai_contracts/scene/generate";
import type {
  GuildmasterNoteGenerationRequest,
  ReportGenerationRequest,
  SceneGenerationRequest,
} from "./src/ai_runtime/types";

export default defineConfig({
  plugins: [
    {
      name: "local-ai-bridge",
      configureServer(server) {
        server.middlewares.use("/api/ai/report", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          try {
            const body = (await readJsonBody(req)) as ReportGenerationRequest;
            const payload = await generateReportViaCodexCli(body);
            sendJson(res, payload);
          } catch (error) {
            sendJson(res, { error: error instanceof Error ? error.message : "report route failed" }, 500);
          }
        });

        server.middlewares.use("/api/ai/guildmaster-note", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          try {
            const body = (await readJsonBody(req)) as GuildmasterNoteGenerationRequest;
            const payload = await generateGuildmasterNotesViaCodexCli(body);
            sendJson(res, payload);
          } catch (error) {
            sendJson(
              res,
              { error: error instanceof Error ? error.message : "guildmaster note route failed" },
              500
            );
          }
        });

        server.middlewares.use("/api/ai/scene", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          try {
            const body = (await readJsonBody(req)) as SceneGenerationRequest;
            const payload = await generateSceneTextViaCodexCli(body);
            sendJson(res, payload);
          } catch (error) {
            sendJson(res, { error: error instanceof Error ? error.message : "scene route failed" }, 500);
          }
        });
      },
    },
  ],
});

async function readJsonBody(req: { on: (event: string, listener: (chunk?: unknown) => void) => void }): Promise<unknown> {
  const body = await new Promise<string>((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += String(chunk);
    });
    req.on("end", () => resolve(raw));
    req.on("error", (error) => reject(error));
  });

  return body ? JSON.parse(body) : {};
}

function sendJson(
  res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (chunk: string) => void;
  },
  payload: unknown,
  statusCode = 200
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
