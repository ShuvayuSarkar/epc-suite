import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { CLIENT_MASTER, PROJECT_TYPES, MOCK_BIDS } from "./BidList";
import { appendStoredItem } from "../../utils/persistentStorage";
import {
  ChevronRight, Info, CheckCircle2, AlertTriangle, Calculator, FileText
} from "lucide-react";

/* ─── Bid-ID Auto-Generator (BRD 0.1) ─── */
function generateBidId(client: string, year: number, seq: number): string {
  const shortClient = client.replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(0,8);
  return `BID-${year}-${shortClient}-${String(seq).padStart(3,"0")}`;
}

const APPROVAL_CHAIN = [
  { role: "Finance Manager (CFO)", threshold: "Pricing sign-off", sla: "5 days before deadline" },
  { role: "CTO", threshold: "Technical sign-off", sla: "5 days before deadline" },
  { role: "CEO / MD", threshold: "Final submission approval", sla: "2 days before deadline" },
];

type CostKey = "manufactured"|"buyout"|"service"|"bayAugmentation"|"civil"|"mandatorySpares"|"overheads";
const COST_CATEGORIES: { key: CostKey; label: string; note: string }[] = [
  { key: "manufactured",     label: "Manufactured (In-House)",     note: "Conductors, OPGW cable, hardware" },
  { key: "buyout",           label: "Buyout Materials",            note: "Insulators, tower sections, bay equipment" },
  { key: "service",          label: "Service / Installation",      note: "Erection, stringing, earthing, civil" },
  { key: "bayAugmentation",  label: "Bay Augmentation Works",      note: "Type B/C/E only — leave 0 for Type A/D" },
  { key: "civil",            label: "Civil & Foundation Works",    note: "Type C only — leave 0 for others" },
  { key: "mandatorySpares",  label: "Mandatory Spares (5-10%)",    note: "Separate sub-scope; own BOQ & delivery" },
  { key: "overheads",        label: "Overheads & Contingency",     note: "Site infrastructure, mobilisation, margin" },
];

const COMPETITOR_RANKS = ["L1","L2","L3"];

export default function NewBid() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Tender Details, 2=Cost, 3=L1 Status, 4=Review

  /* Step 1 — Tender Details */
  const [client, setClient]         = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [deadline, setDeadline]     = useState("");
  const [rfpRef, setRfpRef]         = useState("");
  const [notes, setNotes]           = useState("");

  /* Auto-generated fields (0.1 BRD) */
  const [bidId, setBidId]           = useState("");
  const [autoConfig, setAutoConfig] = useState<typeof CLIENT_MASTER["NTPC"] | null>(null);

  useEffect(() => {
    if (client && CLIENT_MASTER[client]) {
      const cfg = CLIENT_MASTER[client];
      setAutoConfig(cfg);
      const year = new Date().getFullYear();
      setBidId(generateBidId(client, year, Math.floor(Math.random()*900)+100));
    } else {
      setAutoConfig(null);
      setBidId("");
    }
  }, [client]);

  /* Step 2 — Cost Estimation */
  const [costs, setCosts] = useState<Record<CostKey,string>>({
    manufactured: "", buyout: "", service: "", bayAugmentation: "", civil: "", mandatorySpares: "", overheads: ""
  });
  const totalCost = Object.values(costs).reduce((s,v) => s + (parseFloat(v)||0), 0);
  const sparesTotal = parseFloat(costs.mandatorySpares)||0;
  const sparesRatio = totalCost > 0 ? ((sparesTotal / totalCost)*100).toFixed(1) : "0";
  const sparesOk = parseFloat(sparesRatio) >= 5 && parseFloat(sparesRatio) <= 10;

  /* Step 3 — L1/L2/L3 Tracking */
  const [l1Status, setL1Status]     = useState("Draft");
  const [competitors, setCompetitors] = useState([
    { rank:"L1", bidder:"", amount:"" },
    { rank:"L2", bidder:"", amount:"" },
    { rank:"L3", bidder:"", amount:"" },
  ]);
  const updateCompetitor = (i: number, field: "bidder"|"amount", val: string) => {
    setCompetitors(prev => prev.map((c,idx) => idx===i ? {...c,[field]:val} : c));
  };

  const handleSubmit = () => {
    if (!client) {
      alert("Please select a client utility before submitting.");
      return;
    }
    const newBidObj = {
      bidId: bidId || `BID-${new Date().getFullYear()}-${client}-00${Date.now().toString().slice(-2)}`,
      client: client,
      projectName: projectName || "Untitled Tender",
      type: projectType || "A",
      submittedDate: new Date().toISOString().split('T')[0],
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      l1Status: l1Status || "Draft",
      bidValue: totalCost || 5000,
      costEstimate: {
        manufactured: parseFloat(costs.manufactured) || 0,
        buyout: parseFloat(costs.buyout) || 0,
        service: parseFloat(costs.service) || 0,
        bayAugmentation: parseFloat(costs.bayAugmentation) || 0,
        civil: parseFloat(costs.civil) || 0,
        mandatorySpares: parseFloat(costs.mandatorySpares) || 0,
        overheads: parseFloat(costs.overheads) || 0,
      },
      competitorBids: competitors.filter(c => c.bidder && c.amount).map(c => ({
        rank: c.rank,
        bidder: c.bidder,
        amount: parseFloat(c.amount) || 0,
      })),
      submittedBy: "Commercial Team",
      daysBeforeDeadline: 2,
      internalSignOff: new Date().toISOString().split('T')[0],
      notes: notes || "",
    };
    appendStoredItem('epc_bids', newBidObj, MOCK_BIDS);
    alert(`Bid ${newBidObj.bidId} logged successfully!\n\nStatus: ${l1Status}\nTotal Cost: ₹${totalCost.toLocaleString()} Lakhs`);
    navigate("/bidding");
  };

  const stepLabels = ["Tender Details", "Cost Estimation", "L1/L2/L3 Status", "Review & Submit"];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <PageHeader title="Log New Tender" />
        <button onClick={() => navigate("/bidding")} className="text-sm text-slate-500 hover:text-slate-700">← Back to Bids</button>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => {
          const s = i + 1;
          const done = step > s; const active = step === s;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done?"bg-indigo-600 border-indigo-600 text-white":active?"border-indigo-600 text-indigo-600 bg-white":"border-slate-300 text-slate-400 bg-white"}`}>
                  {done ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active?"text-indigo-700 font-medium":"text-slate-400"}`}>{label}</span>
              </div>
              {i < stepLabels.length-1 && <div className={`flex-1 h-0.5 mb-5 ${step > s ? "bg-indigo-600" : "bg-slate-200"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STEP 1: Tender Details ── */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><FileText size={18}/> Tender Details</h2>

          {/* Client selection → auto-cascade (BRD 0.2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client / Utility <span className="text-red-500">*</span></label>
              <select value={client} onChange={e => setClient(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— Select Client —</option>
                {Object.keys(CLIENT_MASTER).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bid ID (Auto-generated)</label>
              <div className="flex items-center gap-2">
                <input value={bidId} readOnly
                  className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 font-mono text-indigo-700 cursor-not-allowed" />
                {bidId && <CheckCircle2 size={18} className="text-green-500 shrink-0"/>}
              </div>
              <p className="text-xs text-slate-400 mt-1">Format: BID-{"{YYYY}"}-{"{CLIENT}"}-{"{SEQ}"}</p>
            </div>
          </div>

          {/* Auto-populated Client Master config (BRD 0.2) */}
          {autoConfig && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-indigo-600"/>
                <span className="text-sm font-semibold text-indigo-700">Client Master — Auto-Populated from Client Config</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  ["Award Document Type", autoConfig.awardDocType],
                  ["SLA Set", autoConfig.slaSet],
                  ["Reference Format", autoConfig.refFormat],
                  ["Payment Terms", autoConfig.paymentTerms],
                  ["Retention %", `${autoConfig.retentionPct}%`],
                ].map(([k,v]) => (
                  <div key={k}>
                    <p className="text-xs text-indigo-500 font-medium">{k}</p>
                    <p className="font-semibold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name <span className="text-red-500">*</span></label>
            <input value={projectName} onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. NTPC Lara 400kV HTLS Reconductoring Phase II"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Project Type A–E with template info (BRD 0.3) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Type (A–E) <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {PROJECT_TYPES.map(pt => (
                <button key={pt.code} onClick={() => setProjectType(pt.code)}
                  className={`border rounded-lg p-3 text-left transition-all ${projectType===pt.code?"border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400":"border-slate-200 hover:border-indigo-300 bg-white"}`}>
                  <div className="font-bold text-indigo-700 text-lg mb-1">Type {pt.code}</div>
                  <div className="text-xs text-slate-700 font-medium leading-tight mb-1">{pt.name}</div>
                  <div className="text-xs text-slate-400 leading-tight">{pt.scope}</div>
                </button>
              ))}
            </div>
            {projectType && (
              <div className="mt-2 text-xs text-green-700 flex items-center gap-1">
                <CheckCircle2 size={12}/> Template Type {projectType} will be instantiated for this project
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Submission Deadline <span className="text-red-500">*</span></label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RFP / Tender Reference</label>
              <input value={rfpRef} onChange={e => setRfpRef(e.target.value)}
                placeholder="e.g. NTPC/CON/CS-6990/2026"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Bid Strategy</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Key differentiators, risk flags, client relationship notes..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!client || !projectName || !projectType || !deadline}>
              Next: Cost Estimation <ChevronRight size={16}/>
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 2: Cost Estimation (BRD 0.4) ── */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Calculator size={18}/> Cost Estimation</h2>
          <p className="text-sm text-slate-500">Enter estimates in ₹ Lakhs for each cost category.</p>

          <div className="space-y-3">
            {COST_CATEGORIES.map(cat => (
              <div key={cat.key} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <p className="text-sm font-medium text-slate-700">{cat.label}</p>
                  <p className="text-xs text-slate-400">{cat.note}</p>
                </div>
                <div className="col-span-4 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={costs[cat.key]} onChange={e => setCosts(prev => ({...prev,[cat.key]:e.target.value}))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                </div>
                <div className="col-span-3 text-sm text-slate-500">Lakhs</div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Total Bid Value</span>
              <span className="text-2xl font-bold text-indigo-700">₹{totalCost.toLocaleString()} L</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Mandatory Spares as % of total</span>
              <span className={`font-semibold flex items-center gap-1 ${sparesOk?"text-green-600":"text-amber-600"}`}>
                {sparesOk ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                {sparesRatio}% {sparesOk ? "(5–10% ✅)" : "(BRD requires 5–10%)"}
              </span>
            </div>
            {totalCost > 0 && (
              <div className="bg-slate-50 rounded-lg p-3 mt-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Cost Breakdown</p>
                <div className="space-y-1">
                  {COST_CATEGORIES.map(cat => {
                    const v = parseFloat(costs[cat.key])||0;
                    const pct = totalCost > 0 ? ((v/totalCost)*100).toFixed(0) : "0";
                    return v > 0 ? (
                      <div key={cat.key} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 w-40 truncate">{cat.label}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width:`${pct}%` }} />
                        </div>
                        <span className="text-slate-700 font-medium w-12 text-right">{pct}%</span>
                        <span className="text-slate-500 w-20 text-right">₹{v.toLocaleString()}L</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(1)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={() => setStep(3)}>Next: L1/L2/L3 Status <ChevronRight size={16}/></Button>
          </div>
        </Card>
      )}

      {/* ── STEP 3: L1/L2/L3 Tracking (BRD 0.5) ── */}
      {step === 3 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">L1 / L2 / L3 Bid Status Tracking</h2>
          <p className="text-sm text-slate-500">Record the bid outcome and competitor ranking. This can be updated after result declaration.</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current L1 Status <span className="text-red-500">*</span></label>
            <div className="flex gap-3 flex-wrap">
              {[
                { val:"Draft",    label:"📝 Draft",    cls:"border-slate-300 text-slate-600" },
                { val:"Awaiting", label:"⏳ Awaiting", cls:"border-amber-400 text-amber-700 bg-amber-50" },
                { val:"Won",      label:"🏆 L1 — Won", cls:"border-green-500 text-green-700 bg-green-50" },
                { val:"Lost",     label:"❌ Lost",     cls:"border-red-400 text-red-700 bg-red-50" },
              ].map(s => (
                <button key={s.val} onClick={() => setL1Status(s.val)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${l1Status===s.val?"ring-2 ring-offset-1 ring-indigo-500 "+s.cls:s.cls+" opacity-60 hover:opacity-100"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {l1Status !== "Draft" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Competitor Bids (₹ Lakhs)</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase w-16">Rank</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Bidder / Company</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Amount (₹ Lakhs)</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">vs. Our Bid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {competitors.map((c, i) => {
                      const diff = totalCost && parseFloat(c.amount) ? parseFloat(c.amount) - totalCost : null;
                      return (
                        <tr key={c.rank} className={i===0?"bg-green-50/50":""}>
                          <td className="px-4 py-3">
                            <span className={`font-bold text-sm ${i===0?"text-green-700":i===1?"text-amber-700":"text-slate-500"}`}>{c.rank}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input value={c.bidder} onChange={e => updateCompetitor(i,"bidder",e.target.value)}
                              placeholder={i===0?"Enter L1 bidder name":"Enter bidder name (optional)"}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={c.amount} onChange={e => updateCompetitor(i,"amount",e.target.value)}
                              placeholder="0.00"
                              className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 text-right" />
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {diff !== null
                              ? diff > 0
                                ? <span className="text-red-600 font-medium">+₹{diff.toFixed(0)}L higher</span>
                                : diff < 0
                                  ? <span className="text-green-600 font-medium">−₹{Math.abs(diff).toFixed(0)}L lower</span>
                                  : <span className="text-slate-500">Same</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">Our bid value: ₹{totalCost.toLocaleString()} Lakhs</p>
            </div>
          )}

          {/* Approval Chain (BRD §5, rows 1-2) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Required Approval Chain (BRD §5)</h3>
            <div className="space-y-2">
              {APPROVAL_CHAIN.map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0">{i+1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{a.role}</p>
                    <p className="text-xs text-slate-500">{a.threshold}</p>
                  </div>
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{a.sla}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(2)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={() => setStep(4)}>Review & Submit <ChevronRight size={16}/></Button>
          </div>
        </Card>
      )}

      {/* ── STEP 4: Review & Submit ── */}
      {step === 4 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600"/> Review & Submit</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3 bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700">Tender Details</h3>
              {[["Bid ID",bidId],["Client",client],["Project Name",projectName],["Project Type",`Type ${projectType}`],["Deadline",deadline],["RFP Ref",rfpRef||"—"]].map(([k,v])=>(
                <div key={k} className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">{k}:</span><span className="font-medium text-slate-800">{v}</span></div>
              ))}
              {autoConfig && (
                <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Award Doc Type:</span><span className="font-medium text-indigo-700">{autoConfig.awardDocType}</span></div>
              )}
            </div>
            <div className="space-y-3 bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700">Cost Summary</h3>
              {COST_CATEGORIES.map(cat => {
                const v = parseFloat(costs[cat.key])||0;
                return v > 0 ? (
                  <div key={cat.key} className="flex justify-between text-xs">
                    <span className="text-slate-500">{cat.label}</span>
                    <span className="font-medium">₹{v.toLocaleString()}L</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-slate-300 pt-2 flex justify-between font-bold">
                <span className="text-slate-700">TOTAL BID VALUE</span>
                <span className="text-indigo-700">₹{totalCost.toLocaleString()}L</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">L1 Status</span>
                <span className={`font-bold ${l1Status==="Won"?"text-green-700":l1Status==="Lost"?"text-red-600":l1Status==="Awaiting"?"text-amber-700":"text-slate-600"}`}>{l1Status}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Notes / Bid Strategy</p>
              <p className="text-sm text-slate-700">{notes}</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={() => setStep(3)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6">
              <CheckCircle2 size={16} /> Submit Bid Log
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
