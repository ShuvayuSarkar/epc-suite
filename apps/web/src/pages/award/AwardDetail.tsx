import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { MOCK_AWARDS, AwardRecord } from "./AwardList";
import {
  CheckCircle2, Clock, AlertCircle, Calendar, Building2,
  FileSignature, DollarSign, Users, FileText, PenLine, ChevronRight, X
} from "lucide-react";

/* ─── CPBG/CPG structured data model (BRD 1.4) ─── */
interface BankGuarantee {
  type: "CPBG" | "CPG" | "APG";
  bank: string;
  bgNumber: string;
  amount: number;    // ₹ Lakhs
  validFrom: string;
  validTill: string;
  status: "Active" | "Expired" | "Encashed" | "Renewed";
}

/* ─── Sample BG data keyed by awardId ─── */
const BG_DATA: Record<string, BankGuarantee[]> = {
  "AWD-2026-001": [
    { type:"CPBG", bank:"State Bank of India", bgNumber:"SBI/BG/2026/1234",  amount:145.5, validFrom:"2026-08-26", validTill:"2027-08-14", status:"Active" },
    { type:"CPG",  bank:"HDFC Bank",           bgNumber:"HDFC/BG/2026/4512", amount:72.5,  validFrom:"2026-08-26", validTill:"2027-08-14", status:"Active" },
  ],
  "AWD-2026-002": [
    { type:"CPG",  bank:"HDFC Bank",           bgNumber:"HDFC/BG/2026/0567", amount:42.0,  validFrom:"2026-07-07", validTill:"2027-06-30", status:"Active" },
  ],
  "AWD-2025-004": [
    { type:"CPBG", bank:"Punjab National Bank", bgNumber:"PNB/BG/2025/0891", amount:185.0, validFrom:"2025-08-06", validTill:"2026-07-29", status:"Active" },
    { type:"APG",  bank:"Axis Bank",            bgNumber:"AXIS/BG/2025/0234", amount:92.5,  validFrom:"2025-08-10", validTill:"2026-07-29", status:"Active" },
  ],
};

/* ─── Kick-off Meeting MoM keyed by awardId ─── */
const KICKOFF_DATA: Record<string, {
  date: string; venue: string; chairperson: string;
  attendees: { name: string; designation: string; company: string }[];
  agendaItems: string[];
  decisions: string[];
  actionItems: { action: string; owner: string; dueDate: string; status: string }[];
}> = {
  "AWD-2026-001": {
    date: "2026-08-28", venue: "NTPC Lara Project Site, Chhattisgarh",
    chairperson: "Project Director — Apar Industries",
    attendees: [
      { name:"Mr. Rajesh Sharma",    designation:"Project Director",      company:"Apar Industries Ltd" },
      { name:"Mr. Anil Kumar",       designation:"Project Manager",       company:"Apar Industries Ltd" },
      { name:"Mr. P.K. Srivastava", designation:"Sr. Engineer (O&M)",    company:"NTPC Lara" },
      { name:"Ms. Priya Gupta",      designation:"Resident Officer",      company:"NTPC (Client RO)" },
      { name:"Mr. S. Pandey",        designation:"Safety Officer",        company:"Apar Industries Ltd" },
    ],
    agendaItems: [
      "Award overview and scope of work confirmation",
      "L2 schedule presentation and baseline freeze",
      "Survey plan for conductors and tower sections",
      "Vendor selection timeline — 12 categories",
      "HSE plan and site mobilization",
      "CPBG/CPG submission timeline",
      "Communication protocol and correspondence format",
    ],
    decisions: [
      "Dual-baseline (Contractual: 18 months, Accelerated: 15 months) approved by Client RO",
      "Survey to commence within 7 days; GPS-tagged results to be submitted to NTPC within 30 days",
      "Per-category vendor finalization to be completed within 10 days of survey approval",
      "Monthly progress review meetings on every 2nd Monday at NTPC site office",
    ],
    actionItems: [
      { action:"Submit L2 schedule to NTPC for approval",    owner:"PM — Anil Kumar",   dueDate:"2026-09-05", status:"✅ Done" },
      { action:"Deploy survey team to Lara site",            owner:"Survey Lead",        dueDate:"2026-09-04", status:"✅ Done" },
      { action:"Submit CPBG/CPG to NTPC treasury",           owner:"Finance — CFO",      dueDate:"2026-09-03", status:"✅ Done" },
      { action:"Issue LOI to HTLS conductor vendor",         owner:"Procurement Mgr",    dueDate:"2026-09-10", status:"⏳ Pending" },
      { action:"Finalize HSE plan and get NTPC approval",    owner:"Safety Officer",     dueDate:"2026-09-08", status:"⏳ Pending" },
    ],
  },
  "AWD-2026-002": {
    date: "2026-07-12", venue: "Virtual (MS Teams) — IndiGrid HO Mumbai",
    chairperson: "Project Manager — Apar Industries",
    attendees: [
      { name:"Mr. Vikram Tiwari",    designation:"Project Manager",          company:"Apar Industries Ltd" },
      { name:"Ms. Ankita Roy",       designation:"Resident Officer",         company:"IndiGrid" },
      { name:"Mr. Subhash Patil",    designation:"OPGW Technical Lead",      company:"Apar Industries Ltd" },
      { name:"Mr. D. Kulkarni",      designation:"Safety Officer",           company:"Apar Industries Ltd" },
    ],
    agendaItems: [
      "OPGW scope confirmation — drum-wise mapping",
      "FOTE schedule and OTDR testing protocol",
      "Vendor selection for FOTE subcontractor",
      "Type Test submission plan",
    ],
    decisions: [
      "OPGW drums to be mapped 1:1 with tower sections; drum schedule in 14 days",
      "OTDR baseline test mandatory before stringing",
      "FOTE subcontractor empanelment by 2026-07-20",
    ],
    actionItems: [
      { action:"Submit drum schedule to IndiGrid",   owner:"OPGW Lead",     dueDate:"2026-07-26", status:"✅ Done" },
      { action:"Empanel FOTE subcontractor",         owner:"Procurement",   dueDate:"2026-07-20", status:"✅ Done" },
      { action:"Submit Type Test certificates",      owner:"QA/QC Lead",    dueDate:"2026-07-30", status:"✅ Done" },
    ],
  },
};

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  awardReceived:    <Trophy size={16}/>,
  acceptanceLetter: <FileText size={16}/>,
  kickoffMeeting:   <Users size={16}/>,
  cpbgCpg:          <DollarSign size={16}/>,
  contractSigned:   <FileSignature size={16}/>,
};

const MILESTONE_ORDER = ["awardReceived","acceptanceLetter","kickoffMeeting","cpbgCpg","contractSigned"] as const;

function Trophy({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}

const DOC_TYPE_COLOR: Record<string, string> = {
  LOA:"bg-blue-100 text-blue-700", NOA:"bg-purple-100 text-purple-700", LOI:"bg-teal-100 text-teal-700"
};
const STATUS_VARIANT: Record<string,string> = {
  "In Progress":"warning","Completed":"success","Overdue":"danger","On Hold":"secondary"
};
const BG_STATUS_COLOR: Record<string,string> = {
  Active:"text-green-700 bg-green-100", Expired:"text-red-700 bg-red-100",
  Encashed:"text-purple-700 bg-purple-100", Renewed:"text-blue-700 bg-blue-100"
};

import { usePersistentState } from "../../hooks/usePersistentState";

export default function AwardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [markingMilestone, setMarkingMilestone] = useState<string|null>(null);
  const [milestoneDate, setMilestoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const [awards, setAwards] = usePersistentState<AwardRecord[]>('epc_awards', MOCK_AWARDS);
  const award = awards.find(a => a.awardId === id);
  if (!award) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={40} className="mx-auto text-slate-300 mb-3"/>
        <p className="text-slate-500">Award not found: {id}</p>
        <button onClick={() => navigate("/award")} className="mt-4 text-indigo-600 hover:underline text-sm">← Back</button>
      </div>
    );
  }

  const [bgs, setBgs] = usePersistentState<BankGuarantee[]>(`epc_award_bgs_${id}`, BG_DATA[award.awardId] || []);
  const [contracts, setContracts] = usePersistentState<any[]>('epc_contracts', []);
  const [contractForm, setContractForm] = useState({
    ref: '',
    signingDate: new Date().toISOString().split('T')[0],
    ldClause: '0.5%/week, max 5%'
  });
  const [showAddBgModal, setShowAddBgModal] = useState(false);
  const [newBg, setNewBg] = useState<Partial<BankGuarantee>>({
    type: "CPBG",
    bank: "State Bank of India",
    bgNumber: "",
    amount: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validTill: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: "Active"
  });

  const handleRegisterContract = () => {
    if (!contractForm.ref) {
      alert("Please enter a contract reference number");
      return;
    }
    const updatedAward = {
      ...award,
      contractRef: contractForm.ref,
      milestones: {
        ...award.milestones,
        contractSigned: {
          ...award.milestones.contractSigned,
          status: 'done' as const,
          completedDate: contractForm.signingDate,
          notes: `Registered: ${contractForm.ref}`
        }
      }
    };
    setAwards(prev => prev.map(a => a.awardId === id ? updatedAward : a));
    const newContract = {
      id: `CONT-${Date.now().toString().slice(-4)}`,
      contractNumber: contractForm.ref,
      project: award.projectName,
      client: award.client,
      value: award.awardValue,
      status: 'Active',
      signingDate: contractForm.signingDate,
      scope: `${award.projectType} Transmission Reconductoring`,
      ldClause: contractForm.ldClause
    };
    setContracts(prev => [newContract, ...prev]);
  };

  const handleCreateBg = () => {
    if (!newBg.bgNumber || !newBg.bank) {
      alert("Please fill in BG Number and Bank");
      return;
    }
    const created: BankGuarantee = {
      type: (newBg.type as any) || "CPBG",
      bank: newBg.bank || "State Bank of India",
      bgNumber: newBg.bgNumber,
      amount: Number(newBg.amount) || 0,
      validFrom: newBg.validFrom || new Date().toISOString().split('T')[0],
      validTill: newBg.validTill || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: (newBg.status as any) || "Active"
    };
    setBgs(prev => [created, ...prev]);
    setShowAddBgModal(false);
    setNewBg({
      type: "CPBG",
      bank: "State Bank of India",
      bgNumber: "",
      amount: 100,
      validFrom: new Date().toISOString().split('T')[0],
      validTill: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: "Active"
    });
  };

  const kickoff = KICKOFF_DATA[award.awardId];
  const milArr = MILESTONE_ORDER.map(k => ({ key:k, ...award.milestones[k] }));
  const doneCount = milArr.filter(m => m.status === "done").length;
  const pct = Math.round((doneCount/5)*100);

  const tabs = [
    { id:"overview",   label:"Overview" },
    { id:"milestones", label:"Milestones" },
    { id:"kickoff",    label:"Kick-Off MoM" },
    { id:"cpbg",       label:"Bank Guarantees" },
    { id:"contract",   label:"Contract" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/award")} className="text-sm text-slate-400 hover:text-slate-600 mb-1">← Back to Awards</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <PageHeader title={award.projectName}/>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="font-mono text-xs text-indigo-600 font-semibold">{award.awardId}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${DOC_TYPE_COLOR[award.awardDocType]}`}>{award.awardDocType}</span>
              <Badge variant={STATUS_VARIANT[award.overallStatus] as any}>{award.overallStatus}</Badge>
              <span className="text-xs text-slate-400">{award.client} · Type {award.projectType}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-700">{pct}%</p>
            <p className="text-xs text-slate-400">{doneCount}/5 milestones done</p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon:<DollarSign size={18}/>,    label:"Award Value",   value:`₹${(award.awardValue/100).toFixed(1)} Cr`, color:"text-indigo-600 bg-indigo-50" },
          { icon:<Calendar size={18}/>,      label:"Received Date", value:award.receivedDate,                         color:"text-slate-700 bg-slate-100"   },
          { icon:<FileText size={18}/>,      label:"Doc Reference", value:award.awardDocRef,                           color:"text-blue-600 bg-blue-50"       },
          { icon:<Building2 size={18}/>,     label:"Contract Ref",  value:award.contractRef || "Pending",              color: award.contractRef?"text-green-600 bg-green-50":"text-amber-600 bg-amber-50" },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-start gap-3">
            <div className={`${k.color} p-2 rounded-lg shrink-0`}>{k.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className="font-semibold text-slate-800 text-sm truncate" title={k.value}>{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* 5-step progress bar */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Stage 1 Progress — All 5 BRD Milestones</h3>
            <div className="flex items-center gap-2 overflow-x-auto">
              {milArr.map((m, i) => {
                const done = m.status === "done";
                const overdue = m.status === "overdue";
                const dueSoon = m.status === "due_soon";
                return (
                  <React.Fragment key={m.key}>
                    <div className="flex flex-col items-center min-w-[80px] text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm ${done?"bg-green-500 border-green-500 text-white":overdue?"bg-red-500 border-red-500 text-white":dueSoon?"bg-amber-400 border-amber-400 text-white":"border-slate-300 text-slate-400 bg-white"}`}>
                        {done ? "✓" : MILESTONE_ICONS[m.key]}
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-tight">{m.label}</p>
                      {m.completedDate && <p className="text-[10px] text-green-600">{m.completedDate}</p>}
                      {!m.completedDate && m.status !== "pending" && <p className="text-[10px] text-amber-600">SLA: {m.sla}</p>}
                    </div>
                    {i < 4 && <div className={`flex-1 h-1 rounded min-w-[20px] ${done && milArr[i+1]?.status==="done"?"bg-green-400":done?"bg-amber-200":"bg-slate-200"}`}/>}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <h3 className="font-semibold text-slate-700">Award Details</h3>
              {[
                ["Award ID", award.awardId],
                ["Bid Reference", award.bidId],
                ["Client", award.client],
                ["Award Document Type", award.awardDocType],
                ["Award Doc Reference", award.awardDocRef],
                ["Project Type", `Type ${award.projectType}`],
                ["Received Date", award.receivedDate],
                ["Award Value", `₹${(award.awardValue/100).toFixed(1)} Cr (₹${award.awardValue.toLocaleString()} L)`],
                ["Overall Status", award.overallStatus],
                ["Contract Reference", award.contractRef || "—"],
              ].map(([k,v]) => (
                <div key={k} className="flex text-sm border-b border-slate-100 pb-1 last:border-0">
                  <span className="text-slate-500 w-40 shrink-0">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-slate-700 mb-3">BRD Compliance Check</h3>
              <div className="space-y-2">
                {milArr.map(m => (
                  <div key={m.key} className={`flex items-center gap-3 p-2 rounded-lg ${m.status==="done"?"bg-green-50":m.status==="overdue"?"bg-red-50":m.status==="due_soon"?"bg-amber-50":"bg-slate-50"}`}>
                    <div className={`shrink-0 ${m.status==="done"?"text-green-600":m.status==="overdue"?"text-red-600":"text-amber-600"}`}>
                      {m.status==="done" ? <CheckCircle2 size={16}/> : m.status==="overdue" ? <AlertCircle size={16}/> : <Clock size={16}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{m.label}</p>
                      <p className="text-[10px] text-slate-400">{m.sla}</p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${m.status==="done"?"text-green-600":m.status==="overdue"?"text-red-600":"text-amber-600"}`}>
                      {m.status==="done" ? "✅" : m.status==="overdue" ? "❌ Overdue" : m.status==="due_soon" ? "⚠️ Due Soon" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {milArr.map((m, i) => (
            <Card key={m.key} className={`p-5 border-l-4 ${m.status==="done"?"border-green-500":m.status==="overdue"?"border-red-500":m.status==="due_soon"?"border-amber-400":"border-slate-200"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 ${m.status==="done"?"bg-green-500 border-green-500 text-white":m.status==="overdue"?"bg-red-500 border-red-500 text-white":m.status==="due_soon"?"bg-amber-400 border-amber-400 text-white":"border-slate-300 text-slate-400 bg-white"}`}>
                    {m.status==="done" ? "✓" : i+1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{m.label}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.status==="done"?"bg-green-100 text-green-700":m.status==="overdue"?"bg-red-100 text-red-700":m.status==="due_soon"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-500"}`}>
                        {m.status==="done"?"Completed":m.status==="overdue"?"Overdue":m.status==="due_soon"?"Due Soon":"Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">BRD SLA: {m.sla}</p>
                    {m.completedDate && <p className="text-xs text-green-600 font-medium mt-0.5">Completed: {m.completedDate}</p>}
                    {m.notes && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded p-2">{m.notes}</p>}
                  </div>
                </div>
                {m.status !== "done" && (
                  <Button
                    onClick={() => setMarkingMilestone(m.key)}
                    className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                    Mark Complete
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {markingMilestone && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <Card className="p-6 w-full max-w-md space-y-4">
                <h3 className="font-semibold text-slate-800">Mark Milestone Complete</h3>
                <p className="text-sm text-slate-600">Enter the completion date and notes:</p>
                <input
                  type="date"
                  value={milestoneDate}
                  onChange={e => setMilestoneDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  rows={3}
                  value={milestoneNotes}
                  onChange={e => setMilestoneNotes(e.target.value)}
                  placeholder="Completion notes..."
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setMarkingMilestone(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                  <Button onClick={() => {
                    if (!markingMilestone || !award) return;
                    const updated = awards.map(a => {
                      if (a.awardId !== award.awardId) return a;
                      return {
                        ...a,
                        milestones: {
                          ...a.milestones,
                          [markingMilestone]: {
                            ...a.milestones[markingMilestone as keyof typeof a.milestones],
                            status: "done" as const,
                            completedDate: milestoneDate || new Date().toISOString().split('T')[0],
                            notes: milestoneNotes || "Completed",
                          }
                        }
                      };
                    });
                    setAwards(updated);
                    setMarkingMilestone(null);
                    setMilestoneNotes("");
                  }}>Confirm</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── KICK-OFF MoM ── */}
      {activeTab === "kickoff" && (
        <div className="space-y-4">
          {kickoff ? (
            <>
              <Card className="p-5 space-y-4">
                <h3 className="font-semibold text-slate-700">Meeting Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[["Date",kickoff.date],["Venue",kickoff.venue],["Chairperson",kickoff.chairperson]].map(([k,v])=>(
                    <div key={k} className="col-span-1">
                      <p className="text-xs text-slate-500">{k}</p>
                      <p className="font-medium text-slate-800">{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Attendees</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50"><tr>
                        <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Name</th>
                        <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Designation</th>
                        <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Company</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {kickoff.attendees.map((a,i) => (
                          <tr key={i} className={a.company.includes("Apar")?"bg-indigo-50/40":""}>
                            <td className="px-3 py-2 font-medium text-slate-800">{a.name}</td>
                            <td className="px-3 py-2 text-slate-600">{a.designation}</td>
                            <td className="px-3 py-2 text-slate-500">{a.company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Agenda Items</h4>
                  <ol className="space-y-1">
                    {kickoff.agendaItems.map((item,i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-slate-400 shrink-0">{i+1}.</span><span className="text-slate-700">{item}</span></li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Decisions</h4>
                  <ul className="space-y-1">
                    {kickoff.decisions.map((d,i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-green-500 shrink-0">✓</span><span className="text-slate-700">{d}</span></li>
                    ))}
                  </ul>
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold text-slate-700 mb-3">Action Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr>
                      <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Action</th>
                      <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Owner</th>
                      <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Due Date</th>
                      <th className="px-3 py-2 text-left text-xs text-slate-500 font-semibold uppercase">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {kickoff.actionItems.map((ai,i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-700">{ai.action}</td>
                          <td className="px-3 py-2 text-slate-600">{ai.owner}</td>
                          <td className="px-3 py-2 text-slate-500">{ai.dueDate}</td>
                          <td className="px-3 py-2">{ai.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400 space-y-3">
              <Users size={36} className="mx-auto text-slate-300"/>
              <p>No kick-off meeting recorded yet.</p>
              <Button onClick={() => navigate("/meetings")} className="mx-auto">Log Kick-Off Meeting</Button>
            </Card>
          )}
        </div>
      )}

      {/* ── BANK GUARANTEES / CPBG/CPG ── */}
      {activeTab === "cpbg" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Bank Guarantees (CPBG / CPG / APG)</h3>
            <Button onClick={() => setShowAddBgModal(true)} className="text-xs">+ Add Bank Guarantee</Button>
          </div>
          {bgs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bgs.map((bg, i) => {
                const daysLeft = Math.round((new Date(bg.validTill).getTime() - Date.now()) / 86400000);
                return (
                  <Card key={i} className={`p-5 border-l-4 ${daysLeft < 30 ? "border-red-400" : daysLeft < 90 ? "border-amber-400" : "border-green-400"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{bg.type}</span>
                        <h4 className="font-semibold text-slate-800 mt-1">{bg.bank}</h4>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${BG_STATUS_COLOR[bg.status]}`}>{bg.status}</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {[
                        ["BG Number", bg.bgNumber],
                        ["Amount",    `₹${bg.amount.toLocaleString()} Lakhs`],
                        ["Valid From", bg.validFrom],
                        ["Valid Till", bg.validTill],
                        ["Days Remaining", `${daysLeft > 0 ? daysLeft : "EXPIRED"} ${daysLeft < 0 ? "⚠️" : daysLeft < 30 ? "⛔ RENEW NOW" : daysLeft < 90 ? "⚠️ Due Soon" : "✅"}`],
                      ].map(([k,v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}</span>
                          <span className={`font-medium ${k==="Days Remaining" && daysLeft < 90 ? "text-amber-700" : "text-slate-800"}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-400 space-y-3">
              <DollarSign size={36} className="mx-auto text-slate-300"/>
              <p>No bank guarantees recorded yet for this award.</p>
              <Button onClick={() => setShowAddBgModal(true)} className="mx-auto">Add CPBG / CPG</Button>
            </Card>
          )}
          {/* BRD Benchmark reminder */}
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">BRD §1.4 Benchmarks for CPBG/CPG</p>
            <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
              <li>CPBG/CPG must be submitted within 7 days of award acceptance letter</li>
              <li>Alert threshold: notify 30 / 60 / 90 days before expiry</li>
              <li>Performance BG typically 5-10% of contract value</li>
              <li>Advance Payment Guarantee (APG) required if advance payment granted</li>
            </ul>
          </Card>
        </div>
      )}

      {/* ── CONTRACT ── */}
      {activeTab === "contract" && (
        <Card className="p-5 space-y-5">
          <h3 className="font-semibold text-slate-700">Contract Signing & Registration (BRD 1.5)</h3>
          {award.contractRef ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 size={24} className="text-green-600 shrink-0"/>
                <div>
                  <p className="font-semibold text-green-800">Contract Signed & Registered</p>
                  <p className="text-sm text-green-700">Reference: {award.contractRef}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Award Value",`₹${(award.awardValue/100).toFixed(1)} Cr`],["LD Clause","0.5% per week, max 5% of contract"],["Retention",`5% of each bill`],["Payment Terms","80% Supply (JVR) + 20% Service (JMC)"]].map(([k,v])=>(
                  <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
                ))}
              </div>
              <Button onClick={() => navigate("/contracts")} className="w-full text-sm">
                View in Contract Management <ChevronRight size={14}/>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock size={24} className="text-amber-600 shrink-0"/>
                <div>
                  <p className="font-semibold text-amber-800">Contract Pending</p>
                  <p className="text-sm text-amber-700">BRD SLA: Contract must be signed within 15 days of acceptance letter.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contract Reference Number *</label>
                  <input
                    value={contractForm.ref}
                    onChange={e => setContractForm(p => ({ ...p, ref: e.target.value }))}
                    placeholder={`e.g. ${award.client}/CONT/${award.awardId}/2026`}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Signing Date</label>
                    <input
                      type="date"
                      value={contractForm.signingDate}
                      onChange={e => setContractForm(p => ({ ...p, signingDate: e.target.value }))}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LD Clause</label>
                    <input
                      value={contractForm.ldClause}
                      onChange={e => setContractForm(p => ({ ...p, ldClause: e.target.value }))}
                      placeholder="e.g. 0.5%/week, max 5%"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <Button onClick={handleRegisterContract} className="bg-green-600 hover:bg-green-700 text-white">
                  <PenLine size={14}/> Register Contract Signing
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add Bank Guarantee Modal */}
      {showAddBgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add Bank Guarantee</h3>
              <button onClick={() => setShowAddBgModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">BG Type</label>
                  <select
                    value={newBg.type}
                    onChange={e => setNewBg({ ...newBg, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="CPBG">CPBG</option>
                    <option value="CPG">CPG</option>
                    <option value="APG">APG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Bank *</label>
                  <input
                    value={newBg.bank || ''}
                    onChange={e => setNewBg({ ...newBg, bank: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">BG Number *</label>
                  <input
                    value={newBg.bgNumber || ''}
                    onChange={e => setNewBg({ ...newBg, bgNumber: e.target.value })}
                    placeholder="e.g. SBI/BG/2026/1234"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹ Lakhs) *</label>
                  <input
                    type="number"
                    value={newBg.amount || 0}
                    onChange={e => setNewBg({ ...newBg, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={newBg.validFrom || ''}
                    onChange={e => setNewBg({ ...newBg, validFrom: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valid Till</label>
                  <input
                    type="date"
                    value={newBg.validTill || ''}
                    onChange={e => setNewBg({ ...newBg, validTill: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowAddBgModal(false)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateBg} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save BG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
