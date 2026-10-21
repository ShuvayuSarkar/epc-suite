import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Plus, AlertCircle, CheckCircle2, Clock, TrendingDown, Pencil, Trash2, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, ReferenceLine
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────
interface WBSActivity {
  id: string;
  wbsCode: string;
  l2MilestoneCode?: string; // Contractual L2 Milestone (L2-01 to L2-10)
  segment: string;
  activity: string;
  category: string;
  contractualStart: string;
  contractualEnd: string;
  accStart: string;
  accEnd: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Complete';
  resourceLoading: number;
  responsibleTeam: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────
const INITIAL_WBS: WBSActivity[] = [
  {
    id: '1',
    wbsCode: '1.01',
    l2MilestoneCode: 'L2-01',
    segment: 'Turnkey Contract',
    activity: 'Letter of Award (LOA) & Contract Signing with MSETCL',
    category: 'Contracts',
    contractualStart: '2026-09-01',
    contractualEnd: '2026-09-05',
    accStart: '2026-09-01',
    accEnd: '2026-09-05',
    progress: 100,
    status: 'Complete',
    resourceLoading: 4,
    responsibleTeam: 'Contracts & Legal Team',
  },
  {
    id: '2',
    wbsCode: '1.02',
    l2MilestoneCode: 'L2-02',
    segment: 'Turnkey Contract',
    activity: 'Mother Order BOQ Feed (10 Items) & CPBG Submission',
    category: 'Procurement',
    contractualStart: '2026-09-06',
    contractualEnd: '2026-09-15',
    accStart: '2026-09-06',
    accEnd: '2026-09-12',
    progress: 100,
    status: 'Complete',
    resourceLoading: 6,
    responsibleTeam: 'Finance & Procurement',
  },
  {
    id: '3',
    wbsCode: '1.03',
    l2MilestoneCode: 'L2-03',
    segment: 'Manufacturing',
    activity: 'Advance Mfg Clearance: Conductor 100% (Apar) & HW 75%',
    category: 'Procurement',
    contractualStart: '2026-09-16',
    contractualEnd: '2026-09-30',
    accStart: '2026-09-14',
    accEnd: '2026-09-25',
    progress: 100,
    status: 'Complete',
    resourceLoading: 8,
    responsibleTeam: 'SCM & Plant Management',
  },
  {
    id: '4',
    wbsCode: '1.04',
    l2MilestoneCode: 'L2-04',
    segment: 'Seg 1 (0-15km)',
    activity: 'Detailed Route Walkover, Check Survey & Tower Spotting',
    category: 'Engineering',
    contractualStart: '2026-09-20',
    contractualEnd: '2026-10-15',
    accStart: '2026-09-18',
    accEnd: '2026-10-10',
    progress: 85,
    status: 'On Track',
    resourceLoading: 12,
    responsibleTeam: 'Survey & Engineering Team',
  },
  {
    id: '5',
    wbsCode: '1.05',
    l2MilestoneCode: 'L2-05',
    segment: 'Site Logistics',
    activity: 'Central Site Store & Yard Preparation (Inventory Controller)',
    category: 'Procurement',
    contractualStart: '2026-10-01',
    contractualEnd: '2026-10-25',
    accStart: '2026-09-28',
    accEnd: '2026-10-20',
    progress: 75,
    status: 'On Track',
    resourceLoading: 10,
    responsibleTeam: 'Inventory Controller & Stores',
  },
  {
    id: '6',
    wbsCode: '1.06',
    l2MilestoneCode: 'L2-06',
    segment: 'Statutory',
    activity: 'Statutory Track A: CEIG Contractor License Application',
    category: 'Electrical',
    contractualStart: '2026-10-05',
    contractualEnd: '2026-11-05',
    accStart: '2026-10-01',
    accEnd: '2026-10-30',
    progress: 60,
    status: 'On Track',
    resourceLoading: 4,
    responsibleTeam: 'Electrical Statutory Team',
  },
  {
    id: '7',
    wbsCode: '1.07',
    l2MilestoneCode: 'L2-07',
    segment: 'Statutory',
    activity: 'Statutory Track B: Client Form V & CLRA Labour License',
    category: 'Civil',
    contractualStart: '2026-10-08',
    contractualEnd: '2026-11-05',
    accStart: '2026-10-05',
    accEnd: '2026-11-02',
    progress: 40,
    status: 'At Risk',
    resourceLoading: 4,
    responsibleTeam: 'Labour Compliance Team',
  },
  {
    id: '8',
    wbsCode: '1.08',
    l2MilestoneCode: 'L2-08',
    segment: 'QA/QC & Utility',
    activity: 'Supplier Works Joint FAT & MSETCL DI Issuance',
    category: 'Electrical',
    contractualStart: '2026-10-15',
    contractualEnd: '2026-11-08',
    accStart: '2026-10-12',
    accEnd: '2026-11-02',
    progress: 50,
    status: 'On Track',
    resourceLoading: 6,
    responsibleTeam: 'Marketing & QA/QC',
  },
  {
    id: '9',
    wbsCode: '1.09',
    l2MilestoneCode: 'L2-09',
    segment: 'Seg 1 (0-15km)',
    activity: 'Civil Gang Mobilization, Batching Plant & Shuttering Setup',
    category: 'Civil',
    contractualStart: '2026-10-20',
    contractualEnd: '2026-11-12',
    accStart: '2026-10-18',
    accEnd: '2026-11-08',
    progress: 25,
    status: 'On Track',
    resourceLoading: 18,
    responsibleTeam: 'Civil Construction Gangs',
  },
  {
    id: '10',
    wbsCode: '1.10',
    l2MilestoneCode: 'L2-10',
    segment: 'Seg 1 (0-15km)',
    activity: '60-Day Ground Break: First Tower Foundation Kickoff (AP-01)',
    category: 'Civil',
    contractualStart: '2026-11-15',
    contractualEnd: '2026-11-20',
    accStart: '2026-11-10',
    accEnd: '2026-11-15',
    progress: 0,
    status: 'On Track',
    resourceLoading: 24,
    responsibleTeam: 'Civil Foundations Wing',
  },
];

const ganttMonths = ['Sep-26','Oct-26','Nov-26','Dec-26','Jan-27','Feb-27','Mar-27','Apr-27','May-27','Jun-27'];
const CAT_COLOR: Record<string,string> = { Civil:'#6366f1', Mechanical:'#0891b2', Electrical:'#7c3aed', 'Bay/Sub':'#d97706', OPGW:'#059669', Procurement:'#dc2626' };
const STATUS_V: Record<string,string> = { 'On Track':'success', 'At Risk':'warning', Delayed:'danger', Complete:'secondary' };

function monthsFrom(d: string, base='2026-09-01') {
  const diff = (new Date(d).getTime() - new Date(base).getTime()) / (1000*60*60*24*30.44);
  return Math.max(0, diff);
}

const progressData = [
  { month:'Sep-26', planned:8, actual:7 }, { month:'Oct-26', planned:18, actual:14 },
  { month:'Nov-26', planned:28, actual:25 }, { month:'Dec-26', planned:42, actual:38 },
  { month:'Jan-27', planned:55, actual:null }, { month:'Feb-27', planned:67, actual:null },
  { month:'Mar-27', planned:78, actual:null }, { month:'Apr-27', planned:88, actual:null },
  { month:'May-27', planned:95, actual:null }, { month:'Jun-27', planned:100, actual:null },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function WBSManager() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [activeTab, setActiveTab] = useState('baseline');
  const [filterSeg, setFilterSeg]   = useState('All');
  const [filterCat, setFilterCat]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [wbsData, setWbsData] = usePersistentState<WBSActivity[]>('epc_wbs', INITIAL_WBS);
  const [editRow, setEditRow] = useState<WBSActivity | null>(null);
  const [deleteRow, setDeleteRow] = useState<WBSActivity | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<WBSActivity>>({
    wbsCode: '',
    segment: 'Seg 1 (0-15km)',
    activity: '',
    category: 'Engineering',
    contractualStart: '2026-10-01',
    contractualEnd: '2026-12-31',
    accStart: '2026-09-15',
    accEnd: '2026-11-30',
    progress: 0,
    resourceLoading: 10,
    responsibleTeam: 'Engineering Design Team',
    status: 'On Track'
  });

  const handleAddActivity = () => {
    if (!newActivity.activity) return;
    const nextId = String(wbsData.length + 1);
    const code = newActivity.wbsCode || `1.${wbsData.length + 1}`;
    const created: WBSActivity = {
      id: nextId,
      wbsCode: code,
      segment: newActivity.segment || 'Seg 1 (0-15km)',
      activity: newActivity.activity,
      category: newActivity.category || 'Engineering',
      contractualStart: newActivity.contractualStart || '2026-10-01',
      contractualEnd: newActivity.contractualEnd || '2026-12-31',
      accStart: newActivity.accStart || '2026-09-15',
      accEnd: newActivity.accEnd || '2026-11-30',
      progress: Number(newActivity.progress) || 0,
      resourceLoading: Number(newActivity.resourceLoading) || 5,
      responsibleTeam: newActivity.responsibleTeam || 'Project Team',
      status: (newActivity.status as any) || 'On Track'
    };
    setWbsData([...wbsData, created]);
    setShowAddModal(false);
    setNewActivity({
      wbsCode: '',
      segment: 'Seg 1 (0-15km)',
      activity: '',
      category: 'Engineering',
      contractualStart: '2026-10-01',
      contractualEnd: '2026-12-31',
      accStart: '2026-09-15',
      accEnd: '2026-11-30',
      progress: 0,
      resourceLoading: 10,
      responsibleTeam: 'Engineering Design Team',
      status: 'On Track'
    });
  };

  const segments = [...new Set(wbsData.map(w=>w.segment))];
  const cats     = [...new Set(wbsData.map(w=>w.category))];

  const filtered = useMemo(() => wbsData.filter(w =>
    (filterSeg==='All'||w.segment===filterSeg) &&
    (filterCat==='All'||w.category===filterCat) &&
    (filterStatus==='All'||w.status===filterStatus)
  ), [wbsData, filterSeg,filterCat,filterStatus]);

  const onTrack = wbsData.filter(w=>w.status==='On Track').length;
  const atRisk  = wbsData.filter(w=>w.status==='At Risk').length;
  const delayed = wbsData.filter(w=>w.status==='Delayed').length;
  const totalRes= wbsData.reduce((s,w)=>s+w.resourceLoading,0);

  const handleDelete = (row: WBSActivity) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setWbsData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const tabs = [
    { id:'baseline', label:'L2 Dual Baseline' },
    { id:'gantt',    label:'Gantt View' },
    { id:'progress', label:'S-Curve Progress' },
    { id:'resource', label:'Resource Loading' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="WBS & L2 Master Schedule (BRD §3.1–3.2)"
        description="Contractual Baseline signed at Contract Award · Governed by committed Level 2 Master Schedule"
      />
      <ReadOnlyBanner moduleId="4.1" />

      {/* ── 60-Day Countdown to Ground Breaking Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-xl p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                Mission 60 Days
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                Signed L2 Contract Schedule Baseline
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Hit the Ground in 60 Days: First Tower Foundation Kickoff
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Contract Award (Day 0) → Mother Order Feed (Day 5) → Advance Mfg Clearance (Day 15) → Statutory Track A/B (Day 40) → Ground Break (Day 60).
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-5 py-3 rounded-xl backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">Day 42</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Elapsed</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">18 Days</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-right">
              <div className="text-xs text-indigo-300 font-semibold">Target Date</div>
              <div className="text-sm font-bold text-white">15-Nov-2026</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-indigo-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-indigo-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <strong>Mother Order Feed:</strong> Complete
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <strong>100% Conductor / 75% HW:</strong> Locked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <strong>Statutory Tracks (CEIG & Form V):</strong> Active
            </span>
          </div>
          <span className="text-amber-300 font-bold text-[11px]">
            70% of 60-Day Pre-Construction Window Consumed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'On Track', value:onTrack, color:'text-green-600 bg-green-50', icon:<CheckCircle2 size={18}/> },
          { label:'At Risk',  value:atRisk,  color:'text-amber-600 bg-amber-50', icon:<AlertCircle size={18}/> },
          { label:'Delayed',  value:delayed, color:'text-red-600 bg-red-50',     icon:<TrendingDown size={18}/> },
          { label:'Total Resources', value:totalRes+'p', color:'text-indigo-600 bg-indigo-50', icon:<Clock size={18}/> },
        ].map(k=>(
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {activeTab==='baseline' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { val:filterSeg, set:setFilterSeg, label:'All Segments', opts:segments },
              { val:filterCat, set:setFilterCat, label:'All Categories', opts:cats },
              { val:filterStatus, set:setFilterStatus, label:'All Statuses', opts:['On Track','At Risk','Delayed','Complete'] },
            ].map(f=>(
              <select key={f.label} value={f.val} onChange={e=>f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="ml-auto text-xs text-slate-400 self-center">{filtered.length}/{wbsData.length} activities</span>
            {canCreate && (
              <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-sm">
                <Plus size={14}/>Add Activity
              </Button>
            )}
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['L2 Code','WBS','Segment','Activity','Cat','Contractual Start','Contractual End','Acc. Start','Acc. End','Float (days)','Progress','Resources','Status', ...(canUpdate||canRemove?['Actions']:[])].map(h=>(
                      <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(w=>{
                    const cDays = Math.round((new Date(w.contractualEnd).getTime()-new Date(w.contractualStart).getTime())/86400000);
                    const aDays = Math.round((new Date(w.accEnd).getTime()-new Date(w.accStart).getTime())/86400000);
                    const float = cDays - aDays;
                    return (
                      <tr key={w.id} className={`hover:bg-slate-50 ${w.status==='Delayed'?'bg-red-50/30':w.status==='At Risk'?'bg-amber-50/20':''}`}>
                        <td className="px-3 py-3">
                          {w.l2MilestoneCode ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 font-mono">
                              {w.l2MilestoneCode}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{w.wbsCode}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 max-w-[110px] truncate" title={w.segment}>{w.segment}</td>
                        <td className="px-3 py-3 text-xs font-medium text-slate-800">{w.activity}</td>
                        <td className="px-3 py-3"><span style={{background:CAT_COLOR[w.category]+'22',color:CAT_COLOR[w.category]}} className="px-2 py-0.5 rounded text-[10px] font-semibold">{w.category}</span></td>
                        <td className="px-3 py-3 text-xs text-slate-500">{w.contractualStart}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{w.contractualEnd}</td>
                        <td className="px-3 py-3 text-xs text-indigo-600 font-medium">{w.accStart}</td>
                        <td className="px-3 py-3 text-xs text-indigo-600 font-medium">{w.accEnd}</td>
                        <td className={`px-3 py-3 text-xs font-bold ${float>0?'text-green-600':float<0?'text-red-600':'text-slate-500'}`}>{float>0?'+':''}{float}d</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${w.progress}%`}}/></div>
                            <span className="text-xs text-slate-600 w-8">{w.progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">{w.resourceLoading>0?w.resourceLoading+'p':'—'}</td>
                        <td className="px-3 py-3"><Badge variant={STATUS_V[w.status] as any}>{w.status}</Badge></td>
                        {(canUpdate || canRemove) && (
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {canUpdate && (
                                <button onClick={() => setEditRow(w)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                  <Pencil size={13} />
                                </button>
                              )}
                              {canRemove && (
                                <button onClick={() => handleDelete(w)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab==='gantt' && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gantt — Contractual (grey) vs Accelerated (indigo) baselines</h3>
          <div className="overflow-x-auto">
            <div style={{minWidth:'900px'}}>
              <div className="grid text-[10px] text-slate-400 font-semibold mb-2" style={{gridTemplateColumns:'200px repeat(10, 1fr)'}}>
                <div className="px-2">Activity</div>
                {ganttMonths.map(m=><div key={m} className="text-center">{m}</div>)}
              </div>
              {wbsData.map(w=>{
                const cLeft = monthsFrom(w.contractualStart);
                const cWidth = Math.max(0.3, monthsFrom(w.contractualEnd) - cLeft);
                const aLeft = monthsFrom(w.accStart);
                const aWidth = Math.max(0.3, monthsFrom(w.accEnd) - aLeft);
                return (
                  <div key={w.id} className="grid items-center mb-1.5" style={{gridTemplateColumns:'200px repeat(10, 1fr)'}}>
                    <div className="px-2 text-xs text-slate-600 truncate" title={`${w.wbsCode} ${w.activity}`}>{w.wbsCode} {w.activity}</div>
                    <div className="col-span-10 relative h-5">
                      <div className="absolute top-0.5 h-2 bg-slate-300 rounded opacity-60" style={{left:`${cLeft*10}%`,width:`${cWidth*10}%`}}/>
                      <div className="absolute bottom-0.5 h-2 rounded" style={{left:`${aLeft*10}%`,width:`${aWidth*10}%`,background:CAT_COLOR[w.category]}}/>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-4 h-2 bg-slate-300 rounded inline-block"/>Contractual</span>
                <span className="flex items-center gap-1"><span className="w-4 h-2 bg-indigo-500 rounded inline-block"/>Accelerated</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab==='progress' && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">S-Curve: Planned vs Actual Cumulative Progress (%)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={progressData} margin={{top:4,right:20,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
              <Tooltip formatter={(v:any)=>[`${v}%`]}/>
              <Legend/>
              <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4"/>
              <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="Planned %" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="actual"  stroke="#6366f1" name="Actual %"  strokeWidth={2} dot={{r:3}} connectNulls={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {activeTab==='resource' && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Resource Loading by Category (People)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cats.map(c=>({cat:c, loading:wbsData.filter(w=>w.category===c).reduce((s,w)=>s+w.resourceLoading,0)}))} margin={{top:4,right:8,left:-20,bottom:0}}>
              <XAxis dataKey="cat" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}} allowDecimals={false}/>
              <Tooltip/>
              <Bar dataKey="loading" name="People" radius={[4,4,0,0]}>
                {cats.map((c,i)=><React.Fragment key={c}><rect fill={CAT_COLOR[c]}/></React.Fragment>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {INITIAL_WBS.filter(w=>w.resourceLoading>0).map(w=>(
              <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                <span className="text-slate-600 truncate max-w-[120px]" title={w.activity}>{w.activity}</span>
                <span className="font-semibold text-slate-800 ml-2">{w.resourceLoading}p</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit WBS Activity Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit WBS Activity — {editRow.wbsCode}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">WBS Code</label>
                  <input value={editRow.wbsCode} readOnly className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Activity</label>
                  <input 
                    value={editRow.activity} 
                    onChange={e => setEditRow({ ...editRow, activity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Progress (%)</label>
                  <input 
                    type="number" 
                    value={editRow.progress} 
                    onChange={e => setEditRow({ ...editRow, progress: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select 
                    value={editRow.status} 
                    onChange={e => setEditRow({ ...editRow, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option>On Track</option>
                    <option>At Risk</option>
                    <option>Delayed</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Responsible Team</label>
                <input 
                  value={editRow.responsibleTeam} 
                  onChange={e => setEditRow({ ...editRow, responsibleTeam: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => {
                  setWbsData(prev => prev.map(w => w.id === editRow.id ? editRow : w));
                  setEditRow(null);
                }} 
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add WBS Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Add New WBS Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Activity Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tower Foundation Pit Excavation (Loc 45-60)"
                  value={newActivity.activity} 
                  onChange={e => setNewActivity({ ...newActivity, activity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">WBS Code (Auto if blank)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1.8"
                    value={newActivity.wbsCode} 
                    onChange={e => setNewActivity({ ...newActivity, wbsCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Segment</label>
                  <select 
                    value={newActivity.segment} 
                    onChange={e => setNewActivity({ ...newActivity, segment: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Seg 1 (0-15km)</option>
                    <option>Seg 2 (15-40km)</option>
                    <option>Seg 3 (40-75km)</option>
                    <option>Substation Bay</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={newActivity.category} 
                    onChange={e => setNewActivity({ ...newActivity, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Engineering</option>
                    <option>Procurement</option>
                    <option>Civil</option>
                    <option>Erection</option>
                    <option>Stringing</option>
                    <option>Commissioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Resource Loading (Persons)</label>
                  <input 
                    type="number" 
                    value={newActivity.resourceLoading} 
                    onChange={e => setNewActivity({ ...newActivity, resourceLoading: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contractual Finish</label>
                  <input 
                    type="date" 
                    value={newActivity.contractualEnd} 
                    onChange={e => setNewActivity({ ...newActivity, contractualEnd: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Responsible Team</label>
                  <input 
                    type="text" 
                    value={newActivity.responsibleTeam} 
                    onChange={e => setNewActivity({ ...newActivity, responsibleTeam: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddActivity} disabled={!newActivity.activity?.trim()} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add Activity</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.wbsCode ?? 'this record'}
        recordType="WBS Activity"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}