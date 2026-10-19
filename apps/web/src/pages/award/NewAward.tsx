import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { CheckCircle2, ChevronRight, Info, FileText, AlertTriangle } from "lucide-react";
import { MOCK_BIDS, CLIENT_MASTER, PROJECT_TYPES, BidRecord } from "../bidding/BidList";
import { MOCK_AWARDS, AwardRecord } from "./AwardList";
import { usePersistentState } from "../../hooks/usePersistentState";

/* LOA/NOA/LOI descriptions (BRD §3.2) */
const AWARD_DOC_INFO: Record<string, string> = {
  LOA: "Letter of Award — Formal award of contract. Binding on receipt of acceptance letter.",
  NOA: "Notification of Award — Award intent. Contract signed separately post-acceptance.",
  LOI: "Letter of Intent — Unconditional intent to award. Full contract follows after kick-off.",
};

function generateAwardId(client: string) {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random()*900)+100).padStart(3,"0");
  const short = client.replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(0,6);
  return `AWD-${year}-${num}`;
}

export default function NewAward() {
  const navigate = useNavigate();
  const [bids] = usePersistentState<BidRecord[]>('epc_bids', MOCK_BIDS);
  const [awards, setAwards] = usePersistentState<AwardRecord[]>('epc_awards', MOCK_AWARDS);
  const [step, setStep] = useState(1);

  /* Step 1 — Award receipt details */
  const [bidRef, setBidRef]           = useState("");
  const [client, setClient]           = useState("");
  const [awardDocType, setAwardDocType] = useState("");
  const [awardDocRef, setAwardDocRef] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [awardId, setAwardId]         = useState("");
  const [autoDocType, setAutoDocType] = useState("");

  /* Step 2 — Acceptance Letter */
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [acceptanceBy, setAcceptanceBy] = useState("");
  const [legalClearance, setLegalClearance] = useState(false);
  const [acceptanceNotes, setAcceptanceNotes] = useState("");

  /* Step 3 — Kick-off + CPBG */
  const [kickoffDate, setKickoffDate] = useState("");
  const [kickoffVenue, setKickoffVenue] = useState("");
  const [cpbgBank, setCpbgBank] = useState("");
  const [cpbgNumber, setCpbgNumber] = useState("");
  const [cpbgAmount, setCpbgAmount] = useState("");
  const [cpbgValidTill, setCpbgValidTill] = useState("");

  /* Step 4 — Contract */
  const [contractRef, setContractRef] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [ldClause, setLdClause] = useState("");
  const [retention, setRetention] = useState("5");

  const selectedBid = bids.find(b => b.bidId === bidRef);

  useEffect(() => {
    if (selectedBid) {
      setClient(selectedBid.client);
      const cfg = CLIENT_MASTER[selectedBid.client];
      if (cfg) {
        setAutoDocType(cfg.awardDocType);
        setAwardDocType(cfg.awardDocType);
      }
      setAwardId(generateAwardId(selectedBid.client));
    }
  }, [bidRef, selectedBid]);

  const stepLabels = ["Award Receipt", "Acceptance Letter", "Kick-Off & CPBG", "Contract Signing"];

  const handleSubmit = () => {
    const finalClient = client || (selectedBid ? selectedBid.client : "");
    if (!finalClient) {
      alert("Please select a bid or specify a client.");
      return;
    }
    const finalAwardId = awardId || generateAwardId(finalClient);
    const newAwardObj: AwardRecord = {
      awardId: finalAwardId,
      bidId: bidRef || (selectedBid ? selectedBid.bidId : `BID-${new Date().getFullYear()}-${finalClient}-001`),
      projectName: selectedBid ? selectedBid.projectName : `${finalClient} Transmission Project`,
      client: finalClient,
      awardDocType: (awardDocType as "LOA" | "NOA" | "LOI") || "LOA",
      awardDocRef: awardDocRef || `${finalClient}/AWD/${new Date().getFullYear()}/001`,
      awardValue: selectedBid ? selectedBid.bidValue : 12500,
      projectType: selectedBid ? selectedBid.type : "A",
      receivedDate: receivedDate || new Date().toISOString().split('T')[0],
      overallStatus: "In Progress",
      contractRef: contractRef || "",
      milestones: {
        awardReceived: {
          id: "m1",
          label: "Award Received & Logged",
          sla: "Acknowledgment ≤3 days of receipt",
          slaDays: 3,
          completedDate: receivedDate || new Date().toISOString().split('T')[0],
          status: "done",
          notes: `Ref: ${awardDocRef || "Logged"}`
        },
        acceptanceLetter: {
          id: "m2",
          label: "Acceptance Letter Issued",
          sla: "Acceptance ≤7 days of award",
          slaDays: 7,
          completedDate: acceptanceDate || (acceptanceBy ? new Date().toISOString().split('T')[0] : null),
          status: acceptanceDate || acceptanceBy ? "done" : "pending",
          notes: acceptanceNotes || (legalClearance ? "Legal clearance verified" : "")
        },
        kickoffMeeting: {
          id: "m3",
          label: "Kick-Off Meeting Held",
          sla: "Meeting ≤14 days of award",
          slaDays: 14,
          completedDate: kickoffDate || null,
          status: kickoffDate ? "done" : "pending",
          notes: kickoffVenue ? `Venue: ${kickoffVenue}` : ""
        },
        cpbgCpg: {
          id: "m4",
          label: "CPBG / CPG Submitted",
          sla: "Submission ≤7 days of acceptance",
          slaDays: 7,
          completedDate: cpbgNumber ? new Date().toISOString().split('T')[0] : null,
          status: cpbgNumber ? "done" : "pending",
          notes: cpbgBank ? `${cpbgBank} (₹${cpbgAmount || 100}L)` : ""
        },
        contractSigned: {
          id: "m5",
          label: "Official Contract Signed",
          sla: "Signing ≤15 days of award",
          slaDays: 15,
          completedDate: contractDate || null,
          status: contractDate ? "done" : "pending",
          notes: contractRef ? `Ref: ${contractRef}` : ""
        }
      }
    };

    setAwards([newAwardObj, ...awards]);
    alert(`Award ${finalAwardId} logged successfully!\n\nClient: ${client}\nDoc Type: ${awardDocType}\nDoc Ref: ${awardDocRef}`);
    navigate("/award");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <PageHeader title="Log New Award (Stage 1)"/>
        <button onClick={() => navigate("/award")} className="text-sm text-slate-500 hover:text-slate-700">← Back</button>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => {
          const s = i+1; const done = step > s; const active = step === s;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done?"bg-indigo-600 border-indigo-600 text-white":active?"border-indigo-600 text-indigo-600 bg-white":"border-slate-300 text-slate-400 bg-white"}`}>
                  {done ? <CheckCircle2 size={16}/> : s}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active?"text-indigo-700 font-medium":"text-slate-400"}`}>{label}</span>
              </div>
              {i < stepLabels.length-1 && <div className={`flex-1 h-0.5 mb-5 ${step > s ? "bg-indigo-600":"bg-slate-200"}`}/>}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STEP 1: Award Receipt (BRD 1.1) ── */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><FileText size={18}/> Award Receipt Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link to Bid (Optional)</label>
            <select value={bidRef} onChange={e => setBidRef(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">— Select from Won Bids (or leave blank for direct entry) —</option>
              {bids.filter(b => b.l1Status === "Won" || b.l1Status === "Awaiting").map(b => (
                <option key={b.bidId} value={b.bidId}>{b.bidId} — {b.projectName} ({b.client})</option>
              ))}
            </select>
          </div>

          {selectedBid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-green-800 mb-1">✅ Linked to Won Bid</p>
              <p className="text-green-700">{selectedBid.projectName}</p>
              <p className="text-green-600 text-xs mt-0.5">Bid Value: ₹{(selectedBid.bidValue/100).toFixed(1)} Cr | Type {selectedBid.type}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client <span className="text-red-500">*</span></label>
              <select value={client} onChange={e => setClient(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— Select —</option>
                {Object.keys(CLIENT_MASTER).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Auto-generated Award ID</label>
              <input value={awardId} readOnly
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 font-mono text-indigo-700 cursor-not-allowed"/>
            </div>
          </div>

          {/* LOA/NOA/LOI selection (BRD 1.1) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Award Document Type <span className="text-red-500">*</span>
              {autoDocType && <span className="ml-2 text-xs text-indigo-500">(Auto-set from Client Master: {autoDocType})</span>}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["LOA","NOA","LOI"].map(dt => (
                <button key={dt} onClick={() => setAwardDocType(dt)}
                  className={`border-2 rounded-lg p-3 text-center transition-all ${awardDocType===dt?"border-indigo-500 bg-indigo-50":"border-slate-200 hover:border-indigo-300 bg-white"}`}>
                  <div className="font-bold text-indigo-700 text-lg">{dt}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                    {dt==="LOA"?"Letter of Award":dt==="NOA"?"Notification of Award":"Letter of Intent"}
                  </div>
                </button>
              ))}
            </div>
            {awardDocType && (
              <div className="mt-2 flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 rounded p-2">
                <Info size={12} className="shrink-0 mt-0.5"/>
                {AWARD_DOC_INFO[awardDocType]}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Award Doc Reference No. <span className="text-red-500">*</span></label>
              <input value={awardDocRef} onChange={e => setAwardDocRef(e.target.value)}
                placeholder="e.g. NTPC/CS-6990/LOA/2026-27/001"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Received <span className="text-red-500">*</span></label>
              <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
          </div>

          {client && CLIENT_MASTER[client] && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">Client Master — Auto-loaded Config</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(CLIENT_MASTER[client]).map(([k,v]) => (
                  <div key={k}><p className="text-blue-500">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!client || !awardDocType || !awardDocRef || !receivedDate}>
              Next: Acceptance Letter <ChevronRight size={16}/>
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 2: Legal Review & Acceptance Letter (BRD 1.2) ── */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Legal Review & Acceptance Letter (BRD 1.2)</h2>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5"/>
            <span>BRD SLA: Acceptance letter must be dispatched within <strong>7 days</strong> of receiving {awardDocType}. Received: {receivedDate}.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Acceptance Letter Date <span className="text-red-500">*</span></label>
              <input type="date" value={acceptanceDate} onChange={e => setAcceptanceDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Signed By <span className="text-red-500">*</span></label>
              <select value={acceptanceBy} onChange={e => setAcceptanceBy(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— Select Signatory —</option>
                <option>Project Director</option>
                <option>Chief Executive Officer</option>
                <option>Vice President (Projects)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legal Review Clearance</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="checkbox" id="legal" checked={legalClearance} onChange={e => setLegalClearance(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"/>
              <label htmlFor="legal" className="text-sm text-slate-700">
                Legal team has reviewed the {awardDocType} and cleared it for acceptance (no objections / LD exceptions noted)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / LD Disclaimer</label>
            <textarea value={acceptanceNotes} onChange={e => setAcceptanceNotes(e.target.value)} rows={3}
              placeholder="Any LD disclaimers, condition precedents, or legal notes to include in acceptance letter..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <p className="text-xs text-slate-400 mt-1">Note: Per BRD, LD disclaimers on client-facing L2 submissions must be included if applicable.</p>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(1)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={() => setStep(3)} disabled={!acceptanceDate || !acceptanceBy}>
              Next: Kick-Off & CPBG <ChevronRight size={16}/>
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 3: Kick-Off Meeting + CPBG (BRD 1.3 + 1.4) ── */}
      {step === 3 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Kick-Off Meeting & CPBG/CPG (BRD 1.3 + 1.4)</h2>

          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Kick-Off Meeting</h3>
            <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">BRD SLA: Kick-off must be held within <strong>14 days</strong> of {awardDocType} receipt ({receivedDate}).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Date</label>
                <input type="date" value={kickoffDate} onChange={e => setKickoffDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                <input value={kickoffVenue} onChange={e => setKickoffVenue(e.target.value)}
                  placeholder="e.g. NTPC Lara Project Site"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>
            <p className="text-xs text-slate-400">Full MoM (attendees, agenda, decisions, action items) can be entered in the Award Detail page after creation.</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">CPBG / CPG Details (BRD 1.4)</h3>
            <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">BRD SLA: CPBG/CPG must be submitted within <strong>7 days</strong> of acceptance letter date ({acceptanceDate || "—"}).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issuing Bank <span className="text-red-500">*</span></label>
                <select value={cpbgBank} onChange={e => setCpbgBank(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">— Select Bank —</option>
                  {["State Bank of India","Punjab National Bank","HDFC Bank","ICICI Bank","Axis Bank","Bank of Baroda","Canara Bank"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">BG Number <span className="text-red-500">*</span></label>
                <input value={cpbgNumber} onChange={e => setCpbgNumber(e.target.value)}
                  placeholder="e.g. SBI/BG/2026/1234"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹ Lakhs) <span className="text-red-500">*</span></label>
                <input type="number" value={cpbgAmount} onChange={e => setCpbgAmount(e.target.value)}
                  placeholder="e.g. 145.5"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid Till <span className="text-red-500">*</span></label>
                <input type="date" value={cpbgValidTill} onChange={e => setCpbgValidTill(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(2)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={() => setStep(4)}>Next: Contract Signing <ChevronRight size={16}/></Button>
          </div>
        </Card>
      )}

      {/* ── STEP 4: Contract Signing (BRD 1.5) ── */}
      {step === 4 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Contract Signing & Registration (BRD 1.5)</h2>
          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">BRD SLA: Contract must be signed within <strong>15 days</strong> of acceptance letter ({acceptanceDate || "—"}). This can be filled in now or updated later.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Reference Number</label>
              <input value={contractRef} onChange={e => setContractRef(e.target.value)}
                placeholder="Leave blank if not yet signed"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Signing Date</label>
              <input type="date" value={contractDate} onChange={e => setContractDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LD Clause</label>
              <input value={ldClause} onChange={e => setLdClause(e.target.value)}
                placeholder="e.g. 0.5% per week, max 5% of contract value"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Retention %</label>
              <select value={retention} onChange={e => setRetention(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="5">5% (Standard)</option>
                <option value="10">10%</option>
                <option value="3">3% (Negotiated)</option>
              </select>
            </div>
          </div>

          {/* Final Review Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-slate-700 mb-2">Review Summary</h3>
            {[
              ["Award ID",         awardId],
              ["Client",           client],
              ["Doc Type",         awardDocType],
              ["Doc Reference",    awardDocRef],
              ["Received Date",    receivedDate],
              ["Acceptance Date",  acceptanceDate],
              ["Acceptance By",    acceptanceBy],
              ["Legal Cleared",    legalClearance ? "✅ Yes" : "⚠️ Pending"],
              ["Kick-Off Date",    kickoffDate || "—"],
              ["CPBG Bank",        cpbgBank || "—"],
              ["CPBG Amount",      cpbgAmount ? `₹${cpbgAmount} L` : "—"],
              ["Contract Ref",     contractRef || "Pending"],
            ].map(([k,v]) => (
              <div key={k} className="flex gap-2 border-b border-slate-200 pb-1 last:border-0">
                <span className="text-slate-500 w-36 shrink-0">{k}</span>
                <span className="font-medium text-slate-800">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(3)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">← Back</Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6">
              <CheckCircle2 size={16}/> Submit Award Record
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
