import React, { useState, useMemo } from "react";
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { CheckCircle2, AlertCircle, Clock, Plus, FileText, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

/* BRD §2.8: Statutory verification — factory/PCB/labor/vehicle licenses */
const LICENSE_TYPES = ["Factory License","PCB Consent to Operate","PCB Consent to Establish","Labor License (Contractor)","Vehicle Fitness Certificate","Pollution Certificate","Fire NOC","Electrical Inspector Certificate","State EB NOC","PTCC Approval"] as const;

interface License {
  id: string; type: typeof LICENSE_TYPES[number];
  licenseNo: string; authority: string;
  issuedDate: string; validTill: string;
  entity: string; entityType: "Company"|"Vendor";
  status: "Valid"|"Expiring"|"Expired"|"Applied";
}

const MOCK_LICENSES: License[] = [];

const VENDORS = ["Apar Industries Ltd","KEC International","Shrikant Constructions"];
const STATUS_V: Record<string,string> = { Valid:"success", Expiring:"warning", Expired:"danger", Applied:"primary" };

function daysLeft(validTill: string) {
  return Math.round((new Date(validTill).getTime() - Date.now()) / 86400000);
}

import { usePersistentState } from '../../hooks/usePersistentState';

export default function StatutoryVerification() {
  const { canCreate, canRemove } = usePermission('4.12');
  const [activeTab, setActiveTab] = useState("licenses");
  const [filterEntity, setFilterEntity] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [licenses, setLicenses] = usePersistentState<License[]>('epc_gp_licenses', MOCK_LICENSES);

  // Form state
  const [formType, setFormType] = useState<typeof LICENSE_TYPES[number]>(LICENSE_TYPES[0]);
  const [formEntity, setFormEntity] = useState(VENDORS[0]);
  const [formStatus, setFormStatus] = useState<"Valid"|"Expiring"|"Expired"|"Applied">("Valid");
  const [formLicNo, setFormLicNo] = useState("");
  const [formAuth, setFormAuth] = useState("");
  const [formIssued, setFormIssued] = useState(new Date().toISOString().split('T')[0]);
  const [formValidTill, setFormValidTill] = useState(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);

  const filtered = useMemo(() => licenses.filter(l =>
    (filterEntity === "All" || l.entity === filterEntity) &&
    (filterType === "All" || l.type === filterType) &&
    (filterStatus === "All" || l.status === filterStatus)
  ), [licenses, filterEntity, filterType, filterStatus]);

  const validCount   = licenses.filter(l => l.status==="Valid").length;
  const expiringCount= licenses.filter(l => l.status==="Expiring").length;
  const expiredCount = licenses.filter(l => l.status==="Expired").length;

  const vendorRag = VENDORS.map(v => {
    const vLics = licenses.filter(l => l.entity === v);
    const hasExpired = vLics.some(l => l.status === "Expired");
    const hasExpiring = vLics.some(l => l.status === "Expiring");
    return { vendor: v, rag: hasExpired ? "Red" : hasExpiring ? "Amber" : "Green", count: vLics.length, expired: vLics.filter(l=>l.status==="Expired").length, expiring: vLics.filter(l=>l.status==="Expiring").length };
  });

  const barData = [...new Set(licenses.map(l => l.type.split("(")[0].trim().slice(0,22)))].map(t => ({
    type: t, valid: licenses.filter(l => l.type.startsWith(t) && l.status==="Valid").length,
    expiring: licenses.filter(l => l.type.startsWith(t) && l.status==="Expiring").length,
    expired: licenses.filter(l => l.type.startsWith(t) && l.status==="Expired").length,
  })).filter(d => d.valid+d.expiring+d.expired > 0);

  const tabs = [{ id:"licenses",label:"License Register" },{ id:"vendor",label:"Vendor Compliance" },{ id:"renewal",label:"Renewal Calendar" }];

  return (
    <div className="space-y-6">
      <PageHeader title="Statutory Verification (BRD §2.8)" />
        <ReadOnlyBanner moduleId="4.12" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Licenses",  value:String(licenses.length),      color:"text-indigo-600 bg-indigo-50",  icon:<FileText size={20}/> },
          { label:"Valid",           value:String(validCount),           color:"text-green-600 bg-green-50",    icon:<CheckCircle2 size={20}/> },
          { label:"Expiring Soon",   value:String(expiringCount),        color:"text-amber-600 bg-amber-50",    icon:<Clock size={20}/> },
          { label:"Expired",         value:String(expiredCount),         color:"text-red-600 bg-red-50",        icon:<AlertCircle size={20}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>
      {expiredCount > 0 && (
        <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5"/>
          <div>
            <p className="font-semibold text-red-800">⛔ Critical: {expiredCount} Expired License(s) Detected</p>
            <p className="text-sm text-red-700 mt-0.5">Vendors with expired statutory licenses cannot receive new POs until renewed. Immediate action required.</p>
          </div>
        </div>
      )}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "licenses" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { val:filterEntity, set:setFilterEntity, label:"All Entities", opts:VENDORS },
              { val:filterType,   set:setFilterType,   label:"All Types",   opts:[...LICENSE_TYPES] },
              { val:filterStatus, set:setFilterStatus, label:"All Statuses",opts:["Valid","Expiring","Expired","Applied"] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="text-xs text-slate-500 ml-auto">{filtered.length}/{licenses.length}</span>
            {canCreate && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/> Add License</Button>
            )}
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["ID","Type","License No.","Authority","Issued","Valid Till","Days Left","Entity","Status","Actions"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(l => {
                    const dl = daysLeft(l.validTill);
                    return (
                      <tr key={l.id} className={`hover:bg-slate-50 ${l.status==="Expired"?"bg-red-50/40":l.status==="Expiring"?"bg-amber-50/40":""}`}>
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{l.id}</td>
                        <td className="px-3 py-3 text-xs text-slate-700 max-w-[150px] truncate" title={l.type}>{l.type}</td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-600">{l.licenseNo}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 max-w-[140px] truncate" title={l.authority}>{l.authority}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{l.issuedDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{l.validTill}</td>
                        <td className={`px-3 py-3 text-xs font-bold ${dl<0?"text-red-700":dl<90?"text-amber-700":"text-green-700"}`}>{dl<0?"EXPIRED":dl+"d"}</td>
                        <td className="px-3 py-3 text-xs text-slate-700">{l.entity}<span className="ml-1 text-[10px] text-slate-400">({l.entityType})</span></td>
                        <td className="px-3 py-3"><Badge variant={STATUS_V[l.status] as any}>{l.status}</Badge></td>
                        <td className="px-3 py-3 text-right">
                          {canRemove && (
                            <button
                              onClick={() => setLicenses(prev => prev.filter(x => x.id !== l.id))}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete License"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {activeTab === "vendor" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Traffic-light compliance view per vendor. Red = expired license, Amber = expiring, Green = all valid.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendorRag.map(v => (
              <Card key={v.vendor} className={`p-5 border-2 ${v.rag==="Red"?"border-red-400 bg-red-50":v.rag==="Amber"?"border-amber-400 bg-amber-50":"border-green-400 bg-green-50"}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm">{v.vendor}</h3>
                  <span className={`w-4 h-4 rounded-full ${v.rag==="Red"?"bg-red-500":v.rag==="Amber"?"bg-amber-500":"bg-green-500"}`}/>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-600">Total licenses</span><span className="font-semibold">{v.count}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Expired</span><span className={`font-semibold ${v.expired>0?"text-red-700":"text-slate-600"}`}>{v.expired}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Expiring soon</span><span className={`font-semibold ${v.expiring>0?"text-amber-700":"text-slate-600"}`}>{v.expiring}</span></div>
                </div>
                {v.rag === "Red" && <p className="mt-3 text-xs text-red-700 font-semibold">⛔ Cannot issue PO until expired licenses renewed</p>}
                {v.rag === "Amber" && <p className="mt-3 text-xs text-amber-700 font-semibold">⚠️ Renew expiring licenses within 30 days</p>}
                {v.rag === "Green" && <p className="mt-3 text-xs text-green-700 font-semibold">✅ Fully compliant — PO can be issued</p>}
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Compliance by License Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top:4, right:8, left:-20, bottom:40 }}>
                <XAxis dataKey="type" tick={{ fontSize:9 }} angle={-30} textAnchor="end"/>
                <YAxis tick={{ fontSize:11 }} allowDecimals={false}/>
                <Tooltip/>
                <Legend/>
                <Bar dataKey="valid" stackId="a" fill="#22c55e" name="Valid"/>
                <Bar dataKey="expiring" stackId="a" fill="#f59e0b" name="Expiring"/>
                <Bar dataKey="expired" stackId="a" fill="#ef4444" name="Expired" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === "renewal" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Upcoming license renewals grouped by month.</p>
          {["September 2026","October 2026","November 2026"].map(month => {
            const ml = licenses.filter(l => {
              const d = new Date(l.validTill);
              return d.toLocaleString("en-IN",{month:"long",year:"numeric"}) === month;
            });
            return ml.length > 0 ? (
              <Card key={month} className="p-5">
                <h3 className="font-semibold text-slate-700 mb-3">{month}</h3>
                <div className="space-y-2">
                  {ml.map(l => (
                    <div key={l.id} className={`flex items-center gap-3 p-3 rounded-lg border ${l.status==="Expired"?"bg-red-50 border-red-200":l.status==="Expiring"?"bg-amber-50 border-amber-200":"bg-slate-50 border-slate-200"}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{l.type}</p>
                        <p className="text-[10px] text-slate-500">{l.entity} · {l.licenseNo}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">Expires: {l.validTill}</p>
                        <Badge variant={STATUS_V[l.status] as any}>{l.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null;
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Add Statutory License</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">License Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {LICENSE_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Entity</label>
                <select
                  value={formEntity}
                  onChange={e => setFormEntity(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {VENDORS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {["Valid", "Expiring", "Expired", "Applied"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">License No.</label>
                <input
                  type="text"
                  placeholder="e.g. CG/FL/2026/0892"
                  value={formLicNo}
                  onChange={e => setFormLicNo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Inspector of Factories"
                  value={formAuth}
                  onChange={e => setFormAuth(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={formIssued}
                    onChange={e => setFormIssued(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Valid Till</label>
                  <input
                    type="date"
                    value={formValidTill}
                    onChange={e => setFormValidTill(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={() => {
                  const newLic: License = {
                    id: `LIC-${String(licenses.length + 1).padStart(3, '0')}`,
                    type: formType,
                    licenseNo: formLicNo || `LIC-GEN-${Date.now().toString().slice(-4)}`,
                    authority: formAuth || 'Statutory Authority',
                    issuedDate: formIssued,
                    validTill: formValidTill,
                    entity: formEntity,
                    entityType: formEntity === 'Apar Industries Ltd' ? 'Company' : 'Vendor',
                    status: formStatus
                  };
                  setLicenses(prev => [newLic, ...prev]);
                  setShowForm(false);
                  setFormLicNo("");
                  setFormAuth("");
                }}
              >
                Save License
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

