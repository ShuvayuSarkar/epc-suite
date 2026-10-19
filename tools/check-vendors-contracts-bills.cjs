const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  for (const t of ['vendors', 'contracts', 'bills']) {
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);
    console.log(`\n=== Columns in ${t} ===`);
    console.table(res.rows);
  }
  await client.end();
}

run().catch(console.error);
