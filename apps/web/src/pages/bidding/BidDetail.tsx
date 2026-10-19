import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { MOCK_BIDS, CLIENT_MASTER, PROJECT_TYPES } from "./BidList";
import { Trophy, TrendingDown, TrendingUp, AlertCircle, FileText, DollarSign, Users, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

const COST_LABELS: Record<string, string> = {
  manufactured: "Manufactured",
  buyout: "Buyout",
  service: "Service",
  bayAugmentation: "Bay Augmentation",
  civil: "Civil Works",
  mandatorySpares: "Mandatory Spares",
  overheads: "Overheads",
};
const COST_COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#64748b"];

const L1_VARIANT: Record<string, string> = { Won:"success", Lost:"danger", Awaiting:"warning", Draft:"secondary" };

import { usePersistentState } from "../../hooks/usePersistentState";

export default function BidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [bids] = usePersistentState<typeof MOCK_BIDS>('epc_bids', MOCK_BIDS);
  const bid = bids.find(b => b.bidId === id);

  if (!bid) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">Bid not found: {id}</p>
        <button onClick={() => navigate("/bidding")} className="mt-4 text-indigo-600 hover:underline text-sm">← Back to Bids</button>
      </div>
    );
  }

  const clientConfig = CLIENT_MASTER[bid.client];
  const projectType  = PROJECT_TYPES.find(p => p.code === bid.type);
  const totalCost    = Object.values(bid.costEstimate).reduce((s, v) => s + v, 0);
  const sparesRatio  = totalCost > 0 ? ((bid.costEstimate.mandatorySpares / totalCost) * 100).toFixed(1) : "0";
  const l1 = bid.competitorBids.find(c => c.rank === "L1");
  const l2 = bid.competitorBids.find(c => c.rank === "L2");

  const pieData = Object.entries(bid.costEstimate)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: COST_LABELS[k] || k, value: v }));

  const barData = bid.competitorBids.filter(c => c.amount > 0).map(c => ({
    rank: c.rank, bidder: c.bidder.slice(0, 12), amount: c.amount
  }));

  const tabs = [
    { id: "overview",   label: "Overview" },
    { id: "cost",       label: "Cost Breakdown" },
    { id: "l1status",   label: "L1/L2/L3 Status" },
    { id: "approval",   label: "Approval Chain" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate("/bidding")} className="text-sm text-slate-400 hover:text-slate-600 mb-1">← Back to Bids</button>
          <PageHeader title={bid.projectName} />
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-sm text-indigo-600 font-semibold">{bid.bidId}</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">Type {bid.type}</span>
            <Badge variant={L1_VARIANT[bid.l1Status] as any}>{bid.l1Status}</Badge>
            <span className="text-slate-500 text-sm">{bid.client}</span>
          </div>
        </div>
        <Button onClick={() => navigate(`/bidding/new`)} className="shrink-0">+ New Bid</Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <DollarSign size={20}/>, label: "Bid Value",    value: `₹${(bid.bidValue/100).toFixed(1)} Cr`, color:"text-indigo-600 bg-indigo-50" },
          { icon: <Calendar size={20}/>,  label: "Deadline",      value: bid.deadline || "TBD",                 color:"text-slate-700 bg-slate-100" },
          { icon: <FileText size={20}/>,  label: "Award Doc Type",value: clientConfig?.awardDocType || "—",     color:"text-blue-600 bg-blue-50" },
          { icon: <Users size={20}/>,     label: "Days Before Deadline", value: `${bid.daysBeforeDeadline}d`, color: bid.daysBeforeDeadline >= 2 ? "text-green-600 bg-green-50":"text-red-600 bg-red-50" },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`${k.color} p-2 rounded-lg`}>{k.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className="font-bold text-slate-800">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-slate-700">Bid Details</h3>
            {[
              ["Client",         bid.client],
              ["Award Doc Type", clientConfig?.awardDocType || "—"],
              ["SLA Set",        clientConfig?.slaSet || "—"],
              ["Payment Terms",  clientConfig?.paymentTerms || "—"],
              ["Retention %",    clientConfig ? `${clientConfig.retentionPct}%` : "—"],
              ["Ref Format",     clientConfig?.refFormat || "—"],
              ["Project Type",   `Type ${bid.type} — ${projectType?.name || ""}`],
              ["Submitted Date", bid.submittedDate || "—"],
              ["Deadline",       bid.deadline],
              ["Approved By",    bid.submittedBy],
              ["Internal Sign-Off", bid.internalSignOff || "—"],
            ].map(([k,v]) => (
              <div key={k} className="flex text-sm gap-2 border-b border-slate-100 pb-1 last:border-0">
                <span className="text-slate-500 w-36 shrink-0">{k}</span>
                <span className="font-medium text-slate-800">{v}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-slate-700">Project Type Info</h3>
            {projectType && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-indigo-700 mb-1">Type {projectType.code}</p>
                <p className="font-medium text-slate-800 mb-1">{projectType.name}</p>
                <p className="text-sm text-slate-500">{projectType.scope}</p>
              </div>
            )}
            {bid.notes && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Notes / Bid Strategy</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded p-3">{bid.notes}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── COST BREAKDOWN ── */}
      {activeTab === "cost" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Cost by Category (₹ Lakhs)</h3>
            <div className="space-y-2">
              {Object.entries(bid.costEstimate).map(([k, v], i) => {
                const pct = totalCost > 0 ? ((v / totalCost) * 100).toFixed(0) : "0";
                return v > 0 ? (
                  <div key={k} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-36 text-xs">{COST_LABELS[k] || k}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width:`${pct}%`, backgroundColor: COST_COLORS[i % COST_COLORS.length] }} />
                    </div>
                    <span className="w-8 text-xs text-slate-500 text-right">{pct}%</span>
                    <span className="w-20 text-right font-medium text-slate-800">₹{v.toLocaleString()}L</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span className="text-indigo-700">₹{totalCost.toLocaleString()}L</span>
              </div>
              <div className="text-xs text-slate-500 flex justify-between pt-1">
                <span>Mandatory Spares Ratio</span>
                <span className={parseFloat(sparesRatio)>=5&&parseFloat(sparesRatio)<=10?"text-green-600 font-medium":"text-amber-600 font-medium"}>
                  {sparesRatio}% {parseFloat(sparesRatio)>=5&&parseFloat(sparesRatio)<=10?"✅ (5–10% BRD req.)":"⚠️ (BRD: 5–10%)"}
                </span>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-700 mb-2">Cost Pie Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}L`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── L1/L2/L3 STATUS ── */}
      {activeTab === "l1status" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Competitor Ranking</h3>
            {bid.competitorBids.length > 0 ? (
              <div className="space-y-3">
                {bid.competitorBids.map((c, i) => {
                  const isUs = c.bidder === "Apar Industries";
                  const diff = l1 && c.amount && l1.amount ? c.amount - l1.amount : 0;
                  return (
                    <div key={c.rank} className={`rounded-lg border p-4 ${isUs?"border-indigo-400 bg-indigo-50":"border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${i===0?"text-green-700":i===1?"text-amber-700":"text-slate-500"}`}>{c.rank}</span>
                          <span className="font-medium text-slate-800">{c.bidder}</span>
                          {isUs && <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-medium">Us</span>}
                        </div>
                        <span className="font-bold text-slate-800">₹{c.amount.toLocaleString()}L</span>
                      </div>
                      {i > 0 && l1 && c.amount > 0 && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {diff > 0
                            ? <><TrendingDown size={12} className="text-red-500"/> ₹{diff.toLocaleString()}L ({((diff/l1.amount)*100).toFixed(1)}%) above L1</>
                            : <><TrendingUp size={12} className="text-green-500"/> L1</>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Result not yet declared.</p>
            )}
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">Overall Status</p>
              <Badge variant={L1_VARIANT[bid.l1Status] as any} className="mt-1">
                {bid.l1Status === "Won" && <Trophy size={12}/>} {bid.l1Status}
              </Badge>
            </div>
          </Card>
          {barData.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-slate-700 mb-2">Bid Amount Comparison (₹ Lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                  <XAxis dataKey="bidder" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}L`, "Bid Amount"]} />
                  <Bar dataKey="amount" radius={[4,4,0,0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.rank === "L1" ? "#22c55e" : entry.rank === "L2" ? "#f59e0b" : "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* ── APPROVAL CHAIN ── */}
      {activeTab === "approval" && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-700">BRD §5 Approval Matrix — Bidding Stage</h3>
          <div className="space-y-3">
            {[
              { step:"1", role:"Finance Manager / CFO", trigger:"Bid cost estimation sign-off", sla:"5 days before submission deadline", client:"No",  status:"✅ Signed" },
              { step:"2", role:"CTO",                   trigger:"Technical proposal sign-off",  sla:"5 days before submission deadline", client:"No",  status:"✅ Signed" },
              { step:"3", role:"CEO / MD",              trigger:"Final bid submission approval", sla:"2 days before submission deadline", client:"No",  status: bid.submittedDate ? "✅ Signed" : "🔵 Pending" },
              { step:"4", role:"Project Director",      trigger:"L1 status confirmation",        sla:"1 day of result",                  client:"No",  status: bid.l1Status === "Won" || bid.l1Status === "Lost" ? "✅ Confirmed" : "⏳ Awaiting result" },
            ].map(a => (
              <div key={a.step} className="flex items-start gap-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{a.step}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <p className="font-semibold text-slate-700 text-sm">{a.role}</p>
                    <span className="text-sm">{a.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{a.trigger}</p>
                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 w-fit">SLA: {a.sla}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
