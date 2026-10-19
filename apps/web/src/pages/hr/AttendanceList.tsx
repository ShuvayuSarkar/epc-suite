import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge, StatsCard } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type AttendanceRecord = {
  code: string; name: string; project: string; in: string; out: string;
  type: string; source: string; gps: string; geofenced: boolean;
};

const initialAttendance: AttendanceRecord[] = [];

const columns = [
  { header: 'Emp Code', accessor: 'code' },
  { header: 'Name', accessor: 'name' },
  { header: 'Project', accessor: 'project' },
  { header: 'Check In', accessor: 'in' },
  { header: 'Check Out', accessor: 'out' },
  { header: 'Type', accessor: 'type', cell: (v: string) => <Badge variant="success">{v}</Badge> },
  { header: 'Source', accessor: 'source' },
  { header: 'GPS', accessor: 'gps' },
  { header: 'Geofenced', accessor: 'geofenced', cell: (v: boolean) => v ? '✅' : '❌' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function AttendanceList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.11');
  const [data, setData] = usePersistentState<AttendanceRecord[]>('epc_attendance', initialAttendance);
  const [editRow, setEditRow] = useState<AttendanceRecord | null>(null);
  const [deleteRow, setDeleteRow] = useState<AttendanceRecord | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAtt, setNewAtt] = useState({
    code: '',
    name: '',
    project: 'Narmada',
    in: '09:00',
    out: '18:00',
    type: 'PRESENT',
    source: 'MANUAL',
    gps: '-',
    geofenced: true,
  });

  const handleDelete = (row: AttendanceRecord) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.code !== deleteRow.code));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(r => r.code === editRow.code ? editRow : r));
    setEditRow(null);
  };

  const handleCreateAttendance = () => {
    if (!newAtt.code || !newAtt.name) {
      alert('Please fill in Employee Code and Name');
      return;
    }
    setData(prev => [{ ...newAtt }, ...prev]);
    setShowNewModal(false);
    setNewAtt({
      code: '',
      name: '',
      project: 'Narmada',
      in: '09:00',
      out: '18:00',
      type: 'PRESENT',
      source: 'MANUAL',
      gps: '-',
      geofenced: true,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Records" 
        action={canCreate ? { label: '+ Log Attendance', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.11" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Present" value={String(data.filter(d => d.type === 'PRESENT').length)} />
        <StatsCard title="Absent" value={String(data.filter(d => d.type === 'ABSENT').length)} />
        <StatsCard title="Half Day" value={String(data.filter(d => d.type === 'HALF_DAY').length)} />
        <StatsCard title="On Leave" value={String(data.filter(d => d.type === 'LEAVE').length)} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as AttendanceRecord) : undefined}
          onDelete={canRemove ? row => handleDelete(row as AttendanceRecord) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.name ?? 'this record'}
        recordType="Attendance Record"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Log Attendance</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code *</label>
                  <input 
                    value={newAtt.code} 
                    onChange={e => setNewAtt({ ...newAtt, code: e.target.value })}
                    placeholder="EMP-1003" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name *</label>
                  <input 
                    value={newAtt.name} 
                    onChange={e => setNewAtt({ ...newAtt, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={newAtt.project} 
                    onChange={e => setNewAtt({ ...newAtt, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status Type</label>
                  <select 
                    value={newAtt.type} 
                    onChange={e => setNewAtt({ ...newAtt, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF_DAY">HALF_DAY</option>
                    <option value="LEAVE">LEAVE</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check In</label>
                  <input 
                    value={newAtt.in} 
                    onChange={e => setNewAtt({ ...newAtt, in: e.target.value })}
                    placeholder="09:00" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check Out</label>
                  <input 
                    value={newAtt.out} 
                    onChange={e => setNewAtt({ ...newAtt, out: e.target.value })}
                    placeholder="18:00" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateAttendance} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Attendance</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Attendance Record</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code</label>
                <input 
                  value={editRow.code} 
                  onChange={e => setEditRow({ ...editRow, code: e.target.value })}
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Check In</label>
                <input 
                  value={editRow.in} 
                  onChange={e => setEditRow({ ...editRow, in: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Check Out</label>
                <input 
                  value={editRow.out} 
                  onChange={e => setEditRow({ ...editRow, out: e.target.value })}
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
