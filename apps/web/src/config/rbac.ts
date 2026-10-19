// ============================================================
// BRD Role × Module Access Matrix (BRD-EPC-CHK-FINAL §3)
// Legend: F=Full | E=Edit/Create | R=Read-only | A=Approve | V=View-only (portal) | null=No access
// ============================================================

export type PermissionLevel = 'F' | 'E' | 'R' | 'A' | 'V' | null;

export type RoleId =
  | 'bid_manager'
  | 'project_director'
  | 'project_manager'
  | 'survey_team'
  | 'lead_design_engineer'
  | 'vendor_manager'
  | 'plant_manager'
  | 'quality_inspector'
  | 'store_manager'
  | 'gang_supervisor'
  | 'finance_controller'
  | 'compliance_officer'
  | 'sales_executive'
  | 'hr_manager'
  | 'safety_hse_officer'
  | 'claims_manager'
  | 'contract_manager'
  | 'legal_contracts'
  | 'document_controller'
  | 'client_stakeholder'
  | 'treasury_manager'
  | 'system_admin';

export type ModuleId =
  | '4.1'  | '4.2'  | '4.3'  | '4.4'  | '4.5'  | '4.6'  | '4.7'
  | '4.8'  | '4.9'  | '4.10' | '4.11' | '4.12' | '4.13' | '4.14'
  | '4.15' | '4.16' | '4.17' | '4.18' | '4.19' | '4.20' | '4.21'
  | '4.22' | '4.23' | '4.24' | '4.25' | '4.26' | '4.27';

export interface RoleConfig {
  id: RoleId;
  label: string;
  description: string;
}

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  routes: string[];  // frontend route prefixes that belong to this module
}

// ── 22 Roles ──────────────────────────────────────────────
export const ROLES: RoleConfig[] = [
  { id: 'bid_manager',          label: 'Bid Manager',           description: 'Manages tender submissions, cost estimates, and bid tracking' },
  { id: 'project_director',     label: 'Project Director (PD)', description: 'Senior approver across all modules; escalation endpoint' },
  { id: 'project_manager',      label: 'Project Manager (PM)',  description: 'Full operational control of project execution' },
  { id: 'survey_team',          label: 'Survey Team',           description: 'Field survey data entry (GPS, conductor length, tower coords)' },
  { id: 'lead_design_engineer', label: 'Lead Design Engineer',  description: 'Engineering drawings, GTP, MQP/ITP, document control' },
  { id: 'vendor_manager',       label: 'Vendor Manager',        description: 'Vendor selection, PO management, scorecard tracking' },
  { id: 'plant_manager',        label: 'Plant Manager',         description: 'Factory production tracking, quality at plant level' },
  { id: 'quality_inspector',    label: 'Quality Inspector',     description: 'FAT, TPIA, inspection scheduling, NCR management' },
  { id: 'store_manager',        label: 'Store Manager',         description: 'Inventory, GRN/JVR, warehouse, store setup' },
  { id: 'gang_supervisor',      label: 'Gang Supervisor',       description: 'Field crew management, DPR entry, safety compliance' },
  { id: 'finance_controller',   label: 'Finance Controller',    description: 'Billing, collections, budget, TDS/GST, payments' },
  { id: 'compliance_officer',   label: 'Compliance Officer',    description: 'Statutory licenses, insurance, regulatory compliance' },
  { id: 'sales_executive',      label: 'Sales Executive',       description: 'Hotspot resolution, ROW negotiation, client liaison' },
  { id: 'hr_manager',           label: 'HR Manager',            description: 'Manpower planning, payroll, attendance, compliance' },
  { id: 'safety_hse_officer',   label: 'Safety / HSE Officer',  description: 'Safety audits, incident reporting, toolbox talks' },
  { id: 'claims_manager',       label: 'Claims Manager',        description: 'EOT claims, delay documentation, cost recovery' },
  { id: 'contract_manager',     label: 'Contract Manager',      description: 'Contract repository, PO amendments, variations' },
  { id: 'legal_contracts',      label: 'Legal / Contracts',     description: 'Legal review, dispute resolution, contract approval' },
  { id: 'document_controller',  label: 'Document Controller',   description: 'Transmittal management, document version control' },
  { id: 'client_stakeholder',   label: 'Client / Stakeholder',  description: 'External view-only portal access' },
  { id: 'treasury_manager',     label: 'Treasury Manager',      description: 'Bank guarantees, payment execution, cash management' },
  { id: 'system_admin',         label: 'System Administrator',  description: 'Full access to all modules including configuration' },
];

// ── 21 Modules with Route Mapping ─────────────────────────
export const MODULES: ModuleConfig[] = [
  { id: '4.1',  name: 'Project Mapping (DPR & Approval)',  routes: ['/projects', '/wbs', '/installation/dpr', '/installation', '/stage3', '/stage4', '/stage5'] },
  { id: '4.2',  name: 'Collections Management',            routes: ['/collections'] },
  { id: '4.3',  name: 'Gang Management',                   routes: ['/gangs', '/installation/gangs'] },
  { id: '4.4',  name: 'Hotspot Mapping',                   routes: ['/hotspots', '/site-surveys'] },
  { id: '4.5',  name: 'Resource Management',               routes: ['/resources', '/golden-period/insurance', '/golden-period/statutory', '/golden-period/bank-guarantees'] },
  { id: '4.6',  name: 'Document Mgmt (EOT & Delay)',       routes: ['/eot'] },
  { id: '4.7',  name: 'Finance Management',                routes: ['/finance', '/finance/bills', '/finance/budget'] },
  { id: '4.8',  name: 'PO Amendment',                      routes: ['/po-amendments', '/procurement/amendments'] },
  { id: '4.9',  name: 'Risk Management',                   routes: ['/risks'] },
  { id: '4.10', name: 'Contract Management',               routes: ['/contracts', '/award'] },
  { id: '4.11', name: 'HR & Payroll',                      routes: ['/hr'] },
  { id: '4.12', name: 'Safety & HSE',                      routes: ['/safety'] },
  { id: '4.13', name: 'Quality Assurance & QC',            routes: ['/qa-qc'] },
  { id: '4.14', name: 'Procurement & Vendor Management',   routes: ['/procurement', '/procurement/vendors', '/procurement/purchase-orders', '/golden-period/vendor-finalization', '/golden-period/manufacturing-clearance'] },
  { id: '4.15', name: 'Inventory & Warehouse',             routes: ['/inventory', '/inventory/dispatch'] },
  { id: '4.16', name: 'Client Portal',                     routes: ['/client-portal'] },
  { id: '4.17', name: 'Correspondence & Transmittal',      routes: ['/correspondence'] },
  { id: '4.18', name: 'Engineering Document Control',      routes: ['/engineering-docs', '/engineering'] },
  { id: '4.19', name: 'Multi-Project-Type Engine',         routes: ['/settings'] },
  { id: '4.20', name: 'Commissioning & Handover',          routes: ['/commissioning', '/stage6'] },
  { id: '4.21', name: 'RFI Management',                    routes: ['/rfis'] },
  { id: '4.22', name: 'Minutes of Meeting (MOM)',          routes: ['/meetings'] },
  { id: '4.23', name: 'Transmittal Management',            routes: ['/transmittals'] },
  { id: '4.24', name: 'Deliverable Schedule',              routes: ['/deliverables'] },
  { id: '4.25', name: 'Comment Response Sheet (CRS)',       routes: ['/crs'] },
  { id: '4.26', name: 'Statutory Approvals',               routes: ['/statutory-approvals'] },
  { id: '4.27', name: 'Issue Tracker',                     routes: ['/issues'] },
];

// ── The Matrix ────────────────────────────────────────────
// rolePermissions[roleId][moduleId] = PermissionLevel
export type PermissionMatrix = Record<RoleId, Partial<Record<ModuleId, PermissionLevel>>>;

export const PERMISSION_MATRIX: PermissionMatrix = {
  bid_manager:          { '4.1':'R','4.2':null,'4.3':null,'4.4':'R','4.5':null,'4.6':null,'4.7':'E','4.8':null,'4.9':'R','4.10':'R','4.11':null,'4.12':null,'4.13':null,'4.14':'E','4.15':null,'4.16':null,'4.17':'E','4.18':null,'4.19':'R','4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':'R','4.25':null,'4.26':null,'4.27':'R' },
  project_director:     { '4.1':'A','4.2':'A','4.3':'R','4.4':'A','4.5':'R','4.6':'A','4.7':'A','4.8':'A','4.9':'A','4.10':'A','4.11':'R','4.12':'A','4.13':'A','4.14':'A','4.15':'R','4.16':'R','4.17':'A','4.18':'A','4.19':'A','4.20':'A','4.21':'A','4.22':'A','4.23':'A','4.24':'A','4.25':'A','4.26':'A','4.27':'A' },
  project_manager:      { '4.1':'F','4.2':'R','4.3':'F','4.4':'F','4.5':'F','4.6':'F','4.7':'F','4.8':'F','4.9':'F','4.10':'R','4.11':'R','4.12':'F','4.13':'F','4.14':'F','4.15':'F','4.16':'F','4.17':'F','4.18':'F','4.19':'R','4.20':'F','4.21':'F','4.22':'F','4.23':'F','4.24':'F','4.25':'F','4.26':'F','4.27':'F' },
  survey_team:          { '4.1':'R','4.2':null,'4.3':null,'4.4':'E','4.5':null,'4.6':null,'4.7':null,'4.8':null,'4.9':'R','4.10':null,'4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':null,'4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':null,'4.24':null,'4.25':null,'4.26':null,'4.27':null },
  lead_design_engineer: { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'R','4.6':null,'4.7':null,'4.8':null,'4.9':null,'4.10':'R','4.11':null,'4.12':null,'4.13':'F','4.14':'R','4.15':null,'4.16':null,'4.17':'R','4.18':'F','4.19':null,'4.20':'R','4.21':'R','4.22':'E','4.23':'E','4.24':'F','4.25':'F','4.26':'R','4.27':'E' },
  vendor_manager:       { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'R','4.6':null,'4.7':'R','4.8':'R','4.9':null,'4.10':'R','4.11':null,'4.12':null,'4.13':'R','4.14':'F','4.15':'R','4.16':null,'4.17':'R','4.18':'R','4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':'R','4.25':null,'4.26':null,'4.27':'R' },
  plant_manager:        { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'R','4.6':null,'4.7':'R','4.8':null,'4.9':null,'4.10':null,'4.11':null,'4.12':null,'4.13':'F','4.14':'R','4.15':'R','4.16':null,'4.17':null,'4.18':'R','4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':'R','4.25':null,'4.26':null,'4.27':'R' },
  quality_inspector:    { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'R','4.6':null,'4.7':null,'4.8':null,'4.9':'R','4.10':null,'4.11':null,'4.12':'R','4.13':'F','4.14':'R','4.15':'R','4.16':null,'4.17':null,'4.18':'F','4.19':null,'4.20':'F','4.21':null,'4.22':'R','4.23':'R','4.24':'R','4.25':'E','4.26':null,'4.27':'R' },
  store_manager:        { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'F','4.6':null,'4.7':'R','4.8':null,'4.9':null,'4.10':null,'4.11':null,'4.12':null,'4.13':'R','4.14':'R','4.15':'F','4.16':null,'4.17':'R','4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':'R','4.25':null,'4.26':null,'4.27':'R' },
  gang_supervisor:      { '4.1':'E','4.2':null,'4.3':'F','4.4':'R','4.5':'F','4.6':null,'4.7':null,'4.8':null,'4.9':'R','4.10':null,'4.11':'R','4.12':'F','4.13':'R','4.14':null,'4.15':'R','4.16':null,'4.17':null,'4.18':null,'4.19':null,'4.20':'R','4.21':'E','4.22':'R','4.23':null,'4.24':'R','4.25':null,'4.26':null,'4.27':'R' },
  finance_controller:   { '4.1':'R','4.2':'F','4.3':null,'4.4':null,'4.5':'R','4.6':'R','4.7':'F','4.8':'F','4.9':null,'4.10':'R','4.11':'R','4.12':null,'4.13':null,'4.14':'R','4.15':'R','4.16':null,'4.17':'R','4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':null,'4.24':null,'4.25':null,'4.26':'R','4.27':'R' },
  compliance_officer:   { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'F','4.6':null,'4.7':null,'4.8':null,'4.9':'R','4.10':'R','4.11':'R','4.12':'F','4.13':'R','4.14':'R','4.15':null,'4.16':null,'4.17':null,'4.18':'R','4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':null,'4.25':null,'4.26':'F','4.27':'R' },
  sales_executive:      { '4.1':'R','4.2':null,'4.3':null,'4.4':'F','4.5':null,'4.6':null,'4.7':null,'4.8':null,'4.9':'R','4.10':null,'4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':'R','4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':null,'4.24':null,'4.25':null,'4.26':null,'4.27':'R' },
  hr_manager:           { '4.1':'R','4.2':null,'4.3':'F','4.4':null,'4.5':'R','4.6':null,'4.7':null,'4.8':null,'4.9':null,'4.10':null,'4.11':'F','4.12':'R','4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':null,'4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':null,'4.24':null,'4.25':null,'4.26':null,'4.27':'R' },
  safety_hse_officer:   { '4.1':'R','4.2':null,'4.3':'R','4.4':'R','4.5':'R','4.6':null,'4.7':null,'4.8':null,'4.9':'F','4.10':null,'4.11':'R','4.12':'F','4.13':'R','4.14':null,'4.15':null,'4.16':null,'4.17':null,'4.18':null,'4.19':null,'4.20':'R','4.21':null,'4.22':'E','4.23':null,'4.24':'R','4.25':null,'4.26':'R','4.27':'E' },
  claims_manager:       { '4.1':'R','4.2':'R','4.3':null,'4.4':'R','4.5':null,'4.6':'F','4.7':'R','4.8':'R','4.9':'R','4.10':'R','4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':'F','4.18':'R','4.19':null,'4.20':null,'4.21':'R','4.22':'R','4.23':'R','4.24':'R','4.25':null,'4.26':null,'4.27':'F' },
  contract_manager:     { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':null,'4.6':'R','4.7':'R','4.8':'F','4.9':'R','4.10':'F','4.11':null,'4.12':null,'4.13':null,'4.14':'R','4.15':null,'4.16':null,'4.17':'F','4.18':'R','4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'F','4.24':null,'4.25':null,'4.26':'R','4.27':'R' },
  legal_contracts:      { '4.1':'R','4.2':'R','4.3':null,'4.4':null,'4.5':null,'4.6':'A','4.7':'R','4.8':'A','4.9':'R','4.10':'A','4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':'R','4.18':'R','4.19':null,'4.20':null,'4.21':null,'4.22':'R','4.23':'R','4.24':null,'4.25':null,'4.26':'R','4.27':'R' },
  document_controller:  { '4.1':'R','4.2':null,'4.3':null,'4.4':null,'4.5':'R','4.6':'F','4.7':null,'4.8':null,'4.9':null,'4.10':'R','4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':'F','4.18':'F','4.19':null,'4.20':'R','4.21':'R','4.22':'F','4.23':'F','4.24':'E','4.25':'F','4.26':'E','4.27':'E' },
  client_stakeholder:   { '4.1':'V','4.2':'V','4.3':null,'4.4':'V','4.5':null,'4.6':'V','4.7':'V','4.8':'V','4.9':null,'4.10':'V','4.11':null,'4.12':'V','4.13':'V','4.14':null,'4.15':'V','4.16':'V','4.17':'V','4.18':'V','4.19':null,'4.20':'V','4.21':'V','4.22':'V','4.23':null,'4.24':'V','4.25':null,'4.26':null,'4.27':'V' },
  treasury_manager:     { '4.1':null,'4.2':'R','4.3':null,'4.4':null,'4.5':null,'4.6':null,'4.7':'F','4.8':null,'4.9':null,'4.10':null,'4.11':null,'4.12':null,'4.13':null,'4.14':null,'4.15':null,'4.16':null,'4.17':null,'4.18':null,'4.19':null,'4.20':null,'4.21':null,'4.22':null,'4.23':null,'4.24':null,'4.25':null,'4.26':null,'4.27':null },
  system_admin:         { '4.1':'F','4.2':'F','4.3':'F','4.4':'F','4.5':'F','4.6':'F','4.7':'F','4.8':'F','4.9':'F','4.10':'F','4.11':'F','4.12':'F','4.13':'F','4.14':'F','4.15':'F','4.16':'F','4.17':'F','4.18':'F','4.19':'F','4.20':'F','4.21':'F','4.22':'F','4.23':'F','4.24':'F','4.25':'F','4.26':'F','4.27':'F' },
};

// ── Helpers ───────────────────────────────────────────────

/** Given a route path, find the BRD module it belongs to */
export function getModuleForRoute(path: string): ModuleConfig | undefined {
  // Lifecycle dashboards (stage0-7) are viewable by anyone who has access to ANY module
  if (/^\/(bidding|golden-period|stage[0-7])$/.test(path)) return undefined;

  // Sort by specificity (longest route first) to match /procurement/vendors before /procurement
  const sorted = [...MODULES].sort((a, b) => {
    const maxA = Math.max(...a.routes.map(r => r.length));
    const maxB = Math.max(...b.routes.map(r => r.length));
    return maxB - maxA;
  });

  for (const mod of sorted) {
    for (const route of mod.routes) {
      if (path === route || path.startsWith(route + '/')) {
        return mod;
      }
    }
  }
  return undefined;
}

/** Get permission level for a role on a specific module */
export function getPermission(role: RoleId, moduleId: ModuleId): PermissionLevel {
  return PERMISSION_MATRIX[role]?.[moduleId] ?? null;
}

/** Check if a permission level allows creating/editing */
export function canEdit(perm: PermissionLevel): boolean {
  return perm === 'F' || perm === 'E';
}

/** Check if a permission level allows approving */
export function canApprove(perm: PermissionLevel): boolean {
  return perm === 'F' || perm === 'A';
}

/** Check if a permission level allows viewing */
export function canView(perm: PermissionLevel): boolean {
  return perm !== null;
}

/** Check if a permission level allows deleting (Full only) */
export function canDelete(perm: PermissionLevel): boolean {
  return perm === 'F';
}

/** Get the human-readable label for a permission */
export function permissionLabel(perm: PermissionLevel): string {
  switch (perm) {
    case 'F': return 'Full Access';
    case 'E': return 'Edit / Create';
    case 'R': return 'Read Only';
    case 'A': return 'Approve Only';
    case 'V': return 'View Only (Portal)';
    default:  return 'No Access';
  }
}

/** Get the color class for a permission badge */
export function permissionColor(perm: PermissionLevel): string {
  switch (perm) {
    case 'F': return 'bg-green-100 text-green-700';
    case 'E': return 'bg-blue-100 text-blue-700';
    case 'R': return 'bg-slate-100 text-slate-600';
    case 'A': return 'bg-amber-100 text-amber-700';
    case 'V': return 'bg-purple-100 text-purple-700';
    default:  return 'bg-red-100 text-red-600';
  }
}

// ── Stage × Module Map (BRD-EPC-CHK-FINAL §4) ────────────
// Maps each lifecycle stage to its primary BRD modules.
// A user must have canView access to at least ONE primary module
// to be allowed into that stage's dashboard.

export type StageId = 'stage0' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'stage6' | 'stage7';

export interface StageConfig {
  id: StageId;
  label: string;
  route: string;
  /** Primary modules: user needs access to at least ONE */
  primaryModules: ModuleId[];
  /** Contributing modules referenced inside this stage (for checklist link gating) */
  contributingModules: ModuleId[];
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    id: 'stage0', label: 'Stage 0: Bidding', route: '/bidding',
    primaryModules: ['4.1', '4.14', '4.19'],
    contributingModules: ['4.7'],
  },
  {
    id: 'stage1', label: 'Stage 1: Award', route: '/award',
    primaryModules: ['4.10'],
    contributingModules: ['4.7', '4.17'],
  },
  {
    id: 'stage2', label: 'Stage 2: Golden Period', route: '/golden-period',
    primaryModules: ['4.4', '4.14'],
    contributingModules: ['4.5', '4.7', '4.9', '4.12'],
  },
  {
    id: 'stage3', label: 'Stage 3: Post-Award', route: '/stage3',
    primaryModules: ['4.1', '4.14', '4.18'],
    contributingModules: ['4.13'],
  },
  {
    id: 'stage4', label: 'Stage 4: Material & Dispatch', route: '/stage4',
    primaryModules: ['4.1', '4.14', '4.15'],
    contributingModules: ['4.7', '4.12'],
  },
  {
    id: 'stage5', label: 'Stage 5: Installation', route: '/stage5',
    primaryModules: ['4.1', '4.3'],
    contributingModules: ['4.4', '4.12', '4.21'],
  },
  {
    id: 'stage6', label: 'Stage 6: T&C & Handover', route: '/stage6',
    primaryModules: ['4.20'],
    contributingModules: ['4.13', '4.1'],
  },
  {
    id: 'stage7', label: 'Stage 7: Billing & Collections', route: '/stage7',
    primaryModules: ['4.2', '4.7'],
    contributingModules: ['4.8'],
  },
];

/**
 * Map from route prefix → moduleId for checklist link gating.
 * Every route that appears in stage checklists is mapped here.
 */
export const ROUTE_MODULE_MAP: Record<string, ModuleId> = {
  '/wbs':                              '4.1',
  '/projects':                         '4.1',
  '/installation':                     '4.1',
  '/installation/dpr':                 '4.1',
  '/installation/jmc':                 '4.1',
  '/collections':                      '4.2',
  '/gangs':                            '4.3',
  '/hotspots':                         '4.4',
  '/site-surveys':                     '4.4',
  '/golden-period/insurance':          '4.5',
  '/golden-period/bank-guarantees':    '4.5',
  '/golden-period/statutory':          '4.12',
  '/eot':                              '4.6',
  '/finance':                          '4.7',
  '/finance/bills':                    '4.7',
  '/po-amendments':                    '4.8',
  '/procurement/amendments':           '4.8',
  '/risks':                            '4.9',
  '/contracts':                        '4.10',
  '/award':                            '4.10',
  '/hr':                               '4.11',
  '/safety':                           '4.12',
  '/qa-qc':                            '4.13',
  '/qa-qc/inspections':                '4.13',
  '/commissioning':                    '4.20',
  '/procurement':                      '4.14',
  '/procurement/vendors':              '4.14',
  '/procurement/purchase-orders':      '4.14',
  '/golden-period/vendor-finalization':'4.14',
  '/golden-period/manufacturing-clearance':'4.14',
  '/inventory':                        '4.15',
  '/inventory/dispatch':               '4.15',
  '/correspondence':                   '4.17',
  '/engineering-docs':                 '4.18',
  '/settings':                         '4.19',
  '/rfis':                             '4.21',
  '/meetings':                         '4.22',
  '/transmittals':                     '4.23',
  '/deliverables':                     '4.24',
  '/crs':                              '4.25',
  '/statutory-approvals':              '4.26',
  '/issues':                           '4.27',
};

/**
 * Given a route (possibly with ?tab= params), look up the BRD module ID.
 * Returns null if no mapping exists (e.g. dashboard, login).
 */
export function getModuleIdForRoute(route: string): ModuleId | null {
  const path = route.split('?')[0]; // strip query params
  // Exact match first
  if (ROUTE_MODULE_MAP[path]) return ROUTE_MODULE_MAP[path];
  // Prefix match (longest wins)
  const sorted = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (path.startsWith(prefix)) return ROUTE_MODULE_MAP[prefix];
  }
  return null;
}

/**
 * Check if a user role has access to a lifecycle stage.
 * Returns true if the role has canView on at least one primary module.
 */
export function canAccessStage(
  role: RoleId,
  stage: StageConfig,
  matrix?: PermissionMatrix
): boolean {
  if (role === 'system_admin') return true;
  const targetMatrix = matrix ?? PERMISSION_MATRIX;
  return stage.primaryModules.some(modId => canView(targetMatrix[role]?.[modId] ?? null));
}

/**
 * Get all stages a role can access.
 */
export function getAccessibleStages(
  role: RoleId,
  matrix?: PermissionMatrix
): StageConfig[] {
  return STAGE_CONFIGS.filter(s => canAccessStage(role, s, matrix));
}

