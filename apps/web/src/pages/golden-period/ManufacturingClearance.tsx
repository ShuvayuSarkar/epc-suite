// ManufacturingClearance.tsx
// BRD Gap 2.4 — LOI / Manufacturing Clearance (informal POs before official contract PO)
// BRD Note: Manufacturing clearance enables 25% pre-production readiness gate (BRD §2.10)

import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, ReferenceLine,
} from 'recharts';
import { FileText, Truck, RefreshCw, AlertCircle, Plus, X, Layers, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { usePersistentState } from '../../hooks/usePersistentState';
import { ClientBOQItem, INITIAL_MSETCL_BOQ } from '../../types/clientBoq';

// ─── Types ──────────────────────────────────────────────────────────────────

type LOIStatus = 'Active' | 'Converted to PO' | 'Expired' | 'Cancelled';
type QualityFlag = 'Pass' | 'Fail' | 'Pending';

interface LOIRecord {
  loiId: string;
  date: string;
  vendor: string;
  vendorCode: string;
  category: string;
  boqItemId?: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedValueL: number; // ₹ Lakhs
  validTill: string;
  status: LOIStatus;
  daysToExpiry: number | null; // null if not active
}

interface ProductionStatus {
  loiId: string;
  vendor: string;
  category: string;
  percentComplete: number;
  plannedCompletionDate: string;
  actualCompletionDate: string | null;
  qualityFlag: QualityFlag;
  remarks: string;
}

interface POConversion {
  loiId: string;
  poNumber: string;
  loiDate: string;
  conversionDate: string;
  loiQty: number;
  poQty: number;
  loiValueL: number;
  poValueL: number;
  deltaQty: number;
  deltaValueL: number;
  vendor: string;
  category: string;
}

interface IssueLoiForm {
  boqItemId: string;
  vendor: string;
  category: string;
  itemDesc: string;
  quantity: string;
  unit: string;
  valueL: string;
  validTill: string;
  justification: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Seeded with Golden Period initial allocations: 100% Conductor, 75% Hardware, 75% Insulators

const MOCK_LOIS: LOIRecord[] = [
  {
    loiId: 'LOI-MC-001',
    date: '2026-10-02',
    vendor: 'Apar Industries Ltd (Internal Works)',
    vendorCode: 'APR-INT-01',
    category: 'Conductor',
    boqItemId: 'BOQ-01',
    itemDescription: 'HTLS INVAR Conductor - 100% Client Mother BOQ Allocation',
    quantity: 450,
    unit: 'KM',
    estimatedValueL: 2160,
    validTill: '2026-12-15',
    status: 'Active',
    daysToExpiry: 55,
  },
  {
    loiId: 'LOI-MC-002',
    date: '2026-10-04',
    vendor: 'Ensto / IAC Hardware Works',
    vendorCode: 'VEN-HW-02',
    category: 'Hardware',
    boqItemId: 'BOQ-02',
    itemDescription: 'Hardware Fittings & Vibration Dampers (75% Advance Booking)',
    quantity: 900,
    unit: 'Sets',
    estimatedValueL: 405,
    validTill: '2026-12-15',
    status: 'Active',
    daysToExpiry: 55,
  },
  {
    loiId: 'LOI-MC-003',
    date: '2026-10-05',
    vendor: 'Aditya Birla Insulators',
    vendorCode: 'ABI-055',
    category: 'Insulator',
    boqItemId: 'BOQ-03',
    itemDescription: 'Disc / Polymer Long Rod Insulators 120kN/160kN (75% Advance Booking)',
    quantity: 3600,
    unit: 'Nos',
    estimatedValueL: 288,
    validTill: '2026-12-20',
    status: 'Active',
    daysToExpiry: 60,
  },
];

const MOCK_PRODUCTION: ProductionStatus[] = [
  {
    loiId: 'LOI-MC-001',
    vendor: 'Apar Industries Ltd (Internal Works)',
    category: 'HTLS Conductor',
    percentComplete: 78,
    plannedCompletionDate: '2026-11-05',
    actualCompletionDate: null,
    qualityFlag: 'Pass',
    remarks: 'Stranding of lot 1 & 2 complete. FAT call raised to Marketing & MSETCL.',
  },
  {
    loiId: 'LOI-MC-002',
    vendor: 'Ensto / IAC Hardware Works',
    category: 'Hardware Fittings',
    percentComplete: 62,
    plannedCompletionDate: '2026-11-12',
    actualCompletionDate: null,
    qualityFlag: 'Pass',
    remarks: 'Forging & galvanization complete for tension clamps. Suspension clamps in machining.',
  },
  {
    loiId: 'LOI-MC-003',
    vendor: 'Aditya Birla Insulators',
    category: 'Insulators (Disc/Polymer)',
    percentComplete: 48,
    plannedCompletionDate: '2026-11-20',
    actualCompletionDate: null,
    qualityFlag: 'Pending',
    remarks: 'Sample batch electrical tests passed. Full lot assembly underway.',
  },
];

const MOCK_CONVERSIONS: POConversion[] = [
  {
    loiId: 'LOI-MC-001',
    poNumber: 'PO-APAR-2026-001',
    loiDate: '2026-10-02',
    conversionDate: '2026-10-16',
    loiQty: 450,
    poQty: 450,
    loiValueL: 2160,
    poValueL: 2160,
    deltaQty: 0,
    deltaValueL: 0,
    vendor: 'Apar Industries Ltd',
    category: 'HTLS Conductor',
  },
  {
    loiId: 'LOI-MC-002',
    poNumber: 'PO-VEN-2026-008',
    loiDate: '2026-10-04',
    conversionDate: '2026-10-18',
    loiQty: 900,
    poQty: 900,
    loiValueL: 405,
    poValueL: 405,
    deltaQty: 0,
    deltaValueL: 0,
    vendor: 'Ensto / IAC Hardware Works',
    category: 'Hardware & Fittings',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const LOI_STATUS_BADGE: Record<LOIStatus, 'success' | 'danger' | 'warning' | 'secondary'> = {
  'Active':          'warning',
  'Converted to PO': 'success',
  'Expired':         'danger',
  'Cancelled':       'secondary',
};

const QUALITY_BADGE: Record<QualityFlag, 'success' | 'danger' | 'secondary'> = {
  Pass:    'success',
  Fail:    'danger',
  Pending: 'secondary',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}L`;

// Timeline data: LOI issuance & planned PO conversion
const timelineData = [
  { month: 'Oct W1', loisIssued: 3, plannedConversions: 0 },
  { month: 'Oct W2', loisIssued: 1, plannedConversions: 1 },
  { month: 'Oct W3', loisIssued: 2, plannedConversions: 2 },
  { month: 'Oct W4', loisIssued: 1, plannedConversions: 1 },
  { month: 'Nov W1', loisIssued: 0, plannedConversions: 2 },
  { month: 'Nov W2', loisIssued: 0, plannedConversions: 1 },
];

const EMPTY_FORM: IssueLoiForm = {
  boqItemId: '',
  vendor: '',
  category: '',
  itemDesc: '',
  quantity: '',
  unit: '',
  valueL: '',
  validTill: '',
  justification: '',
};

// ─── Component ───────────────────────────────────────────────────────────────

const ManufacturingClearance: React.FC = () => {
  const [activeTab, setActiveTab]         = useState<string>('loi-register');
  const [showForm, setShowForm]           = useState<boolean>(false);
  const [form, setForm]                   = useState<IssueLoiForm>(EMPTY_FORM);
  const [filterStatus, setFilterStatus]   = useState<string>('All');
  const [lois, setLois]                   = usePersistentState<LOIRecord[]>('epc_gp_lois', MOCK_LOIS);
  const [clientBoqs, setClientBoqs]       = usePersistentState<ClientBOQItem[]>('epc_client_boq_items', INITIAL_MSETCL_BOQ);

  // Selected BOQ info for form validation
  const selectedBoq = useMemo(() => {
    return clientBoqs.find(b => b.id === form.boqItemId);
  }, [clientBoqs, form.boqItemId]);

  const remainingBalance = useMemo(() => {
    if (!selectedBoq) return 0;
    return Math.max(0, selectedBoq.contractQty - selectedBoq.orderedQty);
  }, [selectedBoq]);

  const isOverBalance = useMemo(() => {
    const qty = Number(form.quantity) || 0;
    return selectedBoq && qty > remainingBalance;
  }, [form.quantity, selectedBoq, remainingBalance]);

  // KPI counts
  const totalLOIs        = lois.length;
  const activeLOIs       = lois.filter((l) => l.status === 'Active').length;
  const convertedLOIs    = lois.filter((l) => l.status === 'Converted to PO').length;
  const expiredLOIs      = lois.filter((l) => l.status === 'Expired').length;
  const cancelledLOIs    = lois.filter((l) => l.status === 'Cancelled').length;

  const filteredLOIs = useMemo(() => {
    if (filterStatus === 'All') return lois;
    return lois.filter((l) => l.status === filterStatus);
  }, [lois, filterStatus]);

  const handleBoqSelect = (boqId: string) => {
    const b = clientBoqs.find(item => item.id === boqId);
    if (b) {
      const balance = Math.max(0, b.contractQty - b.orderedQty);
      setForm(prev => ({
        ...prev,
        boqItemId: boqId,
        category: b.category,
        unit: b.uom,
        itemDesc: b.description,
        quantity: balance > 0 ? String(balance) : '0',
        valueL: balance > 0 ? String(Math.round(balance * b.rateLakhs)) : '0',
      }));
    } else {
      setForm(prev => ({ ...prev, boqItemId: '' }));
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitLOI = () => {
    if (!form.vendor) {
      alert('Please select or specify a vendor.');
      return;
    }
    const enteredQty = Number(form.quantity) || 100;
    const nextNum = lois.length + 1;
    const newLoi: LOIRecord = {
      loiId: `LOI-MC-00${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      vendor: form.vendor,
      vendorCode: `VEN-00${nextNum}`,
      category: form.category || (selectedBoq?.category ?? 'Turnkey Item'),
      boqItemId: form.boqItemId || undefined,
      itemDescription: form.itemDesc || (selectedBoq?.description ?? 'Manufacturing clearance order'),
      quantity: enteredQty,
      unit: form.unit || (selectedBoq?.uom ?? 'Nos'),
      estimatedValueL: Number(form.valueL) || 100,
      validTill: form.validTill || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: 'Active',
      daysToExpiry: 60,
    };

    setLois(prev => [newLoi, ...prev]);

    // Update Mother Order BOQ consumption
    if (form.boqItemId) {
      setClientBoqs(prev => prev.map(b => {
        if (b.id === form.boqItemId) {
          const newOrdered = b.orderedQty + enteredQty;
          return {
            ...b,
            orderedQty: newOrdered,
            status: newOrdered >= b.contractQty ? 'Fully Ordered' : 'Partially Ordered',
          };
        }
        return b;
      }));
    }

    alert(`✅ LOI ${newLoi.loiId} Issued Successfully:\nVendor: ${form.vendor}\nMapped BOQ Item: ${selectedBoq ? selectedBoq.description : 'Ad-hoc'}\nQty: ${enteredQty} ${form.unit}\nEstimated Value: ₹${form.valueL} Lakhs`);
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  const tabs = [
    { id: 'loi-register',   label: 'LOI Register' },
    { id: 'production',     label: 'Production Status' },
    { id: 'po-conversion',  label: 'Conversion to PO' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="LOI / Manufacturing Clearance"
        description="BRD §2.4 · Downstream Ordering strictly mapped against Mother Order Client BOQ · 60-Day Ground Break Track"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} className="inline mr-1" />
            Issue LOI / Clearance
          </Button>
        }
      />

      {/* ── Mother Order BOQ Dynamic Allocation Banner ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                Golden Period Rule (Day 0 – 60)
              </span>
              <span className="text-xs text-indigo-300">Target Ground Break: Day 60</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Downstream Manufacturing Clearances locked to Client Mother BOQ
            </h3>
            <p className="text-xs text-indigo-200 max-w-3xl mt-0.5">
              Advance factory slot bookings and manufacturing clearances issued during the Golden Period must consume strictly against authorized Client Mother BOQ line items. Downstream purchase orders and internal works LOIs dynamically validate against remaining contract line balances.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-950/60 p-3 rounded-lg border border-indigo-700/50">
            <Layers className="text-indigo-400" size={24} />
            <div className="text-right">
              <div className="text-xs text-indigo-300">Client Mother BOQ</div>
              <div className="text-lg font-bold text-white">{clientBoqs.length} Line Items</div>
            </div>
          </div>
        </div>

        {/* Dynamic Mother BOQ Line Item Allocation Chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-indigo-700/40">
          {clientBoqs.slice(0, 3).map((item) => {
            const pct = item.contractQty > 0 ? Math.min(100, Math.round((item.orderedQty / item.contractQty) * 100)) : 0;
            const balance = Math.max(0, item.contractQty - item.orderedQty);
            return (
              <div key={item.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-indigo-200 font-medium truncate max-w-[190px]" title={item.description}>
                    #{item.itemNo}. {item.description}
                  </span>
                  <span className={`font-bold ${pct >= 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                    {pct}% Ordered
                  </span>
                </div>
                <div className="text-base font-bold text-white">
                  {item.orderedQty.toLocaleString()} / {item.contractQty.toLocaleString()} {item.uom}
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-emerald-400' : pct > 0 ? 'bg-amber-400' : 'bg-slate-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-indigo-200 mt-1 flex items-center justify-between">
                  <span>Balance: {balance.toLocaleString()} {item.uom}</span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">{item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
        {clientBoqs.length > 3 && (
          <div className="text-right text-[11px] text-indigo-300 mt-2">
            Showing top 3 of {clientBoqs.length} Mother BOQ line items
          </div>
        )}
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total LOIs Issued</p>
              <p className="text-2xl font-bold text-gray-800">{totalLOIs}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Truck size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Clearances</p>
              <p className="text-2xl font-bold text-yellow-600">{activeLOIs}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RefreshCw size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Converted to PO</p>
              <p className="text-2xl font-bold text-green-600">{convertedLOIs}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Expired / Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{expiredLOIs + cancelledLOIs}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Timeline Chart ── */}
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">
          LOI Issuance vs Planned PO Conversion Timeline
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timelineData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="loisIssued"
              name="LOIs Issued"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="plannedConversions"
              name="Planned PO Conversions"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 4 }}
            />
            <ReferenceLine x="Oct W1" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Golden Period Start', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Issue LOI Form (modal-like) ── */}
      {showForm && (
        <Card className="border-2 border-indigo-400 bg-indigo-50/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Issue New LOI / Manufacturing Clearance</h3>
              <p className="text-xs text-gray-500">All LOIs must consume against an authorized Mother BOQ line item</p>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mother BOQ Selector */}
            <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-indigo-200">
              <label className="block text-xs font-bold text-indigo-900 mb-1">
                Select Mother Order Client BOQ Item *
              </label>
              <select
                value={form.boqItemId}
                onChange={(e) => handleBoqSelect(e.target.value)}
                className="w-full border border-indigo-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- Choose from Client Mother Order BOQ --</option>
                {clientBoqs.map((b) => (
                  <option key={b.id} value={b.id}>
                    Item #{b.itemNo}: {b.description} ({b.contractQty} {b.uom} | Ordered: {b.orderedQty} {b.uom})
                  </option>
                ))}
              </select>

              {selectedBoq && (
                <div className="mt-2.5 p-2.5 bg-indigo-50/80 rounded-md border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Contracted:</span>{' '}
                    <strong className="text-gray-800">{selectedBoq.contractQty} {selectedBoq.uom}</strong>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">Already Ordered:</span>{' '}
                    <strong className="text-indigo-700">{selectedBoq.orderedQty} {selectedBoq.uom}</strong>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">Remaining Balance:</span>{' '}
                    <strong className={remainingBalance > 0 ? 'text-emerald-700 font-bold' : 'text-red-600'}>
                      {remainingBalance} {selectedBoq.uom}
                    </strong>
                  </div>
                  {isOverBalance && (
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      ⚠️ Order exceeds available Mother BOQ balance!
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor *</label>
              <select
                name="vendor"
                value={form.vendor}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select vendor...</option>
                <option>Apar Industries Ltd (Internal Works)</option>
                <option>Ensto / IAC Hardware Works</option>
                <option>Aditya Birla Insulators (ABI-055)</option>
                <option>KEC International Ltd (KEC-002)</option>
                <option>Polycab India Ltd (PCB-027)</option>
                <option>Sterlite Technologies Ltd</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="Conductor, Hardware, Insulators..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Description *</label>
              <input
                type="text"
                name="itemDesc"
                value={form.itemDesc}
                onChange={handleFormChange}
                placeholder="e.g. HTLS INVAR Drake Conductor 4000m/drum"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                <input
                  type="text"
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                  placeholder="Nos/km"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value (₹ Lakhs) *</label>
              <input
                type="number"
                name="valueL"
                value={form.valueL}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LOI Valid Till *</label>
              <input
                type="date"
                name="validTill"
                value={form.validTill}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Justification for Early Start *</label>
              <textarea
                name="justification"
                value={form.justification}
                onChange={handleFormChange}
                rows={2}
                placeholder="Golden Period allocation reason (e.g. factory slot booking for 60-day ground break deadline)..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmitLOI}>Issue LOI & Update Mother BOQ</Button>
          </div>
        </Card>
      )}

      {/* ── Tabs ── */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ── TAB 1: LOI Register ── */}
      {activeTab === 'loi-register' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">LOI / Manufacturing Clearance Register</h3>
              <p className="text-xs text-gray-500">All orders tracked against client contract & Mother Order BOQ</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {['All', 'Active', 'Converted to PO', 'Expired', 'Cancelled'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 text-gray-600 font-medium">LOI ID</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Mother BOQ</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Date</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Vendor</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Category</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Item Description</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Qty</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Unit</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Value (₹L)</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Valid Till</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Status</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {filteredLOIs.map((loi) => {
                  const mappedBoq = clientBoqs.find(b => b.id === loi.boqItemId);
                  return (
                    <tr key={loi.loiId} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-indigo-700 font-semibold">{loi.loiId}</td>
                      <td className="px-3 py-2">
                        {mappedBoq ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            #{mappedBoq.itemNo} {mappedBoq.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Ad-hoc</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{loi.date}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-800">{loi.vendor}</div>
                        <div className="text-xs text-gray-400">{loi.vendorCode}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{loi.category}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs max-w-xs truncate" title={loi.itemDescription}>
                        {loi.itemDescription}
                      </td>
                      <td className="px-3 py-2 text-gray-700 font-semibold">{loi.quantity.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-gray-500">{loi.unit}</td>
                      <td className="px-3 py-2 font-semibold text-gray-700">{fmt(loi.estimatedValueL)}</td>
                      <td className="px-3 py-2 text-gray-600">{loi.validTill}</td>
                      <td className="px-3 py-2">
                        <Badge variant={LOI_STATUS_BADGE[loi.status]}>{loi.status}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        {loi.daysToExpiry !== null ? (
                          <span className={`font-semibold text-sm ${loi.daysToExpiry <= 14 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {loi.daysToExpiry}d
                            {loi.daysToExpiry <= 14 && ' ⚠'}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 2: Production Status ── */}
      {activeTab === 'production' && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-700 mb-4">
              Production Progress — Golden Period Manufacturing Clearances
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={MOCK_PRODUCTION.map((p) => ({ name: p.loiId, pct: p.percentComplete }))}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 80, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, '% Complete']} />
                <Bar dataKey="pct" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_PRODUCTION.map((prod) => (
              <Card key={prod.loiId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-indigo-700 font-semibold">{prod.loiId}</span>
                  <Badge variant={QUALITY_BADGE[prod.qualityFlag]}>
                    {prod.qualityFlag}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-700">{prod.vendor}</p>
                <p className="text-xs text-gray-500 mb-3">{prod.category}</p>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Production Progress</span>
                    <span className="font-semibold">{prod.percentComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${prod.percentComplete}%`,
                        backgroundColor:
                          prod.percentComplete >= 75 ? '#10b981' :
                          prod.percentComplete >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <span className="font-medium">Planned Completion:</span> {prod.plannedCompletionDate}
                  </div>
                  <div>
                    <span className="font-medium">Actual Completion:</span>{' '}
                    {prod.actualCompletionDate ?? 'In Progress'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">{prod.remarks}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: Conversion to PO ── */}
      {activeTab === 'po-conversion' && (
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">
            LOI → PO Conversion Register
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 text-gray-600 font-medium">LOI ID</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">PO Number</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Vendor</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Category</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">LOI Date</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Conversion Date</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">LOI Qty</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">PO Qty</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Δ Qty</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">LOI Value</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">PO Value</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Δ Value</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CONVERSIONS.map((conv) => (
                  <tr key={conv.loiId} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-indigo-700">{conv.loiId}</td>
                    <td className="px-3 py-2 font-mono text-green-700 font-medium">{conv.poNumber}</td>
                    <td className="px-3 py-2 text-gray-700 text-xs">{conv.vendor}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{conv.category}</td>
                    <td className="px-3 py-2 text-gray-600">{conv.loiDate}</td>
                    <td className="px-3 py-2 text-gray-600">{conv.conversionDate}</td>
                    <td className="px-3 py-2 text-gray-700">{conv.loiQty.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-gray-700">{conv.poQty.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${conv.deltaQty > 0 ? 'text-yellow-600' : conv.deltaQty < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                        {conv.deltaQty > 0 ? `+${conv.deltaQty}` : conv.deltaQty === 0 ? '—' : conv.deltaQty}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{fmt(conv.loiValueL)}</td>
                    <td className="px-3 py-2 text-gray-700">{fmt(conv.poValueL)}</td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${conv.deltaValueL > 0 ? 'text-yellow-600' : conv.deltaValueL < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                        {conv.deltaValueL > 0 ? `+${fmt(conv.deltaValueL)}` : conv.deltaValueL === 0 ? '—' : fmt(conv.deltaValueL)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
            <strong>Summary:</strong> {MOCK_CONVERSIONS.length} LOIs converted to official POs.
            Total value converted:{' '}
            <strong>{fmt(MOCK_CONVERSIONS.reduce((s, c) => s + c.poValueL, 0))}</strong>.
            All conversions completed within the Golden Period window.
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManufacturingClearance;
