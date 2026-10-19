import React, { useState, useMemo } from 'react';
import { Plus, Search, ShieldCheck, AlertTriangle, Calendar, FileText, CheckCircle2, Clock, XCircle, Building2, Eye, Pencil, Trash2 } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { FileAttachment } from '../../components/ui/FileAttachment';
import { StatutoryApproval, StatutoryApprovalStatus } from '../../types/statutory';
import { Attachment } from '../../types/attachment';

const MOCK_APPROVALS: StatutoryApproval[] = [];

const statusStyles: Record<StatutoryApprovalStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  not_applied:  { label: 'Not Applied', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Clock className="w-3.5 h-3.5" /> },
  applied:      { label: 'Applied', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
  under_review: { label: 'Under Review', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
  approved:     { label: 'Approved', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected:     { label: 'Rejected', badge: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
  expired:      { label: 'Expired', badge: 'bg-rose-100 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const APPROVAL_TYPES = [
  'Forest Clearance (Stage 1 & 2)',
  'Electrical Inspector Clearance (CEIG)',
  'NHAI Highway Crossing Permission',
  'Railway Crossing NOC',
  'Pollution Control Board Consent (CTO/CTE)',
  'Aviation NOC (AAI / Defence)',
  'River / Canal Crossing Permission',
  'Right of Way (ROW) & Land Revenue Clearance',
];

const DEFAULT_PROJECTS = [
  'Rajkot-Jetpur 220kV Line',
  'Surat-Bardoli 132kV Cable',
];

import { usePersistentState } from '../../hooks/usePersistentState';

export const StatutoryApprovalList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.26');
  const [approvals, setApprovals] = usePersistentState<StatutoryApproval[]>('epc_statutory_approvals', MOCK_APPROVALS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const projectOptions = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    return Array.from(new Set([...list, ...DEFAULT_PROJECTS]));
  }, [storedProjects]);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<StatutoryApproval | null>(null);
  const [editingItem, setEditingItem] = useState<StatutoryApproval | null>(null);
  const [deleteItem, setDeleteItem] = useState<StatutoryApproval | null>(null);

  const initialForm: Omit<StatutoryApproval, 'id' | 'approvalNo'> = {
    project: DEFAULT_PROJECTS[0],
    approvalType: APPROVAL_TYPES[0],
    authority: '',
    appliedDate: new Date().toISOString().slice(0, 10),
    expectedApprovalDate: '',
    actualApprovalDate: '',
    validityDate: '',
    status: 'applied',
    remarks: '',
    documents: [],
  };
  const [formData, setFormData] = useState(initialForm);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      if (search && !item.approvalNo.toLowerCase().includes(search.toLowerCase()) &&
          !item.approvalType.toLowerCase().includes(search.toLowerCase()) &&
          !item.authority.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (projectFilter && item.project !== projectFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (typeFilter && item.approvalType !== typeFilter) return false;
      return true;
    });
  }, [approvals, search, projectFilter, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = approvals.length;
    const approved = approvals.filter(a => a.status === 'approved').length;
    const inProgress = approvals.filter(a => ['applied', 'under_review'].includes(a.status)).length;
    const overdue = approvals.filter(a =>
      ['applied', 'under_review'].includes(a.status) && a.expectedApprovalDate && a.expectedApprovalDate < todayStr
    ).length;
    const expired = approvals.filter(a => a.status === 'expired' || (a.validityDate && a.validityDate < todayStr)).length;
    return { total, approved, inProgress, overdue, expired };
  }, [approvals, todayStr]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (item: StatutoryApproval) => {
    setEditingItem(item);
    setFormData({
      project: item.project,
      approvalType: item.approvalType,
      authority: item.authority,
      appliedDate: item.appliedDate,
      expectedApprovalDate: item.expectedApprovalDate,
      actualApprovalDate: item.actualApprovalDate || '',
      validityDate: item.validityDate || '',
      status: item.status,
      remarks: item.remarks,
      documents: item.documents || [],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setApprovals(prev => prev.map(a => a.id === editingItem.id ? { ...editingItem, ...formData } : a));
    } else {
      const newApproval: StatutoryApproval = {
        id: `stat-${Date.now()}`,
        approvalNo: `STAT-2026-${String(approvals.length + 1).padStart(3, '0')}`,
        ...formData,
      };
      setApprovals(prev => [newApproval, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setApprovals(prev => prev.filter(a => a.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statutory Approvals & Clearances"
        subtitle="Manage government NOCs, clearances, environmental and regulatory permissions"
        actions={
          canCreate ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Clearance
            </button>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Approvals</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Approved / Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">In Process / Applied</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Overdue Clearances</p>
          <p className={`text-2xl font-bold mt-1 ${stats.overdue > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{stats.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Expired / Renewal Due</p>
          <p className={`text-2xl font-bold mt-1 ${stats.expired > 0 ? 'text-rose-600' : 'text-slate-700'}`}>{stats.expired}</p>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by approval no, authority, clearance type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {Object.keys(statusStyles).map(s => (
                <option key={s} value={s}>{statusStyles[s as StatutoryApprovalStatus].label}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Clearance Types</option>
              {APPROVAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Clearance Type</th>
                <th className="py-3 px-4">Authority</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No statutory clearances found.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((app) => {
                  const s = statusStyles[app.status];
                  const isOverdue = ['applied', 'under_review'].includes(app.status) && app.expectedApprovalDate && app.expectedApprovalDate < todayStr;
                  const isExpiringSoon = app.validityDate && app.validityDate < todayStr;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600">
                        {app.approvalNo}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {app.approvalType}
                        {app.documents && app.documents.length > 0 && (
                          <span className="ml-2 inline-flex items-center text-[10px] text-slate-400">
                            📎 {app.documents.length}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={app.authority}>
                        {app.authority}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.project}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.appliedDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className={isOverdue ? 'text-amber-600 font-medium flex items-center gap-1' : 'text-slate-600'}>
                          {app.expectedApprovalDate || '—'}
                          {isOverdue && <AlertTriangle className="w-3 h-3 shrink-0" />}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={isExpiringSoon ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                          {app.validityDate || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.badge}`}>
                          {s.icon}
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewItem(app)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => openEditModal(app)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
                              title="Edit clearance"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => setDeleteItem(app)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600"
                              title="Delete clearance"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem ? `${viewItem.approvalNo} — ${viewItem.approvalType}` : 'Clearance Details'}
      >
        {viewItem && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Project:</span>
                <span className="font-semibold text-slate-800">{viewItem.project}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Authority / Department:</span>
                <span className="font-semibold text-slate-800">{viewItem.authority}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Application Date:</span>
                <span className="font-medium text-slate-700">{viewItem.appliedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Target / Expected Approval:</span>
                <span className="font-medium text-slate-700">{viewItem.expectedApprovalDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Actual Approval Date:</span>
                <span className="font-medium text-slate-700">{viewItem.actualApprovalDate || 'Pending'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Clearance Validity:</span>
                <span className="font-medium text-slate-700">{viewItem.validityDate || 'Perpetual / Undefined'}</span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Remarks & Status Log</p>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 whitespace-pre-wrap">
                {viewItem.remarks || 'No remarks added.'}
              </p>
            </div>

            <FileAttachment
              attachments={viewItem.documents || []}
              readOnly={true}
            />
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Clearance — ${editingItem.approvalNo}` : 'New Statutory Clearance Application'}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData(f => ({ ...f, project: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clearance / Approval Type</label>
              <select
                value={formData.approvalType}
                onChange={(e) => setFormData(f => ({ ...f, approvalType: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                {APPROVAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Authority / Ministry / Board Name</label>
            <input
              type="text"
              placeholder="e.g. Chief Electrical Inspector, NHAI, Forest Division Office"
              value={formData.authority}
              onChange={(e) => setFormData(f => ({ ...f, authority: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applied Date</label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData(f => ({ ...f, appliedDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
              </input>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Approval</label>
              <input
                type="date"
                value={formData.expectedApprovalDate}
                onChange={(e) => setFormData(f => ({ ...f, expectedApprovalDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as StatutoryApprovalStatus }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                {Object.keys(statusStyles).map(s => (
                  <option key={s} value={s}>{statusStyles[s as StatutoryApprovalStatus].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Approval Date (if granted)</label>
              <input
                type="date"
                value={formData.actualApprovalDate}
                onChange={(e) => setFormData(f => ({ ...f, actualApprovalDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clearance Expiry / Validity Date</label>
              <input
                type="date"
                value={formData.validityDate}
                onChange={(e) => setFormData(f => ({ ...f, validityDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks & Application Notes</label>
            <textarea
              rows={3}
              placeholder="Enter file number, surveyor notes, key conditions..."
              value={formData.remarks}
              onChange={(e) => setFormData(f => ({ ...f, remarks: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <FileAttachment
            attachments={formData.documents}
            onAdd={(att) => setFormData(f => ({ ...f, documents: [...f.documents, att] }))}
            onRemove={(id) => setFormData(f => ({ ...f, documents: f.documents.filter(d => d.id !== id) }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingItem ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        recordName={deleteItem?.approvalNo || ''}
        recordType="Statutory Clearance"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};
export default StatutoryApprovalList;
