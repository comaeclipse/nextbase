import { Pool } from 'pg';

// Create a connection pool with better timeout and connection management
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Serverless-friendly settings
  max: 1, // Limit connections in serverless
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  allowExitOnIdle: true, // Allow the pool to exit when all clients are idle
});

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Postgres connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Postgres connection failed:', error);
    return false;
  }
}

// Initialize the database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create destinations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on JSONB fields for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_destinations_city 
      ON destinations ((payload->>'city'))
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_destinations_state 
      ON destinations ((payload->>'state'))
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool };
