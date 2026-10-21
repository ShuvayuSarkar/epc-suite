import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Plus, Calendar, Factory, CheckCircle2, AlertCircle, Clock, Pencil, Trash2, X, Send, FileCheck2, Truck, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { usePersistentState } from '../../hooks/usePersistentState';

// ── BRD §3.7 & Golden Period — Inspection-to-DI Loop ─────────────────────────
export type InspType = 'Factory Inspection' | 'FAT' | 'TPIA' | '25% Readiness Demo' | 'Pre-Dispatch' | 'Stage Inspection';

export type InspStatus = 
  | 'Call Raised (SCM)'
  | 'Nomination Requested (Marketing)'
  | 'Nomination Confirmed'
  | 'FAT Conducted'
  | 'FAT Report Submitted (Marketing)'
  | 'DI Awaited from Utility'
  | 'DI Issued (MDCC Received)'
  | 'Dispatched'
  | 'Failed';

export interface Inspection {
  id: string;
  category: string;
  vendor: string;
  location: string;
  inspType: InspType;
  scheduledDate: string;
  slaDays: number;
  daysFromAward: number;
  status: InspStatus;
  tpiaAgency: string;
  fatProcedureRef: string;
  noticeIssued: boolean;
  reportRef: string;
  project: string;
  outcome: 'Cleared' | 'Minor NCR' | 'Major NCR' | 'Pending' | '';
  // ── Utility Handshake fields ──
  readinessPct: number; // e.g. 100% Conductor, 75% Hardware
  utility: string;
  nominatedOfficer?: string;
  fatReportRef?: string;
  marketingSubmissionDate?: string;
  diNumber?: string; // MSETCL DI #
  diDate?: string;
  diAuthorizedQty?: string;
  dispatchCleared: boolean;
  remarks?: string;
}

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'INS-2026-001',
    project: 'Rajkot-Jetpur 220kV Transmission Line',
    category: 'Conductor',
    vendor: 'Apar Industries Ltd (Silvassa Works)',
    location: 'Silvassa Plant',
    inspType: 'FAT',
    scheduledDate: '2026-12-10',
    slaDays: 7,
    daysFromAward: 14,
    status: 'Nomination Requested (Marketing)',
    tpiaAgency: 'RITES Ltd / Utility CEIG',
    fatProcedureRef: 'FAT-APAR-HTLS-001-R2',
    noticeIssued: true,
    reportRef: '',
    outcome: 'Pending',
    readinessPct: 100, // Conductor 100%
    utility: 'MSETCL / Utility',
    nominatedOfficer: 'Awaiting MSETCL EE (Transmission) Nomination',
    dispatchCleared: false,
    remarks: 'Conductor 100% readiness. Call raised. Expected inspection 2nd week of December 2026.',
  },
  {
    id: 'INS-2026-002',
    project: 'Rajkot-Jetpur 220kV Transmission Line',
    category: 'Hardware',
    vendor: 'Sigma / Aditya Birla Hardware Works',
    location: 'Vadodara Facility',
    inspType: 'FAT',
    scheduledDate: '2026-12-12',
    slaDays: 7,
    daysFromAward: 14,
    status: 'Call Raised (SCM)',
    tpiaAgency: 'Bureau Veritas',
    fatProcedureRef: 'FAT-HW-FIT-004',
    noticeIssued: true,
    reportRef: '',
    outcome: 'Pending',
    readinessPct: 75, // Hardware 75%
    utility: 'MSETCL / Utility',
    nominatedOfficer: 'Nomination to be arranged by Marketing',
    dispatchCleared: false,
    remarks: 'Hardware Fittings 75% ready. Inspection expected 2nd week of December 2026.',
  },
  {
    id: 'INS-2026-003',
    project: 'Rajkot-Jetpur 220kV Transmission Line',
    category: 'Insulator',
    vendor: 'Aditya Birla Insulators (Halol)',
    location: 'Halol Plant',
    inspType: 'TPIA',
    scheduledDate: '2026-12-14',
    slaDays: 7,
    daysFromAward: 14,
    status: 'Call Raised (SCM)',
    tpiaAgency: 'TÜV SÜD India',
    fatProcedureRef: 'FAT-INS-POLY-009',
    noticeIssued: true,
    reportRef: '',
    outcome: 'Pending',
    readinessPct: 75, // Insulators 75%
    utility: 'MSETCL / Utility',
    nominatedOfficer: 'Awaiting Utility Nomination',
    dispatchCleared: false,
    remarks: 'Insulators 75% ready. Expected by 2nd week of December 2026.',
  },
];

const STATUS_V: Record<string, string> = {
  'Call Raised (SCM)': 'secondary',
  'Nomination Requested (Marketing)': 'warning',
  'Nomination Confirmed': 'primary',
  'FAT Conducted': 'warning',
  'FAT Report Submitted (Marketing)': 'primary',
  'DI Awaited from Utility': 'warning',
  'DI Issued (MDCC Received)': 'success',
  'Dispatched': 'success',
  'Failed': 'danger',
};

const OUTCOME_V: Record<string, string> = { 
  Cleared: 'success', 
  'Minor NCR': 'warning', 
  'Major NCR': 'danger', 
  Pending: 'secondary', 
  '': 'secondary' 
};

const TPIA_AGENCIES = ['RITES Ltd', 'Bureau Veritas', 'TÜV SÜD India', 'ERDA Vadodara', 'CPRI', 'SGS India'];
const INSP_TYPES: InspType[] = ['FAT', 'TPIA', 'Factory Inspection', '25% Readiness Demo', 'Pre-Dispatch', 'Stage Inspection'];
const CATEGORIES = ['Conductor', 'Hardware', 'Insulator', 'Tower', 'OPGW', 'Transformer', 'Switchgear', 'Bay Equipment'];

export default function InspectionList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.13');
  const [activeTab, setActiveTab] = useState<'schedule' | 'di-loop' | 'analytics'>('di-loop');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showDiModal, setShowDiModal] = useState<Inspection | null>(null);
  const [inspections, setInspections] = usePersistentState<Inspection[]>('epc_inspections', INITIAL_INSPECTIONS);
  const [editRow, setEditRow] = useState<Inspection | null>(null);
  const [deleteRow, setDeleteRow] = useState<Inspection | null>(null);

  // DI Form State
  const [diForm, setDiForm] = useState({
    diNumber: 'MSETCL/SE/TR/DI-2026/094',
    diDate: new Date().toISOString().split('T')[0],
    diAuthorizedQty: '450 KM',
    nominatedOfficer: 'Er. R. Deshmukh (EE MSETCL) & RITES',
    fatReportRef: 'FAT-REP-APAR-2026-004',
  });

  const [newInspForm, setNewInspForm] = useState({
    project: 'Rajkot-Jetpur 220kV Transmission Line',
    category: CATEGORIES[0],
    type: INSP_TYPES[0] as InspType,
    tpia: TPIA_AGENCIES[0],
    vendor: 'Apar Industries Ltd',
    scheduledDate: '2026-12-10',
    fatRef: 'FAT-APAR-001-R0',
    readinessPct: 100,
  });

  const handleScheduleInspection = () => {
    const newInsp: Inspection = {
      id: `INS-2026-${String(inspections.length + 1).padStart(3, '0')}`,
      project: newInspForm.project,
      category: newInspForm.category,
      vendor: newInspForm.vendor || 'Vendor Facility',
      location: 'Vendor Works',
      inspType: newInspForm.type,
      scheduledDate: newInspForm.scheduledDate || new Date().toISOString().split('T')[0],
      slaDays: 7,
      daysFromAward: 14,
      status: 'Call Raised (SCM)',
      tpiaAgency: newInspForm.tpia,
      fatProcedureRef: newInspForm.fatRef,
      noticeIssued: true,
      reportRef: '',
      outcome: 'Pending',
      readinessPct: Number(newInspForm.readinessPct) || 100,
      utility: 'MSETCL / Utility',
      dispatchCleared: false,
      remarks: 'Inspection call raised by SCM.',
    };
    setInspections([newInsp, ...inspections]);
    setShowForm(false);
  };

  const handleRecordDI = () => {
    if (!showDiModal) return;
    setInspections(prev => prev.map(item => {
      if (item.id === showDiModal.id) {
        return {
          ...item,
          status: 'DI Issued (MDCC Received)',
          diNumber: diForm.diNumber,
          diDate: diForm.diDate,
          diAuthorizedQty: diForm.diAuthorizedQty,
          nominatedOfficer: diForm.nominatedOfficer,
          fatReportRef: diForm.fatReportRef,
          dispatchCleared: true,
          outcome: 'Cleared',
          remarks: `MSETCL DI #${diForm.diNumber} issued on ${diForm.diDate}. Authorized Qty: ${diForm.diAuthorizedQty}. Cleared for dispatch to site store.`,
        };
      }
      return item;
    }));
    setShowDiModal(null);
  };

  const handleAdvanceStatus = (id: string, nextStatus: InspStatus) => {
    setInspections(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const filtered = useMemo(() => inspections.filter(i =>
    (filterCat === 'All' || i.category === filterCat) &&
    (filterStatus === 'All' || i.status === filterStatus)
  ), [inspections, filterCat, filterStatus]);

  const tabs = [
    { id: 'di-loop',  label: '1. Utility Nomination & DI Loop (Marketing / SCM)' },
    { id: 'schedule', label: '2. Inspection Schedule & FAT' },
    { id: 'analytics',label: '3. QA / FAT Analytics' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="QA/QC Inspections & Dispatch Instructions (DI)" 
        description="SCM Inspection Calls · Marketing Utility Nomination · Joint FAT · MSETCL DI Issuance"
        action={canCreate ? { label: '+ Raise Inspection Call', onClick: () => setShowForm(true) } : undefined}
      />
      <ReadOnlyBanner moduleId="4.13" />

      {/* Process Flow Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Utility Inspection-to-Dispatch Workflow (MSETCL Governance)</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block">1. SCM Readiness</span>
            <span className="text-[11px] text-slate-500">100% Conductor / 75% H/W</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="font-bold text-amber-800 block">2. Mktg Nomination</span>
            <span className="text-[11px] text-amber-700">MSETCL EE Nominated</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
            <span className="font-bold text-indigo-800 block">3. Joint FAT</span>
            <span className="text-[11px] text-indigo-700">SCM + Utility Witness</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <span className="font-bold text-blue-800 block">4. Report to Mktg</span>
            <span className="text-[11px] text-blue-700">Signed FAT Submitted</span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
            <span className="font-bold text-purple-800 block">5. MSETCL DI / MDCC</span>
            <span className="text-[11px] text-purple-700">Official DI Issued</span>
          </div>
          <div className="p-2.5 rounded-lg bg-green-50 border border-green-200">
            <span className="font-bold text-green-800 block">6. Dispatch to Store</span>
            <span className="text-[11px] text-green-700">Store Controller GRN</span>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as any)} />

      {activeTab === 'di-loop' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-amber-400 bg-amber-50/40">
              <p className="text-xs text-amber-800 font-semibold uppercase">Calls Awaiting Utility Nomination</p>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {inspections.filter(i => i.status === 'Nomination Requested (Marketing)' || i.status === 'Call Raised (SCM)').length} Lots
              </p>
              <p className="text-[11px] text-amber-700 mt-1">Marketing coordinating with MSETCL CEIG / SE offices</p>
            </Card>

            <Card className="p-4 border-l-4 border-indigo-500 bg-indigo-50/40">
              <p className="text-xs text-indigo-800 font-semibold uppercase">FAT Conducted / Reports in Review</p>
              <p className="text-2xl font-black text-indigo-900 mt-1">
                {inspections.filter(i => i.status === 'FAT Conducted' || i.status === 'FAT Report Submitted (Marketing)' || i.status === 'DI Awaited from Utility').length} Lots
              </p>
              <p className="text-[11px] text-indigo-700 mt-1">Signed reports under MSETCL technical scrutiny</p>
            </Card>

            <Card className="p-4 border-l-4 border-green-500 bg-green-50/40">
              <p className="text-xs text-green-800 font-semibold uppercase">MSETCL DI Issued (Cleared for Site)</p>
              <p className="text-2xl font-black text-green-900 mt-1">
                {inspections.filter(i => i.dispatchCleared).length} Lots
              </p>
              <p className="text-[11px] text-green-700 mt-1">Ready for Site Store Inventory Controller</p>
            </Card>
          </div>

          {/* Master DI Card list */}
          <div className="space-y-3">
            {inspections.map(item => (
              <Card key={item.id} className="p-5 border border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.id}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{item.category} — {item.vendor}</h4>
                      <Badge variant={STATUS_V[item.status] as any}>{item.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Readiness: <strong className="text-slate-800">{item.readinessPct}% Ready</strong> · Scheduled Date: <strong>{item.scheduledDate}</strong> · TPIA: <strong>{item.tpiaAgency}</strong>
                    </p>
                  </div>

                  {/* Actions for workflow progression */}
                  <div className="flex items-center gap-2">
                    {item.status === 'Call Raised (SCM)' && (
                      <Button 
                        onClick={() => handleAdvanceStatus(item.id, 'Nomination Requested (Marketing)')}
                        className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-700"
                      >
                        Request Utility Nomination
                      </Button>
                    )}
                    {item.status === 'Nomination Requested (Marketing)' && (
                      <Button 
                        onClick={() => handleAdvanceStatus(item.id, 'Nomination Confirmed')}
                        className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Confirm Officer Nomination
                      </Button>
                    )}
                    {item.status === 'Nomination Confirmed' && (
                      <Button 
                        onClick={() => handleAdvanceStatus(item.id, 'FAT Report Submitted (Marketing)')}
                        className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700"
                      >
                        Record FAT & Submit to Marketing
                      </Button>
                    )}
                    {(item.status === 'FAT Report Submitted (Marketing)' || item.status === 'DI Awaited from Utility') && (
                      <Button 
                        onClick={() => {
                          setShowDiModal(item);
                          setDiForm(prev => ({
                            ...prev,
                            diAuthorizedQty: item.category === 'Conductor' ? '450 KM' : '900 Sets',
                          }));
                        }}
                        className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
                      >
                        <FileCheck2 size={14} /> Record MSETCL DI Received
                      </Button>
                    )}
                    {item.dispatchCleared && (
                      <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Cleared for Site Dispatch
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Utility & Nominated Officer</span>
                    <span className="font-medium text-slate-800">{item.nominatedOfficer || 'Pending MSETCL Nomination'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">FAT Procedure Reference</span>
                    <span className="font-mono text-slate-700">{item.fatProcedureRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">MSETCL DI / MDCC Number</span>
                    <span className="font-mono font-bold text-indigo-700">{item.diNumber || 'Awaiting DI from Utility'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized Dispatch Qty</span>
                    <span className="font-semibold text-slate-800">{item.diAuthorizedQty || '—'}</span>
                  </div>
                </div>

                {item.remarks && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Remarks:</span> {item.remarks}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Scheduled</th>
                  <th className="p-3">TPIA Agency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">DI Issued?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50 text-xs">
                    <td className="p-3 font-mono font-semibold text-indigo-600">{i.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{i.category}</td>
                    <td className="p-3 text-slate-600">{i.vendor}</td>
                    <td className="p-3 text-slate-500">{i.location}</td>
                    <td className="p-3 font-medium text-slate-700">{i.inspType}</td>
                    <td className="p-3 text-slate-700">{i.scheduledDate}</td>
                    <td className="p-3 text-slate-600">{i.tpiaAgency}</td>
                    <td className="p-3"><Badge variant={STATUS_V[i.status] as any}>{i.status}</Badge></td>
                    <td className="p-3">
                      {i.diNumber ? (
                        <span className="text-green-700 font-mono font-bold">{i.diNumber}</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending DI</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Inspections & DI Clearance by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inspections.map(i => ({ name: i.category, readiness: i.readinessPct, di: i.dispatchCleared ? 100 : 0 }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="readiness" fill="#6366f1" name="Material Readiness %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="di" fill="#22c55e" name="DI Cleared %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Governance: 60-Day Golden Period Milestones</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-green-50 border border-green-200">
                <span className="font-semibold text-green-800">Conductor 100% FAT Readiness</span>
                <span className="text-green-700 font-mono">10 Dec 2026</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-green-50 border border-green-200">
                <span className="font-semibold text-green-800">Hardware & Insulator 75% Readiness</span>
                <span className="text-green-700 font-mono">14 Dec 2026</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-amber-50 border border-amber-200">
                <span className="font-semibold text-amber-800">MSETCL DI Issuance SLA</span>
                <span className="text-amber-700 font-mono">≤10 days from FAT report</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* DI Record Modal */}
      {showDiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800">Record MSETCL Dispatch Instruction (DI)</h3>
                <p className="text-xs text-slate-500 mt-0.5">{showDiModal.category} — {showDiModal.vendor}</p>
              </div>
              <button onClick={() => setShowDiModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">MSETCL DI / MDCC Number *</label>
                <input 
                  value={diForm.diNumber}
                  onChange={e => setDiForm({ ...diForm, diNumber: e.target.value })}
                  placeholder="MSETCL/SE/TR/DI-2026/094"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">DI Date *</label>
                  <input 
                    type="date"
                    value={diForm.diDate}
                    onChange={e => setDiForm({ ...diForm, diDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Authorized Qty for Dispatch *</label>
                  <input 
                    value={diForm.diAuthorizedQty}
                    onChange={e => setDiForm({ ...diForm, diAuthorizedQty: e.target.value })}
                    placeholder="e.g. 450 KM"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nominated Inspector Sign-off</label>
                <input 
                  value={diForm.nominatedOfficer}
                  onChange={e => setDiForm({ ...diForm, nominatedOfficer: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Signed Joint FAT Report Ref</label>
                <input 
                  value={diForm.fatReportRef}
                  onChange={e => setDiForm({ ...diForm, fatReportRef: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowDiModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleRecordDI} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Issue Dispatch Clearance</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Raise SCM Inspection Call</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select 
                    value={newInspForm.category}
                    onChange={e => setNewInspForm({ ...newInspForm, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Vendor Works</label>
                  <input 
                    value={newInspForm.vendor}
                    onChange={e => setNewInspForm({ ...newInspForm, vendor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Readiness %</label>
                  <input 
                    type="number"
                    value={newInspForm.readinessPct}
                    onChange={e => setNewInspForm({ ...newInspForm, readinessPct: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Proposed FAT Date</label>
                  <input 
                    type="date"
                    value={newInspForm.scheduledDate}
                    onChange={e => setNewInspForm({ ...newInspForm, scheduledDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">TPIA Agency</label>
                <select 
                  value={newInspForm.tpia}
                  onChange={e => setNewInspForm({ ...newInspForm, tpia: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  {TPIA_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleScheduleInspection} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Submit Call to Marketing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
