import { initializeDatabase, testConnection } from './postgres';
import { loadDestinations } from './destination-store-postgres';

// Initialize database on module load
async function initialize() {
  try {
    const connected = await testConnection();
    if (connected) {
      await initializeDatabase();
      // Pre-load destinations to ensure data is migrated
      await loadDestinations();
    }
  } catch (error) {
    console.error('Failed to initialize Postgres database:', error);
  }
}

// Run initialization
initialize();
