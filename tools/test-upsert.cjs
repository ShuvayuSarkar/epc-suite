const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const c = await client.query('SELECT "ClientID" FROM clients LIMIT 1');
  const pt = await client.query('SELECT "ProjectTypeID" FROM project_types LIMIT 1');
  const cid = c.rows[0].ClientID;
  const ptid = pt.rows[0].ProjectTypeID;
  const res = await client.query(`
    INSERT INTO projects ("ProjectID", "ClientID", "ProjectTypeID", "CurrentStage", "CurrentSubState", "BidID", "AwardDate", "ContractValue", "CreatedAt", "UpdatedAt")
    VALUES (gen_random_uuid(), $1, $2, 'S0_BIDDING', 'Test Sync SubState', 'BID-TEST-SYNC-001', NOW(), 500000000, NOW(), NOW())
    ON CONFLICT ("BidID") DO UPDATE SET "CurrentSubState" = EXCLUDED."CurrentSubState", "UpdatedAt" = NOW()
    RETURNING *;
  `, [cid, ptid]);
  console.log('Upserted test project:', res.rows[0].BidID);
  await client.query('DELETE FROM projects WHERE "BidID" = $1', ['BID-TEST-SYNC-001']);
  console.log('Cleaned up test project');
  await client.end();
}

run().catch(console.error);
