const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Adding unique indexes if not exist...');
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_clientcode ON clients ("ClientCode");');
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_itemcode ON inventory_items ("ItemCode");');
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_dprs_number ON daily_dprs ("DPRNumber");');
  console.log('Unique indexes verified/created.');
  await client.end();
}

run().catch(console.error);
