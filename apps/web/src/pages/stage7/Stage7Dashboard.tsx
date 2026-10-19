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
  DollarSign, FileText, TrendingDown, ShieldCheck, Award, Package
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';

// BRD 4.8 Stage 7 - Billing, Certification & Collections
// Supply Bill (80%) on JVR | Service Bill (20%) on JMC | AR aging | Retention 5%
// Benchmarks: cert <=15d | payment <=30d | overdue >60d <10% | mandatory spares <=30d

interface CheckItem {
  id: string; ref: string; title: string; description: string;
  module: string; moduleId: string; route: string; sla: string;
  status: 'Complete' | 'In Progress' | 'At Risk' | 'Overdue' | 'Not Started';
  progress: number; keyMetric: string;
  icon: 'billing' | 'cert' | 'ar' | 'retention' | 'closeout';
}

const CHECKLIST: CheckItem[] = [
  { id:'7.1', ref:'BRD 7.1', title:'Supply Bill (80%)',
    description:'Based on Joint Verification Report (JVR). Separate sub-bills for: main supply, Mandatory Spares, OPGW cable, Bay equipment. Submitted to client for certification.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Submit within 7 days of JVR', status:'In Progress',
    progress:75, keyMetric:'3/4 sub-bills submitted | Mandatory Spares in client query', icon:'billing' },
  { id:'7.2', ref:'BRD 7.2', title:'Supply Bill Certification',
    description:'Client Finance certifies the supply bill triggering payment. Separate certification letter for each sub-bill. BRD SLA: within 15 days of submission.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Within 15 days of submission', status:'In Progress',
    progress:60, keyMetric:'2/4 certified | Avg cert time: 11 days | 1 query pending', icon:'cert' },
  { id:'7.3', ref:'BRD 7.3', title:'Mandatory Spares Bill',
    description:'Separate sub-bill for Mandatory Spares. Requires completion certificate from client before billing. Tracked independently from main supply bill.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Bill within 30 days of delivery cert', status:'At Risk',
    progress:35, keyMetric:'Delivery cert not yet received from NTPC | 28 days elapsed', icon:'billing' },
  { id:'7.4', ref:'BRD 7.4', title:'Service Bill - Line T&C (20%)',
    description:'Based on Line JMC sign-off. Service portion = 20% of contract value. Line and Substation service bills are separate milestones with independent certification tracks.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Submit within 7 days of Line JMC', status:'In Progress',
    progress:70, keyMetric:'NTPC Line JMC done | Service bill submitted 2026-12-08 | Awaiting cert', icon:'billing' },
  { id:'7.5', ref:'BRD 7.5', title:'Service Bill - Substation T&C',
    description:'Based on Substation JMC. Separate from Line service bill. Type D projects additionally split OPGW installation billing from FOTE/SDH commissioning billing.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Submit within 7 days of Substation JMC', status:'Not Started',
    progress:10, keyMetric:'Blocked — Substation T&C not yet complete', icon:'billing' },
  { id:'7.6', ref:'BRD 7.6', title:'OPGW/FOTE/SDH Billing (Type D)',
    description:'Type D projects: OPGW installation billed separately from FOTE/SDH commissioning. Both have independent JMC milestones and separate certification letters.',
    module:'Billing', moduleId:'4.7', route:'/finance/bills', sla:'Based on respective JMC dates', status:'Complete',
    progress:100, keyMetric:'OPGW installation bill certified | FOTE/SDH bill certified 2026-12-15', icon:'billing' },
  { id:'7.7', ref:'BRD 7.7', title:'AR Aging Dashboard', moduleId:'4.2',
    description:'4 buckets (Unbilled/Billed/Due/Overdue) + 4 overdue tiers (0-30/30-60/60-90/90-120+). Automated escalation matrix: >30d Team | >60d CFO | >120d Legal.',
    module:'Collections', route:'/collections?tab=aging', sla:'Follow-up within 24h of overdue trigger', status:'At Risk',
    progress:50, keyMetric:'1 bill overdue 57 days (IndiGrid) | Overdue >60d = 57% of AR', icon:'ar' },
  { id:'7.8', ref:'BRD 7.8', title:'Collection Target Tracking', moduleId:'4.2',
    description:'Monthly collection targets tracked collector-wise, project-wise, client-wise. Collection efficiency target >= 95%. Mandatory Spares tracked as a separate collection line.',
    module:'Collections', route:'/collections?tab=analytics', sla:'Monthly review | Efficiency >=95%', status:'At Risk',
    progress:62, keyMetric:'Dec collection: 148L vs 300L target = 49% efficiency', icon:'ar' },
  { id:'7.9', ref:'BRD 7.9', title:'Automated Escalation Alerts', moduleId:'4.2',
    description:'System triggers: >30d overdue to Collection Team. >60d to PD. >90d to CFO. >120d Legal flag. Client-specific escalation paths defined in Client Master.',
    module:'Collections', route:'/collections?tab=aging', sla:'Alerts within 24h of threshold breach', status:'In Progress',
    progress:65, keyMetric:'2 alerts raised | IndiGrid escalated to CFO (57 days)', icon:'ar' },
  { id:'7.10', ref:'BRD 7.10', title:'Retention Release (5%)', moduleId:'4.2',
    description:'5% retention tracked per project. Release requires: (1) DLP expiry + (2) Mandatory Spares completion certificate. Both conditions must be simultaneously satisfied.',
    module:'Collections', route:'/collections?tab=retention', sla:'Release within 15d of conditions being met', status:'At Risk',
    progress:40, keyMetric:'1 project eligible | 1 DLP expiring | 1 Mandatory Spares cert pending', icon:'retention' },
  { id:'7.11', ref:'BRD 7.11', title:'Project Closeout', moduleId:'4.2',
    description:'Final bill submitted, retention released, completion certificate obtained, lessons learned documented. All AR cleared before closeout can be initiated.',
    module:'Collections', route:'/collections?tab=retention', sla:'Within 60 days of DLP end', status:'Not Started',
    progress:5, keyMetric:'No projects at closeout stage yet', icon:'closeout' },
];

const STATUS_V: Record<string, string> = {
  Complete:'success','In Progress':'primary','At Risk':'warning',Overdue:'danger','Not Started':'secondary'
};
const IconMap: Record<string, React.ReactNode> = {
  billing:<FileText size={18} className="text-indigo-600"/>,
  cert:<Award size={18} className="text-indigo-600"/>,
  ar:<TrendingDown size={18} className="text-red-600"/>,
  retention:<ShieldCheck size={18} className="text-amber-600"/>,
  closeout:<CheckCircle2 size={18} className="text-green-600"/>,
};

const arTrend = [
  { month:'Oct', billed:220, collected:215 },
  { month:'Nov', billed:140, collected:214 },
  { month:'Dec', billed:180, collected:148 },
];
const arPie = [
  { name:'Billed (on track)', value:95, color:'#6366f1' },
  { name:'Overdue 0-30', value:74, color:'#eab308' },
  { name:'Overdue 30-60', value:114, color:'#f97316' },
];
const billProgress = [
  { type:'Supply Bills', submitted:3, certified:2, paid:1 },
  { type:'Service Bills', submitted:1, certified:0, paid:0 },
  { type:'OPGW/FOTE', submitted:2, certified:2, paid:0 },
  { type:'Mandatory Spares', submitted:1, certified:0, paid:0 },
];

const MODULE_MAP = [
  { module:'Billing & Certification (BRD 4.7)', route:'/finance/bills',
    color:'border-indigo-400 bg-indigo-50', icon:<FileText size={20} className="text-indigo-600"/>,
    features:[
      '7.1 Supply Bill (80%) — based on JVR',
      '7.2 Supply Bill Certification (<=15d SLA)',
      '7.3 Mandatory Spares sub-bill (<=30d)',
      '7.4 Service Bill - Line T&C (based on Line JMC)',
      '7.5 Service Bill - Substation T&C',
      '7.6 OPGW Installation bill (Type D)',
      '7.6 FOTE/SDH Commissioning bill (Type D)',
    ],
  },
  { module:'Collections Management (BRD 4.2)', route:'/collections',
    color:'border-emerald-400 bg-emerald-50', icon:<DollarSign size={20} className="text-emerald-600"/>,
    features:[
      '7.7 AR Aging: Unbilled/Billed/Due/Overdue 0-30/30-60/60-90/90-120+',
      '7.8 Collection target tracking (collector/project/client-wise)',
      '7.9 Automated escalation: >30d Team | >60d CFO | >120d Legal',
      '7.10 Retention Release tracking (5% after DLP + Mandatory Spares cert)',
      '7.11 Project Closeout (final bill + retention + lessons learned)',
    ],
  },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function Stage7Dashboard() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage7_checklist', CHECKLIST);
  const [activeTab, setActiveTab] = useState('checklist');
  const [filter, setFilter] = useState('All');

  const filtered = checklist.filter(c => filter === 'All' || c.status === filter);
  const complete = checklist.filter(c => c.status === 'Complete').length;
  const atRisk = checklist.filter(c => c.status === 'At Risk').length;
  const overallProgress = Math.round(checklist.reduce((s,c) => s + c.progress, 0) / checklist.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 7: Billing, Certification & Collections (BRD 4.8)"
        description="Supply Bill (JVR) | Service Bill (JMC) | AR Aging | Escalation Matrix | Retention Release | Closeout"
      />

      <div className={`rounded-xl p-5 border-2 ${overallProgress >= 80 ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {overallProgress >= 80 ? <CheckCircle2 size={28} className="text-green-600"/> : <Clock size={28} className="text-amber-600"/>}
            <div>
              <p className="font-bold text-slate-800 text-lg">Stage 7 Progress: {overallProgress}%</p>
              <p className="text-sm text-slate-500">{complete}/{CHECKLIST.length} milestones complete | {atRisk} at risk</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${overallProgress>=80?'bg-green-500':'bg-amber-500'}`} style={{width:`${overallProgress}%`}}/>
            </div>
            <div className="text-xs text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-lg">
              Project closes when all AR cleared + retention released
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Bills Submitted', value:'8', color:'text-indigo-600 bg-indigo-50', icon:<FileText size={18}/> },
          { label:'Bills Certified', value:'4', color:'text-green-600 bg-green-50', icon:<Award size={18}/> },
          { label:'AR Outstanding', value:'25.3Cr', color:'text-amber-600 bg-amber-50', icon:<DollarSign size={18}/> },
          { label:'Overdue >30d', value:'1 case (57d)', color:'text-red-600 bg-red-50', icon:<AlertCircle size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-lg font-bold text-slate-800">{k.value}</p></div>
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
                        <Badge variant={item.module==='Collections'?'success':item.module==='Both'?'secondary':'primary' as any} className="text-[10px]">{item.module}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                        <span>SLA: <strong>{item.sla}</strong></span>
                        <span className={item.status==='At Risk'?'text-amber-600 font-semibold':''}>{item.keyMetric}</span>
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
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Bill Submission vs Collection (Lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={arTrend} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/>
                  <Tooltip/><Legend/>
                  <Bar dataKey="billed" name="Billed" fill="#6366f1" radius={[3,3,0,0]}/>
                  <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">AR by Aging Bucket (Lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={arPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({name,value})=>`${value}L`}>
                    {arPie.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>`${'\u20B9'}${v}L`}/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Billing Pipeline by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={billProgress} layout="vertical" margin={{top:4,right:8,left:60,bottom:0}}>
                  <XAxis type="number" tick={{fontSize:10}} allowDecimals={false}/>
                  <YAxis type="category" dataKey="type" tick={{fontSize:10}}/>
                  <Tooltip/><Legend/>
                  <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[0,3,3,0]}/>
                  <Bar dataKey="certified" name="Certified" fill="#22c55e" radius={[0,3,3,0]}/>
                  <Bar dataKey="paid" name="Payment Received" fill="#10b981" radius={[0,3,3,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD Stage 7 Benchmarks</h3>
              <div className="space-y-2.5">
                {[
                  ['Supply Bill Certification','<=15 days', 73, 'bg-indigo-500'],
                  ['Payment Receipt','<=30 days of cert', 65, 'bg-amber-500'],
                  ['Overdue >60d vs AR','Target <10%', 30, 'bg-red-500'],
                  ['Collection Efficiency','>=95%', 62, 'bg-amber-500'],
                  ['Mandatory Spares Bill','<=30 days', 35, 'bg-red-500'],
                  ['Billing Accuracy','100%', 100, 'bg-green-500'],
                ].map(([k,v,pct,color])=>(
                  <div key={k as string}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{k} <span className="text-slate-400">— {v}</span></span>
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
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Stage 7 spans 2 Core Modules</h3>
            <div className="space-y-4">
              {MODULE_MAP.map(m => (
                <div key={m.module} className={`p-5 rounded-xl border-2 ${m.color}`}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">{m.icon}<h4 className="font-semibold text-slate-800">{m.module}</h4></div>
                    <Button className="flex items-center gap-1 text-xs" onClick={() => navigate(m.route)}>
                      Open Module <ArrowRight size={12}/>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {m.features.map(f => (
                      <div key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">&#9656;</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5 bg-amber-50 border border-amber-300">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Stage 7 Critical Dependencies</h3>
            <div className="space-y-2 text-xs text-amber-800">
              {[
                'Supply Bill can only be raised AFTER JVR is signed. JVR is generated from the Inventory module (Stage 4).',
                'Service Bill can only be raised AFTER the respective JMC is signed. JMC is from the Installation module (Stage 5).',
                'Mandatory Spares billing requires a separate delivery completion certificate from the client.',
                'Type D projects must split OPGW installation billing from FOTE/SDH commissioning — separate cert letters required.',
                'Retention Release (5%) requires BOTH DLP expiry AND Mandatory Spares completion certificate simultaneously.',
                'Project Closeout cannot be initiated until ALL AR buckets are cleared and retention is released.',
              ].map((r, i) => (
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
