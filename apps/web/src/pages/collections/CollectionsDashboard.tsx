import React, { useState, useMemo, useEffect } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { AlertCircle, TrendingUp, TrendingDown, Clock, DollarSign, ShieldCheck, Bell, ArrowRight, FileText, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';

// BRD Module 4.2 â€” Collections Management
// AR Aging: Unbilled / Billed / Due / Overdue 0-30 / 30-60 / 60-90 / 90-120+
// Alerts: >30d Collection Team | >60d CFO | >120d Legal flag

type ARBucket = 'Unbilled' | 'Billed' | 'Due' | 'Overdue 0-30' | 'Overdue 30-60' | 'Overdue 60-90' | 'Overdue 90-120+';
type CollStatus = 'On Track' | 'Follow-up Sent' | 'Escalated to PD' | 'Escalated to CFO' | 'Legal Flag' | 'Collected';
type RetentionStatus = 'Held' | 'DLP Active' | 'Release Requested' | 'Released';

interface ARRecord {
  id: string; project: string; client: string; billNo: string;
  billType: string; netAmt: number; billedDate: string;
  dueDate: string; receivedDate: string; daysOverdue: number;
  bucket: ARBucket; status: CollStatus; collectionOwner: string;
  lastFollowUp: string; remarks: string;
}
interface RetentionRecord {
  id: string; project: string; client: string;
  contractValue: number; retentionPct: number; retentionAmt: number;
  heldSince: string; dlpEnd: string; mandatorySparesCert: boolean;
  status: RetentionStatus;
}

const MOCK_AR: ARRecord[] = [
  { id:'AR-001', project:'NTPC Lara 400kV', client:'NTPC', billNo:'BL-001', billType:'Supply Bill',
    netAmt:21460000, billedDate:'2026-10-20', dueDate:'2026-11-19', receivedDate:'2026-11-28',
    daysOverdue:0, bucket:'Due', status:'Collected', collectionOwner:'Rajesh Gupta', lastFollowUp:'2026-11-20', remarks:'Received with 9 day delay' },
  { id:'AR-002', project:'NTPC Lara 400kV', client:'NTPC', billNo:'BL-002', billType:'Service Bill - Line',
    netAmt:5568000, billedDate:'2026-12-08', dueDate:'2027-01-07', receivedDate:'',
    daysOverdue:0, bucket:'Billed', status:'On Track', collectionOwner:'Rajesh Gupta', lastFollowUp:'2026-12-22', remarks:'Within payment terms' },
  { id:'AR-003', project:'NTPC Lara 400kV', client:'NTPC', billNo:'BL-003', billType:'Mandatory Spares',
    netAmt:1392000, billedDate:'2026-11-25', dueDate:'2026-12-24', receivedDate:'',
    daysOverdue:0, bucket:'Billed', status:'Follow-up Sent', collectionOwner:'Rajesh Gupta', lastFollowUp:'2026-12-23', remarks:'Client query on spares delivery cert' },
  { id:'AR-004', project:'IndiGrid Bhopal-Dhule', client:'IndiGrid', billNo:'BL-005', billType:'Supply Bill',
    netAmt:11368000, billedDate:'2026-10-05', dueDate:'2026-11-04', receivedDate:'',
    daysOverdue:57, bucket:'Overdue 30-60', status:'Escalated to CFO', collectionOwner:'Priya Mehta', lastFollowUp:'2026-12-20', remarks:'Client citing budget constraints; escalated to CFO' },
  { id:'AR-005', project:'MSETCL Pune Ring', client:'MSETCL', billNo:'BL-007', billType:'Supply Bill',
    netAmt:7424000, billedDate:'2026-11-15', dueDate:'2026-12-14', receivedDate:'',
    daysOverdue:15, bucket:'Overdue 0-30', status:'Follow-up Sent', collectionOwner:'Amit Shah', lastFollowUp:'2026-12-20', remarks:'Awaiting client finance approval' },
  { id:'AR-006', project:'NTPC Lara 400kV', client:'NTPC', billNo:'BL-004', billType:'OPGW Installation',
    netAmt:2552000, billedDate:'2026-11-28', dueDate:'2026-12-27', receivedDate:'',
    daysOverdue:0, bucket:'Billed', status:'On Track', collectionOwner:'Rajesh Gupta', lastFollowUp:'2026-12-10', remarks:'' },
];

const MOCK_RETENTION: RetentionRecord[] = [];

const STATUS_V: Record<string, string> = {
  'On Track':'success', 'Follow-up Sent':'primary', 'Escalated to PD':'warning',
  'Escalated to CFO':'danger', 'Legal Flag':'danger', Collected:'secondary'
};
const RET_V: Record<string, string> = { Held:'secondary', 'DLP Active':'primary', 'Release Requested':'warning', Released:'success' };
const BUCKET_COLOR: Record<string, string> = {
  Unbilled:'bg-slate-400', Billed:'bg-blue-400', Due:'bg-indigo-400',
  'Overdue 0-30':'bg-yellow-400', 'Overdue 30-60':'bg-orange-400',
  'Overdue 60-90':'bg-red-400', 'Overdue 90-120+':'bg-red-700'
};
const fmt = (n: number) => n >= 10000000 ? `\u20B9${(n/10000000).toFixed(2)}Cr` : `\u20B9${(n/100000).toFixed(1)}L`;

const collectionMonthly = [
  { month:'Oct', target:250, actual:215 },{ month:'Nov', target:180, actual:214 },
  { month:'Dec', target:300, actual:148 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function CollectionsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'aging');
  const [retentions, setRetentions] = usePersistentState<RetentionRecord[]>('epc_retentions', MOCK_RETENTION);
  const [arRecords, setArRecords] = usePersistentState<ARRecord[]>('epc_ar_records', MOCK_AR);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [filterBucket, setFilterBucket] = useState('All');
  const [filterClient, setFilterClient] = useState('All');

  const clients = useMemo(() => ['All', ...new Set(arRecords.map(r => r.client))], [arRecords]);
  const buckets = ['All','Billed','Due','Overdue 0-30','Overdue 30-60','Overdue 60-90','Overdue 90-120+'];

  const filtered = useMemo(() => arRecords.filter(r =>
    (filterBucket==='All'||r.bucket===filterBucket) &&
    (filterClient==='All'||r.client===filterClient) &&
    r.status !== 'Collected'
  ), [arRecords, filterBucket, filterClient]);

  const arSummary = useMemo(() => [
    { bucket:'Unbilled', amount:0, color:'#94a3b8' },
    { bucket:'Billed', amount:arRecords.filter(r=>r.bucket==='Billed').reduce((s,r)=>s+r.netAmt,0), color:'#6366f1' },
    { bucket:'Due', amount:arRecords.filter(r=>r.bucket==='Due').reduce((s,r)=>s+r.netAmt,0), color:'#3b82f6' },
    { bucket:'Overdue 0-30', amount:arRecords.filter(r=>r.bucket==='Overdue 0-30').reduce((s,r)=>s+r.netAmt,0), color:'#eab308' },
    { bucket:'Overdue 30-60', amount:arRecords.filter(r=>r.bucket==='Overdue 30-60').reduce((s,r)=>s+r.netAmt,0), color:'#f97316' },
    { bucket:'Overdue 60-90', amount:arRecords.filter(r=>r.bucket==='Overdue 60-90').reduce((s,r)=>s+r.netAmt,0), color:'#ef4444' },
    { bucket:'Overdue 90+', amount:arRecords.filter(r=>r.bucket==='Overdue 90-120+').reduce((s,r)=>s+r.netAmt,0), color:'#dc2626' },
  ], [arRecords]);

  const clientAR = useMemo(() => {
    const map = new Map<string, number>();
    arRecords.forEach(r => {
      if (r.status !== 'Collected') {
        map.set(r.client, (map.get(r.client) || 0) + r.netAmt);
      }
    });
    return Array.from(map.entries()).map(([client, amt]) => ({
      client,
      outstanding: Math.round(amt / 100000)
    }));
  }, [arRecords]);

  const totalOutstanding = arRecords.filter(r=>r.status!=='Collected').reduce((s,r)=>s+r.netAmt,0);
  const totalOverdue60 = arRecords.filter(r=>['Overdue 60-90','Overdue 90-120+'].includes(r.bucket)).reduce((s,r)=>s+r.netAmt,0);
  const overdueGt60Pct = totalOutstanding > 0 ? Math.round((totalOverdue60/totalOutstanding)*100) : 0;
  const escalatedCount = arRecords.filter(r=>['Escalated to CFO','Escalated to PD','Legal Flag'].includes(r.status)).length;
  const totalRetention = retentions.filter(r=>r.status!=='Released').reduce((s,r)=>s+r.retentionAmt,0);

  return (
    <div className="space-y-6">
      {/* Header with Title and Invoices action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader
          title="AR Aging & Collections (BRD 4.2)"
          description="Unbilled / Billed / Due / Overdue 0-30 / 30-60 / 60-90 / 90-120+ | Retention | Escalation"
        />
        <Button 
          onClick={() => navigate('/collections/invoices')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <FileText size={16} /> View Client Invoices Register <ArrowRight size={15}/>
        </Button>
      </div>

      {/* Sub-Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { label: 'AR Aging & Collections', href: '/collections', icon: <DollarSign size={14} /> },
          { label: 'Client Invoices Register', href: '/collections/invoices', icon: <FileText size={14} /> },
        ].map(item => (
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label:'Total Outstanding', value:fmt(totalOutstanding), color:'text-indigo-600 bg-indigo-50', icon:<DollarSign size={18}/> },
          { label:'Overdue >60 Days', value:fmt(totalOverdue60), color:overdueGt60Pct>10?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<AlertCircle size={18}/> },
          { label:'Overdue >60 % of AR', value:`${overdueGt60Pct}%`, color:overdueGt60Pct>10?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<TrendingDown size={18}/> },
          { label:'Escalated Cases', value:escalatedCount, color:escalatedCount>0?'text-amber-600 bg-amber-50':'text-green-600 bg-green-50', icon:<Bell size={18}/> },
          { label:'Retention Held', value:fmt(totalRetention), color:'text-amber-600 bg-amber-50', icon:<ShieldCheck size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {overdueGt60Pct > 10 && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-sm text-red-800 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-600 shrink-0"/>
          <span><strong>BRD Alert: Overdue {'>'}60 days is {overdueGt60Pct}% of AR (target: below 10%).</strong> Escalate IndiGrid project to CFO immediately.</span>
        </div>
      )}

      <Tabs tabs={[
        { id:'aging', label:'AR Aging Register' },
        { id:'retention', label:'Retention & Closeout' },
        { id:'analytics', label:'Analytics' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'aging' && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {arSummary.map(s => (
              <div key={s.bucket} className="p-3 rounded-xl border border-slate-200 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${BUCKET_COLOR[s.bucket]||'bg-slate-400'}`}/>
                <p className="text-[10px] text-slate-500 leading-tight">{s.bucket}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{s.amount>0?fmt(s.amount):'Nil'}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {buckets.map(b => (
              <button key={b} onClick={() => setFilterBucket(b)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filterBucket===b?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                {b}
              </button>
            ))}
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['AR ID','Project','Client','Bill No','Type','Net Amt','Billed','Due Date','Days Overdue','Bucket','Status','Owner'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50 ${r.daysOverdue>60?'bg-red-50/30':r.daysOverdue>30?'bg-amber-50/20':r.daysOverdue>0?'bg-yellow-50/20':''}`}>
                    <td className="px-3 py-3 font-mono text-xs text-indigo-600">{r.id}</td>
                    <td className="px-3 py-3 text-xs font-medium max-w-[110px] truncate">{r.project}</td>
                    <td className="px-3 py-3 text-xs">{r.client}</td>
                    <td className="px-3 py-3 text-xs font-mono text-slate-500">{r.billNo}</td>
                    <td className="px-3 py-3 text-xs text-slate-500 max-w-[100px] truncate">{r.billType}</td>
                    <td className="px-3 py-3 text-xs font-bold">{fmt(r.netAmt)}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{r.billedDate}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{r.dueDate}</td>
                    <td className={`px-3 py-3 text-xs font-bold ${r.daysOverdue>60?'text-red-600':r.daysOverdue>0?'text-amber-600':'text-slate-400'}`}>
                      {r.daysOverdue>0?`${r.daysOverdue}d`:'â€”'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white ${BUCKET_COLOR[r.bucket]||'bg-slate-400'}`}>{r.bucket}</span>
                    </td>
                    <td className="px-3 py-3"><Badge variant={STATUS_V[r.status] as any}>{r.status}</Badge></td>
                    <td className="px-3 py-3 text-xs text-slate-500">{r.collectionOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>BRD Escalation Matrix:</strong> &nbsp;
            Overdue &gt;30d â†’ Collection Team follow-up within 24h. &nbsp;
            Overdue &gt;60d â†’ CFO alert. &nbsp;
            Overdue &gt;90d â†’ CFO review. &nbsp;
            Overdue &gt;120d â†’ Legal flag.
          </Card>
        </div>
      )}

      {activeTab === 'retention' && (
        <div className="space-y-4">
          <Card className="p-4 bg-indigo-50 border border-indigo-200 text-xs text-indigo-800">
            <strong>BRD 7.10 Retention Release (5% of Contract Value):</strong> Released after DLP expiry AND Mandatory Spares completion certificate received. Both conditions must be met simultaneously.
          </Card>
          <div className="space-y-3">
            {retentions.map(r => (
              <Card key={r.id} className={`p-5 ${r.status==='Release Requested'?'border-amber-300 bg-amber-50/30':r.status==='Released'?'border-green-300 bg-green-50/30':''}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span>
                      <h4 className="font-semibold text-slate-800">{r.project}</h4>
                      <Badge variant={RET_V[r.status] as any}>{r.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div><p className="text-slate-400">Client</p><p className="font-semibold">{r.client}</p></div>
                      <div><p className="text-slate-400">Contract Value</p><p className="font-semibold">{fmt(r.contractValue)}</p></div>
                      <div><p className="text-slate-400">Retention ({r.retentionPct}%)</p><p className="font-bold text-amber-700">{fmt(r.retentionAmt)}</p></div>
                      <div><p className="text-slate-400">DLP End</p><p className="font-semibold">{r.dlpEnd}</p></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${r.mandatorySparesCert?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                      {r.mandatorySparesCert?<ShieldCheck size={12}/>:<AlertCircle size={12}/>}
                      Mandatory Spares Cert: {r.mandatorySparesCert?'Received':'Pending'}
                    </div>
                    {r.status === 'Release Requested' && (
                      <Button
                        onClick={() => {
                          setRetentions(prev => prev.map(item => item.id === r.id ? { ...item, status: 'Released' } : item));
                          alert(`Retention release approved for ${r.project} (${fmt(r.retentionAmt)})`);
                        }}
                        className="text-xs"
                      >
                        Approve Release
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">AR Aging by Bucket (Rupees Lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={arSummary.filter(s=>s.amount>0)} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="bucket" tick={{fontSize:9}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip formatter={(v:number)=>`${'\u20B9'}${(v/100000).toFixed(1)}L`}/>
                  <Bar dataKey="amount" name="Amount" radius={[4,4,0,0]}>
                    {arSummary.filter(s=>s.amount>0).map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Collection Target vs Actual (Lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={collectionMonthly} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/>
                  <Tooltip/><Legend/>
                  <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[3,3,0,0]}/>
                  <Bar dataKey="actual" name="Collected" fill="#6366f1" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Outstanding AR by Client (Lakhs)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={clientAR} layout="vertical" margin={{top:4,right:8,left:40,bottom:0}}>
                  <XAxis type="number" tick={{fontSize:10}}/><YAxis type="category" dataKey="client" tick={{fontSize:11}}/>
                  <Tooltip formatter={(v:number)=>`${'\u20B9'}${v}L`}/>
                  <Bar dataKey="outstanding" name="Outstanding" fill="#6366f1" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD 4.2 Collection Benchmarks</h3>
              <div className="space-y-2.5">
                {[
                  ['Collection Efficiency','>=95% of monthly target', 75, 'bg-amber-500'],
                  ['Overdue >60d','Target <10% of AR', overdueGt60Pct < 10 ? 90 : 30, overdueGt60Pct < 10 ? 'bg-green-500' : 'bg-red-500'],
                  ['Follow-up SLA','Within 24h of overdue trigger', 85, 'bg-indigo-500'],
                  ['Billing Accuracy','100%', 100, 'bg-green-500'],
                  ['Payment Receipt SLA','Within 30d of certification', 70, 'bg-amber-500'],
                ].map(([k,v,pct,color])=>(
                  <div key={k as string}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{k} <span className="text-slate-400">â€” {v}</span></span>
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
    </div>
  );
}
