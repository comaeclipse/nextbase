import DatabaseConstructor from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DB_FILE = resolve(process.cwd(), "src", "data", "destinations.sqlite");

declare global {
  var __destinationsDb: Database | undefined;
}

function ensureDataDirectory() {
  const directory = dirname(DB_FILE);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

export function getDatabase(): Database {
  if (globalThis.__destinationsDb) {
    return globalThis.__destinationsDb;
  }

  ensureDataDirectory();
  const db = new DatabaseConstructor(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    )
  `);

  globalThis.__destinationsDb = db;
  return db;
}

export function closeDatabase() {
  if (globalThis.__destinationsDb) {
    globalThis.__destinationsDb.close();
    globalThis.__destinationsDb = undefined;
  }
}

export { DB_FILE };
