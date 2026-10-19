import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type EOTClaim = {
  id: string; project: string; event: string; nod: string;
  claimRef: string; days: number; cost: number; decision: string;
  date: string; po: string;
};

const initialClaims: EOTClaim[] = [];

const columns = [
  { header: 'Claim ID', accessor: 'id' },
  { header: 'Project', accessor: 'project' },
  { header: 'Delay Event', accessor: 'event' },
  { header: 'NOD Ref', accessor: 'nod' },
  { header: 'Claim Ref', accessor: 'claimRef' },
  { header: 'Time Impact', accessor: 'days', cell: (v: number) => `${v} days` },
  { header: 'Cost', accessor: 'cost', cell: (v: number) => `₹${(v/100000).toFixed(2)}L` },
  { 
    header: 'Decision', 
    accessor: 'decision',
    cell: (v: string) => <Badge variant={v === 'APPROVED' ? 'success' : v === 'REJECTED' ? 'danger' : 'warning'}>{v}</Badge>
  },
  { header: 'Submission Date', accessor: 'date' },
  { header: 'PO Amend Ref', accessor: 'po' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function EOTClaimList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.6');
  const [data, setData] = usePersistentState<EOTClaim[]>('epc_eot_claims', initialClaims);
  const [editRow, setEditRow] = useState<EOTClaim | null>(null);
  const [deleteRow, setDeleteRow] = useState<EOTClaim | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    id: '',
    project: '',
    event: 'DE-001',
    nod: '',
    claimRef: '',
    days: 15,
    cost: 500000,
    decision: 'PENDING',
    date: new Date().toISOString().split('T')[0],
    po: '-',
  });

  const handleDelete = (row: EOTClaim) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(c => c.id === editRow.id ? editRow : c));
    setEditRow(null);
  };

  const handleCreateClaim = () => {
    if (!newClaim.project || !newClaim.claimRef) {
      alert('Please fill in Project and Claim Reference');
      return;
    }
    const id = newClaim.id || `EOT-00${data.length + 1}`;
    const created: EOTClaim = {
      ...newClaim,
      id,
      days: Number(newClaim.days) || 0,
      cost: Number(newClaim.cost) || 0,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewClaim({
      id: '',
      project: '',
      event: 'DE-001',
      nod: '',
      claimRef: '',
      days: 15,
      cost: 500000,
      decision: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      po: '-',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="EOT Claims" 
        action={canCreate ? { label: '+ Submit EOT Claim', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.6" />
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as EOTClaim) : undefined}
          onDelete={canRemove ? row => handleDelete(row as EOTClaim) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="EOT Claim"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Submit EOT Claim</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Claim ID</label>
                  <input 
                    value={newClaim.id} 
                    onChange={e => setNewClaim({ ...newClaim, id: e.target.value })}
                    placeholder={`EOT-00${data.length + 1}`} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project *</label>
                  <input 
                    value={newClaim.project} 
                    onChange={e => setNewClaim({ ...newClaim, project: e.target.value })}
                    placeholder="e.g. Narmada" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Delay Event Ref</label>
                  <input 
                    value={newClaim.event} 
                    onChange={e => setNewClaim({ ...newClaim, event: e.target.value })}
                    placeholder="DE-001" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NOD Reference</label>
                  <input 
                    value={newClaim.nod} 
                    onChange={e => setNewClaim({ ...newClaim, nod: e.target.value })}
                    placeholder="NOD-452" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Claim Reference *</label>
                <input 
                  value={newClaim.claimRef} 
                  onChange={e => setNewClaim({ ...newClaim, claimRef: e.target.value })}
                  placeholder="CL-091" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Days Claimed</label>
                  <input 
                    type="number"
                    value={newClaim.days} 
                    onChange={e => setNewClaim({ ...newClaim, days: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cost Impact (₹)</label>
                  <input 
                    type="number"
                    value={newClaim.cost} 
                    onChange={e => setNewClaim({ ...newClaim, cost: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateClaim} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Submit Claim</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit EOT Claim</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Claim ID</label>
                <input 
                  value={editRow.id} 
                  onChange={e => setEditRow({ ...editRow, id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                <input 
                  value={editRow.project} 
                  onChange={e => setEditRow({ ...editRow, project: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">NOD Reference</label>
                <input 
                  value={editRow.nod} 
                  onChange={e => setEditRow({ ...editRow, nod: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Days Claimed</label>
                <input 
                  type="number" 
                  value={editRow.days} 
                  onChange={e => setEditRow({ ...editRow, days: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
