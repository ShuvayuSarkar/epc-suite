const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  // Ensure unique indexes for smooth upserts
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_shortname ON clients ("ShortName");`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_matcode ON inventory_items ("MaterialCode");`);
  console.log('Unique indexes created/verified.');
  await client.end();
}

run().catch(console.error);
