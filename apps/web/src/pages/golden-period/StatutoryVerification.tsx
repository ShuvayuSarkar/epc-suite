import React, { useState, useMemo } from "react";
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { CheckCircle2, AlertCircle, Clock, Plus, FileText, Trash2, Zap, Users, X, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { usePersistentState } from '../../hooks/usePersistentState';

/* BRD §2.8: Statutory Verification — Dedicated Electrical (CEIG) & Labour (Form V / CLRA) Tracks */

export type StatutoryTrack = "Electrical" | "Labour";

export interface License {
  id: string;
  track: StatutoryTrack;
  type: string;
  licenseNo: string;
  authority: string;
  issuedDate: string;
  validTill: string;
  entity: string;
  entityType: "Company" | "Vendor" | "Subcontractor";
  status: "Valid" | "Expiring" | "Expired" | "Applied" | "Pending Client Form V";
  remarks?: string;
}

const INITIAL_STATUTORY_LICENSES: License[] = [
  // ── Track 1: Electrical Statutory (CEIG / Utility) ────────────────
  {
    id: "LIC-ELE-001",
    track: "Electrical",
    type: "Class A Electrical Contractor License",
    licenseNo: "MH/ELEC/CLASS-A/2026-992",
    authority: "Chief Electrical Inspector to Govt (CEIG), Maharashtra",
    issuedDate: "2024-04-10",
    validTill: "2027-03-31",
    entity: "Apar Industries Ltd",
    entityType: "Company",
    status: "Valid",
    remarks: "Valid across all 220kV/400kV transmission lines.",
  },
  {
    id: "LIC-ELE-002",
    track: "Electrical",
    type: "CEIG Statutory Work Commencement Clearance",
    licenseNo: "APP-CEIG-2026-081",
    authority: "CEIG Nagpur Division",
    issuedDate: "2026-10-18",
    validTill: "2027-10-17",
    entity: "Apar Industries Ltd",
    entityType: "Company",
    status: "Applied",
    remarks: "To be Applied. Expected to start procedures in 1st Week of November 2026.",
  },
  {
    id: "LIC-ELE-003",
    track: "Electrical",
    type: "Electrical Supervisor Competency Certificate",
    licenseNo: "SUP-CERT-4412",
    authority: "Licensing Board Maharashtra",
    issuedDate: "2023-08-15",
    validTill: "2028-08-14",
    entity: "Site Electrical Team",
    entityType: "Company",
    status: "Valid",
    remarks: "3 certified supervisors posted on Rajkot-Jetpur line.",
  },
  {
    id: "LIC-ELE-004",
    track: "Electrical",
    type: "PTCC Interconnection Clearance",
    licenseNo: "PTCC/WR/2026/044",
    authority: "Power & Telecom Coordination Committee",
    issuedDate: "2026-09-01",
    validTill: "2027-08-31",
    entity: "MSETCL / Apar",
    entityType: "Company",
    status: "Valid",
    remarks: "Clearance for crossing BSNL & railway optical lines.",
  },

  // ── Track 2: Labour Statutory (CLRA & Mobilization) ───────────────
  {
    id: "LIC-LAB-001",
    track: "Labour",
    type: "Principal Employer Form V (CLRA)",
    licenseNo: "PENDING-MSETCL",
    authority: "MSETCL (Client / Principal Employer)",
    issuedDate: "—",
    validTill: "—",
    entity: "Apar Industries Ltd",
    entityType: "Company",
    status: "Pending Client Form V",
    remarks: "Consultancy finalized. Vendor Registration & FORM V still pending from MSETCL.",
  },
  {
    id: "LIC-LAB-002",
    track: "Labour",
    type: "Contract Labour Regulation (CLRA) License (Form VI)",
    licenseNo: "APP-CLRA-2026-112",
    authority: "Office of the Labour Commissioner",
    issuedDate: "2026-10-20",
    validTill: "2027-10-19",
    entity: "Apar Industries Ltd",
    entityType: "Company",
    status: "Applied",
    remarks: "Expected to start the procedures in 1st Week of November 2026 upon Form V receipt.",
  },
  {
    id: "LIC-LAB-003",
    track: "Labour",
    type: "Workmen Compensation (WC) Insurance Policy",
    licenseNo: "WC-POLICY-HDFC-99412",
    authority: "HDFC ERGO General Insurance",
    issuedDate: "2026-09-15",
    validTill: "2027-09-14",
    entity: "All Site Gang Crews (150 Workers)",
    entityType: "Subcontractor",
    status: "Valid",
    remarks: "Covers all erection & stringing gang personnel up to ₹25 Lakhs per incident.",
  },
  {
    id: "LIC-LAB-004",
    track: "Labour",
    type: "BOCW Welfare Fund Registration & Cess",
    licenseNo: "BOCW/MH/2026/339",
    authority: "Building & Other Construction Workers Board",
    issuedDate: "2026-10-01",
    validTill: "2027-09-30",
    entity: "Rajkot-Jetpur Project Site",
    entityType: "Company",
    status: "Valid",
    remarks: "1% labour cess deposit receipt submitted to client.",
  },
];

const STATUS_V: Record<string, string> = {
  Valid: "success",
  Expiring: "warning",
  Expired: "danger",
  Applied: "primary",
  "Pending Client Form V": "warning"
};

function daysLeft(validTill: string) {
  if (!validTill || validTill === "—") return 999;
  return Math.round((new Date(validTill).getTime() - Date.now()) / 86400000);
}

export default function StatutoryVerification() {
  const { canCreate, canRemove } = usePermission('4.12');
  const [activeTab, setActiveTab] = useState<"electrical" | "labour" | "all">("electrical");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [licenses, setLicenses] = usePersistentState<License[]>('epc_gp_licenses', INITIAL_STATUTORY_LICENSES);

  // Form state
  const [formTrack, setFormTrack] = useState<StatutoryTrack>("Electrical");
  const [formType, setFormType] = useState("");
  const [formEntity, setFormEntity] = useState("Apar Industries Ltd");
  const [formStatus, setFormStatus] = useState<License["status"]>("Applied");
  const [formLicNo, setFormLicNo] = useState("");
  const [formAuth, setFormAuth] = useState("");
  const [formIssued, setFormIssued] = useState(new Date().toISOString().split('T')[0]);
  const [formValidTill, setFormValidTill] = useState(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
  const [formRemarks, setFormRemarks] = useState("");

  const electricalLicenses = licenses.filter(l => l.track === "Electrical");
  const labourLicenses = licenses.filter(l => l.track === "Labour");

  const currentList = activeTab === "electrical" 
    ? electricalLicenses 
    : activeTab === "labour" 
    ? labourLicenses 
    : licenses;

  const filtered = useMemo(() => currentList.filter(l =>
    filterStatus === "All" || l.status === filterStatus
  ), [currentList, filterStatus]);

  const validCount = currentList.filter(l => l.status === "Valid").length;
  const appliedCount = currentList.filter(l => l.status === "Applied" || l.status === "Pending Client Form V").length;
  const expiredCount = currentList.filter(l => l.status === "Expired").length;

  const handleAddLicense = () => {
    if (!formType || !formAuth) return;
    const newLic: License = {
      id: `LIC-${formTrack.slice(0, 3).toUpperCase()}-${String(licenses.length + 1).padStart(3, '0')}`,
      track: formTrack,
      type: formType,
      licenseNo: formLicNo || "PENDING-ACK",
      authority: formAuth,
      issuedDate: formIssued,
      validTill: formValidTill,
      entity: formEntity,
      entityType: "Company",
      status: formStatus,
      remarks: formRemarks,
    };
    setLicenses([...licenses, newLic]);
    setShowForm(false);
    setFormType("");
    setFormLicNo("");
    setFormAuth("");
    setFormRemarks("");
  };

  const tabs = [
    { id: "electrical", label: `1. Electrical Statutory (${electricalLicenses.length})` },
    { id: "labour",     label: `2. Labour Statutory (${labourLicenses.length})` },
    { id: "all",        label: `All Clearances (${licenses.length})` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Statutory Clearances (BRD §2.8)" 
        description="2-Part Compliance Structure: Electrical (CEIG) & Labour (Form V / CLRA) for 60-Day Ground Break"
        action={canCreate ? { label: "+ Add Statutory Permit", onClick: () => setShowForm(true) } : undefined}
      />
      <ReadOnlyBanner moduleId="4.12" />

      {/* Track Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${activeTab === 'electrical' ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200' : 'bg-white border-slate-200'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Track A: Electrical Statutory Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">CEIG Contractor License · Supervisor Permits · PTCC Telecom Clearance</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs font-medium">
            <span className="text-green-700">● {electricalLicenses.filter(l => l.status === 'Valid').length} Active</span>
            <span className="text-amber-700">● {electricalLicenses.filter(l => l.status === 'Applied').length} In Process (Expected Nov 2026)</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${activeTab === 'labour' ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200' : 'bg-white border-slate-200'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600 text-white">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Track B: Labour Statutory Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">Form V from Client · CLRA Form VI License · Workmen Compensation (WC)</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs font-medium">
            <span className="text-green-700">● {labourLicenses.filter(l => l.status === 'Valid').length} Active</span>
            <span className="text-amber-700">● {labourLicenses.filter(l => l.status !== 'Valid').length} Pending Client Form V</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Monitored", value: String(currentList.length), color: "text-indigo-600 bg-indigo-50", icon: <FileText size={18}/> },
          { label: "Valid & Active", value: String(validCount), color: "text-green-600 bg-green-50", icon: <CheckCircle2 size={18}/> },
          { label: "Under Application", value: String(appliedCount), color: "text-amber-600 bg-amber-50", icon: <Clock size={18}/> },
          { label: "Expired / Blockers", value: String(expiredCount), color: "text-red-600 bg-red-50", icon: <AlertCircle size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className="text-xl font-bold text-slate-800">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as any)} />

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["All", "Valid", "Applied", "Pending Client Form V"].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterStatus === st 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">{filtered.length} clearances found</span>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Clearance / License Type</th>
                  <th className="px-4 py-3">Registration #</th>
                  <th className="px-4 py-3">Issuing Authority</th>
                  <th className="px-4 py-3">Validity</th>
                  <th className="px-4 py-3">Operational Status & Remarks</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {canRemove && <th className="px-4 py-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(l => {
                  const dl = daysLeft(l.validTill);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{l.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 text-xs">{l.type}</p>
                        <span className="text-[10px] text-slate-400">Entity: {l.entity}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{l.licenseNo}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{l.authority}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {l.validTill !== "—" ? l.validTill : <span className="text-slate-400">Awaiting LOA</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[280px]">
                        <p className="line-clamp-2">{l.remarks || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={STATUS_V[l.status] as any}>{l.status}</Badge>
                      </td>
                      {canRemove && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setLicenses(prev => prev.filter(x => x.id !== l.id))}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add Statutory Clearance</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Track *</label>
                  <select 
                    value={formTrack} 
                    onChange={e => setFormTrack(e.target.value as StatutoryTrack)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Electrical">Track A: Electrical Statutory (CEIG)</option>
                    <option value="Labour">Track B: Labour Statutory (Form V/CLRA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Applied">Applied / In Process</option>
                    <option value="Valid">Valid & Issued</option>
                    <option value="Pending Client Form V">Pending Client Form V</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Clearance / License Name *</label>
                <input 
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  placeholder="e.g. CEIG Clearance or CLRA Form VI"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Registration / Application #</label>
                  <input 
                    value={formLicNo}
                    onChange={e => setFormLicNo(e.target.value)}
                    placeholder="MH/ELEC/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Issuing Authority *</label>
                  <input 
                    value={formAuth}
                    onChange={e => setFormAuth(e.target.value)}
                    placeholder="e.g. CEIG Maharashtra / Labour Dept"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Remarks / Procedure Timeline</label>
                <input 
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                  placeholder="e.g. Procedures starting 1st week of November 2026"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddLicense} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Statutory Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
