import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Destination } from "@/types/destination";

const DATA_FILE = resolve(process.cwd(), "src", "data", "destinations.json");
const IS_READ_ONLY_ENV = process.env.VERCEL === "1" || process.env.NEXT_RUNTIME === "edge";

let fallbackCache: Destination[] | null = null;

function isFsError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error) && typeof error === "object" && "code" in (error as NodeJS.ErrnoException);
}

async function readFromFile(): Promise<Destination[]> {
  const raw = await readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Destination data is not an array");
  }
  return parsed as Destination[];
}

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

async function readStore(): Promise<{ destinations: Destination[]; readonly: boolean }> {
  try {
    const destinations = await readFromFile();
    return { destinations, readonly: false };
  } catch (error) {
    if (isFsError(error)) {
      if (error.code === "ENOENT") {
        if (IS_READ_ONLY_ENV) {
          return { destinations: await readFallback(), readonly: true };
        }
        await writeStore([]);
        return { destinations: [], readonly: false };
      }
      if (error.code === "EACCES" || error.code === "EROFS") {
        return { destinations: await readFallback(), readonly: true };
      }
    }
    throw error;
  }
}

async function writeStore(destinations: Destination[]) {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination data is read-only in this deployment environment.");
  }
  const payload = `${JSON.stringify(destinations, null, 2)}
`;
  await writeFile(DATA_FILE, payload, "utf-8");
}

export async function loadDestinations(): Promise<Destination[]> {
  const { destinations } = await readStore();
  return [...destinations].sort((a, b) => a.city.localeCompare(b.city));
}

export async function createDestination(destination: Destination): Promise<void> {
  const { destinations, readonly } = await readStore();
  if (readonly) {
    throw new Error("Destination store is read-only in this environment.");
  }
  if (destinations.some((entry) => entry.id === destination.id)) {
    throw new Error(`Destination with id "${destination.id}" already exists.`);
  }
  destinations.push(destination);
  await writeStore(destinations);
}

export async function updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
  const { destinations, readonly } = await readStore();
  if (readonly) {
    throw new Error("Destination store is read-only in this environment.");
  }
  const index = destinations.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error("Destination not found.");
  }
  destinations[index] = { ...destinations[index], ...updates, id };
  await writeStore(destinations);
}

export async function deleteDestination(id: string): Promise<void> {
  const { destinations, readonly } = await readStore();
  if (readonly) {
    throw new Error("Destination store is read-only in this environment.");
  }
  const next = destinations.filter((entry) => entry.id !== id);
  if (next.length === destinations.length) {
    throw new Error("Destination not found.");
  }
  await writeStore(next);
}
