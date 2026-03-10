declare module "node:fs/promises" {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readFile(path: string, encoding: "utf-8"): Promise<string>;
  export function writeFile(path: string, data: string, encoding: "utf-8"): Promise<void>;
}

declare module "node:path" {
  export function dirname(path: string): string;
}
