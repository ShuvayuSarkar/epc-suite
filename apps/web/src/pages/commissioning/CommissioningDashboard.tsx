import React, { useState, useMemo, useEffect } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import {
  CheckCircle2, AlertCircle, Clock, Plus, Zap, Radio, FileText,
  ShieldCheck, BookOpen, Award, Bell, Camera, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, Cell, PieChart, Pie, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

type PreCommStatus = 'Not Started' | 'In Progress' | 'Pass' | 'Fail' | 'Conditional Pass';
type TnCStatus = 'Pending' | 'In Progress' | 'Completed' | 'Client Approved';
type PunchSeverity = 'A' | 'B' | 'C';
type PunchStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

interface PreCommCheck {
  id: string; system: string; checkType: string; description: string;
  assignee: string; dueDate: string; completedDate: string;
  status: PreCommStatus; result: string;
}
interface TnCRecord {
  id: string; type: 'Line T&C' | 'Substation T&C' | 'OPGW/OFC Link T&C';
  project: string; segment: string; jmcDate: string;
  startDate: string; targetDate: string; completedDate: string;
  status: TnCStatus; chargingDone: boolean; trialRunDone: boolean;
  clientEngineer: string; daysFromJMC: number;
}
interface PunchItem {
  id: string; severity: PunchSeverity; description: string; location: string;
  gpsLat: number; gpsLng: number; raisedBy: string; raisedDate: string;
  assignedTo: string; dueDate: string; closedDate: string;
  status: PunchStatus; hasPhoto: boolean; project: string; system: string;
}

const MOCK_PRECHECKS: PreCommCheck[] = [
  { id:'PC-001', system:'Line', checkType:'Continuity', description:'Conductor continuity test all phases Seg-A', assignee:'R. Sharma', dueDate:'2026-12-01', completedDate:'2026-12-01', status:'Pass', result:'All phases OK, <0.01 ohm/km' },
  { id:'PC-002', system:'Line', checkType:'Sag/Tension', description:'Sag verification at critical spans >300m Seg-A', assignee:'R. Sharma', dueDate:'2026-12-02', completedDate:'2026-12-02', status:'Pass', result:'Within +/-5% of design sag' },
  { id:'PC-003', system:'Line', checkType:'Earthing', description:'Tower earthing resistance <10 ohm for all towers', assignee:'V. Patel', dueDate:'2026-12-03', completedDate:'2026-12-03', status:'Conditional Pass', result:'12 towers >10 ohm, additional earthing added' },
  { id:'PC-004', system:'Line', checkType:'IR Test', description:'Insulation resistance test all phases each section', assignee:'V. Patel', dueDate:'2026-12-04', completedDate:'', status:'In Progress', result:'' },
  { id:'PC-005', system:'Substation', checkType:'Relay Settings', description:'Protection relay settings per NTPC scheme all bays', assignee:'S. Singh', dueDate:'2026-12-05', completedDate:'', status:'Not Started', result:'' },
  { id:'PC-006', system:'Substation', checkType:'Interlock', description:'Interlock logic: CB/DS/ES sequence verification', assignee:'S. Singh', dueDate:'2026-12-06', completedDate:'', status:'Not Started', result:'' },
  { id:'PC-007', system:'Substation', checkType:'SCADA', description:'RTU/SCADA point check: 48 analog + 120 digital', assignee:'A. Kumar', dueDate:'2026-12-07', completedDate:'', status:'Not Started', result:'' },
  { id:'PC-008', system:'OPGW', checkType:'OTDR', description:'OTDR trace each fiber: attenuation <0.25 dB/km', assignee:'A. Kumar', dueDate:'2026-11-25', completedDate:'2026-11-25', status:'Pass', result:'All 48 fibers in spec, total loss 14.2 dB' },
  { id:'PC-009', system:'OPGW', checkType:'Splice Loss', description:'Splice loss per joint: <0.1 dB, total 42 splices', assignee:'A. Kumar', dueDate:'2026-11-26', completedDate:'2026-11-26', status:'Pass', result:'Max splice loss 0.08 dB avg 0.05 dB' },
  { id:'PC-010', system:'OPGW', checkType:'FOTE/SDH', description:'Fiber Optic Terminal Equipment & SDH commissioning', assignee:'Telecom Vendor', dueDate:'2026-12-10', completedDate:'', status:'Not Started', result:'' },
];

const MOCK_TNC: TnCRecord[] = [
  { id:'TNC-001', type:'Line T&C', project:'NTPC Lara 400kV', segment:'Seg-A (T1-T120)', jmcDate:'2026-11-20', startDate:'2026-12-01', targetDate:'2026-12-05', completedDate:'2026-12-05', status:'Completed', chargingDone:true, trialRunDone:true, clientEngineer:'Suresh Nair (NTPC)', daysFromJMC:15 },
  { id:'TNC-002', type:'Line T&C', project:'NTPC Lara 400kV', segment:'Seg-B (T121-T240)', jmcDate:'2026-11-28', startDate:'2026-12-08', targetDate:'2026-12-12', completedDate:'', status:'In Progress', chargingDone:false, trialRunDone:false, clientEngineer:'Suresh Nair (NTPC)', daysFromJMC:10 },
  { id:'TNC-003', type:'Substation T&C', project:'NTPC Lara 400kV', segment:'NTPC Lara 400/220kV SS', jmcDate:'2026-11-15', startDate:'2026-12-10', targetDate:'2026-12-14', completedDate:'', status:'Pending', chargingDone:false, trialRunDone:false, clientEngineer:'Ramesh Kumar (NTPC)', daysFromJMC:25 },
  { id:'TNC-004', type:'OPGW/OFC Link T&C', project:'NTPC Lara 400kV', segment:'Full Link 180 km', jmcDate:'2026-11-25', startDate:'2026-12-01', targetDate:'2026-12-03', completedDate:'2026-12-02', status:'Client Approved', chargingDone:false, trialRunDone:false, clientEngineer:'Telecom Cell (NTPC)', daysFromJMC:7 },
  { id:'TNC-005', type:'Line T&C', project:'IndiGrid Bhopal-Dhule', segment:'Full Line 290 km', jmcDate:'2026-12-05', startDate:'2026-12-15', targetDate:'2026-12-19', completedDate:'', status:'Pending', chargingDone:false, trialRunDone:false, clientEngineer:'Kiran Shah (IndiGrid)', daysFromJMC:10 },
];

const MOCK_PUNCH: PunchItem[] = [
  { id:'PL-001', severity:'A', description:'Exposed conductor at T-45 cross-arm', location:'Tower 45, Seg-A', gpsLat:21.1458, gpsLng:81.7602, raisedBy:'Client Inspector', raisedDate:'2026-12-03', assignedTo:'Civil Team', dueDate:'2026-12-05', closedDate:'2026-12-04', status:'Closed', hasPhoto:true, project:'NTPC Lara 400kV', system:'Line' },
  { id:'PL-002', severity:'A', description:'Missing earthing connection at T-67 footing', location:'Tower 67, Seg-A', gpsLat:21.1498, gpsLng:81.7689, raisedBy:'QA/QC Engineer', raisedDate:'2026-12-03', assignedTo:'Earthing Team', dueDate:'2026-12-06', closedDate:'', status:'In Progress', hasPhoto:true, project:'NTPC Lara 400kV', system:'Line' },
  { id:'PL-003', severity:'B', description:'Bay-2 CT secondary wiring polarity mismatch', location:'NTPC Lara SS, Bay-2', gpsLat:21.1520, gpsLng:81.7710, raisedBy:'Protection Engineer', raisedDate:'2026-12-05', assignedTo:'Electrical Team', dueDate:'2026-12-10', closedDate:'', status:'Open', hasPhoto:false, project:'NTPC Lara 400kV', system:'Substation' },
  { id:'PL-004', severity:'B', description:'OPGW splice closure not sealed at Span 45-46', location:'Span 45-46, Seg-A', gpsLat:21.1401, gpsLng:81.7555, raisedBy:'OPGW Inspector', raisedDate:'2026-12-04', assignedTo:'OPGW Team', dueDate:'2026-12-08', closedDate:'2026-12-07', status:'Closed', hasPhoto:true, project:'NTPC Lara 400kV', system:'OPGW' },
  { id:'PL-005', severity:'C', description:'Missing signage at SS entry gate', location:'NTPC Lara SS Entry', gpsLat:21.1515, gpsLng:81.7708, raisedBy:'Safety Officer', raisedDate:'2026-12-05', assignedTo:'Civil Team', dueDate:'2026-12-12', closedDate:'', status:'Open', hasPhoto:false, project:'NTPC Lara 400kV', system:'Substation' },
  { id:'PL-006', severity:'C', description:'Cable tray labeling incomplete in control room', location:'NTPC Lara SS, Control Room', gpsLat:21.1515, gpsLng:81.7709, raisedBy:'QA/QC Engineer', raisedDate:'2026-12-06', assignedTo:'Electrical Team', dueDate:'2026-12-15', closedDate:'', status:'Open', hasPhoto:false, project:'NTPC Lara 400kV', system:'Substation' },
  { id:'PL-007', severity:'B', description:'Foundation painting incomplete at 15 tower locations', location:'Seg-B Multiple Towers', gpsLat:21.1600, gpsLng:81.7800, raisedBy:'Client Inspector', raisedDate:'2026-12-07', assignedTo:'Civil Team', dueDate:'2026-12-14', closedDate:'', status:'Open', hasPhoto:true, project:'NTPC Lara 400kV', system:'Line' },
];

const STATUS_V: Record<string, string> = {
  'Not Started':'secondary','In Progress':'primary',Pass:'success',Fail:'danger','Conditional Pass':'warning',
  Pending:'secondary',Completed:'success','Client Approved':'success'
};
const SEV_V: Record<string, string> = { A:'danger', B:'warning', C:'secondary' };
const PUNCH_STATUS_V: Record<string, string> = { Open:'danger','In Progress':'warning',Resolved:'primary',Closed:'success' };

const punchTrend = [
  { week:'W1-Dec', raised:8, closed:3 },{ week:'W2-Dec', raised:5, closed:6 },
  { week:'W3-Dec', raised:3, closed:4 },{ week:'W4-Dec', raised:2, closed:null },
];
const systemHealth = [
  { system:'Line T&C', score:72 },{ system:'Substation T&C', score:45 },
  { system:'OPGW Link', score:95 },{ system:'Pre-Comm', score:60 },
  { system:'Punch List', score:43 },{ system:'Handover', score:20 },
];
const punchBySeverity = [
  { name:'Critical (A)', value:2, color:'#ef4444' },
  { name:'Major (B)', value:3, color:'#f59e0b' },
  { name:'Minor (C)', value:2, color:'#94a3b8' },
];
const DLP_PROJECTS = [
  { project:'Hypothetical Project Alpha', handoverDate:'2025-06-15', dlpEnd:'2026-06-15', alertDays:9, status:'DLP Expiring Soon' },
  { project:'Sample Legacy Project B', handoverDate:'2024-09-01', dlpEnd:'2025-09-01', alertDays:0, status:'DLP Expired' },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function CommissioningDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'precomm');

  const [prechecks, setPrechecks] = usePersistentState<PreCommCheck[]>('epc_commissioning_prechecks', MOCK_PRECHECKS);
  const [tncRecords, setTncRecords] = usePersistentState<TnCRecord[]>('epc_commissioning_tnc', MOCK_TNC);
  const [punchItems, setPunchItems] = usePersistentState<PunchItem[]>('epc_commissioning_punch', MOCK_PUNCH);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [filterSystem, setFilterSystem] = useState('All');
  const [showPunchForm, setShowPunchForm] = useState(false);

  const [newPunch, setNewPunch] = useState({
    description: '',
    location: '',
    severity: 'A' as PunchSeverity,
    system: 'Line',
    assignedTo: '',
    dueDate: ''
  });

  const handleAddPunchItem = () => {
    const id = `PL-${String(punchItems.length + 1).padStart(3, '0')}`;
    const created: PunchItem = {
      id,
      description: newPunch.description || 'Punch item defect',
      location: newPunch.location || 'Tower Location',
      severity: newPunch.severity || 'A',
      system: newPunch.system || 'Line',
      assignedTo: newPunch.assignedTo || 'Site Execution Team',
      dueDate: newPunch.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      raisedBy: 'QA/QC Engineer',
      raisedDate: new Date().toISOString().split('T')[0],
      closedDate: '',
      status: 'Open',
      hasPhoto: false,
      project: 'NTPC Lara 400kV',
      gpsLat: 21.1458,
      gpsLng: 81.7602
    };
    setPunchItems(prev => [created, ...prev]);
    setShowPunchForm(false);
    setNewPunch({ description: '', location: '', severity: 'A', system: 'Line', assignedTo: '', dueDate: '' });
  };

  const filteredChecks = useMemo(() =>
    prechecks.filter(c => filterSystem === 'All' || c.system === filterSystem),
    [prechecks, filterSystem]
  );

  const punchOpen = punchItems.filter(p => p.status !== 'Closed').length;
  const punchClosed = punchItems.filter(p => p.status === 'Closed').length;
  const punchClosurePct = punchItems.length > 0 ? Math.round((punchClosed / punchItems.length) * 100) : 100;
  const tncComplete = tncRecords.filter(t => ['Completed','Client Approved'].includes(t.status)).length;
  const precommPass = prechecks.filter(c => ['Pass','Conditional Pass'].includes(c.status)).length;

  const punchBySeverity = useMemo(() => [
    { name:'Critical (A)', value: punchItems.filter(p => p.severity==='A').length, color:'#ef4444' },
    { name:'Major (B)', value: punchItems.filter(p => p.severity==='B').length, color:'#f59e0b' },
    { name:'Minor (C)', value: punchItems.filter(p => p.severity==='C').length, color:'#94a3b8' },
  ], [punchItems]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testing, Commissioning & Handover (BRD 4.20)"
        description="Pre-commissioning | Line/Substation/OPGW T&C | Punch List | O&M Manual | Handover | DLP"
        actions={<Button onClick={() => setShowPunchForm(true)} className="flex items-center gap-2"><Plus size={14}/> Add Punch Item</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label:'Pre-Comm Passed', value:`${precommPass}/${prechecks.length}`, color:'text-green-600 bg-green-50', icon:<CheckCircle2 size={18}/> },
          { label:'T&C Complete', value:`${tncComplete}/${tncRecords.length}`, color:'text-indigo-600 bg-indigo-50', icon:<Zap size={18}/> },
          { label:'Punch Items Open', value:punchOpen, color:punchOpen>0?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<AlertCircle size={18}/> },
          { label:'Punch Closure %', value:`${punchClosurePct}%`, color:punchClosurePct>=90?'text-green-600 bg-green-50':'text-amber-600 bg-amber-50', icon:<ShieldCheck size={18}/> },
          { label:'DLP Active', value:'1', color:'text-amber-600 bg-amber-50', icon:<Bell size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {punchOpen > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0"/>
          <span><strong>{punchOpen} open punch items.</strong> BRD: 90% closure within 30 days, 100% by 60 days. Cat-A must clear before charging.</span>
        </div>
      )}

      <Tabs tabs={[
        { id:'precomm', label:'Pre-Commissioning' },
        { id:'tnc', label:'T&C Register' },
        { id:'punchlist', label:'Punch List' },
        { id:'handover', label:'Handover & DLP' },
        { id:'analytics', label:'Analytics' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'precomm' && (
        <div className="space-y-4">
          <Card className="p-4 bg-indigo-50 border border-indigo-200 text-xs text-indigo-800">
            <strong>Pre-Commissioning (BRD 6.1):</strong> Line: continuity/sag/earthing/IR | Substation: relay/interlock/SCADA | OPGW: OTDR/splice loss/FOTE/SDH — all must PASS before T&C.
          </Card>
          <div className="flex flex-wrap gap-2">
            {['All','Line','Substation','OPGW'].map(s => (
              <button key={s} onClick={() => setFilterSystem(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filterSystem===s?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                {s} {s!=='All' && `(${MOCK_PRECHECKS.filter(c=>c.system===s).length})`}
              </button>
            ))}
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Check ID','System','Type','Description','Assignee','Due','Completed','Status','Result'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecks.map(c => (
                  <tr key={c.id} className={`hover:bg-slate-50 ${c.status==='Fail'?'bg-red-50/30':c.status==='Conditional Pass'?'bg-amber-50/20':''}`}>
                    <td className="px-3 py-3 font-mono text-xs text-indigo-600">{c.id}</td>
                    <td className="px-3 py-3"><Badge variant={c.system==='Line'?'primary':c.system==='Substation'?'warning':'success' as any}>{c.system}</Badge></td>
                    <td className="px-3 py-3 text-xs font-semibold">{c.checkType}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 max-w-xs truncate">{c.description}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{c.assignee}</td>
                    <td className="px-3 py-3 text-xs">{c.dueDate}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{c.completedDate || '—'}</td>
                    <td className="px-3 py-3"><Badge variant={STATUS_V[c.status] as any}>{c.status}</Badge></td>
                    <td className="px-3 py-3 text-xs text-slate-600 max-w-[140px] truncate">{c.result || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'tnc' && (
        <div className="space-y-4">
          <Card className="p-4 bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong>BRD Benchmarks:</strong> Line T&C within <strong>15 days</strong> of Line JMC. Substation T&C within <strong>30 days</strong>. Each type is a separate milestone triggering separate billing.
          </Card>
          {tncRecords.map(t => {
            const slaBreached = (t.type==='Line T&C' && t.daysFromJMC>15 && !['Completed','Client Approved'].includes(t.status)) ||
                                (t.type==='Substation T&C' && t.daysFromJMC>30 && t.status!=='Completed');
            return (
              <Card key={t.id} className={`p-5 ${slaBreached?'border-red-300 bg-red-50/20':''}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">{t.id}</span>
                      <Badge variant={t.type==='Line T&C'?'primary':t.type==='Substation T&C'?'warning':'success' as any}>{t.type}</Badge>
                      <Badge variant={STATUS_V[t.status] as any}>{t.status}</Badge>
                      {slaBreached && <Badge variant="danger">SLA BREACHED</Badge>}
                    </div>
                    <h4 className="font-semibold text-slate-800">{t.project} — {t.segment}</h4>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      <span>JMC: <strong>{t.jmcDate}</strong></span>
                      <span>Start: <strong>{t.startDate||'TBD'}</strong></span>
                      <span>Target: <strong>{t.targetDate}</strong></span>
                      {t.completedDate && <span className="text-green-600">Done: <strong>{t.completedDate}</strong></span>}
                      <span className={slaBreached?'text-red-600 font-bold':''}>Days from JMC: {t.daysFromJMC}d</span>
                      <span>Client: {t.clientEngineer}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {[{label:'Charged',done:t.chargingDone},{label:'Trial Run',done:t.trialRunDone}].map(m => (
                      <div key={m.label} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${m.done?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}`}>
                        {m.done?<CheckCircle2 size={12}/>:<Clock size={12}/>} {m.label}: {m.done?'Done':'Pending'}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'punchlist' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(['A','B','C'] as PunchSeverity[]).map(s => {
              const items = punchItems.filter(p=>p.severity===s);
              const closed = items.filter(p=>p.status==='Closed').length;
              return (
                <Card key={s} className={`p-4 border-2 ${s==='A'?'border-red-400 bg-red-50':s==='B'?'border-amber-400 bg-amber-50':'border-slate-300 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Cat {s}</span>
                    <Badge variant={SEV_V[s] as any}>Severity {s}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">{s==='A'?'Critical — Safety/Functional':s==='B'?'Major — Quality':'Minor — Cosmetic'}</p>
                  <p className="text-2xl font-black">{items.length} <span className="text-sm text-slate-500">total</span></p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${s==='A'?'bg-red-500':s==='B'?'bg-amber-500':'bg-slate-500'}`} style={{width:`${items.length>0?(closed/items.length)*100:0}%`}}/>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{closed}/{items.length} closed</p>
                </Card>
              );
            })}
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['ID','Sev','Description','Location','Raised','Assigned To','Due','Status','Photo'].map(h=>(
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {punchItems.map(p => (
                  <tr key={p.id} className={`hover:bg-slate-50 ${p.severity==='A'&&p.status!=='Closed'?'bg-red-50/30':''}`}>
                    <td className="px-3 py-3 font-mono text-xs text-indigo-600">{p.id}</td>
                    <td className="px-3 py-3"><Badge variant={SEV_V[p.severity] as any}>Cat {p.severity}</Badge></td>
                    <td className="px-3 py-3 text-xs font-medium max-w-[160px] truncate">{p.description}</td>
                    <td className="px-3 py-3 text-xs text-slate-500 max-w-[100px] truncate">{p.location}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{p.raisedDate}</td>
                    <td className="px-3 py-3 text-xs">{p.assignedTo}</td>
                    <td className="px-3 py-3 text-xs">{p.dueDate}</td>
                    <td className="px-3 py-3"><Badge variant={PUNCH_STATUS_V[p.status] as any}>{p.status}</Badge></td>
                    <td className="px-3 py-3">{p.hasPhoto?<span className="flex items-center gap-1 text-xs text-indigo-600"><Camera size={12}/>Yes</span>:<span className="text-xs text-slate-400">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'handover' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl"><Award size={22} className="text-indigo-600"/></div>
                <div><h3 className="font-bold text-slate-800">Handover Certificate — NTPC Lara</h3>
                <p className="text-xs text-slate-500">Issued within 45 days of T&C completion</p></div>
              </div>
              {[
                { label:'Line T&C Complete', done:true, date:'2026-12-05' },
                { label:'Substation T&C Complete', done:false, date:'Pending' },
                { label:'OPGW Link T&C Complete', done:true, date:'2026-12-02' },
                { label:'All Cat-A Punch Items Cleared', done:false, date:'In Progress' },
                { label:'O&M Manual Submitted', done:false, date:'Pending' },
                { label:'Handover Certificate Issued', done:false, date:'—' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    {item.done?<CheckCircle2 size={15} className="text-green-600"/>:<Clock size={15} className="text-amber-500"/>}
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${item.done?'text-green-600':'text-amber-600'}`}>{item.date}</span>
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-xl"><BookOpen size={22} className="text-amber-600"/></div>
                <div><h3 className="font-bold text-slate-800">O&M Manual Assembly</h3>
                <p className="text-xs text-slate-500">Auto-assembled | BRD: within 30 days of handover</p></div>
              </div>
              {[
                { section:'As-Built Drawings', status:'Complete', docs:24 },
                { section:'Equipment Manuals (OEM)', status:'Complete', docs:18 },
                { section:'Test Reports & OTDR Traces', status:'In Progress', docs:12 },
                { section:'Commissioning Records', status:'In Progress', docs:8 },
                { section:'Spare Parts List', status:'Pending', docs:0 },
                { section:'Emergency Procedures', status:'Pending', docs:0 },
              ].map(s => (
                <div key={s.section} className="flex items-center justify-between p-2.5 mb-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-700">{s.section}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{s.docs} docs</span>
                    <Badge variant={s.status==='Complete'?'success':s.status==='In Progress'?'primary':'secondary' as any}>{s.status}</Badge>
                  </div>
                </div>
              ))}
            </Card>
          </div>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-xl"><Bell size={22} className="text-red-600"/></div>
              <div><h3 className="font-bold text-slate-800">Defect Liability Period (DLP) Tracker</h3>
              <p className="text-xs text-slate-500">Alerts at 30 / 60 / 90 days before DLP expiry</p></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Project','Handover Date','DLP End Date','Days Remaining','Status'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DLP_PROJECTS.map(d => (
                  <tr key={d.project} className={d.alertDays===0?'bg-red-50/30':d.alertDays<=30?'bg-amber-50/30':''}>
                    <td className="px-4 py-3 text-xs font-semibold">{d.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{d.handoverDate}</td>
                    <td className="px-4 py-3 text-xs font-medium">{d.dlpEnd}</td>
                    <td className="px-4 py-3 text-xs font-bold">{d.alertDays>0?`${d.alertDays} days`:'Expired'}</td>
                    <td className="px-4 py-3"><Badge variant={d.alertDays===0?'danger':d.alertDays<=30?'warning':'success' as any}>{d.status}</Badge></td>
                  </tr>
                ))}
                <tr className="bg-green-50/30">
                  <td className="px-4 py-3 text-xs font-semibold">NTPC Lara 400kV</td>
                  <td className="px-4 py-3 text-xs text-slate-400">Pending Handover</td>
                  <td className="px-4 py-3 text-xs text-slate-400">—</td>
                  <td className="px-4 py-3 text-xs text-slate-400">—</td>
                  <td className="px-4 py-3"><Badge variant="secondary">Awaiting T&C</Badge></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Punch List Trend (Weekly Raise vs Close)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={punchTrend} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="week" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="raised" stroke="#ef4444" name="Raised" strokeWidth={2}/>
                  <Line type="monotone" dataKey="closed" stroke="#22c55e" name="Closed" strokeWidth={2} connectNulls={false}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Punch Items by Severity</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={punchBySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                    {punchBySeverity.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Stage 6 Health by System (%)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={systemHealth} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0"/>
                  <PolarAngleAxis dataKey="system" tick={{fontSize:9}}/>
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:9}}/>
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3}/>
                </RadarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pre-Comm Check Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  {status:'Pass',count:3},{status:'Cond. Pass',count:1},
                  {status:'In Progress',count:1},{status:'Not Started',count:5},
                ]} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="status" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/>
                  <Bar dataKey="count" name="Checks" radius={[4,4,0,0]}>
                    {['#22c55e','#f59e0b','#6366f1','#94a3b8'].map((c,i)=><Cell key={i} fill={c}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD 4.20 Stage 6 Benchmarks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Line T&C','Within 15d of JMC'],['Substation T&C','Within 30d of JMC'],
                ['Punch List 90%','Within 30 days'],['Punch List 100%','Within 60 days'],
                ['O&M Manual','Within 30d of handover'],['Handover Cert','Within 45d of T&C'],
                ['DLP Alerts','30 / 60 / 90 days'],['Cat-A Items','Before charging'],
              ].map(([k,v])=>(
                <div key={k} className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-0.5">{k}</p>
                  <p className="text-sm font-bold text-indigo-700">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showPunchForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-semibold">Add Punch List Item</h3>
              <button onClick={()=>setShowPunchForm(false)} className="text-slate-400 text-xl font-bold">x</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input type="text" placeholder="Brief defect description" value={newPunch.description} onChange={e => setNewPunch(p => ({ ...p, description: e.target.value }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                <input type="text" placeholder="Tower / Bay / Area" value={newPunch.location} onChange={e => setNewPunch(p => ({ ...p, location: e.target.value }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Severity</label>
                <select value={newPunch.severity} onChange={e => setNewPunch(p => ({ ...p, severity: e.target.value as PunchSeverity }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none">
                  <option value="A">Cat A (Critical)</option>
                  <option value="B">Cat B (Major)</option>
                  <option value="C">Cat C (Minor)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">System</label>
                <select value={newPunch.system} onChange={e => setNewPunch(p => ({ ...p, system: e.target.value }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none">
                  <option value="Line">Line</option>
                  <option value="Substation">Substation</option>
                  <option value="OPGW">OPGW</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned To</label>
                <input type="text" placeholder="Team or person" value={newPunch.assignedTo} onChange={e => setNewPunch(p => ({ ...p, assignedTo: e.target.value }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={newPunch.dueDate} onChange={e => setNewPunch(p => ({ ...p, dueDate: e.target.value }))} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"/>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={()=>setShowPunchForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600">Cancel</button>
              <Button onClick={handleAddPunchItem}>Add Item</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
