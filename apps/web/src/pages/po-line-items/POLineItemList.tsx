import React, { useState } from 'react';
import { Card, PageHeader, DataTable, Badge, SearchInput, Select, Button } from '../../components/ui';
import { CheckCircle, Circle, X } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type LineItem = {
  id: string; poNumber: string; header: string; schLine: string;
  matCode: string; desc: string; qty: number; unit: string;
  category: string; receiptDate: string | null; dispatchDate: string | null;
  inspectionDate: string | null; project: string;
};

const initialLineItems: LineItem[] = [];

const DateTracker = ({ insp, disp, rec }: { insp: any, disp: any, rec: any }) => {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      {insp ? <span title={`Inspected: ${insp}`}><CheckCircle className="w-4 h-4 text-green-500" /></span> : <span title="Inspection Pending"><Circle className="w-4 h-4" /></span>}
      <div className={`w-4 h-px ${disp ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      {disp ? <span title={`Dispatched: ${disp}`}><CheckCircle className="w-4 h-4 text-green-500" /></span> : <span title="Dispatch Pending"><Circle className="w-4 h-4" /></span>}
      <div className={`w-4 h-px ${rec ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      {rec ? <span title={`Received: ${rec}`}><CheckCircle className="w-4 h-4 text-green-500" /></span> : <span title="Receipt Pending"><Circle className="w-4 h-4" /></span>}
    </div>
  );
};

const columns = [
  { key: 'poNumber', header: 'PO Number' },
  { key: 'schLine', header: 'Sch. Line' },
  { key: 'matCode', header: 'Material Code' },
  { key: 'desc', header: 'Description' },
  { key: 'qty', header: 'Qty' },
  { key: 'unit', header: 'Unit' },
  { key: 'project', header: 'Project' },
  { key: 'tracker', header: 'Tracking (Insp → Disp → Rec)', render: (_: any, row: any) => (
    <DateTracker insp={row.inspectionDate} disp={row.dispatchDate} rec={row.receiptDate} />
  )}
];

import { usePersistentState } from '../../hooks/usePersistentState';

const POLineItemList = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.14');
  const [data, setData] = usePersistentState<LineItem[]>('epc_po_line_items_detail', initialLineItems);
  const [editRow, setEditRow] = useState<LineItem | null>(null);
  const [deleteRow, setDeleteRow] = useState<LineItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItem, setNewItem] = useState({
    poNumber: 'PO-2026-001',
    header: 'Conductors',
    schLine: '30',
    matCode: '',
    desc: '',
    qty: 1,
    unit: 'EA',
    category: 'Conductors',
    project: 'NTPC Lara',
  });

  const handleDelete = (row: LineItem) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(l => l.id === editRow.id ? editRow : l));
    setEditRow(null);
  };

  const handleCreateLineItem = () => {
    if (!newItem.matCode || !newItem.desc) {
      alert('Please fill in Material Code and Description');
      return;
    }
    const created: LineItem = {
      ...newItem,
      id: String(Date.now()),
      qty: Number(newItem.qty) || 1,
      receiptDate: null,
      dispatchDate: null,
      inspectionDate: null,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewItem({
      poNumber: 'PO-2026-001',
      header: 'Conductors',
      schLine: '30',
      matCode: '',
      desc: '',
      qty: 1,
      unit: 'EA',
      category: 'Conductors',
      project: 'NTPC Lara',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="PO Line Items" 
        action={canCreate ? <Button onClick={() => setShowNewModal(true)}>+ Add Line Item</Button> : undefined} 
      />
      
      <Card>
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <SearchInput placeholder="Search PO Number..." className="w-64" />
          <Select options={[{value: 'all', label: 'All Categories'}]} value="all" onChange={()=>{}} />
          <Select options={[{value: 'all', label: 'All Projects'}]} value="all" onChange={()=>{}} />
        </div>
        <DataTable
          data={data}
          columns={columns}
          onEdit={canUpdate ? row => setEditRow(row as LineItem) : undefined}
          onDelete={canRemove ? row => handleDelete(row as LineItem) : undefined}
        />
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.matCode ?? deleteRow?.desc ?? 'this record'}
        recordType="PO Line Item"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add PO Line Item</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PO Number</label>
                  <input 
                    value={newItem.poNumber} 
                    onChange={e => setNewItem({ ...newItem, poNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sch. Line</label>
                  <input 
                    value={newItem.schLine} 
                    onChange={e => setNewItem({ ...newItem, schLine: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Material Code *</label>
                <input 
                  value={newItem.matCode} 
                  onChange={e => setNewItem({ ...newItem, matCode: e.target.value })}
                  placeholder="MAT-CD-01" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <input 
                  value={newItem.desc} 
                  onChange={e => setNewItem({ ...newItem, desc: e.target.value })}
                  placeholder="e.g. ACSR Moose Conductor" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                  <input 
                    type="number"
                    value={newItem.qty} 
                    onChange={e => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                  <input 
                    value={newItem.unit} 
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                <input 
                  value={newItem.project} 
                  onChange={e => setNewItem({ ...newItem, project: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateLineItem} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Item</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit PO Line Item</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Material Code</label>
                <input 
                  value={editRow.matCode} 
                  onChange={e => setEditRow({ ...editRow, matCode: e.target.value })}
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                <input 
                  type="number" 
                  value={editRow.qty} 
                  onChange={e => setEditRow({ ...editRow, qty: Number(e.target.value) })}
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
};

export default POLineItemList;
