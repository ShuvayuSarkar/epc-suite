import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistLink, ChecklistCardWrapper } from '../../components/auth/StageGuard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2, AlertCircle, Clock, ArrowRight,
  Package, Truck, Factory, Warehouse, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// BRD Ã‚Â§4.5 Stage 4 Ã¢â‚¬â€ Material Execution & Dispatch Dashboard
// PM checklist linking to core modules: Procurement, Inventory
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// BRD Benchmarks: Production Ã¢â€°Â¥95% of L2 | On-time dispatch Ã¢â€°Â¥98%
//                 JVR Ã¢â€°Â¤48h | Store setup Ã¢â€°Â¤15d from award

interface CheckItem {
  id: string; ref: string; title: string; description: string;
  module: string; moduleId: string; route: string; sla: string;
  status: 'Complete' | 'In Progress' | 'Overdue' | 'Not Started' | 'At Risk';
  progress: number; keyMetric: string;
  icon: 'production' | 'dispatch' | 'jvr' | 'store' | 'po';
}

const CHECKLIST: CheckItem[] = [
  {
    id: '4.1', ref: 'BRD 4.1', title: 'Production Tracking vs L2', moduleId: '4.14',
    description: 'Daily production tracking for all material categories vs. the dual-baseline L2 schedule. Must maintain â‰¥95% production efficiency.',
    module: 'PO Line Items', route: '/po-line-items', sla: 'â‰¥95% of L2 at all times',
    status: 'In Progress', progress: 72, keyMetric: 'Avg 89% vs L2 Â· 3 categories behind',
    icon: 'production',
  },
  {
    id: '4.2', ref: 'BRD 4.2', title: 'Drum-wise OPGW Production (Type D)', moduleId: '4.15',
    description: 'OPGW cable tracked drum-by-drum with unique serial numbers, OTDR test results, and splice progress.',
    module: 'Inventory (Drum Track)', route: '/inventory', sla: 'All drums OTDR tested before dispatch',
    status: 'In Progress', progress: 58, keyMetric: '12 drums Â· 4 dispatched Â· 3 tested',
    icon: 'production',
  },
  {
    id: '4.3', ref: 'BRD 4.3', title: 'Bay Structure Fabrication (Types B/C/E)', moduleId: '4.14',
    description: 'Bay equipment fabrication at vendor plant: Type B (Line Bay), Type C (Bus Coupler), Type E (Transformer Bay).',
    module: 'Inventory (Bay Fab)', route: '/inventory', sla: 'QC approval before dispatch',
    status: 'In Progress', progress: 45, keyMetric: '6 bays Â· 2 QC approved Â· 4 in fab',
    icon: 'production',
  },
  {
    id: '4.4', ref: 'BRD 4.4', title: 'Dispatch Planning', moduleId: '4.15',
    description: 'Mode of transport, transit insurance, vehicle assignment, and pre-dispatch checklist. ODC permits for over-dimensional cargo.',
    module: 'Dispatch Management', route: '/inventory/dispatch', sla: 'Plan 7 days before dispatch',
    status: 'In Progress', progress: 65, keyMetric: '8 dispatches planned Â· 2 ODC pending',
    icon: 'dispatch',
  },
  {
    id: '4.5', ref: 'BRD 4.5', title: 'Drum-wise Dispatch & ODC Permits', moduleId: '4.15',
    description: 'Dispatch register with drum-serial mapping, vehicle number, e-way bill, ODC permits for towers and heavy equipment.',
    module: 'Dispatch Management', route: '/inventory/dispatch', sla: 'On-time dispatch â‰¥98%',
    status: 'In Progress', progress: 75, keyMetric: 'On-time: 92% Â· 2 ODC approved Â· 1 pending',
    icon: 'dispatch',
  },
  {
    id: '4.6', ref: 'BRD 4.6', title: 'ODC Permits & E-Way Bills', moduleId: '4.15',
    description: 'Over-dimensional cargo permits from state PWD/NHAI. E-way bills generated within 24h of loading.',
    module: 'Dispatch Management', route: '/inventory/dispatch', sla: 'ODC permit before loading Â· E-way within 24h',
    status: 'At Risk', progress: 55, keyMetric: '1 ODC pending for Bay Equipment dispatch',
    icon: 'dispatch',
  },
  {
    id: '4.7', ref: 'BRD 4.7', title: 'Store Receipt + JVR Sign-off', moduleId: '4.15',
    description: 'Joint Verification Report with client store inspector on material arrival. Quantity, damage, drum condition, documentation check.',
    module: 'Inventory (JVR)', route: '/inventory', sla: 'JVR within 48 hours of receipt',
    status: 'In Progress', progress: 68, keyMetric: '8 GRNs Â· 1 JVR overdue Â· 2 discrepancies',
    icon: 'jvr',
  },
  {
    id: '4.8', ref: 'BRD 4.8', title: 'Store Setup Milestone', moduleId: '4.15',
    description: 'Store setup is a distinct milestone per segment â€” fencing, material shed, security, inventory management system.',
    module: 'Inventory (Stores)', route: '/inventory', sla: 'â‰¤15 days from award acceptance',
    status: 'Complete', progress: 100, keyMetric: '4 stores commissioned Â· all within SLA',
    icon: 'store',
  },
  {
    id: '4.9', ref: 'BRD 4.9', title: 'PO / Material Line-Item Master', moduleId: '4.14',
    description: 'Per-line tracking: PO No., Header, Sch Line, Material Code, three independent dates (Receipt, Ex-Works, Inspection).',
    module: 'PO Line Items', route: '/po-line-items', sla: 'Updated within 24h of each date event',
    status: 'In Progress', progress: 60, keyMetric: '15 line items Â· 5 fully dispatched',
    icon: 'po',
  },
];


const STATUS_V: Record<string, string> = {
  Complete: 'success', 'In Progress': 'primary', Overdue: 'danger', 'Not Started': 'secondary', 'At Risk': 'warning'
};
const STATUS_COLOR: Record<string, string> = {
  Complete: '#22c55e', 'In Progress': '#6366f1', Overdue: '#ef4444', 'Not Started': '#94a3b8', 'At Risk': '#f59e0b'
};

const slaData = [
  { item: 'Production %', actual: 89, benchmark: 95 },
  { item: 'On-time Dispatch', actual: 92, benchmark: 98 },
  { item: 'JVR Completion', actual: 87, benchmark: 100 },
  { item: 'Store Setup', actual: 100, benchmark: 100 },
];

const weeklyOutput = [
  { week: 'W1-Oct', planned: 120, actual: 108 },
  { week: 'W2-Oct', planned: 145, actual: 130 },
  { week: 'W3-Oct', planned: 160, actual: 155 },
  { week: 'W4-Oct', planned: 180, actual: null },
  { week: 'W1-Nov', planned: 200, actual: null },
];

const IconMap: Record<string, React.ReactNode> = {
  production: <Factory size={18} className="text-indigo-600"/>,
  dispatch: <Truck size={18} className="text-indigo-600"/>,
  jvr: <CheckCircle2 size={18} className="text-indigo-600"/>,
  store: <Warehouse size={18} className="text-indigo-600"/>,
  po: <Package size={18} className="text-indigo-600"/>,
};

import { usePersistentState } from '../../hooks/usePersistentState';

export default function Stage4Dashboard() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage4_checklist', CHECKLIST);
  const [filter, setFilter] = useState('All');

  const filtered = checklist.filter(c => filter === 'All' || c.status === filter);
  const complete = checklist.filter(c => c.status === 'Complete').length;
  const overdue = checklist.filter(c => c.status === 'Overdue').length;
  const atRisk = checklist.filter(c => c.status === 'At Risk').length;
  const overallProgress = Math.round(checklist.reduce((s, c) => s + c.progress, 0) / checklist.length);

  const statusCounts = ['Complete', 'In Progress', 'At Risk', 'Overdue', 'Not Started'].map(s => ({
    name: s, value: checklist.filter(c => c.status === s).length
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 4: Material Execution & Dispatch (BRD Ã‚Â§4.5)"
        description="Production tracking Ã‚Â· Dispatch planning Ã‚Â· JVR sign-off Ã‚Â· Store setup Ã‚Â· PO line-item master"
      />

      {/* Gate Banner */}
      <div className={`rounded-xl p-5 border-2 ${overallProgress >= 75 ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {overallProgress >= 75 ? <CheckCircle2 size={28} className="text-green-600"/> : <Clock size={28} className="text-amber-600"/>}
            <div>
              <p className="font-bold text-slate-800 text-lg">Stage 4 Progress: {overallProgress}%</p>
              <p className="text-sm text-slate-500">{complete}/{CHECKLIST.length} milestones complete Ã‚Â· {atRisk} at risk Ã‚Â· {overdue} overdue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${overallProgress >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${overallProgress}%`}}/>
            </div>
            <Button className="flex items-center gap-2" onClick={() => navigate('/stage5')}>
              Advance to Stage 5 <ArrowRight size={14}/>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'milestones complete', value: `${complete}/${CHECKLIST.length}`, color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={18}/> },
          { label: 'At Risk', value: atRisk, color: atRisk > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-100', icon: <AlertCircle size={18}/> },
          { label: 'Overall Progress', value: overallProgress + '%', color: 'text-indigo-600 bg-indigo-50', icon: <TrendingUp size={18}/> },
          { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100', icon: <Clock size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD Benchmarks: Actual vs Required (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={slaData} margin={{top:4,right:8,left:-20,bottom:30}}>
              <XAxis dataKey="item" tick={{fontSize:9}} angle={-20} textAnchor="end"/>
              <YAxis tick={{fontSize:11}} domain={[0,110]}/>
              <Tooltip/><Legend/>
              <Bar dataKey="actual" name="Actual %" radius={[4,4,0,0]}>
                {slaData.map((d,i) => <Cell key={i} fill={d.actual >= d.benchmark ? '#22c55e' : '#ef4444'}/>)}
              </Bar>
              <Bar dataKey="benchmark" name="BRD Benchmark %" fill="#e2e8f0" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Weekly Material Output (MT equiv.) Ã¢â‚¬â€ Planned vs Actual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyOutput} margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="week" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/><Legend/>
              <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="Planned" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="actual" stroke="#6366f1" name="Actual" strokeWidth={2} dot={{r:4}} connectNulls={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Execution Checklist filter */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Complete', 'In Progress', 'At Risk', 'Overdue', 'Not Started'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
            {f} {f !== 'All' && `(${CHECKLIST.filter(c=>c.status===f).length})`}
          </button>
        ))}
      </div>

      {/* Checklist Cards */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700">Execution Checklist Ã¢â‚¬â€ {filtered.length} item(s)</h3>
        {filtered.map(item => (
          <ChecklistCardWrapper key={item.id} route={item.route} moduleId={item.moduleId as any}><Card className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${item.status === 'Complete' ? 'bg-green-50' : item.status === 'Overdue' ? 'bg-red-50' : item.status === 'At Risk' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                  {IconMap[item.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.ref}</span>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                    <Badge variant={STATUS_V[item.status] as any}>{item.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span>Ã°Å¸â€œÂ¦ <strong>{item.module}</strong></span>
                    <span>Ã¢ÂÂ± SLA: <strong>{item.sla}</strong></span>
                    <span>Ã°Å¸â€œÅ  {item.keyMetric}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.progress >= 80 ? 'bg-green-500' : item.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{width: `${item.progress}%`}}/>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.progress}%</span>
                </div>
                <Button className="flex items-center gap-1 text-xs" onClick={() => navigate(item.route)}>
                  Open <ArrowRight size={12}/>
                </Button>
              </div>
            </div>
          </Card></ChecklistCardWrapper>
        ))}
      </div>

      {/* Module Map */}
      <Card className="p-5 bg-slate-50 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Stage 4 Ã¢â€ â€™ Core Module Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { module: 'PO Line Items', route: '/po-line-items', color: 'border-indigo-400 bg-indigo-50', features: ['4.1 Production tracking','4.9 PO/Material line-item master with 3 independent dates'], icon: <Package size={20} className="text-indigo-600"/> },
            { module: 'Dispatch Management', route: '/inventory/dispatch', color: 'border-amber-400 bg-amber-50', features: ['4.4 Dispatch planning & mode','4.5 Drum-wise dispatch + serial mapping','4.6 ODC permits & e-way bills'], icon: <Truck size={20} className="text-amber-600"/> },
            { module: 'Inventory (JVR + Stores)', route: '/inventory', color: 'border-green-400 bg-green-50', features: ['4.2 Drum-wise OPGW tracking','4.3 Bay fabrication (B/C/E)','4.7 JVR sign-off Ã¢â€°Â¤48h','4.8 Store setup milestone Ã¢â€°Â¤15d'], icon: <Warehouse size={20} className="text-green-600"/> },
          ].map(m => (
            <div key={m.module} className={`p-4 rounded-xl border-2 ${m.color}`}>
              <div className="flex items-center gap-2 mb-3">
                {m.icon}
                <h4 className="font-semibold text-slate-800 text-sm">{m.module}</h4>
              </div>
              <ul className="space-y-1">
                {m.features.map(g => (
                  <li key={g} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">Ã¢â€“Â¸</span>{g}
                  </li>
                ))}
              </ul>
              <Button className="mt-3 w-full text-xs flex items-center justify-center gap-1" onClick={() => navigate(m.route)}>
                Open {m.module} <ArrowRight size={12}/>
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* BRD Benchmarks */}
      <Card className="p-5 bg-slate-50 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD Ã‚Â§4.5 Stage 4 Benchmarks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Production vs L2', 'Ã¢â€°Â¥95% at all times'], ['On-time Dispatch', 'Ã¢â€°Â¥98%'],
            ['JVR Completion', 'Ã¢â€°Â¤48 hours of receipt'], ['Store Setup', 'Ã¢â€°Â¤15 days from award'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-[10px] text-slate-500 mb-0.5">{k}</p>
              <p className="text-sm font-bold text-indigo-700">{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
