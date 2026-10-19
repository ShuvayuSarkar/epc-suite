import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { usePermission } from '../../hooks/usePermission';
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Plus, Search, Filter, Pencil, Trash2, X, Trophy, FileText, Calendar,
  CheckCircle2, Clock, AlertCircle, TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─── BRD §4.2 Stage 1 — 5 discrete milestones ─── */
export interface Milestone {
  id: string;
  label: string;
  sla: string;           // BRD SLA description
  slaDays: number;       // business days
  completedDate: string | null;
  status: "done" | "overdue" | "pending" | "due_soon";
  notes: string;
}

export interface AwardRecord {
  awardId: string;
  bidId: string;
  projectName: string;
  client: string;
  awardDocType: "LOA" | "NOA" | "LOI"; // BRD 3.2 — auto from Client Master
  awardDocRef: string;
  awardValue: number;         // ₹ Lakhs
  projectType: string;
  receivedDate: string;
  milestones: {
    awardReceived: Milestone;
    acceptanceLetter: Milestone;
    kickoffMeeting: Milestone;
    cpbgCpg: Milestone;
    contractSigned: Milestone;
  };
  overallStatus: "In Progress" | "Completed" | "Overdue" | "On Hold";
  contractRef: string;
}

/* ─── SAMPLE DATA (BRD benchmarks: ack ≤3d, accept ≤7d, kickoff ≤14d, CPBG ≤7d, contract ≤15d) ─── */
export const MOCK_AWARDS: AwardRecord[] = [];

function milestonesDone(a: AwardRecord) {
  return Object.values(a.milestones).filter(m => m.status === "done").length;
}

const STATUS_VARIANT: Record<string, string> = {
  "In Progress":"warning", "Completed":"success", "Overdue":"danger", "On Hold":"secondary"
};
const DOC_TYPE_COLOR: Record<string, string> = {
  LOA: "bg-blue-100 text-blue-700", NOA: "bg-purple-100 text-purple-700", LOI: "bg-teal-100 text-teal-700"
};

import { usePersistentState } from "../../hooks/usePersistentState";

export default function AwardList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.10');
  const [awards, setAwards] = usePersistentState<AwardRecord[]>('epc_awards', MOCK_AWARDS);
  const [editRow, setEditRow] = React.useState<any>(null);
  const [deleteRow, setDeleteRow] = React.useState<any>(null);
  const confirmDelete = () => { if (!deleteRow) return; setAwards(prev => prev.filter(a => a.awardId !== deleteRow.awardId)); setDeleteRow(null); };
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDocType, setFilterDocType] = useState("All");

  const filtered = useMemo(() => awards.filter(a => {
    const q = search.toLowerCase();
    return (
      (!q || a.awardId.toLowerCase().includes(q) || a.projectName.toLowerCase().includes(q) || a.client.toLowerCase().includes(q) || a.awardDocRef.toLowerCase().includes(q)) &&
      (filterClient === "All" || a.client === filterClient) &&
      (filterStatus === "All" || a.overallStatus === filterStatus) &&
      (filterDocType === "All" || a.awardDocType === filterDocType)
    );
  }), [awards, search, filterClient, filterStatus, filterDocType]);

  const clients = [...new Set(awards.map(a => a.client))];
  const completedCount = awards.filter(a => a.overallStatus === "Completed").length;
  const inProgressCount = awards.filter(a => a.overallStatus === "In Progress").length;
  const totalValue = awards.reduce((s, a) => s + a.awardValue, 0);

  const milestoneBarData = [
    { name: "Award\nReceived", done: awards.filter(a => a.milestones.awardReceived.status==="done").length },
    { name: "Acceptance\nLetter",  done: awards.filter(a => a.milestones.acceptanceLetter.status==="done").length },
    { name: "Kick-Off\nMeeting",   done: awards.filter(a => a.milestones.kickoffMeeting.status==="done").length },
    { name: "CPBG/CPG",            done: awards.filter(a => a.milestones.cpbgCpg.status==="done").length },
    { name: "Contract\nSigned",    done: awards.filter(a => a.milestones.contractSigned.status==="done").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Award Receipt & Acceptance (Stage 1)" />
        <Button onClick={() => navigate("/award/new")} className="flex items-center gap-2">
          <Plus size={16}/> Log New Award
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Awards",      value: String(MOCK_AWARDS.length), icon:<Trophy size={20}/>,      color:"text-indigo-600 bg-indigo-50" },
          { label:"Completed",         value: String(completedCount),     icon:<CheckCircle2 size={20}/>, color:"text-green-600 bg-green-50"   },
          { label:"In Progress",       value: String(inProgressCount),    icon:<Clock size={20}/>,        color:"text-amber-600 bg-amber-50"   },
          { label:"Total Award Value", value:`₹${(totalValue/100).toFixed(1)} Cr`, icon:<TrendingUp size={20}/>, color:"text-slate-700 bg-slate-100" },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {/* Milestone Completion Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Milestone Completion Across All Awards (BRD §4.2)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={milestoneBarData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
            <XAxis dataKey="name" tick={{ fontSize:10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize:11 }} domain={[0, MOCK_AWARDS.length]} />
            <Tooltip formatter={(v: number) => [`${v} / ${MOCK_AWARDS.length} awards`, "Completed"]} />
            <Bar dataKey="done" radius={[4,4,0,0]}>
              {milestoneBarData.map((entry, i) => (
                <Cell key={i} fill={entry.done === MOCK_AWARDS.length ? "#22c55e" : entry.done >= 2 ? "#f59e0b" : "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Award ID, project, client, doc ref..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-slate-400"/>
          {[
            { val:filterClient,  set:setFilterClient,  label:"All Clients",   opts:clients },
            { val:filterStatus,  set:setFilterStatus,  label:"All Statuses",  opts:["In Progress","Completed","Overdue","On Hold"] },
            { val:filterDocType, set:setFilterDocType, label:"All Doc Types",  opts:["LOA","NOA","LOI"] },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="All">{f.label}</option>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} / {MOCK_AWARDS.length}</span>
      </Card>

      {/* Award Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-slate-400">No awards match your filters.</Card>
        )}
        {filtered.map(a => {
          const done = milestonesDone(a);
          const pct = Math.round((done / 5) * 100);
          const milArr = Object.values(a.milestones) as Milestone[];
          return (
            <Card key={a.awardId}
              className="p-5 hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300"
              onClick={() => navigate(`/award/${a.awardId}`)}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-indigo-600 font-semibold">{a.awardId}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${DOC_TYPE_COLOR[a.awardDocType]}`}>{a.awardDocType}</span>
                    <Badge variant={STATUS_VARIANT[a.overallStatus] as any}>{a.overallStatus}</Badge>
                    <span className="text-xs text-slate-400">{a.client}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{a.projectName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ref: {a.awardDocRef} | Received: {a.receivedDate} | Value: ₹{(a.awardValue/100).toFixed(1)} Cr</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{pct}%</p>
                    <p className="text-xs text-slate-400">{done}/5 milestones</p>
                  </div>
                  {(canUpdate || canRemove) && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      {canUpdate && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditRow(a); }}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                          title="Edit Award"
                        >
                          <Pencil size={15}/>
                        </button>
                      )}
                      {canRemove && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteRow(a); }}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                          title="Delete Award"
                        >
                          <Trash2 size={15}/>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Milestone Progress Rail */}
              <div className="mt-4 flex items-center gap-1 overflow-x-auto">
                {milArr.map((m, i) => {
                  const done = m.status === "done";
                  const overdue = m.status === "overdue";
                  const dueSoon = m.status === "due_soon";
                  const nextUnfinished = milArr.findIndex(mx => mx.status !== "done") === i;
                  return (
                    <React.Fragment key={m.id}>
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done?"bg-green-500 border-green-500 text-white":overdue?"bg-red-500 border-red-500 text-white":dueSoon?"bg-amber-400 border-amber-400 text-white":nextUnfinished?"border-indigo-400 text-indigo-600 bg-white animate-pulse":"border-slate-200 text-slate-400 bg-slate-50"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight max-w-[60px]">{m.label.split(" ").slice(0,2).join(" ")}</span>
                      </div>
                      {i < 4 && <div className={`flex-1 h-0.5 min-w-[16px] ${done && milArr[i+1].status==="done"?"bg-green-400":done?"bg-amber-300":"bg-slate-200"}`}/>}
                    </React.Fragment>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDeleteDialog open={!!deleteRow} recordName={deleteRow ? (deleteRow.awardDocRef ?? deleteRow.awardId ?? '') : ''} recordType="award" onConfirm={confirmDelete} onCancel={() => setDeleteRow(null)} />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Award — {editRow.awardId}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Project Name</label><input value={editRow.projectName} onChange={e => setEditRow({ ...editRow, projectName: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Client</label><input value={editRow.client} onChange={e => setEditRow({ ...editRow, client: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Doc Ref</label><input value={editRow.awardDocRef} onChange={e => setEditRow({ ...editRow, awardDocRef: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select value={editRow.overallStatus} onChange={e => setEditRow({ ...editRow, overallStatus: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {["In Progress", "Completed", "Overdue", "On Hold"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => { setAwards(prev => prev.map(a => a.awardId === editRow.awardId ? editRow : a)); setEditRow(null); }} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
