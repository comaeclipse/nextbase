import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Neon Postgres database connection...\n');

  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not found');
    console.log('Please ensure DATABASE_URL is set in your environment or .env file');
    return false;
  }

  console.log('✅ DATABASE_URL found');
  console.log(`📍 Host: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'hidden'}`);

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test basic connection
    console.log('\n🔌 Testing basic connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    
    console.log('✅ Connection successful!');
    console.log(`⏰ Current time: ${result.rows[0].current_time}`);
    console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);

    // Test destinations table
    console.log('\n📊 Testing destinations table...');
    const tableClient = await pool.connect();
    
    try {
      // Check if table exists
      const tableCheck = await tableClient.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'destinations'
        );
      `);
      
      if (tableCheck.rows[0].exists) {
        console.log('✅ Destinations table exists');
        
        // Count records
        const countResult = await tableClient.query('SELECT COUNT(*) FROM destinations');
        const count = parseInt(countResult.rows[0].count);
        console.log(`📈 Total destinations: ${count}`);
        
        if (count > 0) {
          // Show sample record
          const sampleResult = await tableClient.query('SELECT id, payload->>\'city\' as city, payload->>\'state\' as state FROM destinations LIMIT 1');
          const sample = sampleResult.rows[0];
          console.log(`📍 Sample destination: ${sample.city}, ${sample.state} (ID: ${sample.id})`);
        }
      } else {
        console.log('⚠️  Destinations table does not exist - will be created on first app run');
      }
      
    } catch (tableError) {
      console.error('❌ Error checking destinations table:', tableError);
    } finally {
      tableClient.release();
    }

    // Test JSONB functionality
    console.log('\n🔧 Testing JSONB functionality...');
    const jsonbClient = await pool.connect();
    
    try {
      const jsonbTest = await jsonbClient.query(`
        SELECT 
          jsonb_typeof('{"test": "value"}'::jsonb) as jsonb_type,
          '{"test": "value"}'::jsonb->>'test' as jsonb_extract
      `);
      
      console.log('✅ JSONB functionality working');
      console.log(`📝 JSONB type: ${jsonbTest.rows[0].jsonb_type}`);
      console.log(`🔍 JSONB extract: ${jsonbTest.rows[0].jsonb_extract}`);
      
    } catch (jsonbError) {
      console.error('❌ JSONB test failed:', jsonbError);
    } finally {
      jsonbClient.release();
    }

    console.log('\n🎉 Database connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
