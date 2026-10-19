import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { useNavigate } from 'react-router-dom';
import { Card, DataTable, Badge, Button, PageHeader, SearchInput } from '../../components/ui';
import { X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type Client = {
  id: string; code: string; legalName: string; shortName: string;
  awardDocType: string; portalIntegration: string; retentionPct: number;
  paymentTerms: string; status: string;
};

const initialClients: Client[] = [];

const columns = [
  { key: 'code', header: 'Client Code' },
  { key: 'legalName', header: 'Legal Name' },
  { key: 'shortName', header: 'Short Name' },
  { key: 'awardDocType', header: 'Award Doc Type', cell: (val: string) => <Badge variant={val === 'LOA' ? 'primary' : val === 'NOA' ? 'secondary' : 'secondary'}>{val}</Badge> },
  { key: 'portalIntegration', header: 'Portal Integration', cell: (val: string) => <Badge variant={val === 'API' ? 'success' : val === 'SFTP' ? 'warning' : 'secondary'}>{val}</Badge> },
  { key: 'retentionPct', header: 'Retention %', cell: (val: number) => `${val}%` },
  { key: 'paymentTerms', header: 'Payment Terms' },
  { key: 'status', header: 'Status', cell: (val: string) => <Badge variant="success">{val}</Badge> },
];

import { usePersistentState } from '../../hooks/usePersistentState';

const ClientList = () => {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [data, setData] = usePersistentState<Client[]>('epc_clients', initialClients);
  const [editRow, setEditRow] = useState<Client | null>(null);
  const [deleteRow, setDeleteRow] = useState<Client | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newClient, setNewClient] = useState({
    code: '',
    legalName: '',
    shortName: '',
    awardDocType: 'LOA',
    portalIntegration: 'API',
    retentionPct: 10,
    paymentTerms: '30 Days',
  });

  const handleDelete = (row: Client) => setDeleteRow(row);
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

  const handleCreateClient = () => {
    if (!newClient.legalName) {
      alert('Please enter Legal Name');
      return;
    }
    const id = String(Date.now());
    const code = newClient.code || `CL00${data.length + 1}`;
    const created: Client = {
      id,
      code,
      legalName: newClient.legalName,
      shortName: newClient.shortName || newClient.legalName,
      awardDocType: newClient.awardDocType,
      portalIntegration: newClient.portalIntegration,
      retentionPct: Number(newClient.retentionPct) || 10,
      paymentTerms: newClient.paymentTerms,
      status: 'Active',
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewClient({
      code: '',
      legalName: '',
      shortName: '',
      awardDocType: 'LOA',
      portalIntegration: 'API',
      retentionPct: 10,
      paymentTerms: '30 Days',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Client & Utility Master" 
        action={canCreate ? <Button onClick={() => setShowNewModal(true)}>+ Add Client</Button> : undefined} 
      />
      <Card>
        <div className="p-4 border-b border-gray-200">
          <SearchInput placeholder="Search clients..." className="w-80" />
        </div>
        <DataTable 
          data={data} 
          columns={columns} 
          onRowClick={(row: any) => navigate(`/clients/${row.id}`)}
          onEdit={canUpdate ? row => setEditRow(row as Client) : undefined}
          onDelete={canRemove ? row => handleDelete(row as Client) : undefined}
        />
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.legalName ?? deleteRow?.shortName ?? 'this record'}
        recordType="Client"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Add New Client</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client Code</label>
                <input 
                  value={newClient.code} 
                  onChange={e => setNewClient({ ...newClient, code: e.target.value })}
                  placeholder={`CL00${data.length + 1}`} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Legal Name *</label>
                <input 
                  value={newClient.legalName} 
                  onChange={e => setNewClient({ ...newClient, legalName: e.target.value })}
                  placeholder="e.g. Power Grid Corporation of India Ltd" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Short Name</label>
                <input 
                  value={newClient.shortName} 
                  onChange={e => setNewClient({ ...newClient, shortName: e.target.value })}
                  placeholder="e.g. PGCIL" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Award Doc Type</label>
                  <select 
                    value={newClient.awardDocType} 
                    onChange={e => setNewClient({ ...newClient, awardDocType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="LOA">LOA</option>
                    <option value="NOA">NOA</option>
                    <option value="LOI">LOI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Portal Integration</label>
                  <select 
                    value={newClient.portalIntegration} 
                    onChange={e => setNewClient({ ...newClient, portalIntegration: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="API">API</option>
                    <option value="SFTP">SFTP</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Retention %</label>
                  <input 
                    type="number"
                    value={newClient.retentionPct} 
                    onChange={e => setNewClient({ ...newClient, retentionPct: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Payment Terms</label>
                  <input 
                    value={newClient.paymentTerms} 
                    onChange={e => setNewClient({ ...newClient, paymentTerms: e.target.value })}
                    placeholder="e.g. 30 Days" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateClient} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Client</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Client</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Legal Name</label>
                <input 
                  value={editRow.legalName} 
                  onChange={e => setEditRow({ ...editRow, legalName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Short Name</label>
                <input 
                  value={editRow.shortName} 
                  onChange={e => setEditRow({ ...editRow, shortName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Award Doc Type</label>
                <input 
                  value={editRow.awardDocType} 
                  onChange={e => setEditRow({ ...editRow, awardDocType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Portal Integration</label>
                <input 
                  value={editRow.portalIntegration} 
                  onChange={e => setEditRow({ ...editRow, portalIntegration: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Terms</label>
                <input 
                  value={editRow.paymentTerms} 
                  onChange={e => setEditRow({ ...editRow, paymentTerms: e.target.value })}
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

export default ClientList;
