import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Card, PageHeader, Button, DataTable, Badge, SearchInput, Select } from '../../components/ui';
import { X, Plus } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Letter = {
  id: string; refNum: string; project: string; client: string;
  type: string; draftedBy: string; status: string; dispatchDate: string; ack: string;
};

const initialLetters: Letter[] = [];

const columns = [
  { key: 'refNum', header: 'Ref Number' },
  { key: 'project', header: 'Project' },
  { key: 'client', header: 'Client' },
  { key: 'type', header: 'Letter Type' },
  { key: 'draftedBy', header: 'Drafted By' },
  { key: 'status', header: 'Status', cell: (val: string) => {
      const colors: any = { DISPATCHED: 'success', ACKNOWLEDGED: 'primary', DRAFT: 'secondary', REVIEW: 'warning', SIGNED: 'secondary' };
      return <Badge variant={colors[val] || 'secondary'}>{val}</Badge>;
    }
  },
  { key: 'dispatchDate', header: 'Dispatch Date' },
  { key: 'ack', header: 'Acknowledged' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

const CorrespondenceList = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.17');
  const [data, setData] = usePersistentState<Letter[]>('epc_correspondence', initialLetters);
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState<Letter | null>(null);
  const [editForm, setEditForm] = useState<Letter | null>(null);
  const [deleteRow, setDeleteRow] = useState<Letter | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newLetter, setNewLetter] = useState({
    refNum: '',
    project: 'NTPC Lara',
    client: 'NTPC',
    type: 'Design Submission',
    draftedBy: 'Engineering Team',
    status: 'DRAFT'
  });

  const filteredData = data.filter(d => 
    d.refNum.toLowerCase().includes(search.toLowerCase()) ||
    d.project.toLowerCase().includes(search.toLowerCase()) ||
    d.client.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (row: Letter) => {
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
    if (!newLetter.project) return;
    const nextId = String(data.length + 1);
    const generatedRef = newLetter.refNum || `APAR/LTR/2026/00${nextId}`;
    const created: Letter = {
      id: nextId,
      refNum: generatedRef,
      project: newLetter.project,
      client: newLetter.client,
      type: newLetter.type,
      draftedBy: newLetter.draftedBy,
      status: newLetter.status,
      dispatchDate: newLetter.status === 'DISPATCHED' ? new Date().toISOString().split('T')[0] : '-',
      ack: 'No'
    };
    setData([created, ...data]);
    setShowNewModal(false);
    setNewLetter({
      refNum: '',
      project: 'NTPC Lara',
      client: 'NTPC',
      type: 'Design Submission',
      draftedBy: 'Engineering Team',
      status: 'DRAFT'
    });
  };

  const handleDelete = (row: Letter) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Correspondence & Transmittal" 
        action={
          canCreate ? (
            <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
              <Plus size={16} /> Draft Letter
            </Button>
          ) : undefined
        } 
      />
      
      <Card>
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <SearchInput 
            value={search} 
            onChange={val => setSearch(val)} 
            placeholder="Search Ref Number, Project..." 
            className="w-64" 
          />
        </div>
        <DataTable
          data={filteredData}
          columns={columns}
          onEdit={canUpdate ? row => handleOpenEdit(row as Letter) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Letter) : undefined}
        />
      </Card>

      {/* New Letter Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Draft New Letter / Correspondence</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ref Number (Optional - Auto-generated if blank)</label>
                <input 
                  type="text" 
                  placeholder="e.g. APAR/PGCIL/2026/045"
                  value={newLetter.refNum} 
                  onChange={e => setNewLetter({ ...newLetter, refNum: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                  <input 
                    type="text" 
                    value={newLetter.project} 
                    onChange={e => setNewLetter({ ...newLetter, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client *</label>
                  <input 
                    type="text" 
                    value={newLetter.client} 
                    onChange={e => setNewLetter({ ...newLetter, client: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Letter Type</label>
                  <select 
                    value={newLetter.type} 
                    onChange={e => setNewLetter({ ...newLetter, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Design Submission</option>
                    <option>Commercial</option>
                    <option>Site Update</option>
                    <option>Technical Clarification</option>
                    <option>Contractual Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Drafted By</label>
                  <input 
                    type="text" 
                    value={newLetter.draftedBy} 
                    onChange={e => setNewLetter({ ...newLetter, draftedBy: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Initial Status</label>
                <select 
                  value={newLetter.status} 
                  onChange={e => setNewLetter({ ...newLetter, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="SIGNED">SIGNED</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Letter</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Letter — {editForm.refNum}</h3>
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ref Number</label>
                <input 
                  value={editForm.refNum} 
                  onChange={e => setEditForm({ ...editForm, refNum: e.target.value })}
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">Client</label>
                  <input 
                    value={editForm.client} 
                    onChange={e => setEditForm({ ...editForm, client: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Letter Type</label>
                  <input 
                    value={editForm.type} 
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
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
                    <option value="DRAFT">DRAFT</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="SIGNED">SIGNED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
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
        recordName={deleteRow?.refNum ?? 'this record'}
        recordType="Letter"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default CorrespondenceList;
