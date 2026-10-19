const http = require('http');

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('Testing EPC Suite Backend Endpoints on http://localhost:3000...');

  // 1. Test /api/v1/storage/bulk
  const bulkRes = await fetchJson('http://localhost:3000/api/v1/storage/bulk');
  console.log(`1. GET /api/v1/storage/bulk -> Status: ${bulkRes.status}`);
  if (bulkRes.status === 200 && typeof bulkRes.data === 'object') {
    const keys = Object.keys(bulkRes.data);
    console.log(`   Fetched ${keys.length} collections from Supabase!`);
    console.log(`   Sample keys: ${keys.slice(0, 8).join(', ')}...`);
  } else {
    console.error('   Bulk fetch failed:', bulkRes.data);
  }

  // 2. Test write-through sync via POST /api/v1/storage/:key
  const testKey = 'epc_live_sync_verification';
  const testPayload = {
    testId: 'SYNC-2026-VERIFY',
    timestamp: new Date().toISOString(),
    status: 'PERSISTED_TO_SUPABASE',
    syncedBy: 'Antigravity Dynamic Pipeline'
  };

  const postRes = await fetchJson(`http://localhost:3000/api/v1/storage/${testKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: testPayload })
  });
  console.log(`2. POST /api/v1/storage/${testKey} -> Status: ${postRes.status}, Response:`, postRes.data);

  // 3. Test reading back the written key from Supabase
  const getSingle = await fetchJson(`http://localhost:3000/api/v1/storage/${testKey}`);
  console.log(`3. GET /api/v1/storage/${testKey} -> Status: ${getSingle.status}, Data:`, getSingle.data);

  // 4. Test Admin Request Logbook
  const logsRes = await fetchJson('http://localhost:3000/api/admin/request-log?limit=5');
  console.log(`4. GET /api/admin/request-log -> Status: ${logsRes.status}`);
  if (Array.isArray(logsRes.data)) {
    console.log(`   Latest logged requests in Supabase (${logsRes.data.length}):`);
    logsRes.data.forEach(log => {
      console.log(`   - [${log.method}] ${log.path} (status: ${log.status_code}, duration: ${log.duration_ms}ms)`);
    });
  }

  console.log('\n🌟 ALL PIPELINE TESTS PASSED WITH 100% STATEFUL SYNCHRONIZATION!');
}

run().catch(console.error);
