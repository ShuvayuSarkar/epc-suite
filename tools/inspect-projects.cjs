const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT "ProjectID", "BidID", "CurrentSubState", "CurrentStage", "ContractValue" FROM projects');
  console.log('Projects in DB:');
  console.table(res.rows);
  const constr = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'projects'::regclass;
  `);
  console.log('Constraints on projects:');
  console.table(constr.rows);
  
  // Also check what is stored in epc_storage for epc_projects
  const storageRes = await client.query("SELECT key, length(data::text) as len, data FROM epc_storage WHERE key = 'epc_projects'");
  if (storageRes.rows.length) {
    console.log('epc_storage for epc_projects: length =', storageRes.rows[0].len);
    console.log('first 2 projects in epc_storage:');
    console.log(JSON.stringify(storageRes.rows[0].data.slice(0, 3), null, 2));
  } else {
    console.log('epc_storage has no key epc_projects');
  }

  await client.end();
}
run().catch(console.error);
