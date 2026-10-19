const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT * FROM epc_storage WHERE key = 'epc_projects';");
  console.log('epc_projects in epc_storage count:', res.rows.length);
  if (res.rows.length > 0) {
    console.log('Sample item:', res.rows[0].data[0]);
    console.log('Total items in list:', res.rows[0].data.length);
  }
  await client.end();
}

run().catch(console.error);
