const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const tables = ['gangs', 'hotspots', 'safety_incidents', 'inspections', 'ncrs'];
  for (const t of tables) {
    const res = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      WHERE conrelid = $1::regclass;
    `, [t]);
    console.log(t, res.rows);
  }
  await client.end();
}
run().catch(console.error);
