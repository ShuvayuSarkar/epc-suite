import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Activity, AlertTriangle, TrendingUp, IndianRupee, Layers, FileText,
  ShoppingCart, ShieldAlert, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Minus, Clock, Users, Building, Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { RAGIndicator } from '../../components/ui/RAGIndicator';
import { PageHeader } from '../../components/ui/PageHeader';
import SCurve from '../../components/charts/SCurve';
import { SCurveDataPoint } from '../../types/deliverable';
import { useNavigate } from 'react-router-dom';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Project } from '../projects/ProjectList';

interface PortfolioProject {
  id: string;
  name: string;
  client: string;
  scheduleHealth: 'green' | 'amber' | 'red';
  costHealth: 'green' | 'amber' | 'red';
  qualityHealth: 'green' | 'amber' | 'red';
  safetyHealth: 'green' | 'amber' | 'red';
  progress: number;
  nextMilestone: string;
  daysRemaining: number;
  outlook: 'improving' | 'stable' | 'deteriorating';
  value: string;
}

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'PRJ-101',
    name: 'Rajkot-Jetpur 220kV D/C Transmission Line',
    client: 'GETCO',
    scheduleHealth: 'amber',
    costHealth: 'green',
    qualityHealth: 'green',
    safetyHealth: 'green',
    progress: 68,
    nextMilestone: 'Tower Erection Loc 45-78',
    daysRemaining: 14,
    outlook: 'improving',
    value: '₹145.5 Cr'
  },
  {
    id: 'PRJ-102',
    name: 'Surat-Bardoli 132kV XLPE Underground Cable',
    client: 'GETCO Surat',
    scheduleHealth: 'green',
    costHealth: 'green',
    qualityHealth: 'green',
    safetyHealth: 'green',
    progress: 42,
    nextMilestone: 'NH-48 HDD Road Crossing',
    daysRemaining: 8,
    outlook: 'stable',
    value: '₹88.0 Cr'
  },
  {
    id: 'PRJ-103',
    name: 'IndiGrid Bhopal-Dhule 400kV OPGW Replacement',
    client: 'IndiGrid',
    scheduleHealth: 'green',
    costHealth: 'green',
    qualityHealth: 'green',
    safetyHealth: 'green',
    progress: 92,
    nextMilestone: 'Final Testing & CEIG Sanction',
    daysRemaining: 5,
    outlook: 'improving',
    value: '₹42.0 Cr'
  },
  {
    id: 'PRJ-104',
    name: 'NTPC Lara 400kV HTLS Reconductoring Package',
    client: 'NTPC',
    scheduleHealth: 'red',
    costHealth: 'amber',
    qualityHealth: 'green',
    safetyHealth: 'amber',
    progress: 35,
    nextMilestone: 'Conductor Drum Site Delivery',
    daysRemaining: -4,
    outlook: 'deteriorating',
    value: '₹112.4 Cr'
  }
];

const PORTFOLIO_SCURVE: SCurveDataPoint[] = [
  { period: "Jun'26", planned: 12, actual: 10, forecast: 11 },
  { period: "Jul'26", planned: 28, actual: 25, forecast: 26 },
  { period: "Aug'26", planned: 48, actual: 44, forecast: 46 },
  { period: "Sep'26", planned: 68, actual: 64, forecast: 66 },
  { period: "Oct'26", planned: 84, actual: 78, forecast: 81 },
  { period: "Nov'26", planned: 96, actual: 0, forecast: 92 },
  { period: "Dec'26", planned: 100, actual: 0, forecast: 100 },
];

const PRE_ORDER_PACKAGES = [
  { package: 'Substation Control Cable 1.1kV', prValue: '₹3.2 Cr', status: 'Technical Evaluation', rfqCount: 4, daysOpen: 18 },
  { package: 'Tower Galvanized Fasteners & Accessories', prValue: '₹1.8 Cr', status: 'Commercial Negotiation', rfqCount: 3, daysOpen: 25 },
  { package: 'Polymer Disc Insulators 120kN', prValue: '₹4.5 Cr', status: 'PO Under Signoff', rfqCount: 2, daysOpen: 32 },
];

const POST_ORDER_TRACKING = [
  { poNo: 'PO-2026-088', vendor: 'Sterlite Power', item: 'ACSR Moose Conductor (320km)', readyDate: '2026-10-25', inspection: 'FAT Pending', status: 'On Schedule' },
  { poNo: 'PO-2026-092', vendor: 'L&T Heavy Fabricators', item: 'Lattice Towers Type 2D (450 MT)', readyDate: '2026-10-18', inspection: 'FAT Approved', status: 'In Transit' },
  { poNo: 'PO-2026-095', vendor: 'Apar Silvassa Unit', item: 'OPGW 24F Optical Fiber (48km)', readyDate: '2026-11-05', inspection: 'Factory Call Due', status: 'On Schedule' },
];

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'scurve' | 'procurement' | 'governance'>('overview');
  const [projects] = usePersistentState<Project[]>('epc_projects', []);
  const [issues] = usePersistentState<any[]>('epc_issues', []);

  const totalProjects = projects.length > 0 ? projects.length : 4;
  const totalValueCr = projects.length > 0
    ? projects.reduce((sum, p) => {
        const n = parseFloat(String(p.value || '').replace(/[^\d.]/g, '')) || 0;
        return sum + (String(p.value || '').includes('Cr') ? n : n / 100);
      }, 0)
    : 387.9;

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (Number(p.completion) || 0), 0) / projects.length)
    : 64;

  const aheadCount = projects.filter(p => p.health === 'green').length;
  const lagCount = projects.filter(p => p.health === 'amber' || p.health === 'red').length;
  const criticalIssuesCount = Array.isArray(issues) && issues.length > 0
    ? issues.filter(i => i.severity === 'Critical' || i.status === 'Open').length
    : 3;

  const displayProjects: PortfolioProject[] = projects.length > 0 ? projects.map(p => ({
    id: p.id,
    name: p.name,
    client: p.client,
    scheduleHealth: (p.health === 'red' ? 'red' : p.health === 'amber' ? 'amber' : 'green') as 'green' | 'amber' | 'red',
    costHealth: 'green',
    qualityHealth: 'green',
    safetyHealth: (p.health === 'red' ? 'amber' : 'green') as 'green' | 'amber' | 'red',
    progress: Number(p.completion) || 0,
    nextMilestone: `Stage ${String(p.stage || '').split(':')[0]} Execution`,
    daysRemaining: 14,
    outlook: (Number(p.completion) >= 50 ? 'improving' : 'stable') as 'improving' | 'stable' | 'deteriorating',
    value: p.value || '₹100 Cr'
  })) : PORTFOLIO_PROJECTS;

  const ragClass = (h: 'green' | 'amber' | 'red') =>
    h === 'green' ? 'bg-emerald-500' : h === 'amber' ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management Information System (PMIS)"
        subtitle="Multi-project portfolio oversight, S-Curves, pre/post procurement pipeline & governance"
      />

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active EPC Projects"
          value={`${totalProjects} Lines / Packages`}
          trend={`${aheadCount} on track, ${lagCount} monitored`}
          trendPositive={aheadCount >= lagCount}
          icon={<Activity className="text-indigo-600" />}
        />
        <StatsCard
          title="Total Contract Portfolio"
          value={`₹${totalValueCr.toFixed(1)} Cr`}
          trend="+₹42 Cr Active Scope"
          trendPositive={true}
          icon={<IndianRupee className="text-emerald-600" />}
        />
        <StatsCard
          title="Overall Progress"
          value={`${avgProgress}%`}
          trend={`Avg completion across ${totalProjects} projects`}
          trendPositive={avgProgress >= 50}
          icon={<TrendingUp className="text-blue-600" />}
        />
        <StatsCard
          title="Critical Active Issues"
          value={String(criticalIssuesCount)}
          trend="Immediate Attention"
          trendPositive={false}
          icon={<AlertTriangle className="text-rose-600" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Project Health Indicators
        </button>
        <button
          onClick={() => setActiveTab('scurve')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'scurve'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Portfolio S-Curve Progress
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'procurement'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Procurement Pipeline (Pre & Post Order)
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'governance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          MOM, Clearances & Issues Rollup
        </button>
      </div>

      {/* Tab 1: Project Health Grid */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayProjects.map((proj) => (
              <div 
                key={proj.id} 
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{proj.client}</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{proj.name}</h4>
                    <span className="text-xs text-slate-500">{proj.value} Contract Value</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {proj.outlook === 'improving' ? (
                      <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Improving
                      </span>
                    ) : proj.outlook === 'stable' ? (
                      <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        <Minus className="w-3.5 h-3.5" /> Stable
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Lagging
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 RAG Dimensions */}
                <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-100 text-center">
                  {[
                    { label: 'Schedule', val: proj.scheduleHealth },
                    { label: 'Cost', val: proj.costHealth },
                    { label: 'Quality', val: proj.qualityHealth },
                    { label: 'Safety', val: proj.safetyHealth },
                  ].map(d => (
                    <div key={d.label} className="p-1.5 bg-slate-50 rounded">
                      <span className="text-[10px] text-slate-500 block">{d.label}</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${ragClass(d.val)}`} />
                        <span className="capitalize text-xs font-bold text-slate-700">{d.val}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Physical Progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Next Milestone: <strong>{proj.nextMilestone}</strong></span>
                  <span className={proj.daysRemaining < 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                    {proj.daysRemaining < 0 ? `${Math.abs(proj.daysRemaining)}d Overdue` : `${proj.daysRemaining}d to target`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: S-Curve */}
      {activeTab === 'scurve' && (
        <div className="space-y-4">
          <SCurve
            data={PORTFOLIO_SCURVE}
            title="Consolidated Portfolio S-Curve (Planned vs Actual vs Forecast)"
            category="Turnkey EPC Division"
            todayLabel="Oct'26"
            height={360}
          />
        </div>
      )}

      {/* Tab 3: Procurement Pipeline */}
      {activeTab === 'procurement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              Pre-Order Packages (RFQ & Evaluation)
            </h4>
            <div className="space-y-2">
              {PRE_ORDER_PACKAGES.map(p => (
                <div key={p.package} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{p.package}</span>
                    <span className="text-indigo-600">{p.prValue}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Status: <strong className="text-slate-700">{p.status}</strong></span>
                    <span>{p.rfqCount} Bids Received · Open {p.daysOpen}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Post-Order Manufacturing & Dispatch Tracking
            </h4>
            <div className="space-y-2">
              {POST_ORDER_TRACKING.map(p => (
                <div key={p.poNo} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{p.item}</span>
                    <span className="text-emerald-700">{p.status}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{p.poNo} · {p.vendor}</span>
                    <span>Target: <strong>{p.readyDate}</strong> ({p.inspection})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Governance */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              MOM Action Items Rollup
            </h4>
            <p className="text-2xl font-bold text-slate-900">4 Open</p>
            <p className="text-xs text-amber-600 font-semibold">1 Action Overdue (Conductor PO)</p>
            <p className="text-[11px] text-slate-400">Total 5 meetings conducted across all active lines.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              Statutory Clearances
            </h4>
            <p className="text-2xl font-bold text-slate-900">5 Registered</p>
            <p className="text-xs text-emerald-600 font-semibold">Stage-2 Forest Clearance Granted</p>
            <p className="text-[11px] text-slate-400">CEIG inspection report submission pending.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Open Critical Issues
            </h4>
            <p className="text-2xl font-bold text-rose-600">3 Issues</p>
            <p className="text-xs text-slate-600">GWSSB water pipe route clash at Ch 2+450</p>
            <p className="text-[11px] text-slate-400">Assigned to Lead Design & Site Survey team.</p>
          </div>
        </div>
      )}
    </div>
  );
}
