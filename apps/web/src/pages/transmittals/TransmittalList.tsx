import React, { useState, useMemo } from 'react';
import { Plus, Search, AlertTriangle, Eye, Pencil, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Transmittal, TransmittalPurpose, TransmittalStatus, TransmittalDocument } from '../../types/transmittal';

const MOCK: Transmittal[] = [];

const statusConf: Record<TransmittalStatus, { bg: string; text: string; label: string }> = {
  draft:        { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
  sent:         { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Sent' },
  acknowledged: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Acknowledged' },
  responded:    { bg: 'bg-green-100', text: 'text-green-700', label: 'Responded' },
};

const purposeColors: Record<TransmittalPurpose, string> = {
  'For Review':      'bg-indigo-100 text-indigo-700',
  'For Approval':    'bg-violet-100 text-violet-700',
  'For Information': 'bg-slate-100 text-slate-600',
  'For Construction':'bg-green-100 text-green-700',
  'As Built':        'bg-teal-100 text-teal-700',
  'For Fabrication': 'bg-amber-100 text-amber-700',
  'For Comment':     'bg-orange-100 text-orange-700',
};

const PURPOSES: TransmittalPurpose[] = ['For Review','For Approval','For Information','For Construction','As Built','For Fabrication','For Comment'];
const STATUSES: TransmittalStatus[] = ['draft','sent','acknowledged','responded'];
const DEFAULT_PROJECTS = ['Rajkot-Jetpur 220kV Line','Surat-Bardoli 132kV Cable'];

interface FormDoc {
  docNo: string;
  title: string;
  revision: string;
  copies: number;
  format: TransmittalDocument['format'];
}

import { usePersistentState } from '../../hooks/usePersistentState';

const TransmittalList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.23');
  const [transmittals, setTransmittals] = usePersistentState<Transmittal[]>('epc_transmittals', MOCK);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const projectOptions = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    return Array.from(new Set([...list, ...DEFAULT_PROJECTS]));
  }, [storedProjects]);
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPurpose, setFPurpose] = useState('');
  const [fProject, setFProject] = useState('');

  const [newModal, setNewModal] = useState(false);
  const [editRow, setEditRow] = useState<Transmittal | null>(null);
  const [viewRow, setViewRow] = useState<Transmittal | null>(null);
  const [deleteRow, setDeleteRow] = useState<Transmittal | null>(null);
  const [responseModal, setResponseModal] = useState<Transmittal | null>(null);
  const [responseText, setResponseText] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const initialForm = {
    project: DEFAULT_PROJECTS[0],
    from: 'Priya Sharma / APAR Industries',
    to: '',
    toCompany: '',
    purpose: 'For Review' as TransmittalPurpose,
    expectedResponseDate: '',
    remarks: '',
    status: 'draft' as TransmittalStatus,
    docs: [
      { docNo: '', title: '', revision: 'A', copies: 2, format: 'PDF' as TransmittalDocument['format'] }
    ] as FormDoc[],
  };

  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(() => transmittals.filter(t => {
    if (search && !t.transmittalNo.toLowerCase().includes(search.toLowerCase()) && !t.toCompany.toLowerCase().includes(search.toLowerCase()) && !t.to.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus && t.status !== fStatus) return false;
    if (fPurpose && t.purpose !== fPurpose) return false;
    if (fProject && t.project !== fProject) return false;
    return true;
  }), [transmittals, search, fStatus, fPurpose, fProject]);

  const isOverdue = (t: Transmittal) => t.expectedResponseDate && t.expectedResponseDate < today && !['responded'].includes(t.status);
  const stats = {
    total: transmittals.length,
    sent: transmittals.filter(t => t.status === 'sent').length,
    awaiting: transmittals.filter(t => ['sent','acknowledged'].includes(t.status)).length,
    overdue: transmittals.filter(isOverdue).length,
  };

  const handleOpenCreate = () => {
    setEditRow(null);
    setForm(initialForm);
    setNewModal(true);
  };

  const handleOpenEdit = (t: Transmittal) => {
    setEditRow(t);
    setForm({
      project: t.project,
      from: t.from,
      to: t.to,
      toCompany: t.toCompany,
      purpose: t.purpose,
      expectedResponseDate: t.expectedResponseDate || '',
      remarks: t.remarks || '',
      status: t.status,
      docs: t.documents.map(d => ({
        docNo: d.docNo,
        title: d.title,
        revision: d.revision,
        copies: d.copies,
        format: d.format,
      })),
    });
    setNewModal(true);
  };

  const handleAddDocRow = () => {
    setForm(p => ({
      ...p,
      docs: [...p.docs, { docNo: '', title: '', revision: 'A', copies: 1, format: 'PDF' }]
    }));
  };

  const handleRemoveDocRow = (index: number) => {
    setForm(p => ({
      ...p,
      docs: p.docs.filter((_, i) => i !== index)
    }));
  };

  const handleDocChange = (index: number, field: keyof FormDoc, value: unknown) => {
    setForm(p => {
      const nextDocs = [...p.docs];
      nextDocs[index] = { ...nextDocs[index], [field]: value };
      return { ...p, docs: nextDocs };
    });
  };

  const handleSave = () => {
    const validDocs: TransmittalDocument[] = form.docs
      .filter(d => d.docNo.trim() && d.title.trim())
      .map((d, i) => ({
        id: `doc-${Date.now()}-${i}`,
        docNo: d.docNo.trim(),
        title: d.title.trim(),
        revision: d.revision.trim() || 'A',
        copies: Number(d.copies) || 1,
        format: d.format,
      }));

    if (editRow) {
      setTransmittals(prev => prev.map(t => t.id === editRow.id ? {
        ...t,
        project: form.project,
        from: form.from,
        to: form.to,
        toCompany: form.toCompany,
        purpose: form.purpose,
        expectedResponseDate: form.expectedResponseDate,
        remarks: form.remarks,
        status: form.status,
        documents: validDocs.length > 0 ? validDocs : t.documents,
      } : t));
    } else {
      const n: Transmittal = {
        id: `t-${Date.now()}`,
        transmittalNo: `APAR-TR-2026-${String(transmittals.length + 1).padStart(3, '0')}`,
        project: form.project,
        date: today,
        from: form.from,
        to: form.to,
        toCompany: form.toCompany,
        purpose: form.purpose,
        remarks: form.remarks,
        status: 'draft',
        expectedResponseDate: form.expectedResponseDate,
        documents: validDocs,
      };
      setTransmittals(prev => [n, ...prev]);
    }
    setNewModal(false);
    setEditRow(null);
  };

  const advanceStatus = (id: string) => {
    setTransmittals(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === 'draft') return { ...t, status: 'sent', sentAt: new Date().toISOString() };
      if (t.status === 'sent') return { ...t, status: 'acknowledged', acknowledgedAt: new Date().toISOString() };
      return t;
    }));
  };

  const markResponded = () => {
    if (!responseModal) return;
    setTransmittals(prev => prev.map(t => t.id === responseModal.id ? {
      ...t,
      status: 'responded',
      responseDate: today,
      responseRemarks: responseText
    } : t));
    setResponseModal(null);
    setResponseText('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transmittal Register"
        subtitle="Formal document submissions to clients, vendors, and consultants"
        actions={canCreate ? (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Transmittal
          </button>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700' },
          { label: 'Sent', value: stats.sent, color: 'text-blue-600' },
          { label: 'Awaiting Response', value: stats.awaiting, color: 'text-amber-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Filters */}
        <div className="flex gap-3 p-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transmittal / company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {[
            { val: fStatus, set: setFStatus, placeholder: 'All Statuses', opts: STATUSES.map(s => [s, statusConf[s].label]) },
            { val: fPurpose, set: setFPurpose, placeholder: 'All Purposes', opts: PURPOSES.map(p => [p, p]) },
            { val: fProject, set: setFProject, placeholder: 'All Projects', opts: projectOptions.map(p => [p, p]) },
          ].map(({ val, set, placeholder, opts }, i) => (
            <select
              key={i}
              value={val}
              onChange={e => set(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">{placeholder}</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Transmittal No', 'Date', 'Project', 'To (Company)', 'Purpose', 'Docs', 'Status', 'Expected Response', 'Overdue', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">No transmittals found</td>
                </tr>
              )}
              {filtered.map(t => {
                const od = isOverdue(t);
                const sc = statusConf[t.status];
                return (
                  <tr key={t.id} className={od ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{t.transmittalNo}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.project.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs font-medium">{t.toCompany}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${purposeColors[t.purpose]}`}>{t.purpose}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-center font-medium">{t.documents.length}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${od ? 'text-red-600' : 'text-slate-500'}`}>
                      {t.expectedResponseDate || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {od && (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewRow(t)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                          title="View transmittal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                            title="Edit transmittal"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canUpdate && t.status === 'draft' && (
                          <button onClick={() => advanceStatus(t.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                            Mark Sent
                          </button>
                        )}
                        {canUpdate && t.status === 'sent' && (
                          <button onClick={() => advanceStatus(t.id)} className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 font-medium">
                            Mark Ack.
                          </button>
                        )}
                        {canUpdate && t.status === 'acknowledged' && (
                          <button onClick={() => { setResponseModal(t); setResponseText(''); }} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                            Responded
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={() => setDeleteRow(t)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="Delete transmittal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal open={!!viewRow} onClose={() => setViewRow(null)} title={`Transmittal — ${viewRow?.transmittalNo}`}>
        {viewRow && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {[
                ['Project', viewRow.project],
                ['Date', viewRow.date],
                ['From', viewRow.from],
                ['To', `${viewRow.to} (${viewRow.toCompany})`],
                ['Purpose', viewRow.purpose],
                ['Status', statusConf[viewRow.status].label],
                ['Expected Response', viewRow.expectedResponseDate || '—'],
                ['Response Date', viewRow.responseDate || '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[11px] uppercase font-semibold text-slate-400">{l}</p>
                  <p className="font-medium text-slate-700 text-xs">{v}</p>
                </div>
              ))}
            </div>

            {viewRow.remarks && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submission Remarks</p>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 text-xs">{viewRow.remarks}</p>
              </div>
            )}

            {viewRow.responseRemarks && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Client / Recipient Response</p>
                <p className="text-green-800 bg-green-50 p-2.5 rounded border border-green-200 text-xs font-medium">{viewRow.responseRemarks}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Attached Documents ({viewRow.documents.length})</p>
              <table className="table-auto w-full text-xs border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {['Doc No', 'Title', 'Rev', 'Copies', 'Format'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-slate-600 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewRow.documents.map(d => (
                    <tr key={d.id}>
                      <td className="px-3 py-2 font-mono text-indigo-600 font-medium">{d.docNo}</td>
                      <td className="px-3 py-2 text-slate-700">{d.title}</td>
                      <td className="px-3 py-2">{d.revision}</td>
                      <td className="px-3 py-2 text-center">{d.copies}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">{d.format}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setViewRow(null)} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal open={!!responseModal} onClose={() => setResponseModal(null)} title="Mark as Responded">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Record the formal response received for transmittal <strong className="text-indigo-600">{responseModal?.transmittalNo}</strong>
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Response Status / Remarks *</label>
            <textarea
              rows={3}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="e.g. Code 1 – Approved for Construction / Code 2 – Approved with comments..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setResponseModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              onClick={markResponded}
              disabled={!responseText.trim()}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Confirm Responded
            </button>
          </div>
        </div>
      </Modal>

      {/* New / Edit Transmittal Modal */}
      <Modal
        open={newModal}
        onClose={() => { setNewModal(false); setEditRow(null); }}
        title={editRow ? `Edit Transmittal — ${editRow.transmittalNo}` : 'New Transmittal'}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
              <select
                value={form.project}
                onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {projectOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Purpose</label>
              <select
                value={form.purpose}
                onChange={e => setForm(p => ({ ...p, purpose: e.target.value as TransmittalPurpose }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PURPOSES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">From *</label>
              <input
                type="text"
                value={form.from}
                onChange={e => setForm(p => ({ ...p, from: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To (Recipient Person) *</label>
              <input
                type="text"
                value={form.to}
                placeholder="e.g. Mr. Desai"
                onChange={e => setForm(p => ({ ...p, to: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To Company *</label>
              <input
                type="text"
                value={form.toCompany}
                placeholder="e.g. GETCO / L&T"
                onChange={e => setForm(p => ({ ...p, toCompany: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expected Response Date</label>
              <input
                type="date"
                value={form.expectedResponseDate}
                onChange={e => setForm(p => ({ ...p, expectedResponseDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {editRow && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as TransmittalStatus }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{statusConf[s].label}</option>)}
                </select>
              </div>
            )}
            <div className={editRow ? 'col-span-1' : 'col-span-2'}>
              <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={form.remarks}
                onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Documents sub-section */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Documents to Transmit ({form.docs.length})
              </label>
              <button
                type="button"
                onClick={handleAddDocRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Document
              </button>
            </div>

            <div className="space-y-2">
              {form.docs.map((d, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Doc No (e.g. DWG-001)"
                      value={d.docNo}
                      onChange={e => handleDocChange(index, 'docNo', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Document Title"
                      value={d.title}
                      onChange={e => handleDocChange(index, 'title', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Rev (A)"
                      value={d.revision}
                      onChange={e => handleDocChange(index, 'revision', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={d.format}
                      onChange={e => handleDocChange(index, 'format', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DWG">DWG</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLS">XLS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-1 text-right">
                    {form.docs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocRow(index)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Remove document row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => { setNewModal(false); setEditRow(null); }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.from.trim() || !form.to.trim() || !form.toCompany.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {editRow ? 'Save Changes' : 'Create Transmittal'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.transmittalNo ?? ''}
        recordType="Transmittal"
        onConfirm={() => {
          setTransmittals(p => p.filter(t => t.id !== deleteRow?.id));
          setDeleteRow(null);
        }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default TransmittalList;
