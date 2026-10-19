const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function run() {
  const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(`
    SELECT 
      p."BidID" as id,
      p."CurrentSubState" as name,
      COALESCE(c."ShortName", 'Client') as client,
      CONCAT('Type ', COALESCE(pt."Code"::text, 'A')) as type,
      p."CurrentStage"::text as stage,
      'green' as health,
      50 as completion,
      CONCAT('₹', ROUND(p."ContractValue" / 10000000, 1), ' Cr') as value,
      TO_CHAR(p."AwardDate", 'DD Mon YYYY') as date
    FROM projects p
    LEFT JOIN clients c ON p."ClientID" = c."ClientID"
    LEFT JOIN project_types pt ON p."ProjectTypeID" = pt."ProjectTypeID"
    ORDER BY p."CreatedAt" DESC;
  `);
  console.table(res.rows);
  await client.end();
}
run().catch(console.error);
