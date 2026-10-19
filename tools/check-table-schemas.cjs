const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const tables = ['vendors', 'contracts', 'bills', 'invoices', 'inventory_items', 'daily_dprs'];
  for (const t of tables) {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);
    console.log(`\n=== Columns in ${t} ===`);
    console.table(res.rows);

    const constraints = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = $1;
    `, [t]);
    console.log(`Constraints in ${t}:`);
    console.table(constraints.rows);
  }
  await client.end();
}

run().catch(console.error);
