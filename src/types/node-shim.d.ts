declare module "node:fs/promises" {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function readFile(path: string, encoding: "utf-8"): Promise<string>;
  export function rm(
    path: string,
    options?: { recursive?: boolean; force?: boolean; maxRetries?: number; retryDelay?: number }
  ): Promise<void>;
  export function writeFile(path: string, data: string, encoding: "utf-8"): Promise<void>;
}

declare module "node:path" {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
}

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: string): {
      update(data: string): {
        digest(encoding: "hex"): string;
      };
      digest(encoding: "hex"): string;
    };
    digest(encoding: "hex"): string;
  };
}

declare module "node:os" {
  export function tmpdir(): string;
}

declare module "node:child_process" {
  type StreamLike = {
    on(event: string, listener: (...args: unknown[]) => void): void;
    setEncoding?(encoding: string): void;
  };

  type WritableLike = {
    write(chunk: string): void;
    end(): void;
  };

  export type ChildProcessWithoutNullStreams = {
    stdout: StreamLike;
    stderr: StreamLike;
    stdin: WritableLike;
    on(event: "close", listener: (code: number | null) => void): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
  };

  export function spawn(
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      stdio?: ["pipe", "pipe", "pipe"] | string[];
      env?: Record<string, string | undefined>;
    }
  ): ChildProcessWithoutNullStreams;
}

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};
