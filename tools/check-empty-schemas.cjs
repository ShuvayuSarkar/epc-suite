const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const tables = [
  'approval_checklist_items',
  'approval_matrix_rows',
  'project_health_snapshots',
  'project_type_templates',
  'rbac_disabled_roles',
  'rbac_role_matrix'
];

async function run() {
  await client.connect();
  for (const t of tables) {
    const res = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [t]
    );
    console.log(`=== ${t} ===`);
    console.log(res.rows.map(r => `${r.column_name}: ${r.data_type}`).join(', '));
  }
  await client.end();
}

run().catch(console.error);
