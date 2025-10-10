import type { Destination } from '@/types/destination';
import { pool } from './postgres';

async function readFromPostgres(): Promise<Destination[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT payload FROM destinations ORDER BY payload->>\'city\'');
    return result.rows.map(row => row.payload as Destination);
  } catch (error) {
    console.error('Error reading from Postgres:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function loadDestinations(): Promise<Destination[]> {
  return await readFromPostgres();
}

export async function loadDestinationById(id: string): Promise<Destination | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT payload FROM destinations WHERE id = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].payload as Destination;
  } catch (error) {
    console.error('Error reading destination by id from Postgres:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function loadDestinationBySegments(
  state: string,
  citySegment: string,
): Promise<Destination | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        SELECT payload
        FROM destinations
        WHERE LOWER(payload->>'stateCode') = $1
          AND REGEXP_REPLACE(
                REGEXP_REPLACE(LOWER(payload->>'city'), '[^a-z0-9]+', '-', 'g'),
                '(^-|-$)',
                '',
                'g'
              ) = $2
        LIMIT 1
      `,
      [state.toLowerCase(), citySegment.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].payload as Destination;
  } catch (error) {
    console.error('Error reading destination from Postgres:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function createDestination(destination: Destination): Promise<void> {
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
