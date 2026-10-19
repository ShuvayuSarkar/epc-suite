import React, { useState, useMemo } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle, Clock, FileText, X, Pencil, Trash2 } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';

// ─── Types ─────────────────────────────────────────────────────────────────────
type IssueCategory = 'Design' | 'Procurement' | 'Construction' | 'Safety' | 'Client' | 'Commercial' | 'Other';
type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';
type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Issue {
  id: string;
  issueNo: string;
  title: string;
  project: string;
  category: IssueCategory;
  priority: IssuePriority;
  raisedBy: string;
  assignedTo: string;
  raisedDate: string;
  dueDate: string;
  status: IssueStatus;
  description: string;
  resolution: string;
  closedAt?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_ISSUES: Issue[] = [];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const priorityConfig: Record<IssuePriority, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  High:     { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Low:      { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const statusConfig: Record<IssueStatus, { bg: string; text: string; label: string }> = {
  open:        { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Open' },
  in_progress: { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'In Progress' },
  resolved:    { bg: 'bg-teal-100',  text: 'text-teal-700',  label: 'Resolved' },
  closed:      { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Closed' },
};

const categoryColors: Record<IssueCategory, string> = {
  Design: 'bg-indigo-100 text-indigo-700', Procurement: 'bg-violet-100 text-violet-700',
  Construction: 'bg-amber-100 text-amber-700', Safety: 'bg-red-100 text-red-700',
  Client: 'bg-blue-100 text-blue-700', Commercial: 'bg-green-100 text-green-700', Other: 'bg-slate-100 text-slate-600',
};

import { usePersistentState } from '../../hooks/usePersistentState';

// ─── Main Component ─────────────────────────────────────────────────────────────
const IssueList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.27');
  const [issues, setIssues] = usePersistentState<Issue[]>('epc_issues', MOCK_ISSUES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [deleteRow, setDeleteRow] = useState<Issue | null>(null);
  const [editRow, setEditRow] = useState<Issue | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const emptyForm: Omit<Issue, 'id' | 'issueNo' | 'closedAt'> = {
    title: '', project: 'Rajkot-Jetpur 220kV Line', category: 'Design', priority: 'Medium',
    raisedBy: '', assignedTo: '', raisedDate: new Date().toISOString().slice(0, 10),
    dueDate: '', status: 'open', description: '', resolution: '',
  };
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => issues.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.issueNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (filterCategory && i.category !== filterCategory) return false;
    return true;
  }), [issues, search, filterStatus, filterPriority, filterCategory]);

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    critical: issues.filter(i => i.priority === 'Critical' && i.status !== 'closed').length,
    overdue: issues.filter(i => i.dueDate < today && !['resolved', 'closed'].includes(i.status)).length,
  };

  const handleSave = () => {
    if (editRow) {
      setIssues(prev => prev.map(i => i.id === editRow.id ? { ...editRow, ...form } : i));
      setEditRow(null);
    } else {
      const newIssue: Issue = {
        ...form,
        id: `i-${Date.now()}`,
        issueNo: `ISS-2026-${String(issues.length + 1).padStart(3, '0')}`,
      };
      setIssues(prev => [...prev, newIssue]);
      setNewModal(false);
    }
    setForm(emptyForm);
  };

  const openEdit = (issue: Issue) => {
    setEditRow(issue);
    setForm({ title: issue.title, project: issue.project, category: issue.category, priority: issue.priority, raisedBy: issue.raisedBy, assignedTo: issue.assignedTo, raisedDate: issue.raisedDate, dueDate: issue.dueDate, status: issue.status, description: issue.description, resolution: issue.resolution });
  };

  const IssueForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Issue Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        {([['Project', 'project', ['Rajkot-Jetpur 220kV Line', 'Surat-Bardoli 132kV Cable']] as [string, string, string[]],
           ['Category', 'category', ['Design', 'Procurement', 'Construction', 'Safety', 'Client', 'Commercial', 'Other']] as [string, string, string[]],
           ['Priority', 'priority', ['Critical', 'High', 'Medium', 'Low']] as [string, string, string[]],
           ['Status', 'status', ['open', 'in_progress', 'resolved', 'closed']] as [string, string, string[]]
        ] as Array<[string, keyof typeof form, string[]]>).map(([label, key, opts]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
            <select value={form[key] as string} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {([['Raised By', 'raisedBy'], ['Assigned To', 'assignedTo'], ['Raised Date', 'raisedDate'], ['Due Date', 'dueDate']] as [string, keyof typeof form][]).map(([label, key]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
            <input type={key.includes('Date') ? 'date' : 'text'} value={form[key] as string}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        ))}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Resolution / Action Taken</label>
          <textarea rows={2} value={form.resolution} onChange={e => setForm(p => ({ ...p, resolution: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => { setNewModal(false); setEditRow(null); setForm(emptyForm); }}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
        <button onClick={handleSave}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          {editRow ? 'Save Changes' : 'Create Issue'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Tracker"
        subtitle="General project issues — Design, Procurement, Safety, Client, Commercial"
        actions={canCreate ? (
          <button onClick={() => { setForm(emptyForm); setNewModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> New Issue
          </button>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Issues', value: stats.total, color: 'text-slate-700' },
          { label: 'Open', value: stats.open, color: 'text-red-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Critical', value: stats.critical, color: 'text-red-700' },
          { label: 'Overdue', value: stats.overdue, color: 'text-orange-600' },
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
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          {[
            { label: 'All Statuses', key: 'filterStatus', setter: setFilterStatus, value: filterStatus, opts: [['open','Open'],['in_progress','In Progress'],['resolved','Resolved'],['closed','Closed']] },
            { label: 'All Priorities', key: 'filterPriority', setter: setFilterPriority, value: filterPriority, opts: [['Critical','Critical'],['High','High'],['Medium','Medium'],['Low','Low']] },
            { label: 'All Categories', key: 'filterCategory', setter: setFilterCategory, value: filterCategory, opts: (['Design','Procurement','Construction','Safety','Client','Commercial','Other'] as string[]).map(c => [c, c]) },
          ].map(({ label, key, setter, value, opts }) => (
            <select key={key} value={value} onChange={e => setter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">{label}</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Issue No', 'Title', 'Project', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">No issues found</td></tr>
              )}
              {filtered.map(issue => {
                const isOverdue = issue.dueDate < today && !['resolved', 'closed'].includes(issue.status);
                const pc = priorityConfig[issue.priority];
                const sc = statusConfig[issue.status];
                const isExpanded = expandedId === issue.id;
                return (
                  <React.Fragment key={issue.id}>
                    <tr
                      className={`cursor-pointer hover:bg-slate-50 ${isOverdue ? 'bg-red-50/40' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold whitespace-nowrap">{issue.issueNo}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px]">
                        <div className="truncate">{issue.title}</div>
                        {isOverdue && <span className="text-[10px] text-red-600 font-semibold">⚠ OVERDUE</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{issue.project.split(' ')[0]}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}>{issue.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${pc.bg} ${pc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{issue.assignedTo}</td>
                      <td className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>{issue.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {canUpdate && (
                            <button onClick={() => openEdit(issue)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50" title="Edit issue">
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canRemove && (
                            <button onClick={() => setDeleteRow(issue)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete issue">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{issue.description || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Resolution / Action Taken</p>
                              <p className={`text-sm leading-relaxed ${issue.resolution ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {issue.resolution || 'No resolution recorded yet.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3 text-xs text-slate-400">
                            <span>Raised by: <strong className="text-slate-600">{issue.raisedBy}</strong></span>
                            <span>Raised on: <strong className="text-slate-600">{issue.raisedDate}</strong></span>
                            {issue.closedAt && <span>Closed: <strong className="text-slate-600">{issue.closedAt}</strong></span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={newModal} onClose={() => { setNewModal(false); setForm(emptyForm); }} title="New Issue">
        <IssueForm />
      </Modal>
      <Modal open={!!editRow} onClose={() => { setEditRow(null); setForm(emptyForm); }} title={`Edit Issue — ${editRow?.issueNo}`}>
        <IssueForm />
      </Modal>
      <ConfirmDeleteDialog
        open={!!deleteRow} recordName={deleteRow?.title ?? ''} recordType="Issue"
        onConfirm={() => { setIssues(prev => prev.filter(i => i.id !== deleteRow?.id)); setDeleteRow(null); }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default IssueList;
