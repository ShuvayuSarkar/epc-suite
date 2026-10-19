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
    'hotspots',
    'inspections',
    'ncrs',
    'punch_list_items',
    'safety_incidents',
    'safety_audits',
    'employees',
    'attendance_records',
    'eot_claims',
    'delay_events',
    'gangs'
  ];
  for (const t of tables) {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);
    console.log(`\n=== Table: ${t} ===`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type}, nullable=${r.is_nullable})`).join(', '));

    const constraints = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = $1;
    `, [t]);
    if (constraints.rows.length) {
      console.log(`Constraints: ${constraints.rows.map(c => `${c.constraint_type} on ${c.column_name} (${c.constraint_name})`).join(', ')}`);
    }
  }
  await client.end();
}

run().catch(console.error);
