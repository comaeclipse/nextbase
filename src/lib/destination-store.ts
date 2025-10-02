import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Destination } from "@/types/destination";

const DATA_FILE = resolve(process.cwd(), "src", "data", "destinations.json");

async function readStore(): Promise<Destination[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Destination data is not an array");
    }
    return parsed as Destination[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeStore([]);
      return [];
    }
    throw error;
  }
}

async function writeStore(destinations: Destination[]) {
  const payload = `${JSON.stringify(destinations, null, 2)}\n`;
  await writeFile(DATA_FILE, payload, "utf-8");
}

export async function loadDestinations(): Promise<Destination[]> {
  const destinations = await readStore();
  return destinations.sort((a, b) => a.city.localeCompare(b.city));
}

export async function createDestination(destination: Destination): Promise<void> {
  const destinations = await readStore();
  if (destinations.some((entry) => entry.id === destination.id)) {
    throw new Error(`Destination with id "${destination.id}" already exists.`);
  }
  destinations.push(destination);
  await writeStore(destinations);
}

export async function updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
  const destinations = await readStore();
  const index = destinations.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error("Destination not found.");
  }
  destinations[index] = { ...destinations[index], ...updates, id };
  await writeStore(destinations);
}

export async function deleteDestination(id: string): Promise<void> {
  const destinations = await readStore();
  const next = destinations.filter((entry) => entry.id !== id);
  if (next.length === destinations.length) {
    throw new Error("Destination not found.");
  }
  await writeStore(next);
}
