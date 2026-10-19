import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { usePermission } from '../../hooks/usePermission';
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Plus, Search, Filter, Pencil, Trash2, X, TrendingUp,
  Trophy, XCircle, Clock, AlertCircle, BarChart2, FileText
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export const CLIENT_MASTER: Record<string, { awardDocType: string; slaSet: string; refFormat: string; paymentTerms: string; retentionPct: number }> = {
  NTPC:       { awardDocType: "LOA", slaSet: "NTPC-Standard",        refFormat: "AIL/BRD/MKT/{FY}/LOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  PGCIL:      { awardDocType: "LOA", slaSet: "PowerGrid-Standard",   refFormat: "AIL/BRD/MKT/{FY}/LOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  IndiGrid:   { awardDocType: "LOI", slaSet: "IndiGrid-Standard",    refFormat: "AIL/BRD/MKT/{FY}/LOI/{SEQ}", paymentTerms: "70/30", retentionPct: 5 },
  MSETCL:     { awardDocType: "NOA", slaSet: "MSETCL-Standard",      refFormat: "AIL/BRD/MKT/{FY}/NOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  TSECL:      { awardDocType: "LOI", slaSet: "TSECL-Standard",       refFormat: "AIL/BRD/MKT/{FY}/LOI/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  MPPTCL:     { awardDocType: "NOA", slaSet: "MPPTCL-Standard",      refFormat: "AIL/BRD/MKT/{FY}/NOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  TANTRANSCO: { awardDocType: "LOA", slaSet: "TANTRANSCO-Standard",  refFormat: "AIL/BRD/MKT/{FY}/LOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
  KPTCL:      { awardDocType: "LOA", slaSet: "KPTCL-Standard",       refFormat: "AIL/BRD/MKT/{FY}/LOA/{SEQ}", paymentTerms: "80/20", retentionPct: 5 },
};

export const PROJECT_TYPES = [
  { code: "A", name: "HTLS Reconductoring (Line only)",   scope: "Survey → Conductor Stringing → T&C" },
  { code: "B", name: "Reconductoring + Bay Augmentation", scope: "Adds substation bay supply & erection" },
  { code: "C", name: "Turnkey Uprating",                  scope: "Adds civil, tower & foundation works" },
  { code: "D", name: "OPGW / Fibre-Optic",               scope: "OPGW cable, FOTE, SDH, Repeater Shelters" },
  { code: "E", name: "Hybrid",                            scope: "Combines any two templates" },
];

export interface BidRecord {
  bidId: string;
  projectName: string;
  client: string;
  type: string;
  scope?: string;
  bidValue: number;
  submittedDate: string;
  deadline: string;
  daysBeforeDeadline: number;
  submittedBy: string;
  l1Status: string;
  internalSignOff: string;
  notes: string;
  costEstimate: {
    manufactured: number;
    buyout: number;
    service: number;
    bayAugmentation: number;
    civil: number;
    mandatorySpares: number;
    overheads: number;
  };
  competitorBids: { rank: string; bidder: string; amount: number }[];
  [key: string]: any;
}

export const MOCK_BIDS: BidRecord[] = [];

const L1_VARIANT: Record<string, string> = { Won: "success", Lost: "danger", Awaiting: "warning", Draft: "secondary" };
const PIE_COLORS = ["#22c55e","#ef4444","#f59e0b","#94a3b8"];
const fmt = (v: number) => `${(v / 100).toFixed(1)} Cr`;

import { usePersistentState } from "../../hooks/usePersistentState";

export default function BidList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [bids, setBids] = usePersistentState<typeof MOCK_BIDS>('epc_bids', MOCK_BIDS);
  const [editRow, setEditRow] = React.useState<any>(null);
  const [deleteRow, setDeleteRow] = React.useState<any>(null);
  const confirmDelete = () => { if (!deleteRow) return; setBids(prev => prev.filter(b => b.bidId !== deleteRow.bidId)); setDeleteRow(null); };
  const navigate = useNavigate();
  const [search, setSearch]           = useState("");
  const [filterClient, setFilterClient] = useState("All");
  const [filterType, setFilterType]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = useMemo(() => bids.filter(b => {
    const q = search.toLowerCase();
    return (
      (!q || b.bidId.toLowerCase().includes(q) || b.projectName.toLowerCase().includes(q) || b.client.toLowerCase().includes(q)) &&
      (filterClient === "All" || b.client === filterClient) &&
      (filterType === "All" || b.type === filterType.replace("Type ","")) &&
      (filterStatus === "All" || b.l1Status === filterStatus)
    );
  }), [bids, search, filterClient, filterType, filterStatus]);

  const wonBids   = bids.filter(b => b.l1Status === "Won");
  const submittedBids = bids.filter(b => b.l1Status !== "Draft");
  const winRate   = submittedBids.length ? ((wonBids.length / submittedBids.length) * 100).toFixed(0) : "0";
  const totalVal  = bids.reduce((s, b) => s + b.bidValue, 0);
  const wonVal    = wonBids.reduce((s, b) => s + b.bidValue, 0);

  const pieData = [
    { name: "Won",      value: bids.filter(b => b.l1Status === "Won").length },
    { name: "Lost",     value: bids.filter(b => b.l1Status === "Lost").length },
    { name: "Awaiting", value: bids.filter(b => b.l1Status === "Awaiting").length },
    { name: "Draft",    value: bids.filter(b => b.l1Status === "Draft").length },
  ];

  const clientBarData = Object.entries(
    bids.reduce((acc, b) => { acc[b.client] = (acc[b.client] || 0) + b.bidValue; return acc; }, {} as Record<string,number>)
  ).map(([client, value]) => ({ client, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Bidding & Tender Management" />
        <Button onClick={() => navigate("/bidding/new")} className="flex items-center gap-2">
          <Plus size={16} /> Log New Tender
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bids",      value: String(MOCK_BIDS.length),   icon: <FileText size={20} />,  color: "text-indigo-600 bg-indigo-50" },
          { label: "Win Rate",        value: `${winRate}%`,              icon: <Trophy size={20} />,    color: "text-green-600 bg-green-50"   },
          { label: "Total Bid Value", value: `${fmt(totalVal)}`,          icon: <BarChart2 size={20} />, color: "text-slate-700 bg-slate-100"  },
          { label: "Won Value",       value: `${fmt(wonVal)}`,            icon: <TrendingUp size={20} />,color: "text-green-600 bg-green-50"   },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 flex items-center gap-4">
            <div className={`${kpi.color} p-2 rounded-lg`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Bid Outcome Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Bid Value by Client (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={clientBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="client" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()} L`, "Bid Value"]} />
              <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-3 items-center bg-white">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Bid ID, project, client..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {[
            { value: filterClient, set: setFilterClient, label: "All Clients", opts: Object.keys(CLIENT_MASTER) },
            { value: filterType,   set: setFilterType,   label: "All Types",   opts: ["Type A","Type B","Type C","Type D","Type E"] },
            { value: filterStatus, set: setFilterStatus, label: "All Statuses",opts: ["Won","Lost","Awaiting","Draft"] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="All">{f.label}</option>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} / {MOCK_BIDS.length} bids</span>
      </Card>

      {/* Bid Table */}
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Bid ID","Project Name","Client","Type","Bid Value","Deadline","Days Before Deadline","L1 Status","Competitor Ranking", ...(canUpdate || canRemove ? ["Actions"] : [""])].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No bids match your filters.</td></tr>
            )}
            {filtered.map(bid => (
              <tr key={bid.bidId} className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/bidding/${bid.bidId}`)}>
                <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-semibold whitespace-nowrap">{bid.bidId}</td>
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                  <div className="truncate" title={bid.projectName}>{bid.projectName}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{bid.client}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">Type {bid.type}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">₹{fmt(bid.bidValue)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{bid.deadline || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {bid.daysBeforeDeadline >= 2
                    ? <span className="text-green-700 text-xs flex items-center gap-1"><TrendingUp size={12}/>{bid.daysBeforeDeadline}d ✅</span>
                    : <span className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={12}/>{bid.daysBeforeDeadline}d ⚠️</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={L1_VARIANT[bid.l1Status] as any}>{bid.l1Status}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {bid.competitorBids.length > 0 ? (
                    <div className="text-xs space-y-0.5">
                      {bid.competitorBids.slice(0,2).map((c: any) => (
                        <div key={c.rank} className={`flex gap-1 ${c.rank==="L1"?"text-green-700 font-semibold":c.rank==="L2"?"text-amber-700":"text-slate-500"}`}>
                          <span className="font-mono w-5 shrink-0">{c.rank}</span>
                          <span className="truncate max-w-[90px]" title={c.bidder}>{c.bidder}</span>
                          {c.amount > 0 && <span className="ml-auto shrink-0">₹{c.amount.toLocaleString()}L</span>}
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-slate-400 text-xs italic">Pending</span>}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Link to={`/bidding/${bid.bidId}`} className="text-indigo-600 hover:underline text-xs font-medium">View →</Link>
                    {(canUpdate || canRemove) && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                        {canUpdate && <button onClick={() => setEditRow(bid)} className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600" title="Edit"><Pencil size={13}/></button>}
                        {canRemove && <button onClick={() => setDeleteRow(bid)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><Trash2 size={13}/></button>}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDeleteDialog open={!!deleteRow} recordName={deleteRow ? (deleteRow.bidId ?? '') : ''} recordType="bid" onConfirm={confirmDelete} onCancel={() => setDeleteRow(null)} />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Bid — {editRow.bidId}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Project Name</label><input value={editRow.projectName} onChange={e => setEditRow({ ...editRow, projectName: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Client</label><input value={editRow.client} onChange={e => setEditRow({ ...editRow, client: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Bid Value (₹ Lakh)</label><input type="number" value={editRow.bidValue} onChange={e => setEditRow({ ...editRow, bidValue: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"/></div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">L1 Status</label>
                <select value={editRow.l1Status} onChange={e => setEditRow({ ...editRow, l1Status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {["Won", "Lost", "Awaiting", "Draft"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => { setBids(prev => prev.map(b => b.bidId === editRow.bidId ? editRow : b)); setEditRow(null); }} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
