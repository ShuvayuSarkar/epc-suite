const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const dprs = await client.query('SELECT * FROM daily_dprs LIMIT 2;');
  console.log('daily_dprs sample:');
  console.log(dprs.rows);
  const clients = await client.query('SELECT "ClientID", "ClientCode", "LegalName", "ShortName" FROM clients LIMIT 5;');
  console.log('clients sample:');
  console.table(clients.rows);
  await client.end();
}

run().catch(console.error);
