const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  for (const row of tablesRes.rows) {
    try {
      const countRes = await client.query(`SELECT count(*) FROM "${row.table_name}"`);
      console.log(`${row.table_name}: ${countRes.rows[0].count} rows`);
    } catch (e) {
      console.log(`${row.table_name}: error (${e.message})`);
    }
  }
  await client.end();
}

check().catch(console.error);
