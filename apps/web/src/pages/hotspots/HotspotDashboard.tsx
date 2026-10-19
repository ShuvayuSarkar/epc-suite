import React, { useState, useMemo } from "react";
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { AlertCircle, CheckCircle2, Clock, MapPin, Search, Filter, Plus, User } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

/* BRD §2.2: 7 hotspot categories; §2.5: risk register; §2.6: sales-exec visit log */
const HS_CATEGORIES = ["ROW (Right of Way)","Forest Clearance","Crop Compensation","Utility Shifting","Shutdown Approvals","Client/Utility Delay","Force Majeure"] as const;
type HsCategory = typeof HS_CATEGORIES[number];
const RISK_LEVELS = ["High","Medium","Low"] as const;
const SALES_EXECS = ["Rahul Sharma","Priya Patel","Amit Singh","Neha Gupta","Vikram Tiwari"];
const PROJECTS = ["NTPC Lara 400kV","IndiGrid Bhopal–Dhule","MSETCL A'bad Bay","PGCIL NER-II"];

interface Hotspot {
  id: string; project: string; location: string; segment: string;
  category: HsCategory; risk: "High"|"Medium"|"Low";
  status: "Open"|"In Progress"|"Resolved"|"Escalated";
  salesExec: string; nextVisit: string; daysOpen: number;
  eta: string; gps: string; notes: string;
  mitigation: string; escalationPath: string;
}

interface Visit {
  visitId: string; hotspotId: string; salesExec: string; date: string;
  mode: "Site"|"Virtual"|"Phone"; discussion: string;
  actionPromised: string; nextVisit: string;
  outcome: "Positive"|"Neutral"|"Negative";
}

const MOCK_HS: Hotspot[] = [
  { id:"HS-401", project:"NTPC Lara 400kV", location:"Loc T22–T27, Raipur District", segment:"Sec-1", category:"Crop Compensation", risk:"High", status:"In Progress", salesExec:"Rahul Sharma", nextVisit:"2026-09-28", daysOpen:32, eta:"2026-10-15", gps:"21.82°N 83.22°E", notes:"Farmer refusal at T24 (2.4 acre wheat crop). Compensation formula disputed.", mitigation:"District Collector mediation arranged. Alternative alignment studied.", escalationPath:"PM → PD → Client RO → State Revenue Dept" },
  { id:"HS-402", project:"NTPC Lara 400kV", location:"T78–T80, Forest Patch 200m", segment:"Sec-2", category:"Forest Clearance", risk:"High", status:"Open", salesExec:"Priya Patel", nextVisit:"2026-09-25", daysOpen:18, eta:"2026-11-30", gps:"22.05°N 83.38°E", notes:"200m crossing through Reserved Forest. MoEFCC Stage-I approval pending.", mitigation:"DFO NOC applied. Compensatory afforestation plan submitted.", escalationPath:"PM → Legal Head → Client Forestry Cell → MoEFCC" },
  { id:"HS-403", project:"NTPC Lara 400kV", location:"Highway NH-30 crossing, T55", segment:"Sec-1", category:"Utility Shifting", risk:"Medium", status:"Resolved", salesExec:"Amit Singh", nextVisit:"—", daysOpen:45, eta:"2026-09-05", gps:"21.91°N 83.32°E", notes:"NHAI permission obtained. Stringing permit issued.", mitigation:"Resolved: NHAI clearance + traffic management plan approved.", escalationPath:"—" },
  { id:"HS-404", project:"IndiGrid Bhopal–Dhule", location:"T98–T102, Village Pithampur", segment:"Sec-2", category:"ROW (Right of Way)", risk:"High", status:"Escalated", salesExec:"Neha Gupta", nextVisit:"2026-09-27", daysOpen:54, eta:"2026-10-31", gps:"22.61°N 75.69°E", notes:"5 landowners blocking tower access. Legal notices served.", mitigation:"Legal team pursuing land access under Electricity Act 2003 S.67.", escalationPath:"PD → Client Legal → State Electricity Regulatory Commission" },
  { id:"HS-405", project:"IndiGrid Bhopal–Dhule", location:"T61, Forest Boundary", segment:"Sec-1", category:"Forest Clearance", risk:"High", status:"In Progress", salesExec:"Vikram Tiwari", nextVisit:"2026-09-30", daysOpen:45, eta:"2026-11-15", gps:"22.72°N 75.88°E", notes:"Forest boundary marker dispute. Additional survey by Forest Dept required.", mitigation:"Joint survey with DFO scheduled. Pre-clearance notification issued.", escalationPath:"PM → Legal Head → DFO Indore" },
  { id:"HS-406", project:"MSETCL A'bad Bay", location:"Bay-4 Shutdown Coordination", segment:"220kV Bay", category:"Shutdown Approvals", risk:"Medium", status:"In Progress", salesExec:"Rahul Sharma", nextVisit:"2026-10-05", daysOpen:8, eta:"2026-10-20", gps:"23.02°N 72.57°E", notes:"MSETCL O&M shutdown window: max 12 hours. Coordination with regional grid SLDC.", mitigation:"Shutdown application submitted to SLDC. Night-window preferred.", escalationPath:"PM → Client O&M → SLDC Gujarat" },
  { id:"HS-407", project:"PGCIL NER-II", location:"T40–T55, Hill Section", segment:"Sec-A", category:"Force Majeure", risk:"Low", status:"Resolved", salesExec:"Amit Singh", nextVisit:"—", daysOpen:20, eta:"2025-09-30", gps:"25.79°N 85.56°E", notes:"Flood-season restriction lifted. Survey resumption completed.", mitigation:"Resolved: post-monsoon survey completed successfully.", escalationPath:"—" },
  { id:"HS-408", project:"NTPC Lara 400kV", location:"T35, Grid substation delay", segment:"Sec-1", category:"Client/Utility Delay", risk:"Medium", status:"Open", salesExec:"Priya Patel", nextVisit:"2026-10-01", daysOpen:12, eta:"2026-10-31", gps:"21.86°N 83.27°E", notes:"NTPC ROT clearance for hot-line stringing delayed by 3 weeks.", mitigation:"EOT claim being prepared. Compensation under Force Majeure clause reviewed.", escalationPath:"PM → Client RE → NTPC Project Division" },
];

const MOCK_VISITS: Visit[] = [
  { visitId:"VIS-001", hotspotId:"HS-401", salesExec:"Rahul Sharma", date:"2026-09-20", mode:"Site", discussion:"Met with 3 farmers at T24. Compensation table presented. Farmer demanded 30% premium.", actionPromised:"Escalate to District Collector; revised offer to be submitted.", nextVisit:"2026-09-28", outcome:"Neutral" },
  { visitId:"VIS-002", hotspotId:"HS-401", salesExec:"Rahul Sharma", date:"2026-09-13", mode:"Site", discussion:"Initial farm visit. Crop area measured (2.4 acre). Dispute on rate per sq.ft.", actionPromised:"Get SDM valuation report.", nextVisit:"2026-09-20", outcome:"Negative" },
  { visitId:"VIS-003", hotspotId:"HS-402", salesExec:"Priya Patel", date:"2026-09-19", mode:"Virtual", discussion:"Call with DFO office. Stage-I application acknowledged. Awaiting field inspection date.", actionPromised:"Follow up on inspection date; provide GPS coordinates.", nextVisit:"2026-09-25", outcome:"Positive" },
  { visitId:"VIS-004", hotspotId:"HS-404", salesExec:"Neha Gupta", date:"2026-09-18", mode:"Site", discussion:"Landowners still blocking. Legal notice delivered but refused by 2 owners.", actionPromised:"Legal team to file Magistrate order.", nextVisit:"2026-09-27", outcome:"Negative" },
  { visitId:"VIS-005", hotspotId:"HS-404", salesExec:"Neha Gupta", date:"2026-09-10", mode:"Phone", discussion:"Telephonic discussion with village head. Willing to talk if compensation increased.", actionPromised:"Present enhanced package. Arrange village meeting.", nextVisit:"2026-09-18", outcome:"Neutral" },
  { visitId:"VIS-006", hotspotId:"HS-406", salesExec:"Rahul Sharma", date:"2026-09-21", mode:"Virtual", discussion:"SLDC Gujarat pre-coordination call. Shutdown window: Oct 18-19 (weekend).", actionPromised:"Submit shutdown protection scheme drawing.", nextVisit:"2026-10-05", outcome:"Positive" },
  { visitId:"VIS-007", hotspotId:"HS-405", salesExec:"Vikram Tiwari", date:"2026-09-17", mode:"Site", discussion:"Accompanied DFO team to T61. Boundary map prepared jointly.", actionPromised:"Submit revised route alignment avoiding 50m into forest.", nextVisit:"2026-09-30", outcome:"Positive" },
  { visitId:"VIS-008", hotspotId:"HS-408", salesExec:"Priya Patel", date:"2026-09-22", mode:"Phone", discussion:"NTPC ROT cell: clearance expected after Oct 10 load dispatch approval.", actionPromised:"Prepare EOT notification letter.", nextVisit:"2026-10-01", outcome:"Neutral" },
];

const CAT_COLORS: Record<string,string> = {
  "ROW (Right of Way)":"#ef4444","Forest Clearance":"#22c55e","Crop Compensation":"#f59e0b",
  "Utility Shifting":"#3b82f6","Shutdown Approvals":"#8b5cf6","Client/Utility Delay":"#f97316","Force Majeure":"#64748b"
};
const STATUS_V: Record<string,string> = { Open:"warning", "In Progress":"primary", Resolved:"success", Escalated:"danger" };
const RISK_COLOR: Record<string,string> = { High:"text-red-700 bg-red-100", Medium:"text-amber-700 bg-amber-100", Low:"text-green-700 bg-green-100" };
const OUT_COLOR: Record<string,string> = { Positive:"text-green-700", Neutral:"text-amber-700", Negative:"text-red-700" };

import { usePersistentState } from '../../hooks/usePersistentState';

export default function HotspotDashboard() {
  const [hotspots, setHotspots] = usePersistentState<Hotspot[]>('epc_hotspots', MOCK_HS);
  const [visits, setVisits] = usePersistentState<Visit[]>('epc_hotspot_visits', MOCK_VISITS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);

  const [activeTab, setActiveTab] = useState("register");
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [showHsForm, setShowHsForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);

  // Form states for new hotspot
  const [newHs, setNewHs] = useState<Partial<Hotspot>>({
    location: '', segment: 'Sec-1', gps: '', eta: '', project: '',
    category: 'Crop Compensation', risk: 'High', salesExec: 'Rahul Sharma',
    mitigation: '', escalationPath: '', notes: '', status: 'Open'
  });

  // Form states for new visit
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    hotspotId: '', date: new Date().toISOString().split('T')[0],
    nextVisit: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    salesExec: 'Rahul Sharma', mode: 'Site', outcome: 'Positive', discussion: '', actionPromised: ''
  });

  const projectOptions = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    if (list.length > 0) return Array.from(new Set(list));
    return PROJECTS;
  }, [storedProjects]);

  const filteredHs = useMemo(() => hotspots.filter(h =>
    (!search || h.id.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase())) &&
    (filterProject === "All" || h.project === filterProject) &&
    (filterCat === "All" || h.category === filterCat) &&
    (filterStatus === "All" || h.status === filterStatus) &&
    (filterRisk === "All" || h.risk === filterRisk)
  ), [hotspots, search, filterProject, filterCat, filterStatus, filterRisk]);

  const pieData = HS_CATEGORIES.map(c => ({
    name: c.replace(" (Right of Way)","").replace("Client/Utility Delay","Utility Delay"),
    value: hotspots.filter(h => h.category === c).length
  })).filter(d => d.value > 0);

  const visitPie = [
    { name:"Positive", value: visits.filter(v => v.outcome==="Positive").length },
    { name:"Neutral",  value: visits.filter(v => v.outcome==="Neutral").length },
    { name:"Negative", value: visits.filter(v => v.outcome==="Negative").length },
  ];
  const weekVisits = [
    { week:"Sep W1", visits: Math.min(visits.length, 2) },
    { week:"Sep W2", visits: Math.min(Math.max(0, visits.length - 2), 3) },
    { week:"Sep W3", visits: Math.min(Math.max(0, visits.length - 5), 2) },
    { week:"Sep W4", visits: Math.max(0, visits.length - 7) },
  ];
  const tabs = [
    { id:"register", label:"Hotspot Register" },
    { id:"visits",   label:"Sales-Exec Visits" },
    { id:"risk",     label:"Risk Register" },
    { id:"analytics",label:"Analytics" },
  ];

  const handleAddHotspot = () => {
    const id = `HS-${Math.floor(400 + Math.random() * 500)}`;
    const defaultProject = projectOptions[0] || 'Transmission Project';
    const created: Hotspot = {
      id,
      project: newHs.project || defaultProject,
      location: newHs.location || 'Site Location',
      segment: newHs.segment || 'Sec-1',
      category: (newHs.category as HsCategory) || 'Crop Compensation',
      risk: (newHs.risk as any) || 'High',
      status: (newHs.status as any) || 'Open',
      salesExec: newHs.salesExec || 'Rahul Sharma',
      nextVisit: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      daysOpen: 1,
      eta: newHs.eta || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      gps: newHs.gps || '21.82°N 83.22°E',
      notes: newHs.notes || '',
      mitigation: newHs.mitigation || 'District Collector mediation arranged.',
      escalationPath: newHs.escalationPath || 'PM → PD → Client RO'
    };
    setHotspots(prev => [created, ...prev]);
    setShowHsForm(false);
    setNewHs({
      location: '', segment: 'Sec-1', gps: '', eta: '', project: projectOptions[0] || '',
      category: 'Crop Compensation', risk: 'High', salesExec: 'Rahul Sharma',
      mitigation: '', escalationPath: '', notes: '', status: 'Open'
    });
  };

  const handleLogVisit = () => {
    const visitId = `VIS-${String(visits.length + 1).padStart(3, '0')}`;
    const created: Visit = {
      visitId,
      hotspotId: newVisit.hotspotId || (hotspots[0]?.id || 'HS-401'),
      salesExec: newVisit.salesExec || 'Rahul Sharma',
      date: newVisit.date || new Date().toISOString().split('T')[0],
      mode: (newVisit.mode as any) || 'Site',
      discussion: newVisit.discussion || 'Discussion held on site',
      actionPromised: newVisit.actionPromised || 'Action initiated',
      nextVisit: newVisit.nextVisit || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      outcome: (newVisit.outcome as any) || 'Neutral'
    };
    setVisits(prev => [created, ...prev]);
    setShowVisitForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Hotspot & Blockage Register (BRD §2.2 / 2.5 / 2.6)" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Hotspots",  value:String(hotspots.length),                                               color:"text-indigo-600 bg-indigo-50",  icon:<MapPin size={20}/> },
          { label:"Resolved",        value:String(hotspots.filter(h=>h.status==="Resolved").length),              color:"text-green-600 bg-green-50",    icon:<CheckCircle2 size={20}/> },
          { label:"In Progress",     value:String(hotspots.filter(h=>h.status==="In Progress").length),           color:"text-amber-600 bg-amber-50",    icon:<Clock size={20}/> },
          { label:"Escalated / Open",value:String(hotspots.filter(h=>h.status==="Escalated"||h.status==="Open").length), color:"text-red-600 bg-red-50",icon:<AlertCircle size={20}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── HOTSPOT REGISTER ── */}
      {activeTab === "register" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{filteredHs.length}/{hotspots.length} hotspots shown</span>
            <Button onClick={() => setShowHsForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/> Add Hotspot</Button>
          </div>
          <Card className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or location..."
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
            </div>
            <Filter size={14} className="text-slate-400"/>
            {[
              { val:filterProject, set:setFilterProject, label:"All Projects",   opts:projectOptions },
              { val:filterCat,     set:setFilterCat,     label:"All Categories", opts:[...HS_CATEGORIES] },
              { val:filterStatus,  set:setFilterStatus,  label:"All Statuses",   opts:["Open","In Progress","Resolved","Escalated"] },
              { val:filterRisk,    set:setFilterRisk,    label:"All Risk Levels",opts:["High","Medium","Low"] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-2 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{["ID","Location","Category","Risk","Status","Sales-Exec","Next Visit","Days Open","ETA"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHs.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600 font-semibold">{h.id}</td>
                      <td className="px-3 py-3 max-w-[160px]">
                        <p className="text-slate-700 text-xs font-medium truncate" title={h.location}>{h.location}</p>
                        <p className="text-[10px] text-slate-400">{h.gps}</p>
                      </td>
                      <td className="px-3 py-3"><span style={{ backgroundColor: CAT_COLORS[h.category]+"20", color: CAT_COLORS[h.category] }} className="px-2 py-0.5 rounded text-[10px] font-semibold">{h.category.split("(")[0].trim()}</span></td>
                      <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_COLOR[h.risk]}`}>{h.risk}</span></td>
                      <td className="px-3 py-3"><Badge variant={STATUS_V[h.status] as any}>{h.status}</Badge></td>
                      <td className="px-3 py-3 text-xs text-slate-700 flex items-center gap-1"><User size={12}/>{h.salesExec}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{h.nextVisit}</td>
                      <td className={`px-3 py-3 text-xs font-bold ${h.daysOpen > 30 ? "text-red-600" : h.daysOpen > 14 ? "text-amber-600" : "text-slate-700"}`}>{h.daysOpen}d</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{h.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── SALES EXEC VISITS ── */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Weekly Visit Log — Sales Executives (BRD §2.6)</h3>
            <Button onClick={() => setShowVisitForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/> Log Visit</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Visits per Week</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weekVisits} margin={{ top:4, right:8, left:-24, bottom:0 }}>
                  <XAxis dataKey="week" tick={{ fontSize:11 }}/><YAxis tick={{ fontSize:11 }}/>
                  <Tooltip/><Bar dataKey="visits" fill="#6366f1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Visit Outcome Distribution</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={visitPie} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {visitPie.map((_, i) => <Cell key={i} fill={["#22c55e","#f59e0b","#ef4444"][i]}/>)}
                </Pie><Tooltip/></PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200"><tr>
                  {["Visit ID","Hotspot","Sales-Exec","Date","Mode","Key Discussion","Action Promised","Next Visit","Outcome"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map(v => (
                    <tr key={v.visitId} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-xs text-indigo-600">{v.visitId}</td>
                      <td className="px-3 py-3 text-xs font-medium text-indigo-500">{v.hotspotId}</td>
                      <td className="px-3 py-3 text-xs text-slate-700">{v.salesExec}</td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{v.date}</td>
                      <td className="px-3 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{v.mode}</span></td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-[180px] truncate" title={v.discussion}>{v.discussion}</td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-[160px] truncate" title={v.actionPromised}>{v.actionPromised}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{v.nextVisit}</td>
                      <td className={`px-3 py-3 text-xs font-semibold ${OUT_COLOR[v.outcome]}`}>{v.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── RISK REGISTER ── */}
      {activeTab === "risk" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Risk matrix: all open/in-progress hotspots with mitigation plans and escalation paths (BRD §2.5).</p>
          {hotspots.filter(h => h.status !== "Resolved").map(h => (
            <Card key={h.id} className={`p-5 border-l-4 ${h.risk==="High"?"border-red-500":h.risk==="Medium"?"border-amber-400":"border-green-400"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-indigo-600 font-semibold">{h.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_COLOR[h.risk]}`}>{h.risk} Risk</span>
                  <Badge variant={STATUS_V[h.status] as any}>{h.status}</Badge>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1"><User size={12}/>{h.salesExec}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 mb-1">{h.location}</p>
              <p className="text-xs text-slate-500 mb-3">Category: <span className="font-medium" style={{ color: CAT_COLORS[h.category] }}>{h.category}</span> · Days Open: <span className={h.daysOpen>30?"font-bold text-red-600":"font-bold text-slate-700"}>{h.daysOpen}d</span> · ETA: {h.eta}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Mitigation Plan</p>
                  <p className="text-xs text-slate-700">{h.mitigation}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Escalation Path</p>
                  <p className="text-xs text-slate-700">{h.escalationPath}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Hotspots by Category (BRD 7 Types)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} label={({ name,value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((entry,i) => <Cell key={i} fill={Object.values(CAT_COLORS)[i]}/>)}
              </Pie><Tooltip/><Legend wrapperStyle={{ fontSize:"11px" }}/></PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Days Open — All Active Hotspots</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hotspots.filter(h=>h.status!=="Resolved").map(h=>({ id:h.id, days:h.daysOpen }))} layout="vertical" margin={{ top:4, right:8, left:20, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:10 }}/><YAxis type="category" dataKey="id" tick={{ fontSize:10 }} width={55}/>
                <Tooltip formatter={(v: number) => [`${v} days`,"Days Open"]}/>
                <Bar dataKey="days" radius={[0,4,4,0]}>
                  {hotspots.filter(h=>h.status!=="Resolved").map((h,i) => <Cell key={i} fill={h.daysOpen>30?"#ef4444":h.daysOpen>14?"#f59e0b":"#22c55e"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Add Hotspot Modal */}
      {showHsForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h3 className="font-semibold text-slate-800">Add Hotspot</h3><button onClick={()=>setShowHsForm(false)} className="text-slate-400 text-xl">×</button></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                <input type="text" placeholder="Location description" value={newHs.location} onChange={e => setNewHs(p => ({ ...p, location: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Segment</label>
                <input type="text" placeholder="e.g. Sec-1" value={newHs.segment} onChange={e => setNewHs(p => ({ ...p, segment: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">GPS</label>
                <input type="text" placeholder="lat,lng" value={newHs.gps} onChange={e => setNewHs(p => ({ ...p, gps: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Resolution Date</label>
                <input type="date" value={newHs.eta} onChange={e => setNewHs(p => ({ ...p, eta: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
                <select value={newHs.project} onChange={e => setNewHs(p => ({ ...p, project: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {projectOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select value={newHs.category} onChange={e => setNewHs(p => ({ ...p, category: e.target.value as HsCategory }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {HS_CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Risk Level</label>
                <select value={newHs.risk} onChange={e => setNewHs(p => ({ ...p, risk: e.target.value as any }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {["High","Medium","Low"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sales-Exec</label>
                <select value={newHs.salesExec} onChange={e => setNewHs(p => ({ ...p, salesExec: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {SALES_EXECS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end"><button onClick={()=>setShowHsForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600">Cancel</button><Button onClick={handleAddHotspot}>Add Hotspot</Button></div>
          </Card>
        </div>
      )}

      {/* Log Visit Modal */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h3 className="font-semibold text-slate-800">Log Sales-Exec Visit</h3><button onClick={()=>setShowVisitForm(false)} className="text-slate-400 text-xl">×</button></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Hotspot</label>
                <select value={newVisit.hotspotId || hotspots[0]?.id} onChange={e => setNewVisit(p => ({ ...p, hotspotId: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {hotspots.map(h => <option key={h.id} value={h.id}>{h.id} — {h.location}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Visit Date</label>
                <input type="date" value={newVisit.date} onChange={e => setNewVisit(p => ({ ...p, date: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Next Visit</label>
                <input type="date" value={newVisit.nextVisit} onChange={e => setNewVisit(p => ({ ...p, nextVisit: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sales-Exec</label>
                <select value={newVisit.salesExec} onChange={e => setNewVisit(p => ({ ...p, salesExec: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {SALES_EXECS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mode</label>
                <select value={newVisit.mode} onChange={e => setNewVisit(p => ({ ...p, mode: e.target.value as any }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {["Site","Virtual","Phone"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Outcome</label>
                <select value={newVisit.outcome} onChange={e => setNewVisit(p => ({ ...p, outcome: e.target.value as any }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {["Positive","Neutral","Negative"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Key Discussion</label>
                <textarea rows={2} placeholder="Discussion points..." value={newVisit.discussion} onChange={e => setNewVisit(p => ({ ...p, discussion: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Action Promised</label>
                <textarea rows={2} placeholder="What was committed..." value={newVisit.actionPromised} onChange={e => setNewVisit(p => ({ ...p, actionPromised: e.target.value }))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
              </div>
            </div>
            <div className="flex gap-3 justify-end"><button onClick={()=>setShowVisitForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600">Cancel</button><Button onClick={handleLogVisit}>Log Visit</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}
