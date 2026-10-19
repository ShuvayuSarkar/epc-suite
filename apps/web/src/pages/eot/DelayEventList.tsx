import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge, Button } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type DelayEvent = {
  id: string; project: string; type: string; source: string;
  desc: string; date: string; status: string;
};

const initialDelayEvents: DelayEvent[] = [];

const columns = [
  { header: 'Event ID', accessor: 'id' },
  { header: 'Project', accessor: 'project' },
  { header: 'Type', accessor: 'type', cell: (v: string) => <Badge variant="secondary">{v}</Badge> },
  { header: 'Source', accessor: 'source', cell: (v: string) => <Badge variant="primary">{v}</Badge> },
  { header: 'Description', accessor: 'desc' },
  { header: 'Event Date', accessor: 'date' },
  { header: 'Status', accessor: 'status', cell: (v: string) => <Badge variant="warning">{v}</Badge> }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function DelayEventList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.6');
  const [data, setData] = usePersistentState<DelayEvent[]>('epc_delay_events', initialDelayEvents);
  const [filter, setFilter] = useState('All');
  const [editRow, setEditRow] = useState<DelayEvent | null>(null);
  const [deleteRow, setDeleteRow] = useState<DelayEvent | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: '',
    project: '',
    type: 'ROW',
    source: 'STAGE_3',
    desc: '',
    date: new Date().toISOString().split('T')[0],
    status: 'NOD_ISSUED',
  });

  const filteredData = filter === 'All' ? data : data.filter(d => d.source === filter);

  const handleDelete = (row: DelayEvent) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(d => d.id === editRow.id ? editRow : d));
    setEditRow(null);
  };

  const handleCreateEvent = () => {
    if (!newEvent.project || !newEvent.desc) {
      alert('Please fill in Project and Description');
      return;
    }
    const id = newEvent.id || `DE-00${data.length + 1}`;
    const created: DelayEvent = {
      ...newEvent,
      id,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewEvent({
      id: '',
      project: '',
      type: 'ROW',
      source: 'STAGE_3',
      desc: '',
      date: new Date().toISOString().split('T')[0],
      status: 'NOD_ISSUED',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Delay Events" 
        action={canCreate ? { label: '+ Log Delay Event', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.6" />
      
      <div className="flex gap-2">
        {['All', 'STAGE_3', 'STAGE_5'].map(s => (
          <Button 
            key={s} 
            variant={filter === s ? 'primary' : 'outline'}
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={filteredData}
          onEdit={canUpdate ? row => setEditRow(row as DelayEvent) : undefined}
          onDelete={canRemove ? row => handleDelete(row as DelayEvent) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="Delay Event"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Log Delay Event</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Event ID</label>
                  <input 
                    value={newEvent.id} 
                    onChange={e => setNewEvent({ ...newEvent, id: e.target.value })}
                    placeholder={`DE-00${data.length + 1}`} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project *</label>
                  <input 
                    value={newEvent.project} 
                    onChange={e => setNewEvent({ ...newEvent, project: e.target.value })}
                    placeholder="e.g. Narmada" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select 
                    value={newEvent.type} 
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ROW">ROW</option>
                    <option value="SHUTDOWN">SHUTDOWN</option>
                    <option value="WEATHER">WEATHER</option>
                    <option value="CLIENT_APPROVAL">CLIENT_APPROVAL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Source Stage</label>
                  <select 
                    value={newEvent.source} 
                    onChange={e => setNewEvent({ ...newEvent, source: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="STAGE_3">STAGE_3</option>
                    <option value="STAGE_5">STAGE_5</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <textarea 
                  value={newEvent.desc} 
                  onChange={e => setNewEvent({ ...newEvent, desc: e.target.value })}
                  rows={3}
                  placeholder="Detail the cause and location of delay..." 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Event Date</label>
                <input 
                  type="date"
                  value={newEvent.date} 
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateEvent} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Event</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Delay Event</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Event ID</label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input 
                  value={editRow.desc} 
                  onChange={e => setEditRow({ ...editRow, desc: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Event Date</label>
                <input 
                  type="date" 
                  value={editRow.date} 
                  onChange={e => setEditRow({ ...editRow, date: e.target.value })}
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
