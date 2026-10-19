import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pencil, Trash2, X } from 'lucide-react';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

type AuditType = 'Internal' | 'External' | 'Regulatory';
type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

interface SafetyAudit {
  id: string;
  title: string;
  project: string;
  auditType: AuditType;
  scheduledDate: string;
  auditor: string;
  status: AuditStatus;
  findings: number;
  score: number;
}

const initialAudits: SafetyAudit[] = [];

const statusVariant: Record<AuditStatus, string> = {
  PLANNED: 'primary', IN_PROGRESS: 'warning', COMPLETED: 'success', OVERDUE: 'danger'
};
const typeVariant: Record<AuditType, string> = {
  Internal: 'secondary', External: 'primary', Regulatory: 'warning'
};

import { usePersistentState } from '../../hooks/usePersistentState';

export default function AuditList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.12');
  const [data, setData] = usePersistentState<SafetyAudit[]>('epc_safety_audits', initialAudits);
  const [editRow, setEditRow] = useState<SafetyAudit | null>(null);
  const [deleteRow, setDeleteRow] = useState<SafetyAudit | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAudit, setNewAudit] = useState({
    id: '',
    title: '',
    project: 'Narmada',
    auditType: 'Internal' as AuditType,
    scheduledDate: new Date().toISOString().split('T')[0],
    auditor: '',
    status: 'PLANNED' as AuditStatus,
    findings: 0,
    score: 0,
  });

  const handleDelete = (row: SafetyAudit) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setData(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setData(prev => prev.map(a => a.id === editRow.id ? editRow : a));
    setEditRow(null);
  };

  const handleCreateAudit = () => {
    if (!newAudit.title || !newAudit.auditor) {
      alert('Please fill in Title and Auditor');
      return;
    }
    const id = newAudit.id || `AUD-00${data.length + 1}`;
    const created: SafetyAudit = {
      ...newAudit,
      id,
    };
    setData(prev => [created, ...prev]);
    setShowNewModal(false);
    setNewAudit({
      id: '',
      title: '',
      project: 'Narmada',
      auditType: 'Internal',
      scheduledDate: new Date().toISOString().split('T')[0],
      auditor: '',
      status: 'PLANNED',
      findings: 0,
      score: 0,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Safety Audits" 
        action={canCreate ? <Button onClick={() => setShowNewModal(true)}>+ Schedule Audit</Button> : undefined} 
      />
      <ReadOnlyBanner moduleId="4.12" />

      <div className="space-y-3">
        {data.map(audit => (
          <Card key={audit.id} className={`p-5 border-l-4 ${audit.status === 'OVERDUE' ? 'border-red-500' : audit.status === 'COMPLETED' ? 'border-green-400' : 'border-indigo-400'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-indigo-600 font-bold">{audit.id}</span>
                  <Badge variant={typeVariant[audit.auditType] as any}>{audit.auditType}</Badge>
                  <Badge variant={statusVariant[audit.status] as any}>{audit.status}</Badge>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{audit.title}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>📍 {audit.project}</span>
                  <span>📅 {audit.scheduledDate}</span>
                  <span>👤 {audit.auditor}</span>
                  {audit.status === 'COMPLETED' && (
                    <>
                      <span>🔍 {audit.findings} findings</span>
                      <span>📊 Score: {audit.score}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                {canUpdate && (
                  <button onClick={() => setEditRow(audit)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                    <Pencil size={13} />
                  </button>
                )}
                {canRemove && (
                  <button onClick={() => handleDelete(audit)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.title ?? 'this record'}
        recordType="Audit"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Schedule Safety Audit</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Audit Title *</label>
                <input 
                  value={newAudit.title} 
                  onChange={e => setNewAudit({ ...newAudit, title: e.target.value })}
                  placeholder="e.g. Scaffolding & Fall Protection Audit" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={newAudit.project} 
                    onChange={e => setNewAudit({ ...newAudit, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Audit Type</label>
                  <select 
                    value={newAudit.auditType} 
                    onChange={e => setNewAudit({ ...newAudit, auditType: e.target.value as AuditType })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                    <option value="Regulatory">Regulatory</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Auditor *</label>
                  <input 
                    value={newAudit.auditor} 
                    onChange={e => setNewAudit({ ...newAudit, auditor: e.target.value })}
                    placeholder="e.g. Amit Desai" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date</label>
                  <input 
                    type="date"
                    value={newAudit.scheduledDate} 
                    onChange={e => setNewAudit({ ...newAudit, scheduledDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateAudit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Schedule Audit</button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Audit</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input 
                  value={editRow.title} 
                  onChange={e => setEditRow({ ...editRow, title: e.target.value })}
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Audit Type</label>
                <input 
                  value={editRow.auditType} 
                  onChange={e => setEditRow({ ...editRow, auditType: e.target.value as AuditType })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Auditor</label>
                <input 
                  value={editRow.auditor} 
                  onChange={e => setEditRow({ ...editRow, auditor: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date</label>
                <input 
                  value={editRow.scheduledDate} 
                  onChange={e => setEditRow({ ...editRow, scheduledDate: e.target.value })}
                  type="date" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <input 
                  value={editRow.status} 
                  onChange={e => setEditRow({ ...editRow, status: e.target.value as AuditStatus })}
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
