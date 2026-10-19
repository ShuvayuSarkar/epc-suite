import React, { useState, useMemo } from "react";
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { DollarSign, AlertCircle, CheckCircle2, Clock, Plus, RefreshCw, Pencil, Trash2, X } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usePersistentState } from '../../hooks/usePersistentState';

/* BRD §2.9: Bank guarantee tracking — Performance BG, APG, CPBG, Retention BG */
interface BankGuarantee {
  id: string; type: "CPBG"|"CPG"|"Performance BG"|"APG"|"Retention BG"|"Material BG";
  bank: string; bgNumber: string; amount: number;
  project: string; beneficiary: string;
  issuedDate: string; expiryDate: string;
  status: "Active"|"Expired"|"Encashed"|"Renewed"|"Released";
  linkedTo: string;
}

interface Encashment {
  date: string; bgId: string; bgNumber: string; amount: number;
  reason: string; response: string; status: "Resolved"|"Contested"|"Settled";
}

const MOCK_BGS: BankGuarantee[] = [];

const MOCK_ENCASHMENTS: Encashment[] = [];

const BG_TYPE_COLOR: Record<string,string> = {
  CPBG:"bg-blue-100 text-blue-700", "Performance BG":"bg-indigo-100 text-indigo-700",
  APG:"bg-purple-100 text-purple-700", "Retention BG":"bg-teal-100 text-teal-700",
  "Material BG":"bg-orange-100 text-orange-700", CPG:"bg-cyan-100 text-cyan-700"
};
const STATUS_V: Record<string,string> = { Active:"success", Expired:"danger", Encashed:"warning", Renewed:"primary", Released:"secondary" };
const ENC_V: Record<string,string> = { Resolved:"success", Settled:"warning", Contested:"danger" };

function daysLeft(expiryDate: string) {
  return Math.round((new Date(expiryDate).getTime() - Date.now()) / 86400000);
}

export default function BankGuaranteeTracker() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.10');

  const [activeTab, setActiveTab] = useState("register");
  const [filterProject, setFilterProject] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [bgs, setBgs] = usePersistentState<BankGuarantee[]>('epc_gp_bgs', MOCK_BGS);
  const [encashments, setEncashments] = usePersistentState<Encashment[]>('epc_gp_encashments', MOCK_ENCASHMENTS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [showEncashModal, setShowEncashModal] = useState(false);
  const [newEncashment, setNewEncashment] = useState<Partial<Encashment>>({
    date: new Date().toISOString().split('T')[0],
    bgNumber: '',
    amount: 0,
    reason: '',
    response: '',
    status: 'Settled'
  });
  const [newBg, setNewBg] = useState<Partial<BankGuarantee>>({
    type: 'Performance BG',
    bank: 'State Bank of India',
    bgNumber: '',
    amount: 100,
    project: '',
    beneficiary: 'Client Ltd',
    issuedDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'Active',
    linkedTo: 'CONT-2026-001'
  });
  const [editRow, setEditRow] = useState<BankGuarantee | null>(null);
  const [deleteRow, setDeleteRow] = useState<BankGuarantee | null>(null);

  const confirmDelete = () => {
    if (!deleteRow) return;
    setBgs(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  const handleCreateBg = () => {
    if (!newBg.bgNumber || !newBg.bank) {
      alert('Please fill in BG Number and Bank');
      return;
    }
    const defaultProj = storedProjects[0]?.name || 'Transmission Project';
    const created: BankGuarantee = {
      id: `BG-${String(bgs.length + 1).padStart(3, '0')}`,
      type: (newBg.type as any) || 'Performance BG',
      bank: newBg.bank || 'State Bank of India',
      bgNumber: newBg.bgNumber,
      amount: Number(newBg.amount) || 0,
      project: newBg.project || defaultProj,
      beneficiary: newBg.beneficiary || 'Client Ltd',
      issuedDate: newBg.issuedDate || new Date().toISOString().split('T')[0],
      expiryDate: newBg.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: (newBg.status as any) || 'Active',
      linkedTo: newBg.linkedTo || 'CONT-NEW'
    };
    setBgs(prev => [created, ...prev]);
    setShowForm(false);
    setNewBg({
      type: 'Performance BG',
      bank: 'State Bank of India',
      bgNumber: '',
      amount: 100,
      project: storedProjects[0]?.name || '',
      beneficiary: 'Client Ltd',
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Active',
      linkedTo: 'CONT-2026-001'
    });
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setBgs(prev => prev.map(b => b.id === editRow.id ? editRow : b));
    setEditRow(null);
  };

  const handleCreateEncashment = () => {
    if (!newEncashment.bgNumber || !newEncashment.reason) {
      alert('Please fill in BG Number and Reason');
      return;
    }
    const created: Encashment = {
      date: newEncashment.date || new Date().toISOString().split('T')[0],
      bgId: `BG-${Date.now().toString().slice(-4)}`,
      bgNumber: newEncashment.bgNumber,
      amount: Number(newEncashment.amount) || 0,
      reason: newEncashment.reason,
      response: newEncashment.response || '',
      status: (newEncashment.status as any) || 'Contested'
    };
    setEncashments(prev => [created, ...prev]);
    setShowEncashModal(false);
    setNewEncashment({
      date: new Date().toISOString().split('T')[0],
      bgNumber: '',
      amount: 0,
      reason: '',
      response: '',
      status: 'Settled'
    });
  };

  const projects = useMemo(() => {
    const list = [...new Set([...bgs.map(b => b.project), ...storedProjects.map(p => p.name || p.title || p.id)])].filter(Boolean);
    return list.length > 0 ? list : ['Transmission Project'];
  }, [bgs, storedProjects]);

  const filtered = useMemo(() => bgs.filter(b =>
    (filterProject === "All" || b.project === filterProject) &&
    (filterType === "All" || b.type === filterType) &&
    (filterStatus === "All" || b.status === filterStatus)
  ), [bgs, filterProject, filterType, filterStatus]);

  const totalValue = bgs.filter(b => b.status === "Active").reduce((s, b) => s + b.amount, 0);
  const expiring90 = bgs.filter(b => { const d = daysLeft(b.expiryDate); return d >= 0 && d <= 90; });
  const encashedCount = bgs.filter(b => b.status === "Encashed").length;

  const pieData = ["CPBG", "CPG", "Performance BG", "APG", "Retention BG"].map(t => ({
    name: t, value: bgs.filter(b => b.type === t).reduce((s, b) => s + b.amount, 0)
  })).filter(d => d.value > 0);
  const PIE_COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];

  const monthData: Record<string, number> = {};
  bgs.filter(b => b.status === "Active").forEach(b => {
    const m = new Date(b.expiryDate).toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthData[m] = (monthData[m] || 0) + b.amount;
  });
  const barData = Object.entries(monthData).map(([month, amount]) => ({ month, amount }));

  const tabs = [{ id:"register",label:"BG Register" },{ id:"expiry",label:"Expiry Alerts" },{ id:"encashment",label:"Encashment History" }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Bank Guarantee Tracker (BRD §2.9)" />
        <ReadOnlyBanner moduleId="4.10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Active BGs",          value:String(bgs.filter(b=>b.status==="Active").length),  color:"text-green-600 bg-green-50",  icon:<CheckCircle2 size={20}/> },
          { label:"Total BG Value",      value:`₹${(totalValue/100).toFixed(1)} Cr`,               color:"text-indigo-600 bg-indigo-50", icon:<DollarSign size={20}/> },
          { label:"Expiring in 90 Days", value:String(expiring90.length),                          color: expiring90.length>0?"text-amber-600 bg-amber-50":"text-green-600 bg-green-50", icon:<Clock size={20}/> },
          { label:"Encashed",            value:String(encashedCount),                               color: encashedCount>0?"text-red-600 bg-red-50":"text-slate-700 bg-slate-100", icon:<AlertCircle size={20}/> },
        ].map(k => (

          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">BG Value by Type (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ name, value }) => `${name}: ₹${value}L`} labelLine={false}>
              {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
            </Pie><Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}L`,"Amount"]}/><Legend wrapperStyle={{ fontSize:"11px" }}/></PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">BG Expiry Timeline (₹L at risk per month)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <XAxis dataKey="month" tick={{ fontSize:11 }}/><YAxis tick={{ fontSize:11 }}/>
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}L`,"Expiring BG Value"]}/>
              <Bar dataKey="amount" fill="#f59e0b" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {activeTab === "register" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { val:filterProject, set:setFilterProject, label:"All Projects", opts:projects },
              { val:filterType,    set:setFilterType,    label:"All Types",    opts:["CPBG","CPG","Performance BG","APG","Retention BG","Material BG"] },
              { val:filterStatus,  set:setFilterStatus,  label:"All Statuses", opts:["Active","Expired","Encashed","Renewed","Released"] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="text-xs text-slate-500 ml-auto">{filtered.length}/{MOCK_BGS.length}</span>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/> Add BG</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["BG ID","Type","Bank","BG Number","Amount (₹L)","Project","Beneficiary","Issued","Expiry","Days Left","Status","Actions"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(b => {
                    const dl = daysLeft(b.expiryDate);
                    return (
                      <tr key={b.id} className={`hover:bg-slate-50 ${dl<30&&dl>=0?"bg-red-50/30":dl<90&&dl>=0?"bg-amber-50/30":""}`}>
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{b.id}</td>
                        <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${BG_TYPE_COLOR[b.type]||"bg-slate-100 text-slate-700"}`}>{b.type}</span></td>
                        <td className="px-3 py-3 text-xs text-slate-700">{b.bank}</td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-600 whitespace-nowrap">{b.bgNumber}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-800">₹{b.amount.toLocaleString()}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 max-w-[120px] truncate" title={b.project}>{b.project}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{b.beneficiary}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{b.issuedDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{b.expiryDate}</td>
                        <td className={`px-3 py-3 text-xs font-bold ${dl<0?"text-red-700":dl<30?"text-red-600":dl<90?"text-amber-600":"text-green-600"}`}>
                          {dl<0?"EXPIRED":dl+"d"} {dl<30&&dl>=0?"⛔":dl<90&&dl>=0?"⚠️":""}
                        </td>
                        <td className="px-3 py-3"><Badge variant={STATUS_V[b.status] as any}>{b.status}</Badge></td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-0.5">
                            {canUpdate && <button onClick={() => setEditRow(b)} title="Edit BG" className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={13}/></button>}
                            {canRemove && <button onClick={() => setDeleteRow(b)} title="Delete BG" className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "expiry" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">BGs Expiring Within 90 Days — Renew Immediately</h3>
          {expiring90.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-green-600 flex items-center justify-center gap-2"><CheckCircle2 size={18}/> No BGs expiring within 90 days</p></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiring90.sort((a,b) => daysLeft(a.expiryDate) - daysLeft(b.expiryDate)).map(bg => {
                const dl = daysLeft(bg.expiryDate);
                return (
                  <Card key={bg.id} className={`p-5 border-l-4 ${dl<30?"border-red-500":"border-amber-400"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${BG_TYPE_COLOR[bg.type]||"bg-slate-100 text-slate-700"}`}>{bg.type}</span>
                        <p className="font-semibold text-slate-800 mt-1 text-sm">{bg.bank}</p>
                      </div>
                      <span className={`text-lg font-extrabold ${dl<30?"text-red-700":"text-amber-700"}`}>{dl}d</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {[["BG Number",bg.bgNumber],["Amount",`₹${bg.amount.toLocaleString()}L`],["Project",bg.project],["Beneficiary",bg.beneficiary],["Expiry",bg.expiryDate]].map(([k,v])=>(
                        <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-medium text-slate-800">{v}</span></div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => {
                        setBgs(prev => prev.map(b => b.id === bg.id ? { 
                          ...b, 
                          status: "Renewed", 
                          expiryDate: new Date(Date.now() + 365*86400000).toISOString().split('T')[0] 
                        } : b));
                        alert(`Renewal initiated for ${bg.bgNumber}. Expiry extended by 1 year.`);
                      }}
                      className="w-full mt-3 text-xs flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <RefreshCw size={12}/> Initiate Renewal
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">BRD §2.9 Alert Thresholds</p>
            <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
              <li>Alert at 90 days before expiry — plan renewal</li>
              <li>Alert at 30 days — mandatory renewal initiation</li>
              <li>Alert at 7 days — escalate to CFO and Project Director</li>
              <li>Performance BG: typically 5–10% of contract value</li>
              <li>APG: equal to advance amount received from client</li>
            </ul>
          </Card>
        </div>
      )}

      {activeTab === "encashment" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">BG Encashment History</h3>
          {encashments.map((e, idx) => (
            <Card key={idx} className="p-5 border-l-4 border-red-500">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{e.bgNumber}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Date: {e.date} · Amount: ₹{e.amount}L</p>
                </div>
                <Badge variant={ENC_V[e.status] as any}>{e.status}</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 rounded p-3"><p className="font-semibold text-red-700 mb-1">Client's Reason for Encashment</p><p className="text-slate-700">{e.reason}</p></div>
                <div className="bg-green-50 rounded p-3"><p className="font-semibold text-green-700 mb-1">Our Response</p><p className="text-slate-700">{e.response}</p></div>
              </div>
            </Card>
          ))}
          {encashments.length === 0 && <Card className="p-8 text-center text-slate-400">No BG encashments on record.</Card>}
          <div className="flex justify-end">
            <Button onClick={() => setShowEncashModal(true)} className="flex items-center gap-2">
              <Plus size={14}/> Record Encashment
            </Button>
          </div>
        </div>
      )}

      {showEncashModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Record BG Encashment</h3>
              <button onClick={() => setShowEncashModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">BG Number *</label>
                <input
                  type="text"
                  value={newEncashment.bgNumber || ''}
                  onChange={e => setNewEncashment({ ...newEncashment, bgNumber: e.target.value })}
                  placeholder="e.g. SBI/BG/2026/1234"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEncashment.date || ''}
                    onChange={e => setNewEncashment({ ...newEncashment, date: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹L) *</label>
                  <input
                    type="number"
                    value={newEncashment.amount || 0}
                    onChange={e => setNewEncashment({ ...newEncashment, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={newEncashment.status || 'Contested'}
                  onChange={e => setNewEncashment({ ...newEncashment, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none bg-white"
                >
                  <option value="Contested">Contested</option>
                  <option value="Settled">Settled</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client Reason *</label>
                <textarea
                  value={newEncashment.reason || ''}
                  onChange={e => setNewEncashment({ ...newEncashment, reason: e.target.value })}
                  placeholder="Reason given by beneficiary/client..."
                  rows={2}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Response</label>
                <textarea
                  value={newEncashment.response || ''}
                  onChange={e => setNewEncashment({ ...newEncashment, response: e.target.value })}
                  placeholder="Legal or contractual response..."
                  rows={2}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowEncashModal(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleCreateEncashment}>Save Encashment</Button>
            </div>
          </Card>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Add Bank Guarantee</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">BG Type</label>
                  <select
                    value={newBg.type || 'Performance BG'}
                    onChange={e => setNewBg({ ...newBg, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none bg-white"
                  >
                    {["CPBG","CPG","Performance BG","APG","Retention BG","Material BG"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bank</label>
                  <select
                    value={newBg.bank || 'State Bank of India'}
                    onChange={e => setNewBg({ ...newBg, bank: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none bg-white"
                  >
                    {["State Bank of India","HDFC Bank","ICICI Bank","Axis Bank","Punjab National Bank","Canara Bank","Bank of Baroda"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
                  <select
                    value={newBg.project || projects[0]}
                    onChange={e => setNewBg({ ...newBg, project: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none bg-white"
                  >
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newBg.status || 'Active'}
                    onChange={e => setNewBg({ ...newBg, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none bg-white"
                  >
                    {["Active","Expired","Encashed","Renewed","Released"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">BG Number *</label>
                  <input
                    type="text"
                    value={newBg.bgNumber || ''}
                    onChange={e => setNewBg({ ...newBg, bgNumber: e.target.value })}
                    placeholder="e.g. SBI/BG/2026/1234"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹L) *</label>
                  <input
                    type="number"
                    value={newBg.amount || 0}
                    onChange={e => setNewBg({ ...newBg, amount: Number(e.target.value) })}
                    placeholder="e.g. 145.5"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Beneficiary</label>
                <input
                  type="text"
                  value={newBg.beneficiary || ''}
                  onChange={e => setNewBg({ ...newBg, beneficiary: e.target.value })}
                  placeholder="e.g. NTPC Ltd"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={newBg.issuedDate || ''}
                    onChange={e => setNewBg({ ...newBg, issuedDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newBg.expiryDate || ''}
                    onChange={e => setNewBg({ ...newBg, expiryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleCreateBg}>Save BG</Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow ? deleteRow.id : ''}
        recordType="bank guarantee"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit BG — {editRow.id}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">BG Type</label>
                  <select
                    value={editRow.type}
                    onChange={e => setEditRow({ ...editRow, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {["CPBG","CPG","Performance BG","APG","Retention BG","Material BG"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Bank</label>
                  <input
                    value={editRow.bank}
                    onChange={e => setEditRow({ ...editRow, bank: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">BG Number</label>
                  <input
                    value={editRow.bgNumber}
                    onChange={e => setEditRow({ ...editRow, bgNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹L)</label>
                  <input
                    type="number"
                    value={editRow.amount}
                    onChange={e => setEditRow({ ...editRow, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input
                    value={editRow.project}
                    onChange={e => setEditRow({ ...editRow, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={editRow.status}
                    onChange={e => setEditRow({ ...editRow, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {["Active","Expired","Encashed","Renewed","Released"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={editRow.issuedDate}
                    onChange={e => setEditRow({ ...editRow, issuedDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editRow.expiryDate}
                    onChange={e => setEditRow({ ...editRow, expiryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
