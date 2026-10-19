import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type NCR = {
  id: string; project: string; inspection: string; severity: string;
  desc: string; rootCause: string; status: string; target: string; days: number;
};

const initialNCRs: NCR[] = [];

const columns = [
  { header: 'NCR ID', accessor: 'id' },
  { header: 'Project', accessor: 'project' },
  { header: 'Linked Inspection', accessor: 'inspection' },
  { 
    header: 'Severity', 
    accessor: 'severity',
    cell: (v: string) => <Badge variant={v === 'CRITICAL' ? 'danger' : v === 'MAJOR' ? 'warning' : 'primary'}>{v}</Badge>
  },
  { header: 'Description', accessor: 'desc' },
  { header: 'Root Cause', accessor: 'rootCause' },
  { 
    header: 'Status', 
    accessor: 'status',
    cell: (v: string) => <Badge variant={v === 'CLOSED' ? 'success' : v === 'OPEN' ? 'danger' : 'warning'}>{v}</Badge>
  },
  { header: 'Target Date', accessor: 'target' },
  { 
    header: 'Days Open', 
    accessor: 'days',
    cell: (v: number) => <span className={v > 5 ? 'text-red-600 font-bold' : ''}>{v}</span>
  }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function NCRList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.13');
  const [data, setData] = usePersistentState<NCR[]>('epc_ncrs', initialNCRs);
  const [editRow, setEditRow] = useState<NCR | null>(null);
  const [deleteRow, setDeleteRow] = useState<NCR | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newNCR, setNewNCR] = useState({
    id: '',
    project: '',
    inspection: 'INSP-103',
    severity: 'MAJOR',
    desc: '',
    rootCause: '',
    status: 'OPEN',
    target: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    days: 0,
  });

  const handleDelete = (row: NCR) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(n => n.id === editRow.id ? editRow : n));
    setEditRow(null);
  };

  const handleCreateNCR = () => {
    if (!newNCR.project || !newNCR.desc) {
      alert('Please fill in Project and Description');
      return;
    }
    const id = newNCR.id || `NCR-0${data.length + 47}`;
    const created: NCR = {
      ...newNCR,
      id,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewNCR({
      id: '',
      project: '',
      inspection: 'INSP-103',
      severity: 'MAJOR',
      desc: '',
      rootCause: '',
      status: 'OPEN',
      target: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      days: 0,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Non-Conformance Reports" 
        action={canCreate ? { label: '+ Raise NCR', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.13" />
      
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as NCR) : undefined}
          onDelete={canRemove ? row => handleDelete(row as NCR) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="NCR"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Raise Non-Conformance Report</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NCR ID</label>
                  <input 
                    value={newNCR.id} 
                    onChange={e => setNewNCR({ ...newNCR, id: e.target.value })}
                    placeholder={`NCR-0${data.length + 47}`} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project *</label>
                  <input 
                    value={newNCR.project} 
                    onChange={e => setNewNCR({ ...newNCR, project: e.target.value })}
                    placeholder="e.g. Narmada" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Inspection Ref</label>
                  <input 
                    value={newNCR.inspection} 
                    onChange={e => setNewNCR({ ...newNCR, inspection: e.target.value })}
                    placeholder="INSP-103" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
                  <select 
                    value={newNCR.severity} 
                    onChange={e => setNewNCR({ ...newNCR, severity: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <textarea 
                  value={newNCR.desc} 
                  onChange={e => setNewNCR({ ...newNCR, desc: e.target.value })}
                  rows={2}
                  placeholder="Detail the non-conformance observed..." 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Root Cause</label>
                <input 
                  value={newNCR.rootCause} 
                  onChange={e => setNewNCR({ ...newNCR, rootCause: e.target.value })}
                  placeholder="Suspected or verified cause..." 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Resolution Date</label>
                <input 
                  type="date"
                  value={newNCR.target} 
                  onChange={e => setNewNCR({ ...newNCR, target: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateNCR} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Raise NCR</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit NCR</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">NCR ID</label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
                <input 
                  value={editRow.severity} 
                  onChange={e => setEditRow({ ...editRow, severity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input 
                  value={editRow.desc} 
                  onChange={e => setEditRow({ ...editRow, desc: e.target.value })}
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
