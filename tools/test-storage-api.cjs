const http = require('http');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function verify() {
  const data = JSON.stringify({
    data: [
      {
        id: "BID-2024-998",
        name: "Test Sycn Project In DB",
        client: "PGCIL",
        type: "Type B",
        stage: "S2: Golden Period",
        health: "green",
        completion: 15,
        value: "₹95.0 Cr",
        date: "15 Oct 2026"
      }
    ]
  });

  console.log('Sending POST to /api/v1/storage/epc_projects...');
  await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/storage/epc_projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`API Response: ${res.statusCode} ${body}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });

  // Give 1 second for async relational sync to run
  await new Promise(r => setTimeout(r, 1200));

  const client = new Client({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const res = await client.query('SELECT "BidID", "CurrentSubState", "CurrentStage", "ContractValue" FROM projects WHERE "BidID" = \'BID-2024-998\'');
  console.log('Query from Supabase "projects" table:');
  console.table(res.rows);

  const storageRes = await client.query('SELECT key, length(data::text) as len FROM epc_storage WHERE key = \'epc_projects\'');
  console.log('Storage table entry for epc_projects:', storageRes.rows);

  await client.end();
}

verify().catch(console.error);
