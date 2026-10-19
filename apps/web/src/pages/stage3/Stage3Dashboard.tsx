import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistLink, ChecklistCardWrapper } from '../../components/auth/StageGuard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, AlertCircle, Clock, ArrowRight, FileText, ShoppingCart, Calendar, Layers, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface CheckItem {
  id: string; ref: string; title: string; description: string;
  module: string; moduleId: string; route: string; sla: string;
  status: 'Complete'|'In Progress'|'Overdue'|'Not Started';
  progress: number; keyMetric: string;
}

const CHECKLIST: CheckItem[] = [
  { id:'3.1', ref:'BRD 3.1', title:'L2 Schedule — Dual Baseline', moduleId:'4.1', module:'WBS / Baseline', description:'Weekly-granularity schedule with Contractual + Accelerated baselines per segment/site. Resource loading included.', route:'/wbs', sla:'≤15 days from award', status:'In Progress', progress:65, keyMetric:'10 activities · 2 delayed' },
  { id:'3.2', ref:'BRD 3.2', title:'Multi-Segment Schedule Roll-up', moduleId:'4.1', module:'WBS / Baseline', description:'Contract → Segment roll-up across procurement, manufacturing, installation, bay/substation, civil, OPGW timelines.', route:'/wbs', sla:'≤15 days from award', status:'In Progress', progress:60, keyMetric:'4 segments defined' },
  { id:'3.3', ref:'BRD 3.3', title:'Official PO Issuance', moduleId:'4.14', module:'Purchase Orders', description:'POs to plants & vendors. Per-category technical documents submitted with each PO.', route:'/procurement/purchase-orders', sla:'≤15 days from award', status:'In Progress', progress:40, keyMetric:'3 POs issued · 6 draft' },
  { id:'3.4', ref:'BRD 3.4', title:'Per-Category Document Submission', moduleId:'4.18', module:'Doc Control', description:'Drawing / GTP / MQP / ITP per category. All categories must have at least GTP + MQP submitted.', route:'/engineering-docs', sla:'GTP ≤15d · MQP/ITP ≤20d', status:'In Progress', progress:50, keyMetric:'7/12 docs submitted · 1 rejected' },
  { id:'3.5', ref:'BRD 3.5', title:'Named Deliverables', moduleId:'4.18', module:'Doc Control', description:'Drum Schedule, Sag-Tension Chart, Survey Report, Type Test, Drum Planning (Type D).', route:'/engineering-docs', sla:'≤20 days from award', status:'In Progress', progress:55, keyMetric:'5 deliverables · 2 pending' },
  { id:'3.6', ref:'BRD 3.6', title:'Survey / BOQ Client Approval', moduleId:'4.18', module:'Doc Control', description:'Client approval on Survey Report and BOQ is mandatory before foundation work commences.', route:'/engineering-docs', sla:'≤30 days from award', status:'Not Started', progress:20, keyMetric:'Survey submitted · BOQ pending' },
  { id:'3.7', ref:'BRD 3.7', title:'Inspection Scheduling', moduleId:'4.13', module:'Inspections', description:'Factory inspection call letters, TPIA agency coordination, FAT procedure approval. 25% readiness demo mandatory.', route:'/qa-qc/inspections', sla:'Call letter ≤30 days from award', status:'In Progress', progress:70, keyMetric:'8 inspections · 1 completed' },
];

const STATUS_V: Record<string,string> = { Complete:'success', 'In Progress':'primary', Overdue:'danger', 'Not Started':'secondary' };
const STATUS_COLOR: Record<string,string> = { Complete:'#22c55e', 'In Progress':'#6366f1', Overdue:'#ef4444', 'Not Started':'#94a3b8' };

const slaData = [
  { item:'L2 Schedule', elapsed:8, sla:15 }, { item:'GTP Submit', elapsed:12, sla:15 },
  { item:'MQP/ITP', elapsed:14, sla:20 }, { item:'Named Deliv.', elapsed:9, sla:20 },
  { item:'Survey/BOQ', elapsed:5, sla:30 }, { item:'Insp. Call', elapsed:22, sla:30 },
  { item:'CPG/CPBG', elapsed:3, sla:7 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function Stage3Dashboard() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage3_checklist', CHECKLIST);
  const [filter, setFilter] = useState('All');
  const filtered = checklist.filter(c => filter==='All' || c.status===filter);
  const complete = checklist.filter(c=>c.status==='Complete').length;
  const overdue  = checklist.filter(c=>c.status==='Overdue').length;
  const overallProgress = Math.round(checklist.reduce((s,c)=>s+c.progress,0)/checklist.length);
  const statusCounts = ['Complete','In Progress','Overdue','Not Started'].map(s=>({ name:s, value:checklist.filter(c=>c.status===s).length }));

  return (
    <div className="space-y-6">
      <PageHeader title="Stage 3: Post-Award Execution (BRD §4.4)" description="Within 15 days of award acceptance · 7 gaps tracked"/>
      <div className={`rounded-xl p-5 border-2 ${overallProgress>=75?'bg-green-50 border-green-400':'bg-amber-50 border-amber-400'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {overallProgress>=75 ? <CheckCircle2 size={28} className="text-green-600"/> : <Clock size={28} className="text-amber-600"/>}
            <div>
              <p className="font-bold text-slate-800 text-lg">Stage 3 Overall: {overallProgress}%</p>
              <p className="text-sm text-slate-500">{complete}/{CHECKLIST.length} milestones complete · {overdue} overdue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${overallProgress>=75?'bg-green-500':'bg-amber-500'}`} style={{width:`${overallProgress}%`}}/>
            </div>
            <Button className="flex items-center gap-2" onClick={() => navigate('/stage4')}>Advance to Stage 4 <ArrowRight size={14}/></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Complete', value:complete+'/'+CHECKLIST.length, color:'text-green-600 bg-green-50', icon:<CheckCircle2 size={18}/> },
          { label:'Overdue', value:overdue, color:overdue>0?'text-red-600 bg-red-50':'text-slate-700 bg-slate-100', icon:<AlertCircle size={18}/> },
          { label:'Overall Progress', value:overallProgress+'%', color:'text-indigo-600 bg-indigo-50', icon:<TrendingUp size={18}/> },
          { label:'SLA Alerts', value:slaData.filter(s=>s.elapsed>=s.sla*0.8).length, color:'text-amber-600 bg-amber-50', icon:<Clock size={18}/> },
        ].map(k=>(
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">SLA Elapsed vs Limit (Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={slaData} margin={{top:4,right:8,left:-20,bottom:40}}>
              <XAxis dataKey="item" tick={{fontSize:9}} angle={-30} textAnchor="end"/>
              <YAxis tick={{fontSize:11}}/><Tooltip/><Legend/>
              <Bar dataKey="elapsed" name="Elapsed" radius={[4,4,0,0]}>
                {slaData.map((d,i)=><Cell key={i} fill={d.elapsed>=d.sla?'#ef4444':d.elapsed>=d.sla*0.8?'#f59e0b':'#6366f1'}/>)}
              </Bar>
              <Bar dataKey="sla" name="SLA Limit" fill="#e2e8f0" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Distribution</h3>
          <div className="space-y-3">
            {statusCounts.map(s=>(
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24">{s.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{width:`${(s.value/CHECKLIST.length)*100}%`,background:STATUS_COLOR[s.name]}}/>
                </div>
                <span className="text-xs font-bold text-slate-700 w-4">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {['All','Complete','In Progress','Overdue','Not Started'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors ${filter===f?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{f}</button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700">Execution Checklist ({filtered.length})</h3>
        {filtered.map(item=>(
          <ChecklistCardWrapper key={item.id} route={item.route} moduleId={item.moduleId as any}><Card className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${item.status==='Complete'?'bg-green-50':item.status==='Overdue'?'bg-red-50':'bg-indigo-50'}`}>
                  {['3.1','3.2'].includes(item.id)? <Layers size={18} className="text-indigo-600"/>
                  :item.id==='3.3'? <ShoppingCart size={18} className="text-indigo-600"/>
                  :item.id==='3.7'? <Calendar size={18} className="text-indigo-600"/>
                  :<FileText size={18} className="text-indigo-600"/>}
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
                    <div className={`h-2 rounded-full ${item.progress>=80?'bg-green-500':item.progress>=50?'bg-indigo-500':'bg-amber-500'}`} style={{width:`${item.progress}%`}}/>
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

      <Card className="p-5 bg-slate-50 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD §4.4 Stage 3 Benchmarks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['L2 Schedule','≤15 days'],['Drawing/GTP','≤15 days'],['MQP/ITP','≤20 days'],['Survey/BOQ','≤30 days'],['Named Deliverables','≤20 days'],['Inspection Call','≤30 days'],['CPG/CPBG Renewal','≤7 days'],['PO Issuance','≤15 days']].map(([k,v])=>(
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
