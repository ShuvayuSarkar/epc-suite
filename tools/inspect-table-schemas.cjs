const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const tables = [
    'procurement_orders',
    'employees',
    'gangs',
    'hotspots',
    'safety_incidents',
    'inspections',
    'ncrs'
  ];

  for (const t of tables) {
    console.log(`\n=== Table: ${t} ===`);
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);
    console.table(cols.rows);

    const constrs = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      WHERE conrelid = $1::regclass;
    `, [t]);
    console.table(constrs.rows);
  }

  await client.end();
}

run().catch(console.error);
