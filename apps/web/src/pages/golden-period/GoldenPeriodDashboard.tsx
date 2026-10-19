// GoldenPeriodDashboard.tsx — Stage 2 Golden Period
// BRD §2: Site Surveys, Hotspot Resolution, Vendor Finalization, LOI/Mfg Clearance,
//         Insurance, Statutory, Bank Guarantees, Environment, Land Acquisition, 25% Gate
// Same checklist format as Stage 3–7 with per-item RBAC access control.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChecklistLink, ChecklistCardWrapper } from '../../components/auth/StageGuard';
import { useAuth } from '../../contexts/AuthContext';
import { ModuleId, canView } from '../../config/rbac';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2, AlertCircle, Clock, AlertTriangle,
  MapPin, Flame, Truck, Award, ShieldCheck, FileCheck,
  Landmark, Trees, Home, Lock, BarChart2, Grid,
  ArrowRight, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  ref: string;
  title: string;
  description: string;
  module: string;
  moduleId: string;
  route: string;
  sla: string;
  status: 'Complete' | 'In Progress' | 'Blocked' | 'Not Started';
  progress: number;
  keyMetric: string;
  icon: React.ElementType;
}

// ── Checklist Data (BRD §2.1–2.10) ────────────────────────────────────────────
// moduleId mapping:
//   4.4  = Survey & Hotspot Management
//   4.14 = Procurement / Vendor Finalization
//   4.10 = Contracts & Insurance (LOI, BGs, Statutory)

const CHECKLIST: CheckItem[] = [
  {
    id: '2.1', ref: 'BRD 2.1', title: 'Site Survey & GPS Data',
    moduleId: '4.4', module: 'Site Surveys',
    description: 'Route survey with GPS coordinates per tower location. Segment-wise completion. Client approval on survey report mandatory before foundation work. Sag-tension chart included.',
    route: '/site-surveys', sla: '≤30 days from award',
    status: 'Complete', progress: 100, keyMetric: '382 km surveyed · 7 segments · Client approved',
    icon: MapPin,
  },
  {
    id: '2.2', ref: 'BRD 2.2', title: 'Hotspot Register & Resolution',
    moduleId: '4.4', module: 'Hotspot Register',
    description: 'Category-wise hotspot register: Forest land, Railway crossings, River crossings, Highway crossings, Urban areas. Each hotspot tracked with NOC status, responsible authority, and resolution date.',
    route: '/hotspots', sla: '100% resolved before stringing',
    status: 'In Progress', progress: 72, keyMetric: '42 resolved · 15 in progress · 7 overdue',
    icon: Flame,
  },
  {
    id: '2.3', ref: 'BRD 2.3', title: 'Vendor Finalization',
    moduleId: '4.14', module: 'Vendor Finalization',
    description: 'Per-category vendor selection: HTLS, OPGW, Towers, Insulators, Hardware, ACSR, Earthwire, Civil, Transport, Stringing, Telecom, Testing. Minimum 8/12 categories finalized before 25% Gate.',
    route: '/golden-period/vendor-finalization', sla: '8/12 categories before 25% Gate',
    status: 'In Progress', progress: 67, keyMetric: '8/12 categories · ACSR & Hardware pending',
    icon: Truck,
  },
  {
    id: '2.4', ref: 'BRD 2.4', title: 'LOI / Manufacturing Clearance',
    moduleId: '4.14', module: 'LOI / Mfg Clearance',
    description: 'Letter of Intent issued per vendor category. Manufacturing clearance mandatory for HTLS conductor and OPGW vendors before production start. Independent tracking for each clearance document.',
    route: '/golden-period/manufacturing-clearance', sla: '≤45 days from award',
    status: 'In Progress', progress: 58, keyMetric: '6 LOIs issued · HTLS & OPGW cleared · Towers LOI pending',
    icon: Award,
  },
  {
    id: '2.5', ref: 'BRD 2.5', title: 'Insurance Tracker',
    moduleId: '4.10', module: 'Insurance',
    description: 'Contractor All Risk (CAR), Third Party Liability (TPL), Workmen Compensation (WC), Marine Transit, Environmental Liability, Professional Indemnity, Group Personal Accident (GPA), Equipment Insurance. All must be Compliant before mobilization.',
    route: '/golden-period/insurance', sla: 'All policies active before mobilization',
    status: 'In Progress', progress: 75, keyMetric: '6/8 compliant · WC renewal pending · Env. liability overdue',
    icon: ShieldCheck,
  },
  {
    id: '2.6', ref: 'BRD 2.6', title: 'Statutory Verification',
    moduleId: '4.10', module: 'Statutory',
    description: 'Forest Department NOC, Railway crossing permissions, PWD permissions, NHAI approvals, State pollution board clearances, Archaeological Survey clearance. Segment-wise tracking.',
    route: '/golden-period/statutory', sla: 'NOCs before respective work commencement',
    status: 'In Progress', progress: 55, keyMetric: '12/22 NOCs obtained · 4 under process · 6 not initiated',
    icon: FileCheck,
  },
  {
    id: '2.7', ref: 'BRD 2.7', title: 'Bank Guarantees (CPBG / CPG)',
    moduleId: '4.10', module: 'Bank Guarantees',
    description: 'Contract Performance Bank Guarantee (CPBG) and Contract Performance Guarantee (CPG) submitted to client within SLA. Tracked with BG number, amount, bank, validity, and expiry alerts.',
    route: '/golden-period/bank-guarantees', sla: '≤7 days from award acceptance',
    status: 'Complete', progress: 100, keyMetric: 'CPBG ₹4.2 Cr · CPG ₹1.8 Cr · Both submitted on time',
    icon: Landmark,
  },
  {
    id: '2.8', ref: 'BRD 2.8', title: 'Environment Clearance',
    moduleId: '4.10', module: 'Statutory',
    description: 'Forest clearance (Stage I & II), State Environment Impact Assessment, pollution board NOC. Blocked segments cannot have foundation work commenced until clearance obtained.',
    route: '/golden-period/statutory', sla: 'Before any restricted area work',
    status: 'Blocked', progress: 30, keyMetric: 'Seg C blocked · Forest Dept NOC pending · Env. team engaged',
    icon: Trees,
  },
  {
    id: '2.9', ref: 'BRD 2.9', title: 'Land Acquisition Register',
    moduleId: '4.4', module: 'Land Acquisition',
    description: 'Plot-wise land acquisition tracking: owner name, survey number, taluka, district, compensation amount, payment status, possession date. Affected structures and crop compensation tracked separately.',
    route: '/golden-period/statutory', sla: 'Acquisition before foundation for each plot',
    status: 'In Progress', progress: 45, keyMetric: '42/91 plots cleared · 28 in process · 21 not initiated',
    icon: Home,
  },
  {
    id: '2.10', ref: 'BRD 2.10', title: '25% Pre-Production Gate',
    moduleId: '4.14', module: 'Production Readiness',
    description: 'Formal gate review: Survey approved, ≥8/12 vendors finalized, HTLS/OPGW Mfg Clearance issued, CPBG/CPG submitted. All 4 conditions must pass simultaneously. Triggers production start authorization.',
    route: '/golden-period', sla: '≤60 days from award acceptance',
    status: 'In Progress', progress: 75, keyMetric: '3/4 conditions met · Vendor finalization (8/12) pending',
    icon: Lock,
  },
];

// ── Analytics Data ─────────────────────────────────────────────────────────────

const STATUS_V: Record<string, string> = {
  Complete: 'success', 'In Progress': 'primary', Blocked: 'danger', 'Not Started': 'secondary',
};

const slaData = [
  { item: 'Site Survey',      elapsed: 14, sla: 30 },
  { item: 'Vendor Final.',    elapsed: 28, sla: 45 },
  { item: 'LOI / Mfg Clr',   elapsed: 32, sla: 45 },
  { item: 'Insurance',        elapsed: 18, sla: 25 },
  { item: 'Statutory NOCs',   elapsed: 35, sla: 60 },
  { item: 'Bank Guarantees',  elapsed: 5,  sla: 7  },
  { item: '25% Gate',         elapsed: 48, sla: 60 },
];

const hotspotData = [
  { name: 'Forest Land',    resolved: 12, inProgress: 5, overdue: 2 },
  { name: 'Railway X-ing',  resolved: 8,  inProgress: 2, overdue: 1 },
  { name: 'River X-ing',    resolved: 5,  inProgress: 3, overdue: 0 },
  { name: 'Highway X-ing',  resolved: 14, inProgress: 1, overdue: 1 },
  { name: 'Urban Area',     resolved: 3,  inProgress: 4, overdue: 3 },
];

const gateData = [
  { condition: 'Survey Approved', passed: true },
  { condition: 'Vendors (8/12)',  passed: false },
  { condition: 'Mfg Clearance',  passed: true },
  { condition: 'CPBG/CPG',       passed: true },
];

const MODULE_MAP = [
  { id: '4.4',  name: 'Site Surveys & Hotspot', route: '/site-surveys',     items: ['2.1','2.2','2.9'] },
  { id: '4.14', name: 'Vendor & LOI / Mfg Clearance', route: '/golden-period/vendor-finalization', items: ['2.3','2.4','2.10'] },
  { id: '4.10', name: 'Contracts / Insurance / BGs',   route: '/golden-period/insurance',           items: ['2.5','2.6','2.7','2.8'] },
];

const COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#ef4444'];

import { usePersistentState } from '../../hooks/usePersistentState';

// ── Component ──────────────────────────────────────────────────────────────────

export default function GoldenPeriodDashboard() {
  const navigate = useNavigate();
  const { getEffectivePermission } = useAuth();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage2_checklist', CHECKLIST);
  const [activeTab, setActiveTab] = useState<'checklist' | 'analytics' | 'modules'>('checklist');
  const [filter, setFilter] = useState('All');

  const filtered = checklist.filter(c => filter === 'All' || c.status === filter);
  const complete  = checklist.filter(c => c.status === 'Complete').length;
  const blocked   = checklist.filter(c => c.status === 'Blocked').length;
  const overallProgress = Math.round(checklist.reduce((s, c) => s + c.progress, 0) / checklist.length);
  const statusCounts = ['Complete', 'In Progress', 'Blocked', 'Not Started']
    .map(s => ({ name: s, value: checklist.filter(c => c.status === s).length }));
  const gatePassCount = gateData.filter(g => g.passed).length;

  const TABS = [
    { id: 'checklist', label: 'Execution Checklist', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics',           icon: BarChart2 },
    { id: 'modules',   label: 'Module Map',           icon: Grid },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 2: Golden Period (BRD §2)"
        description="25% Pre-Production Readiness Gate · 10 milestones tracked"
        action={
          <div className="flex gap-2">
            {canView(getEffectivePermission('4.14')) && (
              <button
                onClick={() => navigate('/golden-period/vendor-finalization')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                <Award size={14} />
                Vendor Finalization →
              </button>
            )}
            {canView(getEffectivePermission('4.10')) && (
              <button
                onClick={() => navigate('/golden-period/bank-guarantees')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Landmark size={14} />
                Bank Guarantees →
              </button>
            )}
          </div>
        }
      />

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'Golden Period Overview', href: '/golden-period', icon: <Grid size={14} />, moduleId: undefined },
          { label: 'Vendor Finalization', href: '/golden-period/vendor-finalization', icon: <Award size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'LOI / Mfg Clearance', href: '/golden-period/manufacturing-clearance', icon: <FileCheck size={14} />, moduleId: '4.14' as ModuleId },
          { label: 'Bank Guarantees', href: '/golden-period/bank-guarantees', icon: <Landmark size={14} />, moduleId: '4.10' as ModuleId },
          { label: 'Insurance Tracker', href: '/golden-period/insurance', icon: <ShieldCheck size={14} />, moduleId: '4.5' as ModuleId },
          { label: 'Statutory Verification', href: '/golden-period/statutory', icon: <Trees size={14} />, moduleId: '4.5' as ModuleId },
        ]
          .filter(item => !item.moduleId || canView(getEffectivePermission(item.moduleId)))
          .map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors shrink-0 shadow-sm"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
      </div>

      {/* ── Summary Banner ──────────────────────────────────────────────────── */}
      <div className={`rounded-xl p-5 border-2 ${overallProgress >= 75 ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Overall Stage 2 Progress</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{overallProgress}%</p>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { label: 'Complete',    val: complete, color: 'text-green-600' },
              { label: 'In Progress', val: CHECKLIST.filter(c => c.status === 'In Progress').length, color: 'text-indigo-600' },
              { label: 'Blocked',     val: blocked, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          {/* 25% Gate status */}
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${gatePassCount === 4 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            25% Gate: {gatePassCount}/4 conditions met
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress to 25% Gate</span><span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${overallProgress >= 75 ? 'bg-green-500' : overallProgress >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 25% Gate Conditions ─────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Lock size={15} className="text-indigo-500" />
          25% Pre-Production Gate Conditions (all 4 must pass)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {gateData.map(g => (
            <div key={g.condition}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${g.passed ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}
            >
              {g.passed
                ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                : <AlertCircle  size={16} className="text-red-500 shrink-0" />}
              {g.condition}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: EXECUTION CHECKLIST
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {complete}/{CHECKLIST.length} milestones complete
                  {blocked > 0 && <span className="ml-2 text-red-600">· {blocked} blocked</span>}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Complete', 'In Progress', 'Blocked', 'Not Started'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                      filter === f
                        ? f === 'Blocked' ? 'bg-red-600 text-white border-red-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>
          </Card>

          {/* Checklist cards */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700">Execution Checklist ({filtered.length})</h3>
            {filtered.map(item => (
              <ChecklistCardWrapper key={item.id} route={item.route} moduleId={item.moduleId as any}>
                <Card className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        item.status === 'Complete' ? 'bg-green-50'
                        : item.status === 'Blocked' ? 'bg-red-50'
                        : 'bg-indigo-50'
                      }`}>
                        <item.icon size={18} className={
                          item.status === 'Complete' ? 'text-green-600'
                          : item.status === 'Blocked' ? 'text-red-600'
                          : 'text-indigo-600'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.ref}</span>
                          <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                          <Badge variant={STATUS_V[item.status] as any}>{item.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                          <span>📦 <strong>{item.module}</strong></span>
                          <span>⏱ SLA: <strong>{item.sla}</strong></span>
                          <span>📊 {item.keyMetric}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.progress >= 80 ? 'bg-green-500' : item.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item.progress}%</span>
                      </div>
                      <ChecklistLink route={item.route} />
                    </div>
                  </div>
                </Card>
              </ChecklistCardWrapper>
            ))}
          </div>

          {/* BRD Benchmarks */}
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD §2 Stage 2 Benchmarks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Site Survey', '≤30 days'],
                ['Vendor Finalization', '8/12 categories'],
                ['LOI / Mfg Clearance', '≤45 days'],
                ['Insurance', 'All active'],
                ['Bank Guarantees', '≤7 days'],
                ['Statutory NOCs', 'Before work'],
                ['25% Gate Review', '≤60 days'],
                ['Environment Clr.', 'Before restricted work'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-0.5">{k}</p>
                  <p className="text-sm font-bold text-indigo-700">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Status Distribution */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusCounts.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-slate-600">{s.name}: <strong>{s.value}</strong></span>
                  </div>
                ))}
              </div>
            </Card>

            {/* SLA Tracking */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">SLA Days Tracking (Elapsed vs Target)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={slaData} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="item" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="elapsed" name="Elapsed (days)" fill="#6366f1" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="sla" name="SLA Target" fill="#e2e8f0" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Hotspot Resolution */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Hotspot Resolution by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hotspotData} margin={{ left: 0, right: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved"   name="Resolved"    fill="#22c55e" stackId="a" />
                  <Bar dataKey="inProgress" name="In Progress" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="overdue"    name="Overdue"     fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Progress per item */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Completion % per BRD Feature</h3>
              <div className="space-y-3">
                {CHECKLIST.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{item.ref} · {item.title}</span>
                      <span className="font-bold">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.progress >= 100 ? 'bg-green-500' : item.progress >= 60 ? 'bg-indigo-500' : item.progress >= 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: MODULE MAP
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Stage 2 checklist items are executed through these core modules. Click any module to open it.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULE_MAP.map(mod => {
              const modItems = CHECKLIST.filter(c => mod.items.includes(c.id));
              const modComplete = modItems.filter(c => c.status === 'Complete').length;
              const modPct = Math.round(modItems.reduce((s, c) => s + c.progress, 0) / modItems.length);
              return (
                <Card key={mod.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(mod.route)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Module {mod.id}</span>
                      <h4 className="font-semibold text-slate-800 text-sm mt-1">{mod.name}</h4>
                    </div>
                    <span className="text-lg font-bold text-slate-700">{modPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${modPct >= 80 ? 'bg-green-500' : modPct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                      style={{ width: `${modPct}%` }}
                    />
                  </div>
                  <div className="space-y-1 mb-4">
                    {modItems.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-xs text-slate-600">
                        {c.status === 'Complete'
                          ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                          : c.status === 'Blocked'
                          ? <AlertCircle  size={11} className="text-red-500 shrink-0" />
                          : <Clock        size={11} className="text-amber-500 shrink-0" />}
                        <span>{c.ref} — {c.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{modComplete}/{modItems.length} complete</span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(mod.route); }}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Open Module <ArrowRight size={11} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
