const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function testSync() {
  console.log('Testing relational sync triggers...');
  
  // Test epc_clients
  const cRes = await fetch('http://localhost:3000/api/v1/storage/epc_clients');
  const clients = await cRes.json();
  if (clients && clients.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: clients })
    });
    console.log('epc_clients re-synced:', await postRes.json());
  }

  // Test epc_vendors
  const vRes = await fetch('http://localhost:3000/api/v1/storage/epc_vendors');
  const vendors = await vRes.json();
  if (vendors && vendors.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: vendors })
    });
    console.log('epc_vendors re-synced:', await postRes.json());
  }

  // Test epc_contracts
  const ctRes = await fetch('http://localhost:3000/api/v1/storage/epc_contracts');
  const contracts = await ctRes.json();
  if (contracts && contracts.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: contracts })
    });
    console.log('epc_contracts re-synced:', await postRes.json());
  }

  // Test epc_bills
  const bRes = await fetch('http://localhost:3000/api/v1/storage/epc_bills');
  const bills = await bRes.json();
  if (bills && bills.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: bills })
    });
    console.log('epc_bills re-synced:', await postRes.json());
  }

  // Test epc_invoices
  const iRes = await fetch('http://localhost:3000/api/v1/storage/epc_invoices');
  const invoices = await iRes.json();
  if (invoices && invoices.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: invoices })
    });
    console.log('epc_invoices re-synced:', await postRes.json());
  }

  // Test epc_inventory_stock
  const invRes = await fetch('http://localhost:3000/api/v1/storage/epc_inventory_stock');
  const inv = await invRes.json();
  if (inv && inv.length) {
    const postRes = await fetch('http://localhost:3000/api/v1/storage/epc_inventory_stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: inv })
    });
    console.log('epc_inventory_stock re-synced:', await postRes.json());
  }
}

testSync().catch(console.error);
