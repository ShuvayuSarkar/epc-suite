import React, { useState } from 'react';
import { Card, PageHeader, Button, DataTable, Badge } from '../../components/ui';
import { X, Plus } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Amendment = {
  id: string; amdId: string; project: string; origPo: string;
  trigger: string; costImpact: number; timeImpact: number;
  status: string; date: string;
};

const initialAmendments: Amendment[] = [];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const columns = [
  { key: 'amdId', header: 'Amendment ID' },
  { key: 'project', header: 'Project' },
  { key: 'origPo', header: 'Original PO' },
  { key: 'trigger', header: 'Trigger', render: (val: any) => <Badge variant="secondary">{String(val?.trigger || val || '').replace('_', ' ')}</Badge> },
  { key: 'costImpact', header: 'Cost Impact (₹)', render: (row: any) => {
    const val = row?.costImpact ?? row;
    return <span className={val > 0 ? 'text-red-600 font-medium' : ''}>{formatCurrency(val)}</span>;
  } },
  { key: 'timeImpact', header: 'Time Impact (Days)', render: (row: any) => {
    const val = row?.timeImpact ?? row;
    return <span className={val > 0 ? 'text-amber-600 font-medium' : ''}>{val > 0 ? `+${val}` : val}</span>;
  } },
  { key: 'status', header: 'Status', render: (row: any) => {
      const val = row?.status ?? row;
      const colors: any = { REQUESTED: 'default', INTERNAL_APPROVAL: 'warning', APPROVED: 'success' };
      return <Badge variant={colors[val] || 'secondary'}>{String(val).replace('_', ' ')}</Badge>;
    }
  },
  { key: 'date', header: 'Date' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

const POAmendmentList = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.8');
  const [data, setData] = usePersistentState<Amendment[]>('epc_po_amendments', initialAmendments);
  const [editRow, setEditRow] = useState<Amendment | null>(null);
  const [editForm, setEditForm] = useState<Amendment | null>(null);
  const [deleteRow, setDeleteRow] = useState<Amendment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAmd, setNewAmd] = useState({
    amdId: '',
    project: 'NTPC Lara',
    origPo: 'PO-2026-001',
    trigger: 'CHANGE_ORDER',
    costImpact: 250000,
    timeImpact: 15,
    status: 'REQUESTED'
  });

  const handleOpenEdit = (row: Amendment) => {
    setEditRow(row);
    setEditForm({ ...row });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setData(prev => prev.map(r => r.id === editForm.id ? editForm : r));
    setEditRow(null);
    setEditForm(null);
  };

  const handleCreate = () => {
    const nextId = String(data.length + 1);
    const amdId = newAmd.amdId || `AMD-2026-00${nextId}`;
    const created: Amendment = {
      id: nextId,
      amdId,
      project: newAmd.project,
      origPo: newAmd.origPo,
      trigger: newAmd.trigger,
      costImpact: Number(newAmd.costImpact) || 0,
      timeImpact: Number(newAmd.timeImpact) || 0,
      status: newAmd.status,
      date: new Date().toISOString().split('T')[0]
    };
    setData([created, ...data]);
    setShowNewModal(false);
    setNewAmd({
      amdId: '',
      project: 'NTPC Lara',
      origPo: 'PO-2026-001',
      trigger: 'CHANGE_ORDER',
      costImpact: 250000,
      timeImpact: 15,
      status: 'REQUESTED'
    });
  };

  const handleDelete = (row: Amendment) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="PO Amendments" 
        action={
          canCreate ? (
            <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
              <Plus size={16} /> Request Amendment
            </Button>
          ) : undefined
        } 
      />
      
      <Card className="mb-6 p-4 border-l-4 border-l-amber-500 bg-amber-50">
        <h3 className="font-medium text-amber-900 mb-2">Pending Approvals</h3>
        <p className="text-sm text-amber-800">
          You have {data.filter(d => d.status === 'REQUESTED' || d.status === 'INTERNAL_APPROVAL').length} amendment requests pending approval.
        </p>
      </Card>

      <Card>
        <DataTable
          data={data}
          columns={columns}
          onEdit={canUpdate ? row => handleOpenEdit(row as Amendment) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Amendment) : undefined}
        />
      </Card>

      {/* New Amendment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Request PO Amendment</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amendment ID (Auto if blank)</label>
                <input 
                  type="text" 
                  placeholder="e.g. AMD-2026-004"
                  value={newAmd.amdId} 
                  onChange={e => setNewAmd({ ...newAmd, amdId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                  <input 
                    type="text" 
                    value={newAmd.project} 
                    onChange={e => setNewAmd({ ...newAmd, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Original PO *</label>
                  <input 
                    type="text" 
                    value={newAmd.origPo} 
                    onChange={e => setNewAmd({ ...newAmd, origPo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Trigger</label>
                  <select 
                    value={newAmd.trigger} 
                    onChange={e => setNewAmd({ ...newAmd, trigger: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CHANGE_ORDER">Change Order</option>
                    <option value="RATE_REVISION">Rate Revision</option>
                    <option value="EOT_APPROVAL">EOT Approval</option>
                    <option value="QTY_VARIATION">Qty Variation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cost Impact (₹)</label>
                  <input 
                    type="number" 
                    value={newAmd.costImpact} 
                    onChange={e => setNewAmd({ ...newAmd, costImpact: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Time (Days)</label>
                  <input 
                    type="number" 
                    value={newAmd.timeImpact} 
                    onChange={e => setNewAmd({ ...newAmd, timeImpact: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit PO Amendment — {editForm.amdId}</h3>
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amendment ID</label>
                <input 
                  value={editForm.amdId} 
                  onChange={e => setEditForm({ ...editForm, amdId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={editForm.project} 
                    onChange={e => setEditForm({ ...editForm, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Trigger</label>
                  <input 
                    value={editForm.trigger} 
                    onChange={e => setEditForm({ ...editForm, trigger: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cost Impact (₹)</label>
                  <input 
                    type="number" 
                    value={editForm.costImpact} 
                    onChange={e => setEditForm({ ...editForm, costImpact: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select 
                    value={editForm.status} 
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="REQUESTED">REQUESTED</option>
                    <option value="INTERNAL_APPROVAL">INTERNAL_APPROVAL</option>
                    <option value="APPROVED">APPROVED</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.amdId ?? 'this record'}
        recordType="PO Amendment"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default POAmendmentList;
