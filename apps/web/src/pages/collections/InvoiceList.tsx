import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Plus, CheckCircle, Send, CheckCheck, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

export type InvoiceStatus = 'Raised' | 'Submitted' | 'Client Certified' | 'Paid' | 'Disputed';

export interface Invoice {
  id: string;
  project: string;
  client: string;
  type: string;
  grossAmount: number;
  certifiedAmount?: number;
  retentionDeduction: number;
  netPayable: number;
  invoiceDate: string;
  submissionDate?: string;
  certifiedDate?: string;
  dueDate: string;
  paymentReceivedDate?: string;
  status: InvoiceStatus;
  overdueDays: number;
}

const initialInvoices: Invoice[] = [];

const formatCr = (val: number) => `₹${(val / 10000000).toFixed(2)}Cr`;

const statusStyles: Record<InvoiceStatus, { badge: string; icon: React.ReactNode }> = {
  'Raised': { badge: 'bg-slate-100 text-slate-700', icon: <Clock className="w-3 h-3" /> },
  'Submitted': { badge: 'bg-blue-100 text-blue-700', icon: <Send className="w-3 h-3" /> },
  'Client Certified': { badge: 'bg-indigo-100 text-indigo-700 font-bold', icon: <CheckCircle className="w-3 h-3" /> },
  'Paid': { badge: 'bg-emerald-100 text-emerald-800 font-bold', icon: <CheckCheck className="w-3 h-3" /> },
  'Disputed': { badge: 'bg-rose-100 text-rose-800', icon: <AlertTriangle className="w-3 h-3" /> },
};

import { usePersistentState } from '../../hooks/usePersistentState';

export default function InvoiceList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.2');
  const [data, setData] = usePersistentState<Invoice[]>('epc_invoices', initialInvoices);
  const [newModal, setNewModal] = useState(false);
  const [certifyModal, setCertifyModal] = useState<Invoice | null>(null);
  const [certifyAmount, setCertifyAmount] = useState<number>(0);
  const [deleteRow, setDeleteRow] = useState<Invoice | null>(null);

  const [form, setForm] = useState({
    project: 'Rajkot-Jetpur 220kV Line',
    client: 'GETCO',
    type: 'Supply Milestone',
    grossAmount: 10000000,
    retentionDeduction: 1000000,
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  });

  const handleCreate = () => {
    const nextSeq = data.length + 1;
    const net = form.grossAmount - form.retentionDeduction;
    const newInv: Invoice = {
      id: `INV-2026-${String(nextSeq).padStart(3, '0')}`,
      project: form.project,
      client: form.client,
      type: form.type,
      grossAmount: Number(form.grossAmount),
      retentionDeduction: Number(form.retentionDeduction),
      netPayable: net,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate,
      status: 'Raised',
      overdueDays: 0,
    };
    setData(prev => [newInv, ...prev]);
    setNewModal(false);
  };

  const advanceToSubmitted = (inv: Invoice) => {
    setData(prev => prev.map(i => i.id === inv.id ? {
      ...i,
      status: 'Submitted',
      submissionDate: new Date().toISOString().slice(0, 10),
    } : i));
  };

  const openCertify = (inv: Invoice) => {
    setCertifyModal(inv);
    setCertifyAmount(inv.grossAmount);
  };

  const confirmCertify = () => {
    if (!certifyModal) return;
    setData(prev => prev.map(i => i.id === certifyModal.id ? {
      ...i,
      status: 'Client Certified',
      certifiedAmount: certifyAmount,
      certifiedDate: new Date().toISOString().slice(0, 10),
    } : i));
    setCertifyModal(null);
  };

  const advanceToPaid = (inv: Invoice) => {
    setData(prev => prev.map(i => i.id === inv.id ? {
      ...i,
      status: 'Paid',
      paymentReceivedDate: new Date().toISOString().slice(0, 10),
      overdueDays: 0,
    } : i));
  };

  const columns = [
    { key: 'id', header: 'Invoice #', render: (r: Invoice) => <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span> },
    { key: 'project', header: 'Project' },
    { key: 'client', header: 'Client' },
    { key: 'type', header: 'Billing Type' },
    { key: 'grossAmount', header: 'Gross Bill', render: (r: Invoice) => formatCr(r.grossAmount) },
    {
      key: 'certifiedAmount',
      header: 'Client Certified',
      render: (r: Invoice) => r.certifiedAmount ? (
        <span className="font-bold text-slate-800">{formatCr(r.certifiedAmount)}</span>
      ) : (
        <span className="text-slate-400 italic">Pending Cert.</span>
      )
    },
    { key: 'netPayable', header: 'Net Receivable', render: (r: Invoice) => formatCr(r.netPayable) },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (r: Invoice) => {
        const s = statusStyles[r.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
            {s.icon}
            {r.status}
          </span>
        );
      }
    },
    {
      key: 'due',
      header: 'Due / Overdue',
      render: (r: Invoice) => (
        <div>
          <span className="text-slate-600 text-xs block">{r.dueDate}</span>
          {r.overdueDays > 0 && (
            <span className="text-rose-600 font-bold text-[10px] flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> {r.overdueDays}d Overdue
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Progress Stage',
      render: (r: Invoice) => (
        <div className="flex items-center gap-1.5">
          {canUpdate && r.status === 'Raised' && (
            <button
              onClick={() => advanceToSubmitted(r)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Submit
            </button>
          )}
          {canUpdate && r.status === 'Submitted' && (
            <button
              onClick={() => openCertify(r)}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" /> Certify
            </button>
          )}
          {canUpdate && r.status === 'Client Certified' && (
            <button
              onClick={() => advanceToPaid(r)}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" /> Paid
            </button>
          )}
          {r.status === 'Paid' && (
            <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
              ✓ Realized
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Invoicing & Progressive Collections"
        subtitle="Full progressive status tracking: Raised &gt; Submitted &gt; Client Certified &gt; Realized"
        actions={
          canCreate ? (
            <button
              onClick={() => setNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate RA Bill
            </button>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Billed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">₹5.95 Cr</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Certified by Client</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">₹4.50 Cr</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Collected / Realized</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹1.20 Cr</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Overdue Receivables</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹2.20 Cr</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          onDelete={canRemove ? row => setDeleteRow(row as Invoice) : undefined}
          emptyMessage="No invoices found"
        />
      </div>

      {/* Certify Modal */}
      <Modal
        open={!!certifyModal}
        onClose={() => setCertifyModal(null)}
        title={`Record Client Certification — ${certifyModal?.id}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Enter the amount certified and signed off by GETCO/Client engineer for <strong>{certifyModal?.type}</strong>.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gross Raised Amount</label>
            <input
              type="text"
              readOnly
              value={formatCr(certifyModal?.grossAmount || 0)}
              className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Approved Certified Amount (₹)</label>
            <input
              type="number"
              value={certifyAmount}
              onChange={(e) => setCertifyAmount(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Net receivable will reflect any retention deductions automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCertifyModal(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmCertify}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Confirm Certification
            </button>
          </div>
        </div>
      </Modal>

      {/* New Invoice Modal */}
      <Modal
        open={newModal}
        onClose={() => setNewModal(false)}
        title="Generate New Running Account (RA) Bill"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                value={form.project}
                onChange={(e) => setForm(f => ({ ...f, project: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Rajkot-Jetpur 220kV Line">Rajkot-Jetpur 220kV Line</option>
                <option value="Surat-Bardoli 132kV Cable">Surat-Bardoli 132kV Cable</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client</label>
              <input
                type="text"
                value={form.client}
                onChange={(e) => setForm(f => ({ ...f, client: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Milestone / Work Description</label>
            <input
              type="text"
              placeholder="e.g. Tower Foundation Package RA Bill 3"
              value={form.type}
              onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gross Bill Amount (₹)</label>
              <input
                type="number"
                value={form.grossAmount}
                onChange={(e) => setForm(f => ({ ...f, grossAmount: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Retention Deduction (₹)</label>
              <input
                type="number"
                value={form.retentionDeduction}
                onChange={(e) => setForm(f => ({ ...f, retentionDeduction: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contractual Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setNewModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id || ''}
        recordType="Invoice"
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
