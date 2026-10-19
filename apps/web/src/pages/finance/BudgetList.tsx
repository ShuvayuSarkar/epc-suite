import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lock, History, ListFilter, Layers, Plus, CheckCircle, ShieldAlert } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { CBSTree, CBSNode } from '../../components/finance/CBSTree';

type BudgetRow = {
  id: string;
  cbsCode: string;
  head: string;
  budget: number;
  baseline: number;
  actual: number;
  commitments: number;
  variance: number;
  period: string;
};

const MOCK_CBS_NODES: CBSNode[] = [];

const initialFlatBudget: BudgetRow[] = [];

const formatCr = (val: number) => `₹${(val / 10000000).toFixed(2)}Cr`;

import { usePersistentState } from '../../hooks/usePersistentState';

export default function BudgetList() {
  const { canUpdate, canRemove } = usePermission('4.7');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [data, setData] = usePersistentState<BudgetRow[]>('epc_budget_flat', initialFlatBudget);
  const [cbsNodes, setCbsNodes] = usePersistentState<CBSNode[]>('epc_cbs_nodes', MOCK_CBS_NODES);
  const [activeBaseline, setActiveBaseline] = useState('Rev 0 (Contract Original)');
  const [baselineModal, setBaselineModal] = useState(false);
  const [lockNotes, setLockNotes] = useState('');
  const [deleteRow, setDeleteRow] = useState<BudgetRow | null>(null);

  const baselineHistory = [
    { rev: 'Rev 0', date: '2026-06-15', total: 112000000, lockedBy: 'Finance Controller', remarks: 'Award baseline signed off' },
  ];

  const handleLockNewBaseline = () => {
    setActiveBaseline(`Rev 1 (${new Date().toLocaleDateString()})`);
    setBaselineModal(false);
    setLockNotes('');
  };

  const columns = [
    { key: 'cbsCode', header: 'CBS Code', render: (r: BudgetRow) => <span className="font-mono text-xs font-bold text-indigo-600">{r.cbsCode}</span> },
    { key: 'head', header: 'Cost Head' },
    { key: 'baseline', header: 'Baseline Budget', render: (r: BudgetRow) => formatCr(r.baseline) },
    { key: 'actual', header: 'Actual Spent', render: (r: BudgetRow) => formatCr(r.actual) },
    { key: 'commitments', header: 'Open POs / Commit', render: (r: BudgetRow) => <span className="text-blue-600">{formatCr(r.commitments)}</span> },
    {
      key: 'variance',
      header: 'Variance',
      render: (r: BudgetRow) => (
        <span className={r.variance >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
          {r.variance > 0 ? '+' : ''}{formatCr(r.variance)}
        </span>
      )
    },
    {
      key: 'variancePct',
      header: 'Variance %',
      render: (r: BudgetRow) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          r.variance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {((r.variance / r.baseline) * 100).toFixed(1)}%
        </span>
      )
    },
    { key: 'period', header: 'Period' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Control & CBS Budget Baselines"
        subtitle="Cost Breakdown Structure, baseline locking, commitments and variance forecasting"
        actions={
          canUpdate ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBaselineModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Lock Budget Baseline
              </button>
            </div>
          ) : undefined
        }
      />

      {/* KPI & Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Baseline Budget vs Actual Cost vs Open Commitments
          </p>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="head" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${v / 10000000}Cr`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => formatCr(value)} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="baseline" name="Baseline Budget" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commitments" name="Open Commitments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Baseline Version Status
          </p>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-[10px] text-indigo-600 font-bold block">ACTIVE REVISION</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{activeBaseline}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total Baseline: <strong>₹11.20 Cr</strong></p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Baseline Change Log
            </p>
            <div className="space-y-1.5 text-xs">
              {baselineHistory.map(h => (
                <div key={h.rev} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{h.rev}</span>
                    <span>{h.date}</span>
                  </div>
                  <p className="text-slate-500">{h.remarks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'tree' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            CBS Hierarchical Tree
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'flat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Flat Table View
          </button>
        </div>

        <span className="text-xs text-slate-400">
          {viewMode === 'tree' ? 'Showing full project CBS tree' : 'Showing summary cost heads'}
        </span>
      </div>

      {/* Main Content: Tree vs Flat Table */}
      {viewMode === 'tree' ? (
        <CBSTree nodes={cbsNodes} baselineRevision={activeBaseline} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            emptyMessage="No budget heads configured"
          />
        </div>
      )}

      {/* Lock Baseline Modal */}
      <Modal
        open={baselineModal}
        onClose={() => setBaselineModal(false)}
        title="Lock New Budget Baseline (Rev 1)"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Locking a budget baseline creates a permanent, immutable financial benchmark for EVM calculations (PV / Earned Value). All future cost variances will be benchmarked against this revision.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-amber-800">
              Only authorized Project Directors & Finance Controllers can freeze baseline budgets.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Revision Reason / Variation Order Reference
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Incorporated Variation Order VO-002 for 2 additional deviation towers approved by GETCO."
              value={lockNotes}
              onChange={(e) => setLockNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setBaselineModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleLockNewBaseline}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-semibold"
            >
              Confirm & Lock Baseline
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.head ?? 'this record'}
        recordType="Budget Item"
        onConfirm={() => {
          if (deleteRow) {
            setData(prev => prev.filter(r => r.id !== deleteRow.id));
            setDeleteRow(null);
          }
        }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}
