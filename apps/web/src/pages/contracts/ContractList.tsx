import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader, DataTable, Badge, StatsCard, Tabs } from '../../components/ui';
import { X, Layers, Plus, PackageCheck, AlertCircle, ShoppingCart } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { ClientBOQItem, INITIAL_MSETCL_BOQ } from '../../types/clientBoq';
import { usePersistentState } from '../../hooks/usePersistentState';

type Contract = {
  id: string; project: string; client: string; type: string;
  date: string; value: number; status: string; compliance: string;
  ld: string; retention: number;
};

const initialContracts: Contract[] = [
  {
    id: 'CTR-2026-001',
    project: 'Rajkot-Jetpur 220kV Transmission Line',
    client: 'MSETCL / Utility',
    type: 'Turnkey EPC',
    date: '2026-10-15',
    value: 78.5,
    status: 'ACTIVE',
    compliance: 'COMPLIANT',
    ld: '0.5% per week, max 10%',
    retention: 10,
  }
];

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

export default function ContractList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.10');
  const [activeTab, setActiveTab] = useState<'contracts' | 'boq'>('contracts');
  const [data, setData] = usePersistentState<Contract[]>('epc_contracts', initialContracts);
  const [boqItems, setBoqItems] = usePersistentState<ClientBOQItem[]>('epc_client_boq_items', INITIAL_MSETCL_BOQ);
  const [editRow, setEditRow] = useState<Contract | null>(null);
  const [deleteRow, setDeleteRow] = useState<Contract | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNewBoqModal, setShowNewBoqModal] = useState(false);

  const [newBoqItem, setNewBoqItem] = useState<Partial<ClientBOQItem>>({
    itemCode: '',
    description: '',
    category: 'Conductor',
    contractQty: 100,
    uom: 'KM',
    rateLakhs: 1.0,
  });

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

  const handleAddBoqItem = () => {
    if (!newBoqItem.description || !newBoqItem.contractQty) return;
    const qty = Number(newBoqItem.contractQty) || 0;
    const rate = Number(newBoqItem.rateLakhs) || 0;
    const item: ClientBOQItem = {
      id: `BOQ-${String(boqItems.length + 1).padStart(2, '0')}`,
      contractId: data[0]?.id || 'CTR-2026-001',
      itemNo: boqItems.length + 1,
      itemCode: newBoqItem.itemCode || `BOQ-ITEM-${boqItems.length + 1}`,
      description: newBoqItem.description,
      category: newBoqItem.category || 'General',
      contractQty: qty,
      uom: newBoqItem.uom || 'Nos',
      rateLakhs: rate,
      totalValueLakhs: Number((qty * rate).toFixed(2)),
      orderedQty: 0,
      diQty: 0,
      dispatchQty: 0,
      status: 'Unordered',
    };
    setBoqItems(prev => [...prev, item]);
    setShowNewBoqModal(false);
    setNewBoqItem({
      itemCode: '',
      description: '',
      category: 'Conductor',
      contractQty: 100,
      uom: 'KM',
      rateLakhs: 1.0,
    });
  };

  // Metrics for BOQ
  const totalBoqValueL = boqItems.reduce((acc, curr) => acc + curr.totalValueLakhs, 0);
  const totalOrderedValueL = boqItems.reduce((acc, curr) => acc + (curr.orderedQty * curr.rateLakhs), 0);
  const orderedPercent = totalBoqValueL > 0 ? ((totalOrderedValueL / totalBoqValueL) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contract Management & Mother Orders" 
        description="Master Client Contracts · Mother Order Client BOQ · Downstream PO Constraints"
        action={
          canCreate ? {
            label: activeTab === 'contracts' ? '+ New Contract' : '+ Feed Client BOQ Item',
            onClick: () => activeTab === 'contracts' ? setShowNewModal(true) : setShowNewBoqModal(true)
          } : undefined
        } 
      />
      <ReadOnlyBanner moduleId="4.10" />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'contracts', label: `Contracts Repository (${data.length})` },
          { id: 'boq', label: `Mother Order Feed: Client BOQ (${boqItems.length} Items)` },
        ]}
        activeTab={activeTab}
        onChange={id => setActiveTab(id as 'contracts' | 'boq')}
      />
      
      {activeTab === 'contracts' ? (
        <>
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
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">Contract: {data[0]?.project || 'MSETCL Transmission Project'}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded font-mono">{data[0]?.id || 'CTR-2026-001'}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Mother Order Rule:</strong> Internal LOIs and downstream vendor purchase orders can ONLY be placed against these authorized client BOQ items.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total BOQ Value</p>
                <p className="text-sm font-bold text-slate-900">₹{(totalBoqValueL / 100).toFixed(2)} Cr</p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Ordered Balance</p>
                <p className="text-sm font-bold text-green-700">{orderedPercent}% Ordered</p>
              </div>
            </div>
          </div>

          {/* BOQ Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Client Item Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Contract Qty</th>
                    <th className="p-3 text-right">Ordered Qty</th>
                    <th className="p-3 text-right">Remaining Balance</th>
                    <th className="p-3 text-right">Rate (₹L)</th>
                    <th className="p-3 text-right">Total (₹L)</th>
                    <th className="p-3 text-center">Procurement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {boqItems.map((item, idx) => {
                    const balance = item.contractQty - item.orderedQty;
                    const pct = item.contractQty > 0 ? Math.min(100, (item.orderedQty / item.contractQty) * 100) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-mono text-xs text-slate-500">{item.itemNo || idx + 1}</td>
                        <td className="p-3 font-mono text-xs font-semibold text-indigo-600">{item.itemCode}</td>
                        <td className="p-3 font-medium text-slate-800">
                          {item.description}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{item.category}</span>
                        </td>
                        <td className="p-3 text-right font-medium text-slate-900">{item.contractQty.toLocaleString()} {item.uom}</td>
                        <td className="p-3 text-right font-semibold text-indigo-700">{item.orderedQty.toLocaleString()} {item.uom}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">
                          <span className={balance <= 0 ? 'text-green-600' : 'text-amber-600'}>
                            {balance.toLocaleString()} {item.uom}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-600">₹{item.rateLakhs}L</td>
                        <td className="p-3 text-right font-bold text-slate-900">₹{item.totalValueLakhs.toLocaleString()}L</td>
                        <td className="p-3 text-center">
                          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                            item.orderedQty >= item.contractQty 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : item.orderedQty > 0 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.orderedQty >= item.contractQty ? 'Fully Ordered' : item.orderedQty > 0 ? `${pct.toFixed(0)}% Ordered` : 'Unordered'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

      {showNewBoqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Feed New Client BOQ Item (Mother Order)</h3>
              <button onClick={() => setShowNewBoqModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Client Item Code *</label>
                  <input 
                    value={newBoqItem.itemCode} 
                    onChange={e => setNewBoqItem({ ...newBoqItem, itemCode: e.target.value })}
                    placeholder="MSETCL-MAT-11" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select 
                    value={newBoqItem.category} 
                    onChange={e => setNewBoqItem({ ...newBoqItem, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Conductor">Conductor</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Insulator">Insulator</option>
                    <option value="Towers">Towers</option>
                    <option value="Earthwire">Earthwire</option>
                    <option value="OPGW">OPGW</option>
                    <option value="Bay Equipment">Bay Equipment</option>
                    <option value="Civil Works">Civil Works</option>
                    <option value="Erection & Stringing">Erection & Stringing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                <input 
                  value={newBoqItem.description} 
                  onChange={e => setNewBoqItem({ ...newBoqItem, description: e.target.value })}
                  placeholder="e.g. 220kV Composite Polymer Insulators" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contract Qty *</label>
                  <input 
                    type="number"
                    value={newBoqItem.contractQty} 
                    onChange={e => setNewBoqItem({ ...newBoqItem, contractQty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">UOM</label>
                  <input 
                    value={newBoqItem.uom} 
                    onChange={e => setNewBoqItem({ ...newBoqItem, uom: e.target.value })}
                    placeholder="KM / Sets / MT" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Rate (₹ Lakhs)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={newBoqItem.rateLakhs} 
                    onChange={e => setNewBoqItem({ ...newBoqItem, rateLakhs: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewBoqModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddBoqItem} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add to Mother Order</button>
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
