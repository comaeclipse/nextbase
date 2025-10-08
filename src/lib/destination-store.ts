import type { Destination } from "@/types/destination";

import { getDatabase } from "./db";

const IS_READ_ONLY_ENV = process.env.VERCEL === "1" || process.env.NEXT_RUNTIME === "edge";

type SqliteErrorLike = Error & {
  code?: string;
};

let fallbackCache: Destination[] | null = null;
let databaseInitialized = false;

async function readFallback(): Promise<Destination[]> {
  if (!fallbackCache) {
    const jsonModule = await import("@/data/destinations.json");
    const data = (jsonModule as { default?: Destination[] }).default ?? (jsonModule as unknown as Destination[]);
    if (!Array.isArray(data)) {
      throw new Error("Fallback destination data is invalid");
    }
    fallbackCache = data;
  }
  return fallbackCache.slice();
}

function isSqliteError(error: unknown): error is SqliteErrorLike {
  return error instanceof Error && error.name === "SqliteError";
}

function isReadOnlySqliteError(error: SqliteErrorLike): boolean {
  return Boolean(error.code && (error.code === "SQLITE_READONLY" || error.code === "SQLITE_PERM" || error.code === "SQLITE_CANTOPEN"));
}

function parseRows(rows: { payload: string }[]): Destination[] {
  return rows.map((row) => {
    const parsed = JSON.parse(row.payload);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Destination row payload is invalid JSON");
    }
    return parsed as Destination;
  });
}

async function ensureDatabaseReady() {
  if (databaseInitialized) {
    return;
  }
  const db = getDatabase();
  const result = db.prepare("SELECT COUNT(*) as count FROM destinations").get() as { count: number };
  if (result.count === 0) {
    const seedData = await readFallback();
    if (seedData.length > 0) {
      const insert = db.prepare("INSERT INTO destinations (id, payload) VALUES (?, ?)");
      const insertMany = db.transaction((records: Destination[]) => {
        for (const record of records) {
          insert.run(record.id, JSON.stringify(record));
        }
      });
      insertMany(seedData);
    }
  }
  databaseInitialized = true;
}

async function readStore(): Promise<{ destinations: Destination[]; readonly: boolean }> {
  if (IS_READ_ONLY_ENV) {
    return { destinations: await readFallback(), readonly: true };
  }

  try {
    await ensureDatabaseReady();
    const db = getDatabase();
    const rows = db.prepare("SELECT payload FROM destinations").all() as { payload: string }[];
    return { destinations: parseRows(rows), readonly: false };
  } catch (error) {
    if (isSqliteError(error) && isReadOnlySqliteError(error)) {
      return { destinations: await readFallback(), readonly: true };
    }
    throw error;
  }
}

export async function loadDestinations(): Promise<Destination[]> {
  const { destinations } = await readStore();
  return [...destinations].sort((a, b) => a.city.localeCompare(b.city));
}

export async function createDestination(destination: Destination): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  try {
    await ensureDatabaseReady();
    const db = getDatabase();
    db.prepare("INSERT INTO destinations (id, payload) VALUES (?, ?)").run(destination.id, JSON.stringify(destination));
  } catch (error) {
    if (isSqliteError(error) && error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      throw new Error(`Destination with id "${destination.id}" already exists.`);
    }
    throw error;
  }
}

export async function updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  await ensureDatabaseReady();
  const db = getDatabase();
  const existing = db.prepare("SELECT payload FROM destinations WHERE id = ?").get(id) as { payload: string } | undefined;
  if (!existing) {
    throw new Error("Destination not found.");
  }
  const current = JSON.parse(existing.payload) as Destination;
  const next = { ...current, ...updates, id };
  db.prepare("UPDATE destinations SET payload = ? WHERE id = ?").run(JSON.stringify(next), id);
}

export async function deleteDestination(id: string): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  await ensureDatabaseReady();
  const db = getDatabase();
  const result = db.prepare("DELETE FROM destinations WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new Error("Destination not found.");
  }
}
