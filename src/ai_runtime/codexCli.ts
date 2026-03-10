import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type JsonSchema = Record<string, unknown>;

type CodexCliInvocation = {
  prompt: string;
  schema: JsonSchema;
};

export async function runCodexCliJson<T>(input: CodexCliInvocation): Promise<T> {
  const cached = await readCachedJson<T>(input);
  if (cached) {
    return cached;
  }

  const tempDir = await mkdtemp(join(tmpdir(), "isdf-guild-codex-"));
  const schemaPath = join(tempDir, "schema.json");
  const outputPath = join(tempDir, "output.json");

  await writeFile(schemaPath, JSON.stringify(input.schema, null, 2), "utf-8");

  try {
    const { stdout, stderr } = await spawnCodex({
      prompt: input.prompt,
      schema_path: schemaPath,
      output_path: outputPath,
    });

    const raw = await readFile(outputPath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    await writeCachedJson(input, parsed);
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`codex CLI 実行に失敗しました: ${message}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function readCachedJson<T>(input: CodexCliInvocation): Promise<T | null> {
  const cachePath = buildCachePath(input);
  try {
    const raw = await readFile(cachePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeCachedJson<T>(input: CodexCliInvocation, payload: T): Promise<void> {
  const cacheDir = join(process.cwd(), ".cache", "codex_cli");
  await mkdir(cacheDir, { recursive: true });
  await writeFile(buildCachePath(input), JSON.stringify(payload), "utf-8");
}

function buildCachePath(input: CodexCliInvocation): string {
  const cacheDir = join(process.cwd(), ".cache", "codex_cli");
  const hashBuilder = createHash("sha1");
  hashBuilder.update(JSON.stringify(input.schema));
  hashBuilder.update("\n");
  hashBuilder.update(input.prompt);
  const hash = hashBuilder.digest("hex");
  return join(cacheDir, `${hash}.json`);
}

async function spawnCodex(input: {
  prompt: string;
  schema_path: string;
  output_path: string;
}): Promise<{ stdout: string; stderr: string }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      [
        "exec",
        "--skip-git-repo-check",
        "--ephemeral",
        "--sandbox",
        "read-only",
        "-c",
        'model_reasoning_effort="low"',
        "--color",
        "never",
        "--output-schema",
        input.schema_path,
        "-o",
        input.output_path,
        "-",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding?.("utf-8");
    child.stderr.setEncoding?.("utf-8");
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const detail = summarizeCodexError(stdout, stderr);
      reject(new Error(`exit code=${code ?? "unknown"} ${detail}`));
    });

    child.stdin.write(input.prompt);
    child.stdin.end();
  });
}

function summarizeCodexError(stdout: string, stderr: string): string {
  const source = (stderr || stdout).trim();
  if (!source) {
    return "codex output was empty";
  }

  const compact = source.replace(/\s+/g, " ");
  return compact.length > 420 ? `${compact.slice(0, 420)}...` : compact;
}

export async function detectCodexCli(): Promise<boolean> {
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("codex", ["--version"], {
        cwd: process.cwd(),
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"],
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(new Error(`exit code=${code ?? "unknown"}`));
      });
      child.stdin.end();
    });
    return true;
  } catch {
    return false;
  }
}
