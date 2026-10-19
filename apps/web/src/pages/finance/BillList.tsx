import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { CheckCircle2, AlertCircle, Clock, Plus, FileText, DollarSign, Award, Package, Pencil, Trash2, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell
} from 'recharts';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

// BRD Module 4.7 — Billing & Certification
// Supply Bill (80%) based on JVR | Service Bill (20%) based on JMC
// Mandatory Spares sub-bill | Certification <=15d | Payment <=30d

type BillType = 'Supply Bill' | 'Service Bill - Line' | 'Service Bill - Substation' | 'OPGW Installation' | 'FOTE/SDH Commissioning' | 'Mandatory Spares';
type BillStatus = 'Draft' | 'Submitted' | 'Client Query' | 'Certified' | 'Payment Released' | 'Overdue';

interface Bill {
  id: string; project: string; client: string;
  type: BillType; basis: string;
  grossAmt: number; tds: number; gst: number; netAmt: number;
  submittedDate: string; certifiedDate: string; paymentDate: string;
  daysToReceive: number; status: BillStatus;
  invoiceNo: string; certLetterNo: string;
}

const MOCK_BILLS: Bill[] = [];

const STATUS_V: Record<string, string> = {
  Draft:'secondary', Submitted:'primary', 'Client Query':'warning',
  Certified:'success', 'Payment Released':'success', Overdue:'danger'
};
const TYPE_V: Record<string, string> = {
  'Supply Bill':'primary', 'Service Bill - Line':'success', 'Service Bill - Substation':'success',
  'OPGW Installation':'secondary', 'FOTE/SDH Commissioning':'secondary', 'Mandatory Spares':'warning'
};
const fmt = (n: number) => `${'\u20B9'}${(n/100000).toFixed(1)}L`;
const fmtCr = (n: number) => n >= 10000000 ? `${'\u20B9'}${(n/10000000).toFixed(2)}Cr` : `${'\u20B9'}${(n/100000).toFixed(1)}L`;

const certTrend = [
  { month:'Oct', submitted:2, certified:2, paid:1 },
  { month:'Nov', submitted:3, certified:1, paid:1 },
  { month:'Dec', submitted:3, certified:3, paid:0 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

const INITIAL_BILLS: Bill[] = [];

export default function BillList() {
  const { canUpdate, canRemove } = usePermission('4.7');
  const [bills, setBills] = usePersistentState<Bill[]>('epc_bills', INITIAL_BILLS);
  const [projectsList] = usePersistentState<any[]>('epc_projects', []);
  const [clientsList] = usePersistentState<any[]>('epc_clients', []);

  const [activeTab, setActiveTab] = useState('register');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<Bill | null>(null);
  const [deleteRow, setDeleteRow] = useState<Bill | null>(null);

  const [newBillForm, setNewBillForm] = useState({
    project: '',
    client: '',
    type: 'Supply Bill' as BillType,
    basis: 'JVR/2026/01',
    grossAmt: 5000000,
    tds: 2,
    gst: 18,
    invoiceNo: '',
  });

  const handleRaiseBill = () => {
    if (!newBillForm.project && projectsList.length > 0) {
      newBillForm.project = projectsList[0].name;
    }
    const selectedProj = projectsList.find(p => p.name === newBillForm.project) || projectsList[0];
    const clientName = newBillForm.client || selectedProj?.client || 'Client';
    const net = Math.round(Number(newBillForm.grossAmt || 5000000) * (1 + Number(newBillForm.gst || 18) / 100 - Number(newBillForm.tds || 2) / 100));
    
    const newBill: Bill = {
      id: `BIL-2026-${String(bills.length + 1).padStart(3, '0')}`,
      project: newBillForm.project || selectedProj?.name || 'Transmission Project',
      client: clientName,
      type: newBillForm.type,
      basis: newBillForm.basis || 'JVR-2026-001',
      grossAmt: Number(newBillForm.grossAmt) || 5000000,
      tds: Number(newBillForm.tds) || 2,
      gst: Number(newBillForm.gst) || 18,
      netAmt: net,
      submittedDate: new Date().toISOString().split('T')[0],
      certifiedDate: '',
      paymentDate: '',
      daysToReceive: 0,
      status: 'Submitted',
      invoiceNo: newBillForm.invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      certLetterNo: `CERT-${new Date().getFullYear()}-${bills.length + 1}`,
    };
    setBills([newBill, ...bills]);
    setShowForm(false);
  };

  const clients = ['All', 'NTPC', 'IndiGrid', 'MSETCL'];
  const statuses = ['All', 'Draft', 'Submitted', 'Client Query', 'Certified', 'Payment Released', 'Overdue'];

  const filtered = useMemo(() => bills.filter(b =>
    (filterStatus === 'All' || b.status === filterStatus) &&
    (filterClient === 'All' || b.client === filterClient)
  ), [bills, filterStatus, filterClient]);

  const totalBilled = bills.filter(b => b.status !== 'Draft').reduce((s,b) => s + b.netAmt, 0);
  const totalReceived = bills.filter(b => b.status === 'Payment Released').reduce((s,b) => s + b.netAmt, 0);
  const totalCertified = bills.filter(b => ['Certified','Payment Released'].includes(b.status)).reduce((s,b) => s + b.netAmt, 0);
  const overdueBills = bills.filter(b => b.status === 'Overdue').length;
  const avgCertDays = 11;

  const handleDelete = (row: Bill) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setBills(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Certification (BRD 4.7)"
        description="Supply Bill (80% on JVR) | Service Bill (20% on JMC) | Mandatory Spares | OPGW | FOTE/SDH"
        actions={<Button onClick={() => setShowForm(true)} className="flex items-center gap-2"><Plus size={14}/> Raise Bill</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label:'Total Billed', value:fmtCr(totalBilled), color:'text-indigo-600 bg-indigo-50', icon:<FileText size={18}/> },
          { label:'Certified', value:fmtCr(totalCertified), color:'text-green-600 bg-green-50', icon:<Award size={18}/> },
          { label:'Received', value:fmtCr(totalReceived), color:'text-emerald-600 bg-emerald-50', icon:<DollarSign size={18}/> },
          { label:'Overdue Bills', value:overdueBills, color:overdueBills>0?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<AlertCircle size={18}/> },
          { label:'Avg Cert Days', value:`${avgCertDays}d`, color:avgCertDays<=15?'text-green-600 bg-green-50':'text-amber-600 bg-amber-50', icon:<Clock size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={[
        { id:'register', label:'Bill Register' },
        { id:'analytics', label:'Analytics' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filterStatus===s?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                  {s}{s!=='All'&&` (${bills.filter(b=>b.status===s).length})`}
                </button>
              ))}
            </div>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Bill ID','Project','Client','Type','Basis','Net Amt','Submitted','Certified','Status','Days','Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(b => (
                  <tr key={b.id} className={`hover:bg-slate-50 ${b.status==='Overdue'?'bg-red-50/30':b.status==='Client Query'?'bg-amber-50/20':''}`}>
                    <td className="px-3 py-3 font-mono text-xs text-indigo-600">{b.id}</td>
                    <td className="px-3 py-3 text-xs font-medium text-slate-800 max-w-[120px] truncate">{b.project}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{b.client}</td>
                    <td className="px-3 py-3"><Badge variant={TYPE_V[b.type] as any} className="text-[10px]">{b.type}</Badge></td>
                    <td className="px-3 py-3 text-xs text-slate-500 max-w-[120px] truncate">{b.basis}</td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-800">{fmt(b.netAmt)}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{b.submittedDate||'—'}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{b.certifiedDate||'—'}</td>
                    <td className="px-3 py-3"><Badge variant={STATUS_V[b.status] as any}>{b.status}</Badge></td>
                    <td className={`px-3 py-3 text-xs font-bold ${b.daysToReceive>30?'text-red-600':b.daysToReceive>0?'text-amber-600':'text-slate-400'}`}>
                      {b.daysToReceive>0?`${b.daysToReceive}d`:'—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {canUpdate && (
                          <button onClick={() => setEditRow(b)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {canRemove && (
                          <button onClick={() => handleDelete(b)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {bills.some(b => b.status === 'Overdue') && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-sm text-red-800 flex items-center gap-3">
              <AlertCircle size={16} className="text-red-600 shrink-0"/>
              <span><strong>{bills.filter(b=>b.status==='Overdue').length} overdue bills.</strong> BRD: payment receipt within 30 days of certification. Escalate to PD for bills overdue beyond 30 days.</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Bill Certification Pipeline (Monthly)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={certTrend} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/>
                  <Tooltip/><Legend/>
                  <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[3,3,0,0]}/>
                  <Bar dataKey="certified" name="Certified" fill="#22c55e" radius={[3,3,0,0]}/>
                  <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Billing by Type (Net Amount)</h3>
              <div className="space-y-2.5">
                {[
                  { type:'Supply Bill', total:bills.filter(b=>b.type==='Supply Bill').reduce((s,b)=>s+b.netAmt,0), color:'bg-indigo-500' },
                  { type:'Service Bill (Line)', total:bills.filter(b=>b.type==='Service Bill - Line').reduce((s,b)=>s+b.netAmt,0), color:'bg-green-500' },
                  { type:'Service Bill (SS)', total:bills.filter(b=>b.type==='Service Bill - Substation').reduce((s,b)=>s+b.netAmt,0), color:'bg-emerald-500' },
                  { type:'OPGW Installation', total:bills.filter(b=>b.type==='OPGW Installation').reduce((s,b)=>s+b.netAmt,0), color:'bg-sky-500' },
                  { type:'FOTE/SDH', total:bills.filter(b=>b.type==='FOTE/SDH Commissioning').reduce((s,b)=>s+b.netAmt,0), color:'bg-violet-500' },
                  { type:'Mandatory Spares', total:bills.filter(b=>b.type==='Mandatory Spares').reduce((s,b)=>s+b.netAmt,0), color:'bg-amber-500' },
                ].map(item => {
                  const maxVal = 25000000;
                  const pct = Math.round((item.total / maxVal) * 100);
                  return (
                    <div key={item.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{item.type}</span>
                        <span className="font-bold text-slate-700">{fmtCr(item.total)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.color}`} style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">BRD 4.7 Billing Benchmarks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['Supply Bill Basis','JVR completion'],['Service Bill Basis','JMC sign-off'],['Certification SLA','Within 15 days'],['Payment SLA','Within 30 days of cert'],
                ['Billing Accuracy','100%'],['Mandatory Spares Bill','Within 30 days'],['Overdue >60d','Target <10%'],['Type D','OPGW + FOTE separate']
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

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Raise New Bill</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                <select 
                  value={newBillForm.project} 
                  onChange={e => {
                    const p = projectsList.find(pr => pr.name === e.target.value);
                    setNewBillForm({ ...newBillForm, project: e.target.value, client: p?.client || newBillForm.client });
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="">— Select Project —</option>
                  {projectsList.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client</label>
                <input 
                  type="text" 
                  value={newBillForm.client} 
                  onChange={e => setNewBillForm({ ...newBillForm, client: e.target.value })}
                  placeholder="e.g. NTPC / PGCIL"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bill Type</label>
                <select 
                  value={newBillForm.type} 
                  onChange={e => setNewBillForm({ ...newBillForm, type: e.target.value as BillType })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option>Supply Bill</option>
                  <option>Service Bill - Line</option>
                  <option>Service Bill - Substation</option>
                  <option>OPGW Installation</option>
                  <option>FOTE/SDH Commissioning</option>
                  <option>Mandatory Spares</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Billing Basis / JVR-JMC Ref</label>
                <input 
                  type="text" 
                  value={newBillForm.basis} 
                  onChange={e => setNewBillForm({ ...newBillForm, basis: e.target.value })}
                  placeholder="e.g. JVR/2026/045"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gross Amount (₹)</label>
                <input 
                  type="number" 
                  value={newBillForm.grossAmt} 
                  onChange={e => setNewBillForm({ ...newBillForm, grossAmt: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Invoice No.</label>
                <input 
                  type="text" 
                  value={newBillForm.invoiceNo} 
                  onChange={e => setNewBillForm({ ...newBillForm, invoiceNo: e.target.value })}
                  placeholder="e.g. INV-2026-089"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">TDS %</label>
                <input 
                  type="number" 
                  value={newBillForm.tds} 
                  onChange={e => setNewBillForm({ ...newBillForm, tds: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">GST %</label>
                <input 
                  type="number" 
                  value={newBillForm.gst} 
                  onChange={e => setNewBillForm({ ...newBillForm, gst: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleRaiseBill}>Submit Bill</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
