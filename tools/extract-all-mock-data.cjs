const fs = require('fs');
const path = require('path');

// Let's inspect some of the pages to verify their array variable names and formats
const keyMap = {
  'epc_attendance': 'apps/web/src/pages/hr/AttendanceList.tsx',
  'epc_awards': 'apps/web/src/pages/award/AwardList.tsx',
  'epc_bids': 'apps/web/src/pages/bidding/BidList.tsx',
  'epc_bills': 'apps/web/src/pages/finance/BillList.tsx',
  'epc_budget_flat': 'apps/web/src/pages/finance/BudgetList.tsx',
  'epc_cbs_nodes': 'apps/web/src/pages/finance/BudgetList.tsx',
  'epc_clients': 'apps/web/src/pages/clients/ClientList.tsx',
  'epc_contracts': 'apps/web/src/pages/contracts/ContractList.tsx',
  'epc_correspondence': 'apps/web/src/pages/correspondence/CorrespondenceList.tsx',
  'epc_crs': 'apps/web/src/pages/crs/CRSList.tsx',
  'epc_delay_events': 'apps/web/src/pages/eot/DelayEventList.tsx',
  'epc_deliverables': 'apps/web/src/pages/deliverables/DeliverableList.tsx',
  'epc_dpr_logs': 'apps/web/src/pages/installation/DPRList.tsx',
  'epc_employees': 'apps/web/src/pages/hr/EmployeeList.tsx',
  'epc_eng_docs': 'apps/web/src/pages/engineering/EngineeringDocList.tsx',
  'epc_eot_claims': 'apps/web/src/pages/eot/EOTClaimList.tsx',
  'epc_gang_members': 'apps/web/src/pages/gangs/GangList.tsx',
  'epc_gangs': 'apps/web/src/pages/gangs/GangList.tsx',
  'epc_gp_bgs': 'apps/web/src/pages/golden-period/BankGuaranteeTracker.tsx',
  'epc_gp_categories': 'apps/web/src/pages/golden-period/VendorFinalization.tsx',
  'epc_gp_claims': 'apps/web/src/pages/golden-period/InsuranceTracker.tsx',
  'epc_gp_encashments': 'apps/web/src/pages/golden-period/BankGuaranteeTracker.tsx',
  'epc_gp_licenses': 'apps/web/src/pages/golden-period/StatutoryVerification.tsx',
  'epc_gp_lois': 'apps/web/src/pages/golden-period/ManufacturingClearance.tsx',
  'epc_gp_policies': 'apps/web/src/pages/golden-period/InsuranceTracker.tsx',
  'epc_gp_transit_policies': 'apps/web/src/pages/golden-period/InsuranceTracker.tsx',
  'epc_inspections': 'apps/web/src/pages/qa-qc/InspectionList.tsx',
  'epc_inventory_dispatches': 'apps/web/src/pages/inventory/InventoryDashboard.tsx',
  'epc_inventory_stock': 'apps/web/src/pages/inventory/InventoryList.tsx',
  'epc_invoices': 'apps/web/src/pages/collections/InvoiceList.tsx',
  'epc_issues': 'apps/web/src/pages/issues/IssueList.tsx',
  'epc_line_jmcs': 'apps/web/src/pages/installation/JMCList.tsx',
  'epc_meetings': 'apps/web/src/pages/meetings/MOMList.tsx',
  'epc_ncrs': 'apps/web/src/pages/qa-qc/NCRList.tsx',
  'epc_po_amendments': 'apps/web/src/pages/po-amendments/POAmendmentList.tsx',
  'epc_po_dispatches': 'apps/web/src/pages/procurement/POLineItemList.tsx',
  'epc_po_items': 'apps/web/src/pages/procurement/POLineItemList.tsx',
  'epc_po_line_items_detail': 'apps/web/src/pages/po-line-items/POLineItemList.tsx',
  'epc_pos': 'apps/web/src/pages/procurement/POList.tsx',
  'epc_projects': 'apps/web/src/pages/projects/ProjectList.tsx',
  'epc_resources': 'apps/web/src/pages/resources/ResourceList.tsx',
  'epc_retentions': 'apps/web/src/pages/collections/CollectionsDashboard.tsx',
  'epc_rfis': 'apps/web/src/pages/rfis/RFIList.tsx',
  'epc_risks': 'apps/web/src/pages/risks/RiskDashboard.tsx',
  'epc_safety_audits': 'apps/web/src/pages/safety/AuditList.tsx',
  'epc_safety_incidents': 'apps/web/src/pages/safety/IncidentList.tsx',
  'epc_statutory_approvals': 'apps/web/src/pages/statutory-approvals/StatutoryApprovalList.tsx',
  'epc_substation_jmcs': 'apps/web/src/pages/installation/JMCList.tsx',
  'epc_surveys': 'apps/web/src/pages/site-surveys/SiteSurveyList.tsx',
  'epc_transmittals': 'apps/web/src/pages/transmittals/TransmittalList.tsx',
  'epc_vendors': 'apps/web/src/pages/procurement/VendorList.tsx',
  'epc_wbs': 'apps/web/src/pages/wbs/WBSManager.tsx',
};

for (const [key, filePath] of Object.entries(keyMap)) {
  if (fs.existsSync(filePath)) {
    const code = fs.readFileSync(filePath, 'utf8');
    // find what variable is passed to usePersistentState(key, ...)
    const match = code.match(new RegExp(`usePersistentState(?:<[^>]+>)?\\(\\s*['"]${key}['"]\\s*,\\s*([^),]+)`));
    const fallbackVar = match ? match[1].trim() : 'NOT_FOUND';
    console.log(`${key.padEnd(28)} -> ${fallbackVar.padEnd(24)} (${filePath})`);
  } else {
    console.log(`${key.padEnd(28)} -> FILE NOT FOUND: ${filePath}`);
  }
}
