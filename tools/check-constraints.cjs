const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const tables = ['projects', 'clients', 'vendors', 'contracts', 'bills', 'invoices', 'inventory_items', 'rfis'];

async function run() {
  await client.connect();
  for (const t of tables) {
    const res = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = $1 AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    `, [t]);
    console.log(`=== ${t} ===`);
    res.rows.forEach(r => console.log(`  ${r.constraint_type}: ${r.column_name} (${r.constraint_name})`));
  }
  await client.end();
}

run().catch(console.error);
