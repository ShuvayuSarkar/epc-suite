import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistLink, ChecklistCardWrapper } from '../../components/auth/StageGuard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import {
  CheckCircle2, AlertCircle, Clock, ArrowRight,
  Zap, ShieldCheck, FileText, Award, Bell, BookOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell, Legend, PieChart, Pie
} from 'recharts';

// BRD 4.7 Stage 6 — Testing, Commissioning & Handover
// Benchmarks: Line T&C <=15d | Substation T&C <=30d
//             Punch list 90%/30d & 100%/60d | O&M <=30d | Handover <=45d

interface CheckItem {
  id: string; ref: string; title: string; description: string;
  module: string; moduleId: string; route: string; sla: string;
  status: 'Complete' | 'In Progress' | 'At Risk' | 'Overdue' | 'Not Started';
  progress: number; keyMetric: string;
  icon: 'precomm' | 'tnc' | 'punch' | 'handover' | 'dlp' | 'om';
}

const CHECKLIST: CheckItem[] = [
  { id:'6.1', ref:'BRD 6.1', title:'Pre-Commissioning Checks', moduleId:'4.20',
    description:'Line: continuity/sag/earthing/IR. Substation: relay settings/interlock logic/SCADA. OPGW: OTDR/splice loss/FOTE/SDH. All must PASS before T&C commences.',
    module:'Commissioning', route:'/commissioning?tab=precomm', sla:'All checks before T&C start',
    status:'In Progress', progress:60, keyMetric:'6/10 checks passed | 1 conditional | 3 not started',
    icon:'precomm' },
  { id:'6.2', ref:'BRD 6.2', title:'Line T&C', moduleId:'4.20',
    description:'Transmission line testing & commissioning. Charging and trial run included. Separate milestone from Substation T&C. Triggers supply billing.',
    module:'Commissioning', route:'/commissioning?tab=tnc', sla:'Within 15 days of Line JMC',
    status:'In Progress', progress:65, keyMetric:'Seg-A complete | Seg-B in progress | 15d from JMC',
    icon:'tnc' },
  { id:'6.3', ref:'BRD 6.3', title:'Substation T&C', moduleId:'4.20',
    description:'Bay equipment erection, relay coordination, interlock test, transformer charging, SCADA commissioning, trial run with client.',
    module:'Commissioning', route:'/commissioning?tab=tnc', sla:'Within 30 days of Substation JMC',
    status:'Not Started', progress:15, keyMetric:'Pending - pre-comm checks not yet complete',
    icon:'tnc' },
  { id:'6.4', ref:'BRD 6.4', title:'OPGW/OFC Link T&C', moduleId:'4.20',
    description:'OTDR end-to-end, FOTE commissioning, SDH/multiplexer setup, link budget verification, client handover of fiber pairs.',
    module:'Commissioning', route:'/commissioning?tab=tnc', sla:'Within 15 days of OPGW completion',
    status:'Complete', progress:100, keyMetric:'All 48 fibers commissioned | Client approved 2026-12-02',
    icon:'tnc' },
  { id:'6.5', ref:'BRD 6.5', title:'Digital Punch List', moduleId:'4.20',
    description:'GPS-tagged defects with severity A/B/C, photo evidence. Cat-A must be cleared before charging. 90% closure within 30 days, 100% within 60 days.',
    module:'Commissioning', route:'/commissioning?tab=punchlist', sla:'90%/30d & 100%/60d',
    status:'At Risk', progress:43, keyMetric:'5 open | 2 closed | 2 Cat-A still open',
    icon:'punch' },
  { id:'6.6', ref:'BRD 6.6', title:'O&M Manual Assembly', moduleId:'4.18',
    description:'Auto-assembled from: as-built drawings, OEM manuals, test reports, OTDR traces, commissioning records, spare parts list, emergency procedures.',
    module:'Engineering Docs', route:'/engineering-docs', sla:'Within 30 days of Handover',
    status:'In Progress', progress:55, keyMetric:'4/6 sections ready | spare parts & emergency pending',
    icon:'om' },
  { id:'6.7', ref:'BRD 6.7', title:'Handover Certificate', moduleId:'4.20',
    description:'Issued to client after all T&C complete, all Cat-A punch items cleared, O&M manual submitted. Triggers DLP start date.',
    module:'Commissioning', route:'/commissioning?tab=handover', sla:'Within 45 days of T&C completion',
    status:'Not Started', progress:10, keyMetric:'Blocked - Substation T&C & punch items pending',
    icon:'handover' },
  { id:'6.8', ref:'BRD 6.8', title:'DLP Tracker', moduleId:'4.20',
    description:'Defect Liability Period tracked per project. System generates automated alerts at 30, 60, 90 days before DLP expiry. DLP-linked billing tracked.',
    module:'Commissioning', route:'/commissioning', sla:'Alerts at 30/60/90 days',
    status:'At Risk', progress:50, keyMetric:'1 project DLP expiring in 9 days | 1 expired',
    icon:'dlp' },
];

const STATUS_V: Record<string, string> = {
  Complete:'success','In Progress':'primary','At Risk':'warning',Overdue:'danger','Not Started':'secondary'
};

const IconMap: Record<string, React.ReactNode> = {
  precomm:<ShieldCheck size={18} className="text-indigo-600"/>,
  tnc:<Zap size={18} className="text-indigo-600"/>,
  punch:<AlertCircle size={18} className="text-amber-600"/>,
  handover:<Award size={18} className="text-indigo-600"/>,
  om:<BookOpen size={18} className="text-indigo-600"/>,
  dlp:<Bell size={18} className="text-red-600"/>,
};

const weeklyProgress = [
  { week:'W1-Dec', precomm:30, tnc:10, punch:0 },
  { week:'W2-Dec', precomm:55, tnc:35, punch:20 },
  { week:'W3-Dec', precomm:60, tnc:60, punch:43 },
];
const tncStatusData = [
  { name:'Client Approved', value:1, color:'#22c55e' },
  { name:'Completed', value:1, color:'#6366f1' },
  { name:'In Progress', value:1, color:'#f59e0b' },
  { name:'Pending', value:2, color:'#94a3b8' },
];
const punchData = [
  { week:'W1', raised:8, closed:3 },{ week:'W2', raised:5, closed:6 },
  { week:'W3', raised:3, closed:4 },
];

const MODULE_MAP = [
  { module:'Commissioning & Handover', route:'/commissioning', color:'border-indigo-400 bg-indigo-50',
    icon:<Zap size={20} className="text-indigo-600"/>,
    features:[
      '6.1 Pre-comm checks (Line/Substation/OPGW)',
      '6.2 Line T&C (charging + trial run)',
      '6.3 Substation T&C (relay/interlock/SCADA)',
      '6.4 OPGW/OFC Link T&C (OTDR/FOTE/SDH)',
      '6.5 Digital punch list (Severity A/B/C + GPS + photo)',
      '6.6 O&M manual auto-assembly',
      '6.7 Handover certificate issuance',
      '6.8 DLP tracker (alerts 30/60/90 days)',
    ],
  },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function Stage6Dashboard() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage6_checklist', CHECKLIST);
  const [activeTab, setActiveTab] = useState('checklist');
  const [filter, setFilter] = useState('All');

  const filtered = checklist.filter(c => filter === 'All' || c.status === filter);
  const complete = checklist.filter(c => c.status === 'Complete').length;
  const atRisk = checklist.filter(c => c.status === 'At Risk').length;
  const overallProgress = Math.round(checklist.reduce((s,c) => s + c.progress, 0) / checklist.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 6: Testing, Commissioning & Handover (BRD 4.7)"
        description="Pre-comm checks | Line/Substation/OPGW T&C | Punch list | O&M manual | Handover | DLP"
      />

      {/* Progress Gate */}
      <div className={`rounded-xl p-5 border-2 ${overallProgress >= 80 ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {overallProgress >= 80 ? <CheckCircle2 size={28} className="text-green-600"/> : <Clock size={28} className="text-amber-600"/>}
            <div>
              <p className="font-bold text-slate-800 text-lg">Stage 6 Progress: {overallProgress}%</p>
              <p className="text-sm text-slate-500">{complete}/{CHECKLIST.length} milestones complete | {atRisk} at risk</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${overallProgress>=80?'bg-green-500':'bg-amber-500'}`} style={{width:`${overallProgress}%`}}/>
            </div>
            <Button className="flex items-center gap-2" onClick={() => navigate('/stage7')}>
              Advance to Stage 7 <ArrowRight size={14}/>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Pre-Comm Checks', value:'6/10', color:'text-indigo-600 bg-indigo-50', icon:<ShieldCheck size={18}/> },
          { label:'T&C Milestones Done', value:'2/5', color:'text-green-600 bg-green-50', icon:<Zap size={18}/> },
          { label:'Punch Items Open', value:'5', color:'text-red-600 bg-red-50', icon:<AlertCircle size={18}/> },
          { label:'DLP Alerts Active', value:'2', color:'text-amber-600 bg-amber-50', icon:<Bell size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={[
        { id:'checklist', label:'Execution Checklist' },
        { id:'analytics', label:'Analytics' },
        { id:'modulemap', label:'Module Map' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['All','Complete','In Progress','At Risk','Not Started'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter===f?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                {f} {f!=='All'&&`(${CHECKLIST.filter(c=>c.status===f).length})`}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map(item => (
              <ChecklistCardWrapper key={item.id} route={item.route} moduleId={item.moduleId as any}><Card className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${item.status==='Complete'?'bg-green-50':item.status==='At Risk'?'bg-amber-50':item.status==='Overdue'?'bg-red-50':'bg-indigo-50'}`}>
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
                        <span><strong>{item.module}</strong></span>
                        <span>SLA: <strong>{item.sla}</strong></span>
                        <span>{item.keyMetric}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.progress>=80?'bg-green-500':item.progress>=50?'bg-indigo-500':'bg-amber-500'}`} style={{width:`${item.progress}%`}}/>
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
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Stage 6 Weekly Progress (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyProgress} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="week" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}} domain={[0,100]}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="precomm" stroke="#6366f1" name="Pre-Comm" strokeWidth={2}/>
                  <Line type="monotone" dataKey="tnc" stroke="#22c55e" name="T&C" strokeWidth={2}/>
                  <Line type="monotone" dataKey="punch" stroke="#f59e0b" name="Punch Closure" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">T&C Milestone Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={tncStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({name,value})=>`${name} (${value})`}>
                    {tncStatusData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Punch List Weekly Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={punchData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="week" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/><Legend/>
                  <Bar dataKey="raised" name="Raised" fill="#ef4444" radius={[4,4,0,0]}/>
                  <Bar dataKey="closed" name="Closed" fill="#22c55e" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD Stage 6 Benchmarks</h3>
              <div className="space-y-2.5">
                {[
                  ['Line T&C','Within 15d of JMC',65,'bg-amber-500'],
                  ['Substation T&C','Within 30d of JMC',15,'bg-red-500'],
                  ['OPGW T&C','Within 15d of OPGW completion',100,'bg-green-500'],
                  ['Punch Closure 90%','Within 30 days',43,'bg-amber-500'],
                  ['O&M Manual','Within 30d of handover',55,'bg-indigo-500'],
                  ['Handover Cert','Within 45d of T&C',10,'bg-red-500'],
                ].map(([k,v,pct,color])=>(
                  <div key={k as string}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{k} — <span className="text-slate-400">{v}</span></span>
                      <span className="font-bold text-slate-700">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${color}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'modulemap' && (
        <div className="space-y-4">
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Stage 6 — All features live in one Core Module</h3>
            {MODULE_MAP.map(m => (
              <div key={m.module} className={`p-5 rounded-xl border-2 ${m.color}`}>
                <div className="flex items-center gap-2 mb-3">{m.icon}<h4 className="font-semibold text-slate-800">{m.module}</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-4">
                  {m.features.map(f => (
                    <div key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">&#9656;</span>{f}
                    </div>
                  ))}
                </div>
                <Button className="flex items-center gap-1 text-xs" onClick={() => navigate(m.route)}>
                  Open Commissioning Module <ArrowRight size={12}/>
                </Button>
              </div>
            ))}
          </Card>
          <Card className="p-5 bg-amber-50 border border-amber-300">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Stage 6 Sequencing Rules</h3>
            <div className="space-y-2 text-xs text-amber-800">
              {[
                'Pre-comm checks must ALL pass before any T&C can commence.',
                'Line T&C and Substation T&C are independent milestones — each triggers a separate billing event.',
                'OPGW/OFC Link T&C is a third independent milestone (especially critical for Type D OPGW projects).',
                'Cat-A punch items MUST be cleared before line charging is permitted.',
                'Handover certificate cannot be issued until ALL T&C milestones are complete AND O&M manual is submitted.',
                'DLP (Defect Liability Period) clock starts on the handover certificate date.',
              ].map((r,i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-bold shrink-0">{i+1}.</span><span>{r}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
