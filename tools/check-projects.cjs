const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT "ProjectID", "BidID", "CurrentSubState", "CurrentStage", "ContractValue" FROM projects;');
  console.log('Projects rows in Supabase:');
  console.table(res.rows);
  await client.end();
}

run().catch(console.error);
