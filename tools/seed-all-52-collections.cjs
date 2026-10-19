const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const keyMap = {
  'epc_attendance': { file: 'apps/web/src/pages/hr/AttendanceList.tsx', varName: 'initialAttendance' },
  'epc_awards': { file: 'apps/web/src/pages/award/AwardList.tsx', varName: 'MOCK_AWARDS' },
  'epc_bids': { file: 'apps/web/src/pages/bidding/BidList.tsx', varName: 'MOCK_BIDS' },
  'epc_bills': { file: 'apps/web/src/pages/finance/BillList.tsx', varName: 'INITIAL_BILLS' },
  'epc_budget_flat': { file: 'apps/web/src/pages/finance/BudgetList.tsx', varName: 'initialFlatBudget' },
  'epc_cbs_nodes': { file: 'apps/web/src/pages/finance/BudgetList.tsx', varName: 'MOCK_CBS_NODES' },
  'epc_clients': { file: 'apps/web/src/pages/clients/ClientList.tsx', varName: 'initialClients' },
  'epc_contracts': { file: 'apps/web/src/pages/contracts/ContractList.tsx', varName: 'initialContracts' },
  'epc_correspondence': { file: 'apps/web/src/pages/correspondence/CorrespondenceList.tsx', varName: 'initialLetters' },
  'epc_crs': { file: 'apps/web/src/pages/crs/CRSList.tsx', varName: 'MOCK_CRS' },
  'epc_delay_events': { file: 'apps/web/src/pages/eot/DelayEventList.tsx', varName: 'initialDelayEvents' },
  'epc_deliverables': { file: 'apps/web/src/pages/deliverables/DeliverableList.tsx', varName: 'MOCK_DELIVERABLES' },
  'epc_dpr_logs': { file: 'apps/web/src/pages/installation/DPRList.tsx', varName: 'INITIAL_DPR_LOGS' },
  'epc_employees': { file: 'apps/web/src/pages/hr/EmployeeList.tsx', varName: 'initialEmployees' },
  'epc_eng_docs': { file: 'apps/web/src/pages/engineering/EngineeringDocList.tsx', varName: 'MOCK_ENG_DOCS' },
  'epc_eot_claims': { file: 'apps/web/src/pages/eot/EOTClaimList.tsx', varName: 'initialClaims' },
  'epc_gang_members': { file: 'apps/web/src/pages/gangs/GangList.tsx', varName: 'INITIAL_MEMBERS' },
  'epc_gangs': { file: 'apps/web/src/pages/gangs/GangList.tsx', varName: 'INITIAL_GANGS' },
  'epc_gp_bgs': { file: 'apps/web/src/pages/golden-period/BankGuaranteeTracker.tsx', varName: 'MOCK_BGS' },
  'epc_gp_categories': { file: 'apps/web/src/pages/golden-period/VendorFinalization.tsx', varName: 'MOCK_CATEGORIES' },
  'epc_gp_claims': { file: 'apps/web/src/pages/golden-period/InsuranceTracker.tsx', varName: 'MOCK_CLAIMS' },
  'epc_gp_encashments': { file: 'apps/web/src/pages/golden-period/BankGuaranteeTracker.tsx', varName: 'MOCK_ENCASHMENTS' },
  'epc_gp_licenses': { file: 'apps/web/src/pages/golden-period/StatutoryVerification.tsx', varName: 'MOCK_LICENSES' },
  'epc_gp_lois': { file: 'apps/web/src/pages/golden-period/ManufacturingClearance.tsx', varName: 'MOCK_LOIS' },
  'epc_gp_policies': { file: 'apps/web/src/pages/golden-period/InsuranceTracker.tsx', varName: 'MOCK_POLICIES' },
  'epc_gp_transit_policies': { file: 'apps/web/src/pages/golden-period/InsuranceTracker.tsx', varName: 'MOCK_TRANSIT' },
  'epc_inspections': { file: 'apps/web/src/pages/qa-qc/InspectionList.tsx', varName: 'INITIAL_INSPECTIONS' },
  'epc_inventory_dispatches': { file: 'apps/web/src/pages/inventory/InventoryDashboard.tsx', varName: 'MOCK_DISPATCHES' },
  'epc_inventory_stock': { file: 'apps/web/src/pages/inventory/InventoryList.tsx', varName: 'STOCK_DATA' },
  'epc_invoices': { file: 'apps/web/src/pages/collections/InvoiceList.tsx', varName: 'initialInvoices' },
  'epc_issues': { file: 'apps/web/src/pages/issues/IssueList.tsx', varName: 'MOCK_ISSUES' },
  'epc_line_jmcs': { file: 'apps/web/src/pages/installation/JMCList.tsx', varName: 'INITIAL_LINE_JMCS' },
  'epc_meetings': { file: 'apps/web/src/pages/meetings/MOMList.tsx', varName: 'MOCK_MEETINGS' },
  'epc_ncrs': { file: 'apps/web/src/pages/qa-qc/NCRList.tsx', varName: 'initialNCRs' },
  'epc_po_amendments': { file: 'apps/web/src/pages/po-amendments/POAmendmentList.tsx', varName: 'initialAmendments' },
  'epc_po_dispatches': { file: 'apps/web/src/pages/procurement/POLineItemList.tsx', varName: 'MOCK_DISPATCHES' },
  'epc_po_items': { file: 'apps/web/src/pages/procurement/POLineItemList.tsx', varName: 'MOCK_ITEMS' },
  'epc_po_line_items_detail': { file: 'apps/web/src/pages/po-line-items/POLineItemList.tsx', varName: 'initialLineItems' },
  'epc_pos': { file: 'apps/web/src/pages/procurement/POList.tsx', varName: 'initialPOs' },
  'epc_projects': { file: 'apps/web/src/pages/projects/ProjectList.tsx', varName: 'INITIAL_PROJECTS' },
  'epc_resources': { file: 'apps/web/src/pages/resources/ResourceList.tsx', varName: 'initialAssets' },
  'epc_retentions': { file: 'apps/web/src/pages/collections/CollectionsDashboard.tsx', varName: 'MOCK_RETENTION' },
  'epc_rfis': { file: 'apps/web/src/pages/rfis/RFIList.tsx', varName: 'MOCK_RFIS' },
  'epc_risks': { file: 'apps/web/src/pages/risks/RiskDashboard.tsx', varName: 'MOCK_RISKS' },
  'epc_safety_audits': { file: 'apps/web/src/pages/safety/AuditList.tsx', varName: 'initialAudits' },
  'epc_safety_incidents': { file: 'apps/web/src/pages/safety/IncidentList.tsx', varName: 'initialRecords' },
  'epc_statutory_approvals': { file: 'apps/web/src/pages/statutory-approvals/StatutoryApprovalList.tsx', varName: 'MOCK_APPROVALS' },
  'epc_substation_jmcs': { file: 'apps/web/src/pages/installation/JMCList.tsx', varName: 'INITIAL_SUBSTATION_JMCS' },
  'epc_surveys': { file: 'apps/web/src/pages/site-surveys/SiteSurveyList.tsx', varName: 'MOCK_SURVEYS' },
  'epc_transmittals': { file: 'apps/web/src/pages/transmittals/TransmittalList.tsx', varName: 'MOCK' },
  'epc_vendors': { file: 'apps/web/src/pages/procurement/VendorList.tsx', varName: 'initialVendors' },
  'epc_wbs': { file: 'apps/web/src/pages/wbs/WBSManager.tsx', varName: 'INITIAL_WBS' },
};

function extractArray(code, varName) {
  const declRegex = new RegExp(`(?:const|let|var)\\s+${varName}\\b[^=]*=\\s*\\[`);
  const match = declRegex.exec(code);
  if (!match) return null;

  const bracketIdx = match.index + match[0].length - 1;

  let depth = 0;
  let inString = null;
  let endIdx = -1;
  for (let i = bracketIdx; i < code.length; i++) {
    const ch = code[i];
    if (inString) {
      if (ch === inString && code[i-1] !== '\\') {
        inString = null;
      }
    } else {
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = ch;
      } else if (ch === '[') {
        depth++;
      } else if (ch === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx === -1) return null;
  return code.substring(bracketIdx, endIdx + 1);
}

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  let insertedCount = 0;

  for (const [key, { file, varName }] of Object.entries(keyMap)) {
    const code = fs.readFileSync(file, 'utf8');
    const arrStr = extractArray(code, varName);
    if (!arrStr) {
      console.warn(`Could not extract ${varName} from ${file}`);
      continue;
    }

    let data;
    try {
      const fn = new Function('return ' + arrStr);
      data = fn();
    } catch (err) {
      console.error(`Error parsing ${varName}: ${err.message}`);
      continue;
    }

    await client.query(`
      INSERT INTO epc_storage ("key", "data", "updated_at")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("key") DO UPDATE SET "data" = $2, "updated_at" = NOW();
    `, [key, JSON.stringify(data)]);

    console.log(`✓ Seeded ${key} (${data.length} items)`);
    insertedCount++;
  }

  console.log(`\n🎉 Successfully populated ${insertedCount} collections in epc_storage!`);
  await client.end();
}

run().catch(err => {
  console.error(err);
  client.end();
  process.exit(1);
});
