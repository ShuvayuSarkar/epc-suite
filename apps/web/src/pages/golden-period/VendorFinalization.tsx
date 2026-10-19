// VendorFinalization.tsx
// BRD Gap 2.3 — Per-category vendor finalization workflow (12 categories)
// All 12 material categories must be finalized within 10 days of survey approval

import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { usePersistentState } from '../../hooks/usePersistentState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// ─── Types ──────────────────────────────────────────────────────────────────

type CategoryType = 'Manufactured' | 'Buyout' | 'Service';
type VendorStatus = 'Shortlisted' | 'LOI Issued' | 'PO Issued' | 'Approved';

interface CompetingVendor {
  name: string;
  code: string;
  quotedAmount: number; // in ₹ Lakhs
  deliveryWeeks: number;
  selected: boolean;
}

interface CategoryRow {
  id: number;
  categoryName: string;
  type: CategoryType;
  vendorName: string;
  vendorCode: string;
  rfqIssuedDate: string;
  quotationReceived: boolean;
  comparisonDone: boolean;
  loiIssuedDate: string | null;
  poIssuedDate: string | null;
  status: VendorStatus;
  daysTaken: number;
  comparisonNotes: string;
  competingVendors: CompetingVendor[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
// Project: NTPC Lara 765kV Transmission Line Package

const MOCK_CATEGORIES: CategoryRow[] = [];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<VendorStatus, 'success' | 'warning' | 'primary' | 'secondary'> = {
  'PO Issued':   'success',
  'Approved':    'success',
  'LOI Issued':  'primary',
  'Shortlisted': 'secondary',
};

const TYPE_COLORS: Record<CategoryType, string> = {
  Manufactured: '#6366f1',
  Buyout:       '#f59e0b',
  Service:      '#10b981',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}L`;

// ─── Component ───────────────────────────────────────────────────────────────

const VendorFinalization: React.FC = () => {
  const { canUpdate } = usePermission('4.14');
  const [categories, setCategories] = usePersistentState<CategoryRow[]>('epc_gp_categories', MOCK_CATEGORIES);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  const finalized = categories.filter(
    (c) => c.status === 'PO Issued' || c.status === 'Approved'
  ).length;

  const loiCount  = categories.filter((c) => c.loiIssuedDate).length;
  const poCount   = categories.filter((c) => c.poIssuedDate).length;
  const doneRows  = categories.filter((c) => c.daysTaken > 0);
  const avgDays   = doneRows.length
    ? Math.round(doneRows.reduce((s, c) => s + c.daysTaken, 0) / doneRows.length)
    : 0;

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const sMatch = filterStatus === 'All' || c.status === filterStatus;
      const tMatch = filterType   === 'All' || c.type   === filterType;
      return sMatch && tMatch;
    });
  }, [categories, filterStatus, filterType]);

  // Bar chart data — only rows with daysTaken > 0
  const barData = categories
    .filter((c) => c.daysTaken > 0)
    .map((c) => ({ name: `Cat ${c.id}`, days: c.daysTaken }));

  // Pie chart data
  const pieData = (['Manufactured', 'Buyout', 'Service'] as CategoryType[]).map((t) => ({
    name: t,
    value: categories.filter((c) => c.type === t).length,
  }));

  const toggleRow = (id: number) =>
    setExpandedRow((prev) => (prev === id ? null : id));

  const handleFinalize = (catId: number) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          comparisonDone: true,
          loiIssuedDate: c.loiIssuedDate || new Date().toISOString().split('T')[0],
          status: 'Approved' as VendorStatus,
          daysTaken: c.daysTaken || 8
        };
      }
      return c;
    }));
  };

  const handleSelectVendor = (catId: number, vendorCode: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        const chosen = c.competingVendors.find(v => v.code === vendorCode);
        return {
          ...c,
          vendorName: chosen ? chosen.name : c.vendorName,
          vendorCode: vendorCode,
          competingVendors: c.competingVendors.map(v => ({
            ...v,
            selected: v.code === vendorCode
          }))
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Vendor Finalization"
        description="BRD §2.3 · Per-category vendor finalization across 12 material categories · NTPC Lara 765kV"
        actions={
          <Badge variant="warning">
            <Clock size={12} className="inline mr-1" />
        <ReadOnlyBanner moduleId="4.14" />
            BRD: Finalize all within 10 days of survey approval
          </Badge>
        }
      />

      {/* ── Progress Bar ── */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">
            Categories Finalized (PO/Approved)
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {finalized} / 12
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(finalized / 12) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {12 - finalized} categories still pending finalization
        </p>
      </Card>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">% Categories with LOI</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">
            {Math.round((loiCount / 12) * 100)}%
          </p>
          <p className="text-sm text-gray-500">{loiCount} of 12</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">% Categories with PO</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {Math.round((poCount / 12) * 100)}%
          </p>
          <p className="text-sm text-gray-500">{poCount} of 12</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Days to Finalize</p>
          <p className={`text-3xl font-bold mt-1 ${avgDays > 10 ? 'text-red-600' : 'text-green-600'}`}>
            {avgDays}d
          </p>
          <p className="text-sm text-gray-500">BRD target: 10 days</p>
        </Card>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">
            Finalization Timeline (Days Taken per Category)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(v) => [`${v} days`, 'Days Taken']} />
              <Bar dataKey="days" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.days > 10 ? '#ef4444' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-1">Red bars exceed 10-day BRD benchmark</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">
            Vendor Type Split (12 Categories)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Filter by:</span>
        <select
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
        >
          {['All', 'Shortlisted', 'LOI Issued', 'PO Issued', 'Approved'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {['All', 'Manufactured', 'Buyout', 'Service'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 ml-2">
          Showing {filteredCategories.length} of 12 categories
        </span>
      </div>

      {/* ── Category Table ── */}
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">
          Vendor Finalization Register — 12 Categories
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 w-6" />
                <th className="px-3 py-2 text-gray-600 font-medium">#</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Category</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Type</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Vendor</th>
                <th className="px-3 py-2 text-gray-600 font-medium">RFQ Issued</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Quote Rcvd</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Comparison</th>
                <th className="px-3 py-2 text-gray-600 font-medium">LOI Date</th>
                <th className="px-3 py-2 text-gray-600 font-medium">PO Date</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Status</th>
                <th className="px-3 py-2 text-gray-600 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Main row */}
                  <tr
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(cat.id)}
                  >
                    <td className="px-3 py-2 text-gray-400">
                      {expandedRow === cat.id
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{cat.id}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{cat.categoryName}</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: TYPE_COLORS[cat.type] }}
                      >
                        {cat.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      <div>{cat.vendorName}</div>
                      <div className="text-xs text-gray-400">{cat.vendorCode}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{cat.rfqIssuedDate}</td>
                    <td className="px-3 py-2">
                      {cat.quotationReceived
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <Clock size={14} className="text-gray-400" />}
                    </td>
                    <td className="px-3 py-2">
                      {cat.comparisonDone
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <AlertTriangle size={14} className="text-yellow-500" />}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{cat.loiIssuedDate ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{cat.poIssuedDate ?? '—'}</td>
                    <td className="px-3 py-2">
                      <Badge variant={STATUS_BADGE[cat.status]}>{cat.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canUpdate || cat.status === 'PO Issued' || cat.status === 'Approved'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinalize(cat.id);
                        }}
                      >
                        {cat.status === 'PO Issued' || cat.status === 'Approved' ? 'Finalized' : 'Finalize'}
                      </Button>
                    </td>
                  </tr>

                  {/* Expanded inline detail */}
                  {expandedRow === cat.id && (
                    <tr className="bg-indigo-50 border-t border-indigo-100">
                      <td colSpan={12} className="px-6 py-4">
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                            Vendor Comparison — {cat.categoryName} {canUpdate && <span className="text-slate-400 font-normal lowercase">(click a vendor card to select)</span>}
                          </p>
                          {cat.competingVendors.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No competing vendors — bundled with equipment PO.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {cat.competingVendors.map((v) => (
                                <div
                                  key={v.code}
                                  onClick={() => canUpdate && handleSelectVendor(cat.id, v.code)}
                                  className={`rounded-lg border p-3 text-sm transition-all ${
                                    canUpdate ? 'cursor-pointer hover:shadow-md' : ''
                                  } ${
                                    v.selected
                                      ? 'border-indigo-400 bg-white shadow-sm ring-2 ring-indigo-400'
                                      : 'border-gray-200 bg-white hover:border-indigo-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800">{v.name}</span>
                                    {v.selected && (
                                      <CheckCircle size={14} className="text-indigo-500" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{v.code}</div>
                                  <div className="mt-2 text-sm font-semibold text-gray-700">
                                    {v.quotedAmount > 0 ? fmt(v.quotedAmount) : 'Awaited'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {v.deliveryWeeks > 0 ? `${v.deliveryWeeks} wks delivery` : '—'}
                                  </div>
                                  {v.selected ? (
                                    <Badge variant="success" className="mt-2 text-xs">Selected</Badge>
                                  ) : (
                                    canUpdate && <span className="text-[11px] text-indigo-500 hover:underline block mt-2">Select Vendor</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded p-2">
                            <span className="font-medium">Comparison Notes: </span>
                            {cat.comparisonNotes}
                          </div>
                          {cat.daysTaken > 0 && (
                            <p className="text-xs text-gray-500">
                              Days taken to finalize:{' '}
                              <span className={cat.daysTaken > 10 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                {cat.daysTaken} days
                              </span>{' '}
                              {cat.daysTaken > 10 ? '⚠ Exceeded BRD 10-day target' : '✓ Within BRD target'}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VendorFinalization;

