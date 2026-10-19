import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Employee = {
  code: string; name: string; dept: string; role: string;
  type: string; manager: string; skills: string; status: string; joinDate: string;
};

const initialEmployees: Employee[] = [];

const columns = [
  { header: 'Code', accessor: 'code' },
  { header: 'Name', accessor: 'name' },
  { header: 'Department', accessor: 'dept' },
  { header: 'Designation', accessor: 'role' },
  { header: 'Type', accessor: 'type', cell: (v: string) => <Badge variant="secondary">{v}</Badge> },
  { header: 'Reporting To', accessor: 'manager' },
  { header: 'Skills', accessor: 'skills' },
  { header: 'Status', accessor: 'status', cell: (v: string) => <Badge variant={v === 'ACTIVE' ? 'success' : 'danger'}>{v}</Badge> },
  { header: 'Join Date', accessor: 'joinDate' }
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function EmployeeList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.11');
  const [data, setData] = usePersistentState<Employee[]>('epc_employees', initialEmployees);
  const [editRow, setEditRow] = useState<Employee | null>(null);
  const [deleteRow, setDeleteRow] = useState<Employee | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    code: '',
    name: '',
    dept: 'Engineering',
    role: 'Design Engineer',
    type: 'PERMANENT',
    manager: 'Amit Desai',
    skills: '',
    status: 'ACTIVE',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleDelete = (row: Employee) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.code !== deleteRow.code));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(e => e.code === editRow.code ? editRow : e));
    setEditRow(null);
  };

  const handleCreateEmployee = () => {
    if (!newEmp.name) {
      alert('Please fill in Employee Name');
      return;
    }
    const code = newEmp.code || `EMP-100${data.length + 1}`;
    setData(prev => [{ ...newEmp, code }, ...prev]);
    setShowNewModal(false);
    setNewEmp({
      code: '',
      name: '',
      dept: 'Engineering',
      role: 'Design Engineer',
      type: 'PERMANENT',
      manager: 'Amit Desai',
      skills: '',
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Directory" 
        action={canCreate ? { label: '+ Add Employee', onClick: () => setShowNewModal(true) } : undefined} 
      />
      <ReadOnlyBanner moduleId="4.11" />
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onEdit={canUpdate ? row => setEditRow(row as Employee) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Employee) : undefined}
        />
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.name ?? 'this record'}
        recordType="Employee"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add New Employee</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code</label>
                  <input 
                    value={newEmp.code} 
                    onChange={e => setNewEmp({ ...newEmp, code: e.target.value })}
                    placeholder={`EMP-100${data.length + 1}`} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                  <input 
                    value={newEmp.name} 
                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <input 
                    value={newEmp.dept} 
                    onChange={e => setNewEmp({ ...newEmp, dept: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                  <input 
                    value={newEmp.role} 
                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employment Type</label>
                  <select 
                    value={newEmp.type} 
                    onChange={e => setNewEmp({ ...newEmp, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="PERMANENT">PERMANENT</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Reporting To</label>
                  <input 
                    value={newEmp.manager} 
                    onChange={e => setNewEmp({ ...newEmp, manager: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Skills</label>
                <input 
                  value={newEmp.skills} 
                  onChange={e => setNewEmp({ ...newEmp, skills: e.target.value })}
                  placeholder="e.g. AutoCAD, PLS-CADD, Field Survey" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateEmployee} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Employee</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Employee</h3>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <input 
                  value={editRow.dept} 
                  onChange={e => setEditRow({ ...editRow, dept: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                <input 
                  value={editRow.role} 
                  onChange={e => setEditRow({ ...editRow, role: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Skills</label>
                <input 
                  value={editRow.skills} 
                  onChange={e => setEditRow({ ...editRow, skills: e.target.value })}
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
