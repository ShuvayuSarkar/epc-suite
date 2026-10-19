import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Asset = {
  id: string; name: string; type: string; serial: string; location: string;
  status: string; project: string; gang: string; expiry: number; rented: boolean;
};

const initialAssets: Asset[] = [];

const columns = [
  { header: 'Asset ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Type', accessor: 'type', cell: (v: string) => <Badge variant="secondary">{v}</Badge> },
  { header: 'Serial #', accessor: 'serial' },
  { header: 'Location', accessor: 'location' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (v: string) => <Badge variant={v === 'IN_USE' ? 'success' : v === 'MAINTENANCE' ? 'warning' : 'primary'}>{v}</Badge>
  },
  { header: 'Project', accessor: 'project' },
  { header: 'Gang', accessor: 'gang' },
  { 
    header: 'Insurance/Cal Expiry', 
    accessor: 'expiry',
    cell: (v: number) => (
      <span className={v < 0 ? 'text-red-600 font-bold' : v < 30 ? 'text-amber-600 font-bold' : ''}>
        {v < 0 ? `Expired (${Math.abs(v)}d)` : `${v} days left`}
      </span>
    )
  },
  { header: 'Rented', accessor: 'rented', cell: (v: boolean) => v ? 'Yes' : 'No' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function ResourceList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.16');
  const [data, setData] = usePersistentState<Asset[]>('epc_resources', initialAssets);
  const [editRow, setEditRow] = useState<Asset | null>(null);
  const [deleteRow, setDeleteRow] = useState<Asset | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    id: '',
    name: '',
    type: 'TSE_MACHINE',
    serial: '',
    location: 'Narmada',
    status: 'IN_USE',
    project: 'Narmada',
    gang: 'Gang Alpha',
    expiry: 30,
    rented: false,
  });

  const handleDelete = (row: Asset) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(a => a.id === editRow.id ? editRow : a));
    setEditRow(null);
  };

  const handleCreateAsset = () => {
    if (!newAsset.name || !newAsset.serial) {
      alert('Please fill in Asset Name and Serial Number');
      return;
    }
    const id = newAsset.id || `AST-00${data.length + 1}`;
    const created: Asset = {
      ...newAsset,
      id,
      expiry: Number(newAsset.expiry) || 0,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewAsset({
      id: '',
      name: '',
      type: 'TSE_MACHINE',
      serial: '',
      location: 'Narmada',
      status: 'IN_USE',
      project: 'Narmada',
      gang: 'Gang Alpha',
      expiry: 30,
      rented: false,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Asset Management" 
        action={canCreate ? { label: '+ Register Asset', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as Asset) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Asset) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.name ?? 'this record'}
        recordType="Asset"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Register Asset</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Asset ID</label>
                  <input 
                    value={newAsset.id} 
                    onChange={e => setNewAsset({ ...newAsset, id: e.target.value })}
                    placeholder={`AST-00${data.length + 1}`} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Asset Name *</label>
                  <input 
                    value={newAsset.name} 
                    onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                    placeholder="e.g. Tension Stringing Equipment" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select 
                    value={newAsset.type} 
                    onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="TSE_MACHINE">TSE_MACHINE</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="CRANE">CRANE</option>
                    <option value="TOOL">TOOL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number *</label>
                  <input 
                    value={newAsset.serial} 
                    onChange={e => setNewAsset({ ...newAsset, serial: e.target.value })}
                    placeholder="SN1234" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                  <input 
                    value={newAsset.location} 
                    onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={newAsset.project} 
                    onChange={e => setNewAsset({ ...newAsset, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Calibration/Insurance Expiry (Days)</label>
                  <input 
                    type="number"
                    value={newAsset.expiry} 
                    onChange={e => setNewAsset({ ...newAsset, expiry: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input 
                      type="checkbox"
                      checked={newAsset.rented} 
                      onChange={e => setNewAsset({ ...newAsset, rented: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    Is Rented Asset
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateAsset} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Register</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Asset</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input 
                  value={editRow.name} 
                  onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <input 
                  value={editRow.type} 
                  onChange={e => setEditRow({ ...editRow, type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                <input 
                  value={editRow.location} 
                  onChange={e => setEditRow({ ...editRow, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <input 
                  value={editRow.status} 
                  onChange={e => setEditRow({ ...editRow, status: e.target.value })}
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
