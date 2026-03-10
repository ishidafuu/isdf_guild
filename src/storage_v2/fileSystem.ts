import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { StorageV2Data } from "./schema";

export async function loadStorageV2FromFile(path: string): Promise<StorageV2Data | null> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content) as StorageV2Data;
  } catch {
    return null;
  }
}

export async function saveStorageV2ToFile(path: string, data: StorageV2Data): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}
