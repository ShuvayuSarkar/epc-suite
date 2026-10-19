import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge, StatsCard } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Contract = {
  id: string; project: string; client: string; type: string;
  date: string; value: number; status: string; compliance: string;
  ld: string; retention: number;
};

const initialContracts: Contract[] = [];

const columns = [
  { header: 'Contract #', accessor: 'id' },
  { header: 'Project', accessor: 'project' },
  { header: 'Client', accessor: 'client' },
  { header: 'Type', accessor: 'type' },
  { header: 'Signed Date', accessor: 'date' },
  { header: 'Value', accessor: 'value', cell: (v: number) => `₹${v}Cr` },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (v: string) => <Badge variant="primary">{v}</Badge>
  },
  { 
    header: 'Compliance', 
    accessor: 'compliance',
    cell: (v: string) => <Badge variant={v === 'COMPLIANT' ? 'success' : v === 'NON_COMPLIANT' ? 'danger' : 'warning'}>{v}</Badge>
  },
  { header: 'LD Clause', accessor: 'ld' },
  { header: 'Retention %', accessor: 'retention', cell: (v: number) => `${v}%` }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function ContractList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.10');
  const [data, setData] = usePersistentState<Contract[]>('epc_contracts', initialContracts);
  const [editRow, setEditRow] = useState<Contract | null>(null);
  const [deleteRow, setDeleteRow] = useState<Contract | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newContract, setNewContract] = useState({
    id: '',
    project: '',
    client: '',
    type: 'Turnkey',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    status: 'ACTIVE',
    compliance: 'COMPLIANT',
    ld: '0.5% per week, max 5%',
    retention: 10,
  });

  const handleDelete = (row: Contract) => setDeleteRow(row);
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

  const handleCreateContract = () => {
    if (!newContract.id || !newContract.project) {
      alert('Please fill in Contract # and Project');
      return;
    }
    const created: Contract = {
      ...newContract,
      value: Number(newContract.value) || 0,
      retention: Number(newContract.retention) || 10,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewContract({
      id: '',
      project: '',
      client: '',
      type: 'Turnkey',
      date: new Date().toISOString().split('T')[0],
      value: 0,
      status: 'ACTIVE',
      compliance: 'COMPLIANT',
      ld: '0.5% per week, max 5%',
      retention: 10,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contract Management" 
        action={canCreate ? { label: '+ New Contract', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.10" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Active Contracts" value={String(data.filter(d => d.status === 'ACTIVE').length)} />
        <StatsCard title="Compliant" value={String(data.filter(d => d.compliance === 'COMPLIANT').length)} />
        <StatsCard title="Under Review" value={String(data.filter(d => d.compliance === 'UNDER_REVIEW').length)} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as Contract) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Contract) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="Contract"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">New Contract</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contract # *</label>
                  <input 
                    value={newContract.id} 
                    onChange={e => setNewContract({ ...newContract, id: e.target.value })}
                    placeholder="CONT-103" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select 
                    value={newContract.type} 
                    onChange={e => setNewContract({ ...newContract, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Turnkey">Turnkey</option>
                    <option value="Supply">Supply</option>
                    <option value="Service">Service</option>
                    <option value="EPC">EPC</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project *</label>
                <input 
                  value={newContract.project} 
                  onChange={e => setNewContract({ ...newContract, project: e.target.value })}
                  placeholder="e.g. Narmada Substation" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client</label>
                <input 
                  value={newContract.client} 
                  onChange={e => setNewContract({ ...newContract, client: e.target.value })}
                  placeholder="e.g. PGCIL" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Value (₹Cr)</label>
                  <input 
                    type="number"
                    value={newContract.value} 
                    onChange={e => setNewContract({ ...newContract, value: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Retention %</label>
                  <input 
                    type="number"
                    value={newContract.retention} 
                    onChange={e => setNewContract({ ...newContract, retention: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateContract} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Create Contract</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Contract</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contract #</label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Client</label>
                <input 
                  value={editRow.client} 
                  onChange={e => setEditRow({ ...editRow, client: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Value (₹Cr)</label>
                <input 
                  type="number" 
                  value={editRow.value} 
                  onChange={e => setEditRow({ ...editRow, value: Number(e.target.value) })}
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
