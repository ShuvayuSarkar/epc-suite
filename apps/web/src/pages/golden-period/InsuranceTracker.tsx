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
import { Shield, Plus, AlertCircle, CheckCircle2, Clock, FileText, Pencil, Trash2, X } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Policy {
  id: string; type: "Transit"|"Installation"|"Workers Comp"|"Equipment All-Risk"|"CAR";
  insurer: string; policyNo: string; coverage: number; premium: number;
  startDate: string; endDate: string; status: "Active"|"Expired"|"Renewed"|"Cancelled";
  project: string;
}
interface TransitPolicy {
  id: string; vehicle: string; material: string; from: string; to: string;
  value: number; startDate: string; endDate: string; status: "Active"|"Expired";
}
interface Claim {
  id: string; policyId: string; incidentDate: string; description: string;
  claimed: number; settled: number; status: "Filed"|"Under Investigation"|"Settled"|"Rejected";
}

const MOCK_POLICIES: Policy[] = [];
const MOCK_TRANSIT: TransitPolicy[] = [];
const MOCK_CLAIMS: Claim[] = [];

const TYPE_COLOR: Record<string,string> = {
  "Transit":"bg-blue-100 text-blue-700","Installation":"bg-purple-100 text-purple-700",
  "Workers Comp":"bg-orange-100 text-orange-700","Equipment All-Risk":"bg-teal-100 text-teal-700","CAR":"bg-green-100 text-green-700"
};
const CLAIM_V: Record<string,string> = { Filed:"primary","Under Investigation":"warning",Settled:"success",Rejected:"danger" };

import { usePersistentState } from '../../hooks/usePersistentState';

export default function InsuranceTracker() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.10');
  const [policies, setPolicies] = usePersistentState<Policy[]>('epc_gp_policies', MOCK_POLICIES);
  const [transitPolicies, setTransitPolicies] = usePersistentState<TransitPolicy[]>('epc_gp_transit_policies', MOCK_TRANSIT);
  const [claims, setClaims] = usePersistentState<Claim[]>('epc_gp_claims', MOCK_CLAIMS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);

  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddTransitModal, setShowAddTransitModal] = useState(false);
  const [showAddClaimModal, setShowAddClaimModal] = useState(false);

  const [newPolicy, setNewPolicy] = useState<Partial<Policy>>({
    type: "Installation",
    insurer: "United India Insurance",
    policyNo: "",
    coverage: 100,
    premium: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: "Active",
    project: ""
  });

  const [newTransit, setNewTransit] = useState<Partial<TransitPolicy>>({
    vehicle: "",
    material: "",
    from: "",
    to: "",
    value: 25,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: "Active"
  });

  const [newClaim, setNewClaim] = useState<Partial<Claim>>({
    policyId: "INS-001",
    incidentDate: new Date().toISOString().split('T')[0],
    description: "",
    claimed: 5,
    settled: 0,
    status: "Filed"
  });

  const [editRow, setEditRow] = React.useState<Policy | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<Policy | null>(null);
  const confirmDelete = () => { if (!deleteRow) return; setPolicies(prev => prev.filter(r => r.id !== deleteRow.id)); setDeleteRow(null); };

  const handleCreatePolicy = () => {
    if (!newPolicy.policyNo || !newPolicy.insurer) {
      alert("Please enter Policy Number and Insurer");
      return;
    }
    const defaultProj = storedProjects[0]?.name || "Transmission Project";
    const created: Policy = {
      id: `INS-${String(policies.length + 1).padStart(3, '0')}`,
      type: (newPolicy.type as any) || "Installation",
      insurer: newPolicy.insurer,
      policyNo: newPolicy.policyNo,
      coverage: Number(newPolicy.coverage) || 0,
      premium: Number(newPolicy.premium) || 0,
      startDate: newPolicy.startDate || new Date().toISOString().split('T')[0],
      endDate: newPolicy.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: (newPolicy.status as any) || "Active",
      project: newPolicy.project || defaultProj
    };
    setPolicies(prev => [created, ...prev]);
    setShowAddPolicyModal(false);
    setNewPolicy({
      type: "Installation",
      insurer: "United India Insurance",
      policyNo: "",
      coverage: 100,
      premium: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: "Active",
      project: storedProjects[0]?.name || ""
    });
  };

  const handleCreateTransit = () => {
    if (!newTransit.vehicle || !newTransit.material) {
      alert("Please enter Vehicle and Material");
      return;
    }
    const created: TransitPolicy = {
      id: `TRP-${String(transitPolicies.length + 1).padStart(3, '0')}`,
      vehicle: newTransit.vehicle,
      material: newTransit.material,
      from: newTransit.from || "Apar Plant",
      to: newTransit.to || "Site",
      value: Number(newTransit.value) || 0,
      startDate: newTransit.startDate || new Date().toISOString().split('T')[0],
      endDate: newTransit.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: (newTransit.status as any) || "Active"
    };
    setTransitPolicies(prev => [created, ...prev]);
    setShowAddTransitModal(false);
    setNewTransit({
      vehicle: "",
      material: "",
      from: "",
      to: "",
      value: 25,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: "Active"
    });
  };

  const handleCreateClaim = () => {
    if (!newClaim.description) {
      alert("Please provide Incident Description");
      return;
    }
    const created: Claim = {
      id: `CLM-${String(claims.length + 1).padStart(3, '0')}`,
      policyId: newClaim.policyId || policies[0]?.id || "INS-001",
      incidentDate: newClaim.incidentDate || new Date().toISOString().split('T')[0],
      description: newClaim.description,
      claimed: Number(newClaim.claimed) || 0,
      settled: Number(newClaim.settled) || 0,
      status: (newClaim.status as any) || "Filed"
    };
    setClaims(prev => [created, ...prev]);
    setShowAddClaimModal(false);
    setNewClaim({
      policyId: policies[0]?.id || "INS-001",
      incidentDate: new Date().toISOString().split('T')[0],
      description: "",
      claimed: 5,
      settled: 0,
      status: "Filed"
    });
  };

  const [activeTab, setActiveTab] = useState("policies");
  const totalCoverage = policies.reduce((s,p) => s+p.coverage, 0);
  const totalPremium  = policies.reduce((s,p) => s+p.premium, 0);
  const expiring30 = policies.filter(p => {
    const days = Math.round((new Date(p.endDate).getTime() - Date.now()) / 86400000);
    return days <= 30 && days >= 0;
  }).length;

  const pieData = [
    { name:"Installation",       value: MOCK_POLICIES.filter(p=>p.type==="Installation").reduce((s,p)=>s+p.coverage,0) },
    { name:"Transit",            value: MOCK_POLICIES.filter(p=>p.type==="Transit").reduce((s,p)=>s+p.coverage,0) },
    { name:"Workers Comp",       value: MOCK_POLICIES.filter(p=>p.type==="Workers Comp").reduce((s,p)=>s+p.coverage,0) },
    { name:"Equipment All-Risk", value: MOCK_POLICIES.filter(p=>p.type==="Equipment All-Risk").reduce((s,p)=>s+p.coverage,0) },
  ];
  const COLORS = ["#6366f1","#06b6d4","#f59e0b","#10b981"];
  const tabs = [{ id:"policies",label:"Policy Register" },{ id:"transit",label:"Transit Insurance" },{ id:"claims",label:"Claims" }];

  return (
    <div className="space-y-6">
      <PageHeader title="Insurance Tracker (BRD §2.7)" />
        <ReadOnlyBanner moduleId="4.5" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Active Policies",     value:String(MOCK_POLICIES.filter(p=>p.status==="Active").length), color:"text-green-600 bg-green-50",   icon:<Shield size={20}/> },
          { label:"Expiring in 30 Days", value:String(expiring30),                                         color: expiring30>0?"text-red-600 bg-red-50":"text-green-600 bg-green-50", icon:<AlertCircle size={20}/> },
          { label:"Total Insured Value", value:`₹${totalCoverage} Cr`,                                     color:"text-indigo-600 bg-indigo-50",  icon:<CheckCircle2 size={20}/> },
          { label:"Total Premium (₹L)",  value:`₹${totalPremium.toFixed(1)}L`,                             color:"text-slate-700 bg-slate-100",   icon:<FileText size={20}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="font-bold text-slate-800 text-lg">{k.value}</p></div>
          </Card>
        ))}
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "policies" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Coverage by Type (₹ Cr)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="44%"
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₹${v} Cr`, "Coverage"]} />
                  <Legend
                    verticalAlign="bottom"
                    height={32}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                      <span className="text-xs font-medium text-slate-700 mr-2">
                        {value}: <span className="font-bold text-slate-900">₹{entry.payload?.value ?? 0} Cr</span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Expiry Alerts (Next 90 Days)</h3>
              {policies.map(p => {
                const days = Math.round((new Date(p.endDate).getTime() - Date.now()) / 86400000);
                if (days > 90) return null;
                return (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${days < 30 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{p.policyNo}</p>
                      <p className="text-[10px] text-slate-500">{p.type} · {p.insurer}</p>
                    </div>
                    <span className={`text-xs font-bold ${days<30?"text-red-700":"text-amber-700"}`}>{days}d left</span>
                  </div>
                );
              })}
              {policies.filter(p => Math.round((new Date(p.endDate).getTime()-Date.now())/86400000)<=90).length === 0 && (
                <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle2 size={14}/> No policies expiring in next 90 days</p>
              )}
            </Card>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["Policy ID","Type","Insurer","Policy No.","Coverage (Cr)","Premium (₹L)","Start","End","Days Left","Status","Project", ...(canUpdate || canRemove ? ["Actions"] : [])].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {policies.map(p => {
                    const days = Math.round((new Date(p.endDate).getTime() - Date.now()) / 86400000);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{p.id}</td>
                        <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLOR[p.type]}`}>{p.type}</span></td>
                        <td className="px-3 py-3 text-xs text-slate-700">{p.insurer}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 font-mono">{p.policyNo}</td>
                        <td className="px-3 py-3 text-xs font-medium text-slate-800">₹{p.coverage}Cr</td>
                        <td className="px-3 py-3 text-xs text-slate-700">₹{p.premium}L</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{p.startDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{p.endDate}</td>
                        <td className={`px-3 py-3 text-xs font-semibold ${days<30?"text-red-600":days<90?"text-amber-600":"text-green-600"}`}>{days}d</td>
                        <td className="px-3 py-3"><Badge variant="success">{p.status}</Badge></td>
                        <td className="px-3 py-3 text-xs text-slate-500">{p.project}</td>
                        {(canUpdate || canRemove) && (
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {canUpdate && <button onClick={() => setEditRow(p)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit"><Pencil size={13}/></button>}
                              {canRemove && <button onClick={() => setDeleteRow(p)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13}/></button>}
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
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setShowAddPolicyModal(true)} className="flex items-center gap-2">
                <Plus size={14}/> Add Policy
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === "transit" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Per-dispatch transit insurance for material movement to site (BRD §2.7).</p>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["ID","Vehicle","Material","From","To","Transit Value","Start","End","Status"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {transitPolicies.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600">{t.id}</td>
                      <td className="px-3 py-3 text-xs text-slate-700">{t.vehicle}</td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-[160px] truncate" title={t.material}>{t.material}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{t.from}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{t.to}</td>
                      <td className="px-3 py-3 text-xs font-medium text-slate-800">₹{t.value}L</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{t.startDate}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{t.endDate}</td>
                      <td className="px-3 py-3"><Badge variant={t.status==="Active"?"success":"secondary"}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setShowAddTransitModal(true)} className="flex items-center gap-2">
                <Plus size={14}/> Add Transit Policy
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === "claims" && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["Claim ID","Policy","Incident Date","Description","Claimed (₹L)","Settled (₹L)","Status"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600">{c.id}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">{c.policyId}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{c.incidentDate}</td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={c.description}>{c.description}</td>
                      <td className="px-3 py-3 text-xs font-medium text-slate-800">₹{c.claimed}L</td>
                      <td className="px-3 py-3 text-xs font-medium text-green-700">{c.settled > 0 ? `₹${c.settled}L` : "—"}</td>
                      <td className="px-3 py-3"><Badge variant={CLAIM_V[c.status] as any}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex justify-end">
            {canCreate && (
              <Button onClick={() => setShowAddClaimModal(true)} className="flex items-center gap-2">
                <Plus size={14}/> File New Claim
              </Button>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow ? deleteRow.id : ''}
        recordType="insurance policy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Policy</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select
                  value={editRow.type}
                  onChange={e => setEditRow({ ...editRow, type: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["Installation", "Transit", "Workers Comp", "Equipment All-Risk", "CAR"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Insurer</label><input value={editRow.insurer} onChange={e => setEditRow({ ...editRow, insurer: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Policy No</label><input value={editRow.policyNo} onChange={e => setEditRow({ ...editRow, policyNo: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Coverage (₹ Cr)</label><input type="number" value={editRow.coverage} onChange={e => setEditRow({ ...editRow, coverage: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Premium (₹ Lakh)</label><input type="number" value={editRow.premium} onChange={e => setEditRow({ ...editRow, premium: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={editRow.status}
                  onChange={e => setEditRow({ ...editRow, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["Active", "Expired", "Renewed", "Cancelled"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => {
                  setPolicies(prev => prev.map(p => p.id === editRow.id ? editRow : p));
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

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add Insurance Policy</h3>
              <button onClick={() => setShowAddPolicyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={newPolicy.type}
                    onChange={e => setNewPolicy({ ...newPolicy, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {["Installation", "Transit", "Workers Comp", "Equipment All-Risk", "CAR"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Insurer *</label>
                  <input
                    value={newPolicy.insurer || ''}
                    onChange={e => setNewPolicy({ ...newPolicy, insurer: e.target.value })}
                    placeholder="e.g. United India Insurance"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Policy No *</label>
                  <input
                    value={newPolicy.policyNo || ''}
                    onChange={e => setNewPolicy({ ...newPolicy, policyNo: e.target.value })}
                    placeholder="e.g. UIIC/EAR/2026/001234"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <select
                    value={newPolicy.project || (storedProjects[0]?.name || '')}
                    onChange={e => setNewPolicy({ ...newPolicy, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {storedProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                    ))}
                    {storedProjects.length === 0 && <option value="">No projects available</option>}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Coverage (₹ Cr)</label>
                  <input
                    type="number"
                    value={newPolicy.coverage || 0}
                    onChange={e => setNewPolicy({ ...newPolicy, coverage: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Premium (₹ Lakh)</label>
                  <input
                    type="number"
                    value={newPolicy.premium || 0}
                    onChange={e => setNewPolicy({ ...newPolicy, premium: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newPolicy.startDate || ''}
                    onChange={e => setNewPolicy({ ...newPolicy, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newPolicy.endDate || ''}
                    onChange={e => setNewPolicy({ ...newPolicy, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddPolicyModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreatePolicy} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Policy</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transit Policy Modal */}
      {showAddTransitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add Transit Insurance</h3>
              <button onClick={() => setShowAddTransitModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle *</label>
                <input
                  value={newTransit.vehicle || ''}
                  onChange={e => setNewTransit({ ...newTransit, vehicle: e.target.value })}
                  placeholder="e.g. MH-04-AB-1234 (40T Trailer)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Material *</label>
                <input
                  value={newTransit.material || ''}
                  onChange={e => setNewTransit({ ...newTransit, material: e.target.value })}
                  placeholder="e.g. HTLS Conductor Drums (12 nos)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                  <input
                    value={newTransit.from || ''}
                    onChange={e => setNewTransit({ ...newTransit, from: e.target.value })}
                    placeholder="Origin plant / warehouse"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                  <input
                    value={newTransit.to || ''}
                    onChange={e => setNewTransit({ ...newTransit, to: e.target.value })}
                    placeholder="Destination site"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Value (₹L)</label>
                  <input
                    type="number"
                    value={newTransit.value || 0}
                    onChange={e => setNewTransit({ ...newTransit, value: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTransit.startDate || ''}
                    onChange={e => setNewTransit({ ...newTransit, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTransit.endDate || ''}
                    onChange={e => setNewTransit({ ...newTransit, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddTransitModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateTransit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Transit Policy</button>
            </div>
          </div>
        </div>
      )}

      {/* File New Claim Modal */}
      {showAddClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">File Insurance Claim</h3>
              <button onClick={() => setShowAddClaimModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Policy</label>
                  <select
                    value={newClaim.policyId}
                    onChange={e => setNewClaim({ ...newClaim, policyId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.id} ({p.type} - {p.insurer})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={newClaim.incidentDate || ''}
                    onChange={e => setNewClaim({ ...newClaim, incidentDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Claimed Amount (₹ Lakh)</label>
                <input
                  type="number"
                  value={newClaim.claimed || 0}
                  onChange={e => setNewClaim({ ...newClaim, claimed: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Incident Description *</label>
                <textarea
                  value={newClaim.description || ''}
                  onChange={e => setNewClaim({ ...newClaim, description: e.target.value })}
                  placeholder="Describe the incident, damage, and circumstances..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddClaimModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateClaim} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Submit Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}