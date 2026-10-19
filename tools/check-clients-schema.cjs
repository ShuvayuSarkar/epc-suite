const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'clients'
    ORDER BY ordinal_position;
  `);
  console.log('Columns in clients table:');
  console.table(res.rows);

  const sample = await client.query('SELECT * FROM clients LIMIT 1;');
  console.log('First row of clients:', sample.rows[0]);
  await client.end();
}

run().catch(console.error);
