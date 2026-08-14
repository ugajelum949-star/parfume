import postgres from 'postgres';
import 'dotenv/config';

const url = process.env.DATABASE_URL;

async function testConnection() {
  if (!url) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  try {
    const sql = postgres(url, { ssl: 'require', connect_timeout: 5 });
    const res = await sql`SELECT 1 as result`;
    console.log('✅ Connection Test SUCCESS:', res);
    await sql.end();
  } catch (e) {
    console.error('❌ Connection Test FAILED:', e.message);
  }
  process.exit(0);
}

testConnection();
