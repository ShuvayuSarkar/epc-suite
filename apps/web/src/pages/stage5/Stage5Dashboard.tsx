import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistLink, ChecklistCardWrapper } from '../../components/auth/StageGuard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import {
  CheckCircle2, AlertCircle, Clock, ArrowRight, Users, FileText, HardHat,
  MapPin, MessageSquare, CloudRain, TrendingUp, Shield, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, LineChart, Line, CartesianGrid, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// BRD 4.6 Stage 5 - Installation
// Benchmarks: gang productivity 1.5-2.0 (plain) / 1.0-1.5 (hilly) / 0.5-1.0 (forest) km/day
//             efficiency >=90% of L2; hotspot resolution 80% within 30d
//             RFI response <=3d (internal) / <=7d (client); weather logging 100%

interface CheckItem {
  id: string; ref: string; title: string; description: string;
  module: string; moduleId: string; route: string; sla: string;
  status: 'Complete' | 'In Progress' | 'At Risk' | 'Overdue' | 'Not Started';
  progress: number; keyMetric: string;
  icon: 'gang' | 'dpr' | 'jmc' | 'hotspot' | 'rfi' | 'weather';
}

const CHECKLIST: CheckItem[] = [
  {
    id:'5.1', ref:'BRD 5.1', title:'Gang Mobilization',
    description:'Gang composition with T&T (Tools & Tackles), PPE allocation, supervisor assignment, and skill certification for each member.',
    module:'Gangs', moduleId:'4.3', route:'/gangs', sla:'All gangs mobilized before field start',
    status:'In Progress', progress:80, keyMetric:'6 gangs active | 2 pending PPE',
    icon:'gang',
  },
  {
    id:'5.2', ref:'BRD 5.2', title:'Biometric Attendance',
    description:'Daily biometric attendance for all gang members with geofence validation. Attendance must be GPS-tagged to verify on-site presence.',
    module:'Gangs', moduleId:'4.3', route:'/gangs', sla:'100% biometric compliance',
    status:'At Risk', progress:65, keyMetric:'Avg 87% biometric | 1 gang below 70%',
    icon:'gang',
  },
  {
    id:'5.3', ref:'BRD 5.3', title:'Geofencing Validation',
    description:'GPS-based site boundary validation. Gangs must be within the defined geofence polygon during work hours. Out-of-bounds alerts trigger automatically.',
    module:'Gangs', moduleId:'4.3', route:'/gangs', sla:'Zero out-of-bounds during work hours',
    status:'At Risk', progress:70, keyMetric:'1 gang out-of-bounds | 5 compliant',
    icon:'gang',
  },
  {
    id:'5.4', ref:'BRD 5.4', title:'Skill Certification',
    description:'Each gang member must have valid skill certification for their assigned work type (stringing, erection, earthing, OPGW splicing).',
    module:'Gangs', moduleId:'4.3', route:'/gangs', sla:'100% certified before deployment',
    status:'In Progress', progress:85, keyMetric:'51/60 members certified',
    icon:'gang',
  },
  {
    id:'5.5', ref:'BRD 5.5', title:'Daily Progress Report (DPR)',
    description:'Mobile-entry DPR: km laid, manpower deployed, idle time logged, hotspot status, activity type (dismantling/stringing/earthing/erection/civil), GPS-tagged.',
    module:'DPR', moduleId:'4.1', route:'/installation/dpr', sla:'Submitted daily by 6 PM',
    status:'In Progress', progress:75, keyMetric:'28 DPRs this month | 2 missing',
    icon:'dpr',
  },
  {
    id:'5.6', ref:'BRD 5.6', title:'Gang Efficiency vs L2',
    description:'Productivity tracking: Plain 1.5-2.0 km/day, Hilly 1.0-1.5 km/day, Forest 0.5-1.0 km/day. Overall efficiency must be >=90% of L2 schedule.',
    module:'DPR', moduleId:'4.1', route:'/installation/dpr', sla:'Efficiency >=90% of L2',
    status:'In Progress', progress:72, keyMetric:'Current avg: 88% of L2',
    icon:'dpr',
  },
  {
    id:'5.7', ref:'BRD 5.7', title:'JMC - Line',
    description:'Joint Measurement Certificate for transmission line work: tower foundations, stringing spans, earthing. Separate from substation JMC.',
    module:'JMC', moduleId:'4.1', route:'/installation/jmc', sla:'JMC within 7 days of activity completion',
    status:'In Progress', progress:60, keyMetric:'18 approved | 5 pending | 1 disputed',
    icon:'jmc',
  },
  {
    id:'5.8', ref:'BRD 5.8', title:'JMC - Substation',
    description:'Joint Measurement Certificate for substation equipment erection: bay equipment, transformer, bus coupler. Client inspector sign-off required.',
    module:'JMC', moduleId:'4.1', route:'/installation/jmc', sla:'JMC within 7 days of activity completion',
    status:'In Progress', progress:55, keyMetric:'8 approved | 3 pending',
    icon:'jmc',
  },
  {
    id:'5.9', ref:'BRD 5.9', title:'Hotspot Risk Management',
    description:'Weekly sales-exec site visits to high-risk hotspots. Resolution tracking with 30-day target. ROW/Forest/Utility issues monitored.',
    module:'Hotspots', moduleId:'4.4', route:'/hotspots', sla:'80% resolution within 30 days',
    status:'At Risk', progress:55, keyMetric:'12 active hotspots | 4 > 30 days',
    icon:'hotspot',
  },
  {
    id:'5.10', ref:'BRD 5.10', title:'RFI Workflow',
    description:'Request for Information: Raise -> Route -> Respond -> Close. Internal response <=3 days, client response <=7 days. Client-visible via portal.',
    module:'RFI Register', moduleId:'4.21', route:'/rfis', sla:'Internal <=3d | Client <=7d',
    status:'In Progress', progress:68, keyMetric:'8 open | avg response 4.2 days',
    icon:'rfi',
  },
  {
    id:'5.11', ref:'BRD 5.11', title:'Weather Logging',
    description:'100% weather logging required for every DPR entry. Rain/storm days flagged for EOT (Extension of Time) claims and idle time justification.',
    module:'DPR', moduleId:'4.1', route:'/installation/dpr', sla:'100% weather logging',
    status:'In Progress', progress:90, keyMetric:'28/30 days logged | 2 missing',
    icon:'weather',
  },
];

const STATUS_V: Record<string, string> = {
  Complete:'success', 'In Progress':'primary', 'At Risk':'warning', Overdue:'danger', 'Not Started':'secondary'
};

const IconMap: Record<string, React.ReactNode> = {
  gang: <Users size={18} className="text-indigo-600"/>,
  dpr: <FileText size={18} className="text-indigo-600"/>,
  jmc: <HardHat size={18} className="text-indigo-600"/>,
  hotspot: <MapPin size={18} className="text-indigo-600"/>,
  rfi: <MessageSquare size={18} className="text-indigo-600"/>,
  weather: <CloudRain size={18} className="text-indigo-600"/>,
};

// Analytics data
const gangProductivity = [
  { gang:'Alpha', actual:1.8, benchmark:2.0, terrain:'Plain' },
  { gang:'Beta', actual:1.2, benchmark:1.5, terrain:'Hilly' },
  { gang:'Gamma', actual:0.7, benchmark:1.0, terrain:'Forest' },
  { gang:'Delta', actual:1.9, benchmark:2.0, terrain:'Plain' },
  { gang:'Epsilon', actual:1.3, benchmark:1.5, terrain:'Hilly' },
  { gang:'Zeta', actual:0.9, benchmark:1.0, terrain:'Forest' },
];

const weeklyProgress = [
  { week:'W1-Oct', planned:12, actual:11.2, efficiency:93 },
  { week:'W2-Oct', planned:14, actual:12.8, efficiency:91 },
  { week:'W3-Oct', planned:15, actual:13.5, efficiency:90 },
  { week:'W4-Oct', planned:16, actual:14.1, efficiency:88 },
  { week:'W1-Nov', planned:18, actual:null, efficiency:null },
];

const rfiAging = [
  { bucket:'0-3 days', count:3, color:'#22c55e' },
  { bucket:'4-7 days', count:4, color:'#f59e0b' },
  { bucket:'8-14 days', count:2, color:'#ef4444' },
  { bucket:'>14 days', count:1, color:'#991b1b' },
];

const activityBreakdown = [
  { name:'Stringing', value:35 },
  { name:'Foundation', value:20 },
  { name:'Erection', value:18 },
  { name:'Earthing', value:10 },
  { name:'Civil', value:12 },
  { name:'OPGW', value:5 },
];

const radarData = [
  { metric:'Gang Compliance', value:87 },
  { metric:'DPR Completion', value:93 },
  { metric:'JMC Approval', value:72 },
  { metric:'RFI Response', value:68 },
  { metric:'Hotspot Resolution', value:55 },
  { metric:'Weather Logging', value:93 },
];

const COLORS = ['#6366f1','#0891b2','#d97706','#059669','#7c3aed','#94a3b8'];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function Stage5Dashboard() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = usePersistentState<CheckItem[]>('epc_stage5_checklist', CHECKLIST);
  const [activeTab, setActiveTab] = useState('checklist');
  const [filter, setFilter] = useState('All');

  const filtered = checklist.filter(c => filter === 'All' || c.status === filter);
  const complete = checklist.filter(c => c.status === 'Complete').length;
  const atRisk = checklist.filter(c => c.status === 'At Risk').length;
  const overdue = checklist.filter(c => c.status === 'Overdue').length;
  const overallProgress = Math.round(checklist.reduce((s,c) => s + c.progress, 0) / checklist.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 5: Installation (BRD 4.6)"
        description="Gang mobilization | DPR logging | JMC certification | Hotspot management | RFI workflow"
      />

      {/* Progress Gate */}
      <div className={`rounded-xl p-5 border-2 ${overallProgress >= 75 ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {overallProgress >= 75 ? <CheckCircle2 size={28} className="text-green-600"/> : <Clock size={28} className="text-amber-600"/>}
            <div>
              <p className="font-bold text-slate-800 text-lg">Stage 5 Progress: {overallProgress}%</p>
              <p className="text-sm text-slate-500">{complete}/{CHECKLIST.length} milestones complete | {atRisk} at risk | {overdue} overdue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${overallProgress >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{width:`${overallProgress}%`}}/>
            </div>
            <Button className="flex items-center gap-2" onClick={() => navigate('/stage6')}>
              Advance to Stage 6 <ArrowRight size={14}/>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label:'Gangs Active', value:'6', color:'text-indigo-600 bg-indigo-50', icon:<Users size={18}/> },
          { label:'DPRs This Month', value:'28', color:'text-green-600 bg-green-50', icon:<FileText size={18}/> },
          { label:'JMCs Approved', value:'26', color:'text-emerald-600 bg-emerald-50', icon:<HardHat size={18}/> },
          { label:'Open RFIs', value:'8', color:'text-amber-600 bg-amber-50', icon:<MessageSquare size={18}/> },
          { label:'Avg Efficiency', value:'88%', color: 'text-orange-600 bg-orange-50', icon:<TrendingUp size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={[
        { id:'checklist', label:'Execution Checklist' },
        { id:'analytics', label:'Installation Analytics' },
        { id:'modulemap', label:'Module Map' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['All','Complete','In Progress','At Risk','Overdue','Not Started'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter===f ? 'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                {f} {f !== 'All' && `(${CHECKLIST.filter(c=>c.status===f).length})`}
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
          {/* Row 1: Gang Productivity + Weekly Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Gang Productivity vs BRD Benchmark (km/day)</h3>
              <p className="text-[10px] text-slate-400 mb-3">Plain: 1.5-2.0 | Hilly: 1.0-1.5 | Forest: 0.5-1.0</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gangProductivity} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="gang" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:11}} domain={[0,2.5]}/>
                  <Tooltip formatter={(v:any,n:any,p:any)=>[`${v} km/day (${p.payload.terrain})`]}/>
                  <Legend/>
                  <Bar dataKey="actual" name="Actual" radius={[4,4,0,0]}>
                    {gangProductivity.map((d,i) => <Cell key={i} fill={d.actual >= d.benchmark ? '#22c55e':'#ef4444'}/>)}
                  </Bar>
                  <Bar dataKey="benchmark" name="BRD Benchmark" fill="#e2e8f0" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Weekly Installation Progress (km)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyProgress} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="week" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:11}}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="planned" stroke="#94a3b8" name="L2 Planned" strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="actual" stroke="#6366f1" name="Actual" strokeWidth={2} dot={{r:4}} connectNulls={false}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Row 2: Activity Split + RFI Aging */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Activity Breakdown (% of Work)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={activityBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                    {activityBreakdown.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">RFI Aging Analysis (Open Items)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rfiAging} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="bucket" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/>
                  <Bar dataKey="count" name="Open RFIs" radius={[4,4,0,0]}>
                    {rfiAging.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                <span className="text-green-600">Internal SLA: {'<='}3 days</span>
                <span className="text-amber-600">Client SLA: {'<='}7 days</span>
              </div>
            </Card>
          </div>

          {/* Row 3: Radar + Efficiency Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Installation Health Radar (%)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0"/>
                  <PolarAngleAxis dataKey="metric" tick={{fontSize:9}}/>
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:9}}/>
                  <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3}/>
                </RadarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Overall L2 Efficiency Compliance</h3>
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={88 >= 90 ? '#22c55e':'#f59e0b'} strokeWidth="12"
                      strokeDasharray={`${2*Math.PI*52*0.88} ${2*Math.PI*52}`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${88>=90?'text-green-600':'text-amber-600'}`}>88%</span>
                    <span className="text-[10px] text-slate-500">of L2</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className={`text-sm font-bold ${88>=90?'text-green-600':'text-red-600'}`}>
                    {88>=90 ? 'Meeting BRD Benchmark' : 'Below BRD Benchmark (>=90%)'}
                  </p>
                  <p className="text-xs text-slate-500">Need +2% to reach 90% threshold</p>
                </div>
              </div>
            </Card>
          </div>

          {/* BRD Benchmarks Reference */}
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD 4.6 Stage 5 Benchmarks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Gang Productivity (Plain)','1.5-2.0 km/day'],
                ['Gang Productivity (Hilly)','1.0-1.5 km/day'],
                ['Gang Productivity (Forest)','0.5-1.0 km/day'],
                ['Overall Efficiency vs L2','>=90%'],
                ['Hotspot Resolution','80% within 30 days'],
                ['RFI Response (Internal)','<=3 days'],
                ['RFI Response (Client)','<=7 days'],
                ['Weather Logging','100%'],
              ].map(([k,v]) => (
                <div key={k} className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-0.5">{k}</p>
                  <p className="text-sm font-bold text-indigo-700">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'modulemap' && (
        <Card className="p-5 bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Stage 5 Feature to Core Module Map</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { module:'Gangs', moduleId:'4.3', route:'/gangs', color:'border-indigo-400 bg-indigo-50',
                features:['5.1 Gang mobilization (composition, T&T, PPE)','5.2 Biometric attendance (GPS-tagged)','5.3 Geofencing validation (polygon boundary)','5.4 Skill certification tracking'],
                icon:<Users size={20} className="text-indigo-600"/> },
              { module:'DPR (Daily Progress Report)', moduleId:'4.1', route:'/installation/dpr', color:'border-amber-400 bg-amber-50',
                features:['5.5 Mobile DPR entry (km laid, manpower, idle time)','5.6 Gang efficiency vs L2 schedule','5.11 Weather logging (100% required)','GPS-tagged with geofence validation'],
                icon:<FileText size={20} className="text-amber-600"/> },
              { module:'JMC (Joint Measurement)', moduleId:'4.1', route:'/installation/jmc', color:'border-green-400 bg-green-50',
                features:['5.7 Line JMC (foundations, stringing, earthing)','5.8 Substation JMC (bay equipment, transformer)','Client inspector sign-off required','Separate Line vs Substation billing basis'],
                icon:<HardHat size={20} className="text-green-600"/> },
              { module:'Hotspot Register', moduleId:'4.4', route:'/hotspots', color:'border-red-400 bg-red-50',
                features:['5.9 Weekly sales-exec site visits','ROW/Forest/Utility risk tracking','80% resolution within 30 days target','Escalation to PM if >30 days'],
                icon:<MapPin size={20} className="text-red-600"/> },
              { module:'RFI Register', moduleId:'4.21', route:'/rfis', color:'border-purple-400 bg-purple-50',
                features:['5.10 Raise -> Route -> Respond -> Close','Internal SLA: <=3 days','Client SLA: <=7 days','Client-visible via portal'],
                icon:<MessageSquare size={20} className="text-purple-600"/> },
            ].map(m => (
              <div key={m.module} className={`p-4 rounded-xl border-2 ${m.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  {m.icon}
                  <h4 className="font-semibold text-slate-800 text-sm">{m.module}</h4>
                </div>
                <ul className="space-y-1">
                  {m.features.map(f => (
                    <li key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">&#9656;</span>{f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-3 w-full text-xs flex items-center justify-center gap-1" onClick={() => navigate(m.route)}>
                  Open {m.module.split(' ')[0]} <ArrowRight size={12}/>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
