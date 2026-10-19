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
import { FileText, Truck, RefreshCw, AlertCircle, Plus, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';

// ─── Types ──────────────────────────────────────────────────────────────────

type LOIStatus = 'Active' | 'Converted to PO' | 'Expired' | 'Cancelled';
type QualityFlag = 'Pass' | 'Fail' | 'Pending';

interface LOIRecord {
  loiId: string;
  date: string;
  vendor: string;
  vendorCode: string;
  category: string;
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
// Project: NTPC Lara 765kV — 8 LOIs across 3 vendors

const MOCK_LOIS: LOIRecord[] = [];

const MOCK_PRODUCTION: ProductionStatus[] = [
  {
    loiId: 'LOI-NL-004',
    vendor: 'Aditya Birla Insulators',
    category: 'Insulators (Disc/Polymer)',
    percentComplete: 48,
    plannedCompletionDate: '2025-09-01',
    actualCompletionDate: null,
    qualityFlag: 'Pass',
    remarks: 'Production on schedule. 1st batch FAT passed on 2025-07-15.',
  },
  {
    loiId: 'LOI-NL-005',
    vendor: 'Apar Industries Ltd',
    category: 'HTLS Conductor',
    percentComplete: 72,
    plannedCompletionDate: '2025-07-25',
    actualCompletionDate: null,
    qualityFlag: 'Pending',
    remarks: '3rd lot drawing pending TPIA witness. Expected sign-off 2025-07-20.',
  },
  {
    loiId: 'LOI-NL-006',
    vendor: 'KEC International Ltd',
    category: 'Towers & Structures',
    percentComplete: 35,
    plannedCompletionDate: '2025-08-10',
    actualCompletionDate: null,
    qualityFlag: 'Pass',
    remarks: 'Fabrication at Jaipur facility. Steel procurement complete.',
  },
];

const MOCK_CONVERSIONS: POConversion[] = [
  {
    loiId: 'LOI-NL-001',
    poNumber: 'PO-NL-2025-0142',
    loiDate: '2025-06-07',
    conversionDate: '2025-06-14',
    loiQty: 820,
    poQty: 825,
    loiValueL: 4820,
    poValueL: 4858,
    deltaQty: 5,
    deltaValueL: 38,
    vendor: 'Apar Industries Ltd',
    category: 'HTLS Conductor',
  },
  {
    loiId: 'LOI-NL-002',
    poNumber: 'PO-NL-2025-0143',
    loiDate: '2025-06-07',
    conversionDate: '2025-06-14',
    loiQty: 480,
    poQty: 480,
    loiValueL: 980,
    poValueL: 980,
    deltaQty: 0,
    deltaValueL: 0,
    vendor: 'Apar Industries Ltd',
    category: 'OPGW Cable',
  },
  {
    loiId: 'LOI-NL-003',
    poNumber: 'PO-NL-2025-0151',
    loiDate: '2025-06-09',
    conversionDate: '2025-06-17',
    loiQty: 340,
    poQty: 338,
    loiValueL: 12400,
    poValueL: 12327,
    deltaQty: -2,
    deltaValueL: -73,
    vendor: 'KEC International Ltd',
    category: 'Towers & Structures',
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
  { month: 'Jun W1', loisIssued: 2, plannedConversions: 0 },
  { month: 'Jun W2', loisIssued: 3, plannedConversions: 2 },
  { month: 'Jun W3', loisIssued: 2, plannedConversions: 1 },
  { month: 'Jun W4', loisIssued: 1, plannedConversions: 0 },
  { month: 'Jul W1', loisIssued: 0, plannedConversions: 1 },
  { month: 'Jul W2', loisIssued: 0, plannedConversions: 2 },
  { month: 'Aug W1', loisIssued: 0, plannedConversions: 1 },
  { month: 'Aug W2', loisIssued: 0, plannedConversions: 1 },
];

const EMPTY_FORM: IssueLoiForm = {
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

import { usePersistentState } from '../../hooks/usePersistentState';

const ManufacturingClearance: React.FC = () => {
  const [activeTab, setActiveTab]     = useState<string>('loi-register');
  const [showForm, setShowForm]       = useState<boolean>(false);
  const [form, setForm]               = useState<IssueLoiForm>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [lois, setLois]               = usePersistentState<LOIRecord[]>('epc_gp_lois', MOCK_LOIS);

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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitLOI = () => {
    const nextNum = lois.length + 1;
    const newLoi: LOIRecord = {
      loiId: `LOI-NL-00${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      vendor: form.vendor,
      vendorCode: `VEN-00${nextNum}`,
      category: form.category,
      itemDescription: form.itemDesc,
      quantity: Number(form.quantity) || 100,
      unit: form.unit || 'Nos',
      estimatedValueL: Number(form.valueL) || 100,
      validTill: form.validTill || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: 'Active',
      daysToExpiry: 60,
    };
    setLois(prev => [newLoi, ...prev]);
    alert(`LOI ${newLoi.loiId} Created:\nVendor: ${form.vendor}\nCategory: ${form.category}\nValue: ₹${form.valueL}L\nValid Till: ${form.validTill}`);
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
        description="BRD §2.4 · Informal instruction to vendors to commence production before official PO · NTPC Lara 765kV"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} className="inline mr-1" />
            Issue LOI
          </Button>
        }
      />

      {/* ── BRD Note Banner ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>📋 What is Manufacturing Clearance?</strong> An LOI (Letter of Intent) / Manufacturing
        Clearance is an <em>unofficial</em> instruction issued to vendors to commence production
        during the Golden Period — before the official contract PO is signed. This enables early
        factory slot booking and material procurement, reducing overall project schedule risk.
        Manufacturing clearance unlocks the{' '}
        <strong>25% Pre-Production Readiness Gate (BRD §2.10)</strong>.
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
              <p className="text-xs text-gray-500">Production Started</p>
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
        <ResponsiveContainer width="100%" height={220}>
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
            <ReferenceLine x="Jun W2" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Bulk LOI week', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Issue LOI Form (modal-like) ── */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Issue New LOI / Manufacturing Clearance</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor *</label>
              <select
                name="vendor"
                value={form.vendor}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select vendor...</option>
                <option>Apar Industries Ltd (APR-001)</option>
                <option>KEC International Ltd (KEC-002)</option>
                <option>Aditya Birla Insulators (ABI-055)</option>
                <option>Polycab India Ltd (PCB-027)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select category...</option>
                <option>HTLS Conductor</option>
                <option>OPGW Cable</option>
                <option>Hardware & Fittings</option>
                <option>Insulators (Disc/Polymer)</option>
                <option>Towers & Structures</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Description *</label>
              <input
                type="text"
                name="itemDesc"
                value={form.itemDesc}
                onChange={handleFormChange}
                placeholder="e.g. HTLS ACCC Drake Conductor 4000m/drum"
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
                rows={3}
                placeholder="Reason for issuing LOI before official PO (e.g., factory slot booking, long-lead item)..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmitLOI}>Issue LOI</Button>
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
            <h3 className="font-semibold text-gray-700">LOI Register — NTPC Lara 765kV</h3>
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
                  <th className="px-3 py-2 text-gray-600 font-medium">Date</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Vendor</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Category</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Item Description</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Qty</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Unit</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Value (₹L)</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Valid Till</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Status</th>
                  <th className="px-3 py-2 text-gray-600 font-medium">Days to Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredLOIs.map((loi) => (
                  <tr key={loi.loiId} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-indigo-700">{loi.loiId}</td>
                    <td className="px-3 py-2 text-gray-600">{loi.date}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">{loi.vendor}</div>
                      <div className="text-xs text-gray-400">{loi.vendorCode}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{loi.category}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs max-w-xs truncate" title={loi.itemDescription}>
                      {loi.itemDescription}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{loi.quantity.toLocaleString('en-IN')}</td>
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
                ))}
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
              Production Progress — Active LOIs
            </h3>
            {/* Production progress bar chart */}
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
                  <span className="font-mono text-sm text-indigo-700">{prod.loiId}</span>
                  <Badge variant={QUALITY_BADGE[prod.qualityFlag]}>
                    {prod.qualityFlag}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{prod.vendor}</p>
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
                    <td className="px-3 py-2 font-mono text-green-700">{conv.poNumber}</td>
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

