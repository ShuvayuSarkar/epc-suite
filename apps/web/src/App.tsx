import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StageGuard } from './components/auth/StageGuard';
import { RouteGuard } from './components/auth/PermissionGate';

// Loading fallback
const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Overview
const ExecutiveDashboard = React.lazy(() => import('./pages/dashboard/ExecutiveDashboard'));

// Projects
const ProjectList = React.lazy(() => import('./pages/projects/ProjectList'));
const ProjectDetail = React.lazy(() => import('./pages/projects/ProjectDetail'));
const ProjectLifecycle = React.lazy(() => import('./pages/projects/ProjectLifecycle'));
const WBSManager = React.lazy(() => import('./pages/wbs/WBSManager'));
const ClientList = React.lazy(() => import('./pages/clients/ClientList'));
const ClientDetail = React.lazy(() => import('./pages/clients/ClientDetail'));

// Bidding — Stage 0
const BidList = React.lazy(() => import('./pages/bidding/BidList'));
const NewBid = React.lazy(() => import('./pages/bidding/NewBid'));
const BidDetail = React.lazy(() => import('./pages/bidding/BidDetail'));

// Award Receipt & Acceptance — Stage 1
const AwardList = React.lazy(() => import('./pages/award/AwardList'));
const NewAward = React.lazy(() => import('./pages/award/NewAward'));
const AwardDetail = React.lazy(() => import('./pages/award/AwardDetail'));

// Golden Period — Stage 2
const GoldenPeriodDashboard = React.lazy(() => import('./pages/golden-period/GoldenPeriodDashboard'));
const VendorFinalization = React.lazy(() => import('./pages/golden-period/VendorFinalization'));
const ManufacturingClearance = React.lazy(() => import('./pages/golden-period/ManufacturingClearance'));
const InsuranceTracker = React.lazy(() => import('./pages/golden-period/InsuranceTracker'));
const StatutoryVerification = React.lazy(() => import('./pages/golden-period/StatutoryVerification'));
const BankGuaranteeTracker = React.lazy(() => import('./pages/golden-period/BankGuaranteeTracker'));
const Stage3Dashboard = React.lazy(() => import('./pages/stage3/Stage3Dashboard'));
const Stage4Dashboard = React.lazy(() => import('./pages/stage4/Stage4Dashboard'));
const Stage5Dashboard = React.lazy(() => import('./pages/stage5/Stage5Dashboard'));
const Stage6Dashboard = React.lazy(() => import('./pages/stage6/Stage6Dashboard'));
const Stage7Dashboard = React.lazy(() => import('./pages/stage7/Stage7Dashboard'));

// Engineering
const EngineeringDocList = React.lazy(() => import('./pages/engineering-docs/EngineeringDocList'));
const CorrespondenceList = React.lazy(() => import('./pages/correspondence/CorrespondenceList'));
const RFIList = React.lazy(() => import('./pages/rfis/RFIList'));

// Document Control, Meetings, Deliverables & Compliance
const TransmittalList = React.lazy(() => import('./pages/transmittals/TransmittalList'));
const CRSList = React.lazy(() => import('./pages/crs/CRSList'));
const MOMList = React.lazy(() => import('./pages/meetings/MOMList'));
const MOMDetail = React.lazy(() => import('./pages/meetings/MOMDetail'));
const IssueList = React.lazy(() => import('./pages/issues/IssueList'));
const DeliverableList = React.lazy(() => import('./pages/deliverables/DeliverableList'));
const StatutoryApprovalList = React.lazy(() => import('./pages/statutory-approvals/StatutoryApprovalList'));

// Procurement
const ProcurementDashboard = React.lazy(() => import('./pages/procurement/ProcurementDashboard'));
const VendorList = React.lazy(() => import('./pages/procurement/VendorList'));
const POList = React.lazy(() => import('./pages/procurement/POList'));
const POLineItemList = React.lazy(() => import('./pages/procurement/POLineItemList'));
const InventoryList = React.lazy(() => import('./pages/inventory/InventoryList'));
const InventoryDashboard = React.lazy(() => import('./pages/inventory/InventoryDashboard'));
const POAmendmentList = React.lazy(() => import('./pages/po-amendments/POAmendmentList'));

// Field Ops
const InstallationDashboard = React.lazy(() => import('./pages/installation/InstallationDashboard'));
const DPRList = React.lazy(() => import('./pages/installation/DPRList'));
const JMCList = React.lazy(() => import('./pages/installation/JMCList'));
const GangList = React.lazy(() => import('./pages/gangs/GangList'));
const SiteSurveyList = React.lazy(() => import('./pages/site-surveys/SiteSurveyList'));
const HotspotDashboard = React.lazy(() => import('./pages/hotspots/HotspotDashboard'));
const SafetyDashboard = React.lazy(() => import('./pages/safety/SafetyDashboard'));
const IncidentList = React.lazy(() => import('./pages/safety/IncidentList'));
const AuditList = React.lazy(() => import('./pages/safety/AuditList'));

// Quality
const QAQCDashboard = React.lazy(() => import('./pages/qa-qc/QAQCDashboard'));
const InspectionList = React.lazy(() => import('./pages/qa-qc/InspectionList'));
const NCRList = React.lazy(() => import('./pages/qa-qc/NCRList'));
const CommissioningDashboard = React.lazy(() => import('./pages/commissioning/CommissioningDashboard'));

// Finance
const FinanceDashboard = React.lazy(() => import('./pages/finance/FinanceDashboard'));
const BillList = React.lazy(() => import('./pages/finance/BillList'));
const BudgetList = React.lazy(() => import('./pages/finance/BudgetList'));
const CollectionsDashboard = React.lazy(() => import('./pages/collections/CollectionsDashboard'));
const InvoiceList = React.lazy(() => import('./pages/collections/InvoiceList'));

// Contracts & EOT
const ContractList = React.lazy(() => import('./pages/contracts/ContractList'));
const EOTDashboard = React.lazy(() => import('./pages/eot/EOTDashboard'));
const DelayEventList = React.lazy(() => import('./pages/eot/DelayEventList'));
const EOTClaimList = React.lazy(() => import('./pages/eot/EOTClaimList'));

// Resources
const ResourceList = React.lazy(() => import('./pages/resources/ResourceList'));
const HRDashboard = React.lazy(() => import('./pages/hr/HRDashboard'));
const EmployeeList = React.lazy(() => import('./pages/hr/EmployeeList'));
const AttendanceList = React.lazy(() => import('./pages/hr/AttendanceList'));

// Analytics
const RiskDashboard = React.lazy(() => import('./pages/risks/RiskDashboard'));

// Settings
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const AdminPanel = React.lazy(() => import('./pages/settings/AdminPanel'));

// Auth-aware redirect: sends to /login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/** Wraps a lazy component with Suspense + RouteGuard for module-level access control */
function G({ moduleId, children }: { moduleId: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <RouteGuard moduleId={moduleId as any}>
        {children}
      </RouteGuard>
    </Suspense>
  );
}

/** Wraps a lazy component with Suspense only (no module guard — for public/cross-role pages) */
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

const App = () => {
  return (
    <AuthProvider>
    <Routes>
      {/* Public login route */}
      <Route path="/login" element={<S><LoginPage /></S>} />

      {/* Protected routes */}
      <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard — always accessible to authenticated users */}
        <Route path="dashboard" element={<S><ExecutiveDashboard /></S>} />

        {/* ── STAGE 0: BIDDING ──────────────────────────────── */}
        {/* Module 4.1 primary; bid_manager, project_manager, project_director have access */}
        <Route path="bidding">
          <Route index element={<G moduleId="4.1"><StageGuard stageId="stage0"><BidList /></StageGuard></G>} />
          <Route path="new" element={<G moduleId="4.1"><StageGuard stageId="stage0"><NewBid /></StageGuard></G>} />
          <Route path=":id" element={<G moduleId="4.1"><StageGuard stageId="stage0"><BidDetail /></StageGuard></G>} />
        </Route>

        {/* ── STAGE 1: AWARD ───────────────────────────────── */}
        {/* Module 4.10 — contract_manager, project_manager, legal_contracts */}
        <Route path="award">
          <Route index element={<G moduleId="4.10"><StageGuard stageId="stage1"><AwardList /></StageGuard></G>} />
          <Route path="new" element={<G moduleId="4.10"><StageGuard stageId="stage1"><NewAward /></StageGuard></G>} />
          <Route path=":id" element={<G moduleId="4.10"><StageGuard stageId="stage1"><AwardDetail /></StageGuard></G>} />
        </Route>

        {/* ── STAGE 2: GOLDEN PERIOD ───────────────────────── */}
        {/* Module 4.14 primary */}
        <Route path="golden-period">
          <Route index element={<G moduleId="4.14"><StageGuard stageId="stage2"><GoldenPeriodDashboard /></StageGuard></G>} />
          <Route path="vendor-finalization" element={<G moduleId="4.14"><VendorFinalization /></G>} />
          <Route path="manufacturing-clearance" element={<G moduleId="4.14"><ManufacturingClearance /></G>} />
          <Route path="insurance" element={<G moduleId="4.5"><InsuranceTracker /></G>} />
          <Route path="statutory" element={<G moduleId="4.5"><StatutoryVerification /></G>} />
          <Route path="bank-guarantees" element={<G moduleId="4.5"><BankGuaranteeTracker /></G>} />
        </Route>

        {/* ── STAGE 3: PRE-CONSTRUCTION SETUP ──────────────── */}
        {/* Module 4.1 primary */}
        <Route path="stage3" element={<G moduleId="4.1"><StageGuard stageId="stage3"><Stage3Dashboard /></StageGuard></G>} />

        {/* ── STAGE 4: ENGINEERING & MATERIAL ──────────────── */}
        {/* Module 4.18 primary */}
        <Route path="stage4" element={<G moduleId="4.18"><StageGuard stageId="stage4"><Stage4Dashboard /></StageGuard></G>} />

        {/* ── STAGE 5: PROCUREMENT & CONSTRUCTION ──────────── */}
        {/* Module 4.1 primary */}
        <Route path="stage5" element={<G moduleId="4.1"><StageGuard stageId="stage5"><Stage5Dashboard /></StageGuard></G>} />

        {/* ── STAGE 6: COMMISSIONING & HANDOVER ────────────── */}
        {/* Module 4.20 primary */}
        <Route path="stage6" element={<G moduleId="4.20"><StageGuard stageId="stage6"><Stage6Dashboard /></StageGuard></G>} />

        {/* ── STAGE 7: BILLING & COLLECTIONS ───────────────── */}
        {/* Module 4.2 primary */}
        <Route path="stage7" element={<G moduleId="4.2"><StageGuard stageId="stage7"><Stage7Dashboard /></StageGuard></G>} />

        {/* ── PROJECTS & PLANNING (Module 4.1) ─────────────── */}
        <Route path="projects">
          <Route index element={<G moduleId="4.1"><ProjectList /></G>} />
          <Route path=":id" element={<G moduleId="4.1"><ProjectDetail /></G>} />
          <Route path=":id/lifecycle" element={<G moduleId="4.1"><ProjectLifecycle /></G>} />
        </Route>
        <Route path="wbs" element={<G moduleId="4.1"><WBSManager /></G>} />

        {/* Clients — cross-role visibility, no strict module gate */}
        <Route path="clients">
          <Route index element={<S><ClientList /></S>} />
          <Route path=":id" element={<S><ClientDetail /></S>} />
        </Route>

        {/* ── ENGINEERING (Module 4.18) ─────────────────────── */}
        <Route path="engineering-docs" element={<G moduleId="4.18"><EngineeringDocList /></G>} />
        <Route path="correspondence" element={<G moduleId="4.17"><CorrespondenceList /></G>} />
        <Route path="rfis" element={<G moduleId="4.21"><RFIList /></G>} />

        {/* ── DOCUMENT CONTROL (Module 4.23 / 4.25) ────────── */}
        <Route path="transmittals" element={<G moduleId="4.23"><TransmittalList /></G>} />
        <Route path="crs" element={<G moduleId="4.25"><CRSList /></G>} />

        {/* ── MEETINGS & ISSUES (Module 4.22 / 4.27) ───────── */}
        <Route path="meetings">
          <Route index element={<G moduleId="4.22"><MOMList /></G>} />
          <Route path=":id" element={<G moduleId="4.22"><MOMDetail /></G>} />
        </Route>
        <Route path="issues" element={<G moduleId="4.27"><IssueList /></G>} />

        {/* ── DELIVERABLES & SCHEDULE (Module 4.24) ────────── */}
        <Route path="deliverables" element={<G moduleId="4.24"><DeliverableList /></G>} />

        {/* ── COMPLIANCE (Module 4.26) ──────────────────────── */}
        <Route path="statutory-approvals" element={<G moduleId="4.26"><StatutoryApprovalList /></G>} />

        {/* ── PROCUREMENT (Module 4.14) ─────────────────────── */}
        <Route path="procurement">
          <Route index element={<G moduleId="4.14"><ProcurementDashboard /></G>} />
          <Route path="vendors" element={<G moduleId="4.14"><VendorList /></G>} />
          <Route path="purchase-orders" element={<G moduleId="4.14"><POList /></G>} />
        </Route>
        <Route path="po-line-items" element={<G moduleId="4.14"><POLineItemList /></G>} />
        <Route path="po-amendments" element={<G moduleId="4.8"><POAmendmentList /></G>} />

        {/* ── INVENTORY (Module 4.15) ───────────────────────── */}
        <Route path="inventory">
          <Route index element={<G moduleId="4.15"><InventoryList /></G>} />
          <Route path="dispatch" element={<G moduleId="4.15"><InventoryDashboard /></G>} />
        </Route>

        {/* ── FIELD OPS ─────────────────────────────────────── */}
        <Route path="installation">
          <Route index element={<G moduleId="4.1"><InstallationDashboard /></G>} />
          <Route path="dpr" element={<G moduleId="4.1"><DPRList /></G>} />
          <Route path="jmc" element={<G moduleId="4.1"><JMCList /></G>} />
        </Route>
        <Route path="gangs" element={<G moduleId="4.3"><GangList /></G>} />
        <Route path="site-surveys" element={<G moduleId="4.4"><SiteSurveyList /></G>} />
        <Route path="hotspots" element={<G moduleId="4.4"><HotspotDashboard /></G>} />

        {/* ── SAFETY (Module 4.12) ──────────────────────────── */}
        <Route path="safety">
          <Route index element={<G moduleId="4.12"><SafetyDashboard /></G>} />
          <Route path="incidents" element={<G moduleId="4.12"><IncidentList /></G>} />
          <Route path="audits" element={<G moduleId="4.12"><AuditList /></G>} />
        </Route>

        {/* ── QUALITY (Module 4.13) ─────────────────────────── */}
        <Route path="qa-qc">
          <Route index element={<G moduleId="4.13"><QAQCDashboard /></G>} />
          <Route path="inspections" element={<G moduleId="4.13"><InspectionList /></G>} />
          <Route path="ncrs" element={<G moduleId="4.13"><NCRList /></G>} />
        </Route>

        {/* ── COMMISSIONING (Module 4.20) ───────────────────── */}
        <Route path="commissioning" element={<G moduleId="4.20"><CommissioningDashboard /></G>} />

        {/* ── FINANCE (Module 4.7) ──────────────────────────── */}
        <Route path="finance">
          <Route index element={<G moduleId="4.7"><FinanceDashboard /></G>} />
          <Route path="bills" element={<G moduleId="4.7"><BillList /></G>} />
          <Route path="budgets" element={<G moduleId="4.7"><BudgetList /></G>} />
        </Route>

        {/* ── COLLECTIONS (Module 4.2) ──────────────────────── */}
        <Route path="collections">
          <Route index element={<G moduleId="4.2"><CollectionsDashboard /></G>} />
          <Route path="invoices" element={<G moduleId="4.2"><InvoiceList /></G>} />
        </Route>

        {/* ── CONTRACTS (Module 4.10) ───────────────────────── */}
        <Route path="contracts" element={<G moduleId="4.10"><ContractList /></G>} />

        {/* ── EOT / DELAY CLAIMS (Module 4.6) ──────────────── */}
        <Route path="eot">
          <Route index element={<G moduleId="4.6"><EOTDashboard /></G>} />
          <Route path="events" element={<G moduleId="4.6"><DelayEventList /></G>} />
          <Route path="claims" element={<G moduleId="4.6"><EOTClaimList /></G>} />
        </Route>

        {/* ── HR & RESOURCES ────────────────────────────────── */}
        <Route path="resources" element={<G moduleId="4.16"><ResourceList /></G>} />
        <Route path="hr">
          <Route index element={<G moduleId="4.11"><HRDashboard /></G>} />
          <Route path="employees" element={<G moduleId="4.11"><EmployeeList /></G>} />
          <Route path="attendance" element={<G moduleId="4.11"><AttendanceList /></G>} />
        </Route>

        {/* ── RISK (Module 4.9) ─────────────────────────────── */}
        <Route path="risks" element={<G moduleId="4.9"><RiskDashboard /></G>} />

        {/* ── ADMIN (Module 4.19) ───────────────────────────── */}
        <Route path="settings">
          <Route index element={<G moduleId="4.19"><SettingsPage /></G>} />
          <Route path="admin" element={<G moduleId="4.19"><AdminPanel /></G>} />
        </Route>
      </Route>
    </Routes>
    </AuthProvider>
  );
};

export default App;
