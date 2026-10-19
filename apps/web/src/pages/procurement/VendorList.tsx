import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Card, PageHeader, Button, DataTable, Badge, Select } from '../../components/ui';
import { Star, X, Plus } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Vendor = {
  id: string; code: string; name: string; category: string;
  contact: string; quality: number; delivery: number; score: number; status: string;
};

const initialVendors: Vendor[] = [];

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center">
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

const columns = [
  { key: 'code', header: 'Vendor Code' },
  { key: 'name', header: 'Vendor Name' },
  { key: 'category', header: 'Category' },
  { key: 'contact', header: 'Contact Person' },
  { key: 'quality', header: 'Quality Rating', cell: renderStars },
  { key: 'delivery', header: 'Delivery Rating', cell: renderStars },
  { key: 'score', header: 'Overall Score', cell: (val: number) => (
    <span className={`font-bold ${val >= 90 ? 'text-green-600' : val >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
      {val}
    </span>
  ) },
  { key: 'status', header: 'Status', cell: (val: string) => {
      const colors: any = { ACTIVE: 'success', SUSPENDED: 'warning', BLACKLISTED: 'danger' };
      return <Badge variant={colors[val] || 'secondary'}>{val}</Badge>;
    }
  },
];

import { usePersistentState } from '../../hooks/usePersistentState';

const VendorList = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.14');
  const [data, setData] = usePersistentState<Vendor[]>('epc_vendors', initialVendors);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editRow, setEditRow] = useState<Vendor | null>(null);
  const [editForm, setEditForm] = useState<Vendor | null>(null);
  const [deleteRow, setDeleteRow] = useState<Vendor | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newVendor, setNewVendor] = useState({
    code: '',
    name: '',
    category: 'Transformers',
    contact: '',
    quality: 4.5,
    delivery: 4.5,
    score: 90,
    status: 'ACTIVE'
  });

  const filteredData = data.filter(v => {
    const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesStat = statusFilter === 'all' || v.status === statusFilter;
    return matchesCat && matchesStat;
  });

  const handleOpenEdit = (row: Vendor) => {
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
    if (!newVendor.name) return;
    const nextId = String(data.length + 1);
    const code = newVendor.code || `VEN-00${nextId}`;
    const created: Vendor = {
      id: nextId,
      code,
      name: newVendor.name,
      category: newVendor.category,
      contact: newVendor.contact || 'Direct Sales',
      quality: Number(newVendor.quality) || 4.0,
      delivery: Number(newVendor.delivery) || 4.0,
      score: Number(newVendor.score) || 85,
      status: newVendor.status
    };
    setData([created, ...data]);
    setShowNewModal(false);
    setNewVendor({
      code: '',
      name: '',
      category: 'Transformers',
      contact: '',
      quality: 4.5,
      delivery: 4.5,
      score: 90,
      status: 'ACTIVE'
    });
  };

  const handleDelete = (row: Vendor) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vendor Management" 
        action={
          canCreate ? (
            <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
              <Plus size={16} /> Register Vendor
            </Button>
          ) : undefined
        } 
      />
      
      <Card>
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <Select 
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Transformers', label: 'Transformers' },
              { value: 'Switchgear', label: 'Switchgear' },
              { value: 'Towers', label: 'Towers' },
              { value: 'Conductors', label: 'Conductors' },
            ]} 
            value={categoryFilter} 
            onChange={(val: any) => setCategoryFilter(val)} 
          />
          <Select 
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'BLACKLISTED', label: 'Blacklisted' },
            ]} 
            value={statusFilter} 
            onChange={(val: any) => setStatusFilter(val)} 
          />
        </div>
        <DataTable 
          data={filteredData} 
          columns={columns} 
          onEdit={canUpdate ? row => handleOpenEdit(row as Vendor) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Vendor) : undefined}
        />
      </Card>

      {/* New Vendor Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Register New Vendor</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vendor Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Larsen & Toubro Limited"
                  value={newVendor.name} 
                  onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vendor Code (Auto if blank)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. VEN-005"
                    value={newVendor.code} 
                    onChange={e => setNewVendor({ ...newVendor, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={newVendor.category} 
                    onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Transformers</option>
                    <option>Switchgear</option>
                    <option>Towers</option>
                    <option>Conductors</option>
                    <option>Cables</option>
                    <option>Civil Contractors</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alok Sharma"
                    value={newVendor.contact} 
                    onChange={e => setNewVendor({ ...newVendor, contact: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={newVendor.status} 
                    onChange={e => setNewVendor({ ...newVendor, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BLACKLISTED">BLACKLISTED</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} disabled={!newVendor.name.trim()} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Register Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Vendor — {editForm.name}</h3>
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vendor Name</label>
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <input 
                    value={editForm.category} 
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Person</label>
                  <input 
                    value={editForm.contact} 
                    onChange={e => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select 
                  value={editForm.status} 
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="BLACKLISTED">BLACKLISTED</option>
                </select>
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
        recordName={deleteRow?.name ?? 'this record'}
        recordType="Vendor"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default VendorList;
