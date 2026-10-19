const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function run() {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
  `);
  const enums = {};
  res.rows.forEach(r => {
    if (!enums[r.typname]) enums[r.typname] = [];
    enums[r.typname].push(r.enumlabel);
  });
  console.log(JSON.stringify(enums, null, 2));
  await client.end();
}
run().catch(console.error);
