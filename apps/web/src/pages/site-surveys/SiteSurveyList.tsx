import React, { useState, useMemo } from "react";
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { MapPin, Search, Filter, Plus, CheckCircle2, Clock, AlertCircle, Navigation, Pencil, Trash2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

/* ─── BRD §2.1: GPS-tagged site surveys ─── */
interface Survey {
  id: string; project: string; segment: string;
  type: "Conductor" | "OPGW" | "Tower" | "Route";
  totalKm: number; gpsPoints: number; accuracy: "±2m" | "±5m" | "±10m";
  startGps: string; endGps: string; conductorType: string;
  towerCount: number; surveyor: string; date: string;
  status: "Draft" | "In Progress" | "Submitted" | "Client Approved" | "Rejected";
  notes: string;
}

const MOCK_SURVEYS: Survey[] = [];

const STATUS_VARIANT: Record<string,string> = {
  "Client Approved":"success","Submitted":"warning","In Progress":"primary","Draft":"secondary","Rejected":"danger"
};
const TYPE_COLOR: Record<string,string> = {
  Conductor:"bg-indigo-100 text-indigo-700", OPGW:"bg-teal-100 text-teal-700",
  Tower:"bg-orange-100 text-orange-700", Route:"bg-slate-100 text-slate-700"
};
const ACC_COLOR: Record<string,string> = { "±2m":"text-green-600","±5m":"text-amber-600","±10m":"text-red-600" };

function validateGps(lat: string, lng: string): string | null {
  const la = parseFloat(lat); const lo = parseFloat(lng);
  if (isNaN(la)||isNaN(lo)) return "Enter valid coordinates";
  if (la < 8 || la > 37) return "Latitude must be 8°–37° N (India)";
  if (lo < 68 || lo > 97) return "Longitude must be 68°–97° E (India)";
  return null;
}

import { usePersistentState } from '../../hooks/usePersistentState';

export default function SiteSurveyList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.4');
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [surveys, setSurveys] = usePersistentState<Survey[]>('epc_surveys', MOCK_SURVEYS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [editRow, setEditRow] = useState<Survey | null>(null);
  const [deleteRow, setDeleteRow] = useState<Survey | null>(null);

  const confirmDelete = () => {
    if (!deleteRow) return;
    setSurveys(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setSurveys(prev => prev.map(s => s.id === editRow.id ? editRow : s));
    setEditRow(null);
  };

  /* Form state */
  const [fProject, setFProject] = useState(""); const [fSegment, setFSegment] = useState("");
  const [fType, setFType] = useState<Survey["type"]>("Conductor");
  const [fStartLat, setFStartLat] = useState(""); const [fStartLng, setFStartLng] = useState("");
  const [fEndLat, setFEndLat] = useState(""); const [fEndLng, setFEndLng] = useState("");
  const [fKm, setFKm] = useState(""); const [fConductor, setFConductor] = useState("");
  const [fTowers, setFTowers] = useState(""); const [fSurveyor, setFSurveyor] = useState("");
  const [fDate, setFDate] = useState(""); const [fNotes, setFNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const projects = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    return Array.from(new Set([...list, ...surveys.map(s => s.project)].filter(Boolean)));
  }, [storedProjects, surveys]);

  const filtered = useMemo(() => surveys.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.id.toLowerCase().includes(q) || s.project.toLowerCase().includes(q) || s.segment.toLowerCase().includes(q) || s.surveyor.toLowerCase().includes(q)) &&
      (filterProject === "All" || s.project === filterProject) &&
      (filterType === "All" || s.type === filterType) &&
      (filterStatus === "All" || s.status === filterStatus);
  }), [surveys, search, filterProject, filterType, filterStatus]);

  const approved = surveys.filter(s => s.status === "Client Approved").length;
  const totalKm = surveys.reduce((s,x) => s + x.totalKm, 0).toFixed(1);
  const gpsTagged = surveys.filter(s => s.gpsPoints > 0).length;
  const gpsTaggedPct = Math.round((gpsTagged / surveys.length) * 100);

  const barData = projects.map(p => {
    const ps = surveys.filter(s => s.project === p);
    const done = ps.filter(s => s.status === "Client Approved").reduce((a,s) => a+s.totalKm, 0);
    const pending = ps.filter(s => s.status !== "Client Approved").reduce((a,s) => a+s.totalKm, 0);
    return { name: p.slice(0,14), done: parseFloat(done.toFixed(1)), pending: parseFloat(pending.toFixed(1)) };
  });

  const handleSubmit = () => {
    const startErr = validateGps(fStartLat, fStartLng);
    const endErr = validateGps(fEndLat, fEndLng);
    if (startErr) { setFormError("Start GPS: " + startErr); return; }
    if (endErr) { setFormError("End GPS: " + endErr); return; }
    if (!fProject || !fSegment || !fKm || !fSurveyor || !fDate) { setFormError("Fill all required fields."); return; }
    const newSrv: Survey = {
      id: `SRV-2026-${String(surveys.length + 1).padStart(3,"0")}`,
      project: fProject, segment: fSegment, type: fType,
      totalKm: parseFloat(fKm), gpsPoints: Math.round(parseFloat(fKm)*22),
      accuracy: "±2m", startGps: `${fStartLat}° N, ${fStartLng}° E`,
      endGps: `${fEndLat}° N, ${fEndLng}° E`, conductorType: fConductor,
      towerCount: parseInt(fTowers)||0, surveyor: fSurveyor, date: fDate,
      status: "Draft", notes: fNotes,
    };
    setSurveys(prev => [...prev, newSrv]);
    setToast(`Survey ${newSrv.id} logged successfully!`);
    setShowForm(false); setFormError("");
    setTimeout(() => setToast(""), 4000);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl font-medium">{toast}</div>}

      <div className="flex items-center justify-between">
        <PageHeader title="Site Surveys — GPS-Tagged (BRD §2.1)" />
        <ReadOnlyBanner moduleId="4.4" />
        <Button onClick={() => { setShowForm(true); setFormError(""); }} className="flex items-center gap-2">
          <Plus size={16}/> Log New Survey
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon:<MapPin size={20}/>,       label:"Total Surveys",       value:String(surveys.length),        color:"text-indigo-600 bg-indigo-50" },
          { icon:<CheckCircle2 size={20}/>, label:"Client Approved",      value:String(approved),              color:"text-green-600 bg-green-50" },
          { icon:<Navigation size={20}/>,   label:"Total Route (km)",     value:`${totalKm} km`,               color:"text-blue-600 bg-blue-50" },
          { icon:<Clock size={20}/>,        label:"GPS-Tagged %",         value:`${gpsTaggedPct}%`,            color: gpsTaggedPct >= 80 ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50" },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Survey Progress — km Approved vs Pending by Project</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
            <XAxis dataKey="name" tick={{ fontSize:11 }} />
            <YAxis tick={{ fontSize:11 }} unit="km"/>
            <Tooltip formatter={(v: number, n: string) => [`${v} km`, n === "done" ? "Approved" : "Pending"]} />
            <Legend formatter={v => v === "done" ? "Client Approved" : "Pending"} />
            <Bar dataKey="done" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
            <Bar dataKey="pending" stackId="a" fill="#e2e8f0" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID, project, segment, surveyor..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <Filter size={16} className="text-slate-400"/>
        {[
          { val:filterProject, set:setFilterProject, label:"All Projects",  opts:projects },
          { val:filterType,    set:setFilterType,    label:"All Types",     opts:["Conductor","OPGW","Tower","Route"] },
          { val:filterStatus,  set:setFilterStatus,  label:"All Statuses",  opts:["Draft","In Progress","Submitted","Client Approved","Rejected"] },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="All">{f.label}</option>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="text-xs text-slate-500 ml-auto">{filtered.length}/{surveys.length}</span>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Survey ID","Project","Segment","Type","Total KM","GPS Points","GPS Accuracy","Surveyor","Date","Status","Actions"].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs text-indigo-600 font-semibold">{s.id}</td>
                  <td className="px-3 py-3 text-slate-700 text-xs max-w-[130px] truncate" title={s.project}>{s.project}</td>
                  <td className="px-3 py-3 text-slate-600 text-xs max-w-[150px] truncate" title={s.segment}>{s.segment}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLOR[s.type]}`}>{s.type}</span></td>
                  <td className="px-3 py-3 font-medium text-slate-800">{s.totalKm} km</td>
                  <td className="px-3 py-3 text-slate-600">{s.gpsPoints > 0 ? s.gpsPoints.toLocaleString() : "—"}</td>
                  <td className={`px-3 py-3 font-medium text-xs ${ACC_COLOR[s.accuracy]}`}>{s.gpsPoints > 0 ? s.accuracy : "—"}</td>
                  <td className="px-3 py-3 text-slate-700">{s.surveyor}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{s.date}</td>
                  <td className="px-3 py-3"><Badge variant={STATUS_VARIANT[s.status] as any}>{s.status}</Badge></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-0.5">
                      {canUpdate && <button onClick={() => setEditRow(s)} title="Edit survey" className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={13}/></button>}
                      {canRemove && <button onClick={() => setDeleteRow(s)} title="Delete survey" className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>}
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </Card>

      {/* New Survey Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Log New GPS Survey (BRD §2.1)</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{formError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Project <span className="text-red-500">*</span></label>
                <select value={fProject} onChange={e => setFProject(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">— Select —</option>
                  {projects.map(p => <option key={p}>{p}</option>)}
                  <option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Segment Description <span className="text-red-500">*</span></label>
                <input value={fSegment} onChange={e => setFSegment(e.target.value)} placeholder="e.g. Sec-3 T113–T180" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Survey Type</label>
                <select value={fType} onChange={e => setFType(e.target.value as Survey["type"])} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {["Conductor","OPGW","Tower","Route"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Length (km) <span className="text-red-500">*</span></label>
                <input type="number" value={fKm} onChange={e => setFKm(e.target.value)} placeholder="e.g. 45.5" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Start GPS — Latitude (°N) <span className="text-red-500">*</span></label>
                <input value={fStartLat} onChange={e => setFStartLat(e.target.value)} placeholder="e.g. 21.7842 (India: 8–37)" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Start GPS — Longitude (°E) <span className="text-red-500">*</span></label>
                <input value={fStartLng} onChange={e => setFStartLng(e.target.value)} placeholder="e.g. 83.1220 (India: 68–97)" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">End GPS — Latitude (°N) <span className="text-red-500">*</span></label>
                <input value={fEndLat} onChange={e => setFEndLat(e.target.value)} placeholder="e.g. 22.1450" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">End GPS — Longitude (°E) <span className="text-red-500">*</span></label>
                <input value={fEndLng} onChange={e => setFEndLng(e.target.value)} placeholder="e.g. 83.5200" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Conductor / Cable Type</label>
                <input value={fConductor} onChange={e => setFConductor(e.target.value)} placeholder="e.g. HTLS ACSR Drake" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tower Count</label>
                <input type="number" value={fTowers} onChange={e => setFTowers(e.target.value)} placeholder="0" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Surveyor Name <span className="text-red-500">*</span></label>
                <input value={fSurveyor} onChange={e => setFSurveyor(e.target.value)} placeholder="e.g. Rajesh Nair" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Survey Date <span className="text-red-500">*</span></label>
                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Hotspot Flags</label>
                <textarea rows={2} value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="ROW issues, crop patches, forest patches, utility conflicts..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
              <Button onClick={handleSubmit}>Submit Survey</Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow ? deleteRow.id : ''}
        recordType="site survey"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Survey</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              {(['project','segment','surveyor','date','notes'] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">{k}</label>
                  <input 
                    value={(editRow[k] as string) || ''} 
                    onChange={e => setEditRow({ ...editRow, [k]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
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
