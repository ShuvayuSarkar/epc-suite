import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Card, PageHeader, Button, DataTable, Badge } from '../../components/ui';
import { X, Plus } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type PO = {
  id: string; poNumber: string; project: string; vendor: string;
  category: string; orderDate: string; deliveryDate: string;
  value: number; status: string; techApproval: string;
};

const initialPOs: PO[] = [];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const columns = [
  { key: 'poNumber', header: 'PO Number' },
  { key: 'project', header: 'Project' },
  { key: 'vendor', header: 'Vendor' },
  { key: 'category', header: 'Category' },
  { key: 'orderDate', header: 'Order Date' },
  { key: 'deliveryDate', header: 'Delivery Date' },
  { key: 'value', header: 'Value (₹)', cell: formatCurrency },
  { key: 'status', header: 'Status', cell: (val: string) => {
      const colors: any = { DRAFT: 'default', ISSUED: 'primary', ACKNOWLEDGED: 'secondary', IN_PRODUCTION: 'warning', DISPATCHED: 'primary', DELIVERED: 'success', CLOSED: 'default' };
      return <Badge variant={colors[val] || 'secondary'}>{val}</Badge>;
    }
  },
  { key: 'techApproval', header: 'Tech Approval' },
];

import { usePersistentState } from '../../hooks/usePersistentState';

const POList = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.14');
  const [data, setData] = usePersistentState<PO[]>('epc_pos', initialPOs);
  const [editRow, setEditRow] = useState<PO | null>(null);
  const [editForm, setEditForm] = useState<PO | null>(null);
  const [deleteRow, setDeleteRow] = useState<PO | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPO, setNewPO] = useState({
    poNumber: '',
    project: 'NTPC Lara',
    vendor: 'ABB India Ltd',
    category: 'Transformers',
    deliveryDate: '2026-12-31',
    value: 5000000,
    status: 'ISSUED',
    techApproval: 'Approved'
  });

  const handleOpenEdit = (row: PO) => {
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
    if (!newPO.vendor) return;
    const nextId = String(data.length + 1);
    const poNum = newPO.poNumber || `PO-2026-00${nextId}`;
    const created: PO = {
      id: nextId,
      poNumber: poNum,
      project: newPO.project,
      vendor: newPO.vendor,
      category: newPO.category,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: newPO.deliveryDate,
      value: Number(newPO.value) || 0,
      status: newPO.status,
      techApproval: newPO.techApproval
    };
    setData([created, ...data]);
    setShowNewModal(false);
    setNewPO({
      poNumber: '',
      project: 'NTPC Lara',
      vendor: 'ABB India Ltd',
      category: 'Transformers',
      deliveryDate: '2026-12-31',
      value: 5000000,
      status: 'ISSUED',
      techApproval: 'Approved'
    });
  };

  const handleDelete = (row: PO) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  const totalValue = data.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Purchase Orders" 
        action={
          canCreate ? (
            <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
              <Plus size={16} /> Issue PO
            </Button>
          ) : undefined
        } 
      />
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Active POs</div>
          <div className="text-2xl font-bold">{data.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Delivery On-Time %</div>
          <div className="text-2xl font-bold text-green-600">92%</div>
        </Card>
      </div>

      <Card>
        <DataTable
          data={data}
          columns={columns}
          onEdit={canUpdate ? row => handleOpenEdit(row as PO) : undefined}
          onDelete={canRemove ? row => handleDelete(row as PO) : undefined}
        />
      </Card>

      {/* New PO Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Issue New Purchase Order</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PO Number (Optional - Auto-generated if blank)</label>
                <input 
                  type="text" 
                  placeholder="e.g. PO-2026-004"
                  value={newPO.poNumber} 
                  onChange={e => setNewPO({ ...newPO, poNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                  <input 
                    type="text" 
                    value={newPO.project} 
                    onChange={e => setNewPO({ ...newPO, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vendor *</label>
                  <input 
                    type="text" 
                    value={newPO.vendor} 
                    onChange={e => setNewPO({ ...newPO, vendor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={newPO.category} 
                    onChange={e => setNewPO({ ...newPO, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Transformers</option>
                    <option>Switchgear</option>
                    <option>Conductors</option>
                    <option>Towers & Hardware</option>
                    <option>Cables</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Value (₹)</label>
                  <input 
                    type="number" 
                    value={newPO.value} 
                    onChange={e => setNewPO({ ...newPO, value: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Date</label>
                  <input 
                    type="date" 
                    value={newPO.deliveryDate} 
                    onChange={e => setNewPO({ ...newPO, deliveryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={newPO.status} 
                    onChange={e => setNewPO({ ...newPO, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ISSUED">ISSUED</option>
                    <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Issue PO</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Purchase Order — {editForm.poNumber}</h3>
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">PO Number</label>
                <input 
                  value={editForm.poNumber} 
                  onChange={e => setEditForm({ ...editForm, poNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Vendor</label>
                  <input 
                    value={editForm.vendor} 
                    onChange={e => setEditForm({ ...editForm, vendor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={editForm.project} 
                    onChange={e => setEditForm({ ...editForm, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Date</label>
                  <input 
                    type="date" 
                    value={editForm.deliveryDate} 
                    onChange={e => setEditForm({ ...editForm, deliveryDate: e.target.value })}
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
                    <option value="ISSUED">ISSUED</option>
                    <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CLOSED">CLOSED</option>
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
        recordName={deleteRow?.poNumber ?? 'this record'}
        recordType="Purchase Order"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default POList;
