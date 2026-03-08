import type { StoreName, StoreRecordMap } from "./types";

export const DB_NAME = "isdfGuildMvp";
export const DB_VERSION = 1;

export type StoreIndexDefinition = {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
};

export type StoreDefinition<Name extends StoreName = StoreName> = {
  name: Name;
  keyPath: string;
  indexes: StoreIndexDefinition[];
};

export const STORE_DEFINITIONS: readonly StoreDefinition[] = [
  {
    name: "meta",
    keyPath: "key",
    indexes: [],
  },
  {
    name: "clients",
    keyPath: "clientId",
    indexes: [index("type"), index("createdDay")],
  },
  {
    name: "adventurers",
    keyPath: "adventurerId",
    indexes: [index("status"), index("availableDay"), index("createdDay")],
  },
  {
    name: "requests",
    keyPath: "requestId",
    indexes: [index("status"), index("boardScope"), index("expiresDay"), index("clientId")],
  },
  {
    name: "assignments",
    keyPath: "assignmentId",
    indexes: [index("requestId"), index("adventurerId"), index("assignmentState"), index("updatedDay")],
  },
  {
    name: "relations",
    keyPath: "relationId",
    indexes: [
      index("sourceId"),
      index("targetId"),
      index("sourceType"),
      index("targetType"),
      index("lastUpdatedDay"),
    ],
  },
  {
    name: "relation_events",
    keyPath: "eventId",
    indexes: [index("relationId"), index("day"), index("eventType")],
  },
  {
    name: "departure_queue",
    keyPath: "assignmentId",
    indexes: [index("dueDay"), index("adventurerId")],
  },
  {
    name: "mission_runs",
    keyPath: "missionId",
    indexes: [index("assignmentId", { unique: true }), index("returnDueDay"), index("state")],
  },
  {
    name: "reports",
    keyPath: "reportId",
    indexes: [index("unread"), index("returnedDay"), index("missionId")],
  },
  {
    name: "interview_logs",
    keyPath: "logId",
    indexes: [index("assignmentId"), index("day"), index("adventurerId")],
  },
  {
    name: "character_journal",
    keyPath: "journalId",
    indexes: [index("adventurerId"), index("day"), index("eventKind"), index("importance")],
  },
  {
    name: "reputation_daily",
    keyPath: "repId",
    indexes: [index("day")],
  },
  {
    name: "ai_cache",
    keyPath: "cacheKey",
    indexes: [index("eventType"), index("entityId"), index("expiresAt")],
  },
  {
    name: "debug_metrics",
    keyPath: "metricId",
    indexes: [index("day"), index("category")],
  },
] as const;

export const STORE_NAMES = STORE_DEFINITIONS.map((definition) => definition.name) as readonly StoreName[];

export const NEXT_DAY_TRANSACTION_STORES = [
  "meta",
  "requests",
  "assignments",
  "relations",
  "relation_events",
  "departure_queue",
  "mission_runs",
  "reports",
  "adventurers",
  "character_journal",
  "reputation_daily",
  "debug_metrics",
] as const satisfies readonly StoreName[];

export function getStoreDefinition(name: StoreName): StoreDefinition {
  const definition = STORE_DEFINITIONS.find((candidate) => candidate.name === name);
  if (!definition) {
    throw new Error(`Unknown store definition: ${name}`);
  }

  return definition;
}

export function openGuildDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this runtime."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction;

      if (!transaction) {
        throw new Error("Upgrade transaction was not created.");
      }

      applySchema(db, transaction);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

export function applySchema(db: IDBDatabase, transaction: IDBTransaction): void {
  for (const definition of STORE_DEFINITIONS) {
    const store = ensureObjectStore(db, transaction, definition);
    syncIndexes(store, definition.indexes);
  }
}

function ensureObjectStore(
  db: IDBDatabase,
  transaction: IDBTransaction,
  definition: StoreDefinition
): IDBObjectStore {
  if (db.objectStoreNames.contains(definition.name)) {
    return transaction.objectStore(definition.name);
  }

  return db.createObjectStore(definition.name, { keyPath: definition.keyPath });
}

function syncIndexes(store: IDBObjectStore, indexes: readonly StoreIndexDefinition[]): void {
  for (const definition of indexes) {
    if (!store.indexNames.contains(definition.name)) {
      store.createIndex(definition.name, definition.keyPath, definition.options);
      continue;
    }

    const existing = store.index(definition.name);
    if (isDifferentIndex(existing, definition)) {
      store.deleteIndex(definition.name);
      store.createIndex(definition.name, definition.keyPath, definition.options);
    }
  }
}

function isDifferentIndex(existing: IDBIndex, definition: StoreIndexDefinition): boolean {
  const existingKeyPath = normalizeKeyPath(existing.keyPath);
  const nextKeyPath = normalizeKeyPath(definition.keyPath);

  if (existingKeyPath !== nextKeyPath) {
    return true;
  }

  const unique = definition.options?.unique ?? false;
  const multiEntry = definition.options?.multiEntry ?? false;

  return existing.unique !== unique || existing.multiEntry !== multiEntry;
}

function normalizeKeyPath(keyPath: IDBValidKey | string | string[] | null): string {
  if (Array.isArray(keyPath)) {
    return keyPath.join(",");
  }

  return keyPath == null ? "" : String(keyPath);
}

function index(name: string, options?: IDBIndexParameters): StoreIndexDefinition {
  return { name, keyPath: name, options };
}
