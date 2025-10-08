import { pool } from './postgres';
import type { Destination } from '@/types/destination';

// Read-only environment check (Vercel edge functions)
const IS_READ_ONLY_ENV = process.env.VERCEL === "1" || process.env.NEXT_RUNTIME === "edge";

let fallbackCache: Destination[] | null = null;

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

async function readFromPostgres(): Promise<Destination[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT payload FROM destinations ORDER BY payload->>\'city\'');
    return result.rows.map(row => row.payload as Destination);
  } finally {
    client.release();
  }
}

async function seedPostgresFromFallback(): Promise<void> {
  const destinations = await readFallback();
  const client = await pool.connect();
  
  try {
    // Check if data already exists
    const countResult = await client.query('SELECT COUNT(*) FROM destinations');
    if (parseInt(countResult.rows[0].count) > 0) {
      console.log('Postgres database already has data, skipping seed');
      return;
    }

    // Insert all destinations using UPSERT to avoid duplicates
    for (const destination of destinations) {
      await client.query(
        'INSERT INTO destinations (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [destination.id, JSON.stringify(destination)]
      );
    }
    
    console.log(`Seeded ${destinations.length} destinations to Postgres`);
  } finally {
    client.release();
  }
}

export async function loadDestinations(): Promise<Destination[]> {
  if (IS_READ_ONLY_ENV) {
    return await readFallback();
  }

  try {
    const destinations = await readFromPostgres();
    
    // If no data in Postgres, seed from fallback
    if (destinations.length === 0) {
      await seedPostgresFromFallback();
      return await readFromPostgres();
    }
    
    return destinations;
  } catch (error) {
    console.error('Failed to load from Postgres, falling back to JSON:', error);
    return await readFallback();
  }
}

export async function createDestination(destination: Destination): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO destinations (id, payload) VALUES ($1, $2)',
      [destination.id, JSON.stringify(destination)]
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique violation
      throw new Error(`Destination with id "${destination.id}" already exists.`);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT payload FROM destinations WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error("Destination not found.");
    }
    
    const current = result.rows[0].payload as Destination;
    const next = { ...current, ...updates, id };
    
    await client.query(
      'UPDATE destinations SET payload = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(next), id]
    );
  } finally {
    client.release();
  }
}

export async function deleteDestination(id: string): Promise<void> {
  if (IS_READ_ONLY_ENV) {
    throw new Error("Destination store is read-only in this environment.");
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM destinations WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error("Destination not found.");
    }
  } finally {
    client.release();
  }
}
