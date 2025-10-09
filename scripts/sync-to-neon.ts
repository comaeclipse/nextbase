import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

type Destination = {
  id: string;
  payload?: unknown; // not used; kept for compatibility
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

  const jsonPath = resolve(process.cwd(), "src", "data", "destinations.json");
  const file = readFileSync(jsonPath, "utf-8");
  const records: any[] = JSON.parse(file);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Upsert all rows
    for (const rec of records) {
      await client.query(
        `INSERT INTO destinations (id, payload)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = CURRENT_TIMESTAMP`,
        [rec.id, JSON.stringify(rec)]
      );
    }

    await client.query("COMMIT");
    console.log(`Upserted ${records.length} records to Neon`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to sync to Neon:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();


