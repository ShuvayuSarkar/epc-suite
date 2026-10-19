import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { CRS, CRSStatus, ReviewStage, CommentType, CRSComment } from '../../types/crs';

const MOCK_CRS: CRS[] = [];

function computeCRSStatus(comments: CRS['comments']): CRSStatus {
  if (comments.length === 0) return 'open';
  const done = comments.filter(c => c.status === 'closed' || c.status === 'rejected').length;
  if (done === comments.length) return 'all_closed';
  if (done > 0) return 'partially_closed';
  return 'open';
}

const statusConf: Record<CRSStatus, { bg: string; text: string; label: string }> = {
  open:             { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Open' },
  partially_closed: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partially Closed' },
  all_closed:       { bg: 'bg-green-100', text: 'text-green-700', label: 'All Closed' },
};
const typeConf: Record<string, string> = { Major: 'bg-red-100 text-red-700', Minor: 'bg-amber-100 text-amber-700', Info: 'bg-blue-100 text-blue-700' };
const cmtStatusConf: Record<string, string> = { open: 'bg-red-100 text-red-700', responded: 'bg-blue-100 text-blue-700', closed: 'bg-green-100 text-green-700', rejected: 'bg-slate-100 text-slate-500' };
const REVIEW_STAGES: ReviewStage[] = ['Internal Review', 'Client Review', 'Vendor Review', 'Third Party Review'];
const DEFAULT_PROJECTS = ['Rajkot-Jetpur 220kV Line', 'Surat-Bardoli 132kV Cable'];

import { usePersistentState } from '../../hooks/usePersistentState';

const CRSList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.25');
  const [crsList, setCrsList] = usePersistentState<CRS[]>('epc_crs', MOCK_CRS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const projectOptions = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    return Array.from(new Set([...list, ...DEFAULT_PROJECTS]));
  }, [storedProjects]);
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fStage, setFStage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<CRS | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [editRow, setEditRow] = useState<CRS | null>(null);

  // Response Modal State
  const [respondModal, setRespondModal] = useState<{ crsId: string; commentId: string } | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseBy, setResponseBy] = useState('');

  // Add Comment Modal State
  const [addCommentCrsId, setAddCommentCrsId] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({
    page: 'Sheet 1',
    commentBy: '',
    commentType: 'Major' as CommentType,
    commentText: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  // CRS Create/Edit Form State
  const [form, setForm] = useState({
    documentNo: '',
    documentTitle: '',
    revision: 'A',
    reviewStage: 'Client Review' as ReviewStage,
    reviewedBy: '',
    project: DEFAULT_PROJECTS[0]
  });

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => crsList.filter(c => {
    if (search && !c.crsNo.toLowerCase().includes(search.toLowerCase()) && !c.documentNo.toLowerCase().includes(search.toLowerCase()) && !c.documentTitle.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus && c.status !== fStatus) return false;
    if (fStage && c.reviewStage !== fStage) return false;
    return true;
  }), [crsList, search, fStatus, fStage]);

  const totalOpen = crsList.flatMap(c => c.comments).filter(c => c.status === 'open').length;

  const handleCreate = () => {
    const newCRS: CRS = {
      id: `crs-${Date.now()}`,
      crsNo: `CRS-2026-${String(crsList.length + 1).padStart(3, '0')}`,
      documentId: '',
      documentNo: form.documentNo,
      documentTitle: form.documentTitle,
      revision: form.revision,
      reviewStage: form.reviewStage,
      reviewedBy: form.reviewedBy,
      project: form.project,
      status: 'open',
      createdAt: today,
      comments: [],
    };
    setCrsList(prev => [newCRS, ...prev]);
    setNewModal(false);
    setForm({ documentNo: '', documentTitle: '', revision: 'A', reviewStage: 'Client Review', reviewedBy: '', project: projectOptions[0] || DEFAULT_PROJECTS[0] });
  };

  const openEditCRS = (crs: CRS) => {
    setEditRow(crs);
    setForm({
      documentNo: crs.documentNo,
      documentTitle: crs.documentTitle,
      revision: crs.revision,
      reviewStage: crs.reviewStage,
      reviewedBy: crs.reviewedBy,
      project: crs.project,
    });
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setCrsList(prev => prev.map(c => c.id === editRow.id ? {
      ...c,
      documentNo: form.documentNo,
      documentTitle: form.documentTitle,
      revision: form.revision,
      reviewStage: form.reviewStage,
      reviewedBy: form.reviewedBy,
      project: form.project,
    } : c));
    setEditRow(null);
  };

  const handleAddComment = () => {
    if (!addCommentCrsId) return;
    setCrsList(prev => prev.map(c => {
      if (c.id !== addCommentCrsId) return c;
      const count = c.comments.length + 1;
      const newComment: CRSComment = {
        id: `c-${Date.now()}`,
        number: `C-${String(count).padStart(3, '0')}`,
        page: commentForm.page,
        commentBy: commentForm.commentBy || c.reviewedBy,
        commentType: commentForm.commentType,
        commentText: commentForm.commentText,
        response: '',
        responseBy: '',
        status: 'open',
        dueDate: commentForm.dueDate,
      };
      const updatedComments = [...c.comments, newComment];
      return {
        ...c,
        comments: updatedComments,
        status: computeCRSStatus(updatedComments),
      };
    }));
    setAddCommentCrsId(null);
    setCommentForm({
      page: 'Sheet 1',
      commentBy: '',
      commentType: 'Major',
      commentText: '',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    });
  };

  const handleDeleteComment = (crsId: string, commentId: string) => {
    setCrsList(prev => prev.map(c => {
      if (c.id !== crsId) return c;
      const comments = c.comments.filter(cm => cm.id !== commentId);
      return { ...c, comments, status: computeCRSStatus(comments) };
    }));
  };

  const updateCommentStatus = (crsId: string, cId: string, status: string) => {
    setCrsList(prev => prev.map(c => {
      if (c.id !== crsId) return c;
      const comments = c.comments.map(cm => cm.id === cId ? { ...cm, status: status as CRSComment['status'], closedAt: status === 'closed' ? today : undefined } : cm);
      return { ...c, comments, status: computeCRSStatus(comments) };
    }));
  };

  const submitResponse = () => {
    if (!respondModal) return;
    setCrsList(prev => prev.map(c => {
      if (c.id !== respondModal.crsId) return c;
      const comments = c.comments.map(cm => cm.id === respondModal.commentId ? { ...cm, response: responseText, responseBy, status: 'responded' as const } : cm);
      return { ...c, comments, status: computeCRSStatus(comments) };
    }));
    setRespondModal(null);
    setResponseText('');
    setResponseBy('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comment Response Sheets (CRS)"
        subtitle="Design review comment tracking — Internal, Client, Vendor"
        actions={canCreate ? (
          <button
            onClick={() => {
              setForm({ documentNo: '', documentTitle: '', revision: 'A', reviewStage: 'Client Review', reviewedBy: '', project: projectOptions[0] || DEFAULT_PROJECTS[0] });
              setNewModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> New CRS
          </button>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total CRS', value: crsList.length, color: 'text-slate-700' },
          { label: 'All Closed', value: crsList.filter(c => c.status === 'all_closed').length, color: 'text-green-600' },
          { label: 'Partially Closed', value: crsList.filter(c => c.status === 'partially_closed').length, color: 'text-amber-600' },
          { label: 'Open Comments', value: totalOpen, color: 'text-red-600' },
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
            <input
              type="text"
              placeholder="Search CRS / doc no / title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={fStatus}
            onChange={e => setFStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="partially_closed">Partially Closed</option>
            <option value="all_closed">All Closed</option>
          </select>
          <select
            value={fStage}
            onChange={e => setFStage(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Stages</option>
            {REVIEW_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['CRS No', 'Doc No', 'Title', 'Rev', 'Project', 'Review Stage', 'Comments (closed/total)', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">No CRS records found</td>
                </tr>
              )}
              {filtered.map(crs => {
                const closed = crs.comments.filter(c => c.status === 'closed' || c.status === 'rejected').length;
                const total = crs.comments.length;
                const pct = total > 0 ? Math.round((closed / total) * 100) : 0;
                const sc = statusConf[crs.status];
                const isExp = expandedId === crs.id;
                return (
                  <React.Fragment key={crs.id}>
                    <tr
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(isExp ? null : crs.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{crs.crsNo}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600 whitespace-nowrap">{crs.documentNo}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs max-w-[200px] truncate" title={crs.documentTitle}>{crs.documentTitle}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{crs.revision}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{crs.project.split(' ')[0]}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{crs.reviewStage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
                            <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{closed}/{total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedId(isExp ? null : crs.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title={isExp ? 'Collapse comments' : 'Expand comments'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => openEditCRS(crs)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Edit CRS metadata"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => setDeleteRow(crs)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete CRS sheet"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <span className="text-slate-400 text-xs ml-1">
                            {isExp ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExp && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Comments Register — Reviewed by: <span className="text-indigo-600 font-semibold">{crs.reviewedBy}</span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {crs.comments.length} comment{crs.comments.length === 1 ? '' : 's'} recorded · {closed} resolved
                              </p>
                            </div>
                            {canUpdate && (
                              <button
                                onClick={() => {
                                  setAddCommentCrsId(crs.id);
                                  setCommentForm({
                                    page: 'Sheet 1',
                                    commentBy: crs.reviewedBy,
                                    commentType: 'Major',
                                    commentText: '',
                                    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Review Comment
                              </button>
                            )}
                          </div>

                          {crs.comments.length === 0 ? (
                            <div className="py-6 text-center bg-white border border-dashed border-slate-200 rounded-lg">
                              <p className="text-xs text-slate-500 mb-2">No review comments added to this CRS yet.</p>
                              {canUpdate && (
                                <button
                                  onClick={() => {
                                    setAddCommentCrsId(crs.id);
                                    setCommentForm({
                                      page: 'Sheet 1',
                                      commentBy: crs.reviewedBy,
                                      commentType: 'Major',
                                      commentText: '',
                                      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                                    });
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                  + Click here to add the first comment
                                </button>
                              )}
                            </div>
                          ) : (
                            <table className="table-auto w-full text-xs border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                              <thead className="bg-slate-100/80 border-b border-slate-200">
                                <tr>
                                  {['#', 'Page', 'Type', 'Comment', 'Response', 'By', 'Due', 'Status', ...(canUpdate ? ['Actions'] : [])].map(h => (
                                    <th key={h} className="px-3 py-2 text-left text-slate-600 font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {crs.comments.map(cm => {
                                  const isOD = cm.dueDate < today && !['closed', 'rejected'].includes(cm.status);
                                  return (
                                    <tr key={cm.id} className={isOD ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}>
                                      <td className="px-3 py-2 font-mono font-bold text-indigo-600">{cm.number}</td>
                                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{cm.page}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${typeConf[cm.commentType]}`}>{cm.commentType}</span>
                                      </td>
                                      <td className="px-3 py-2 text-slate-800 max-w-xs">{cm.commentText}</td>
                                      <td className="px-3 py-2 text-slate-600 max-w-xs">
                                        {cm.response ? <span className="text-slate-800 font-medium">{cm.response}</span> : <em className="text-slate-400">Awaiting response</em>}
                                      </td>
                                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{cm.responseBy || '—'}</td>
                                      <td className={`px-3 py-2 whitespace-nowrap font-medium ${isOD ? 'text-red-600' : 'text-slate-500'}`}>{cm.dueDate}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${cmtStatusConf[cm.status]}`}>{cm.status}</span>
                                      </td>
                                      {canUpdate && (
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <div className="flex items-center gap-1.5">
                                            {cm.status === 'open' && (
                                              <button
                                                onClick={() => {
                                                  setRespondModal({ crsId: crs.id, commentId: cm.id });
                                                  setResponseText('');
                                                  setResponseBy('Lead Design Engineer');
                                                }}
                                                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                              >
                                                Respond
                                              </button>
                                            )}
                                            {cm.status === 'responded' && (
                                              <button
                                                onClick={() => updateCommentStatus(crs.id, cm.id, 'closed')}
                                                className="px-2 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                              >
                                                Close
                                              </button>
                                            )}
                                            {['open', 'responded'].includes(cm.status) && (
                                              <button
                                                onClick={() => updateCommentStatus(crs.id, cm.id, 'rejected')}
                                                className="px-2 py-0.5 text-xs bg-slate-400 text-white rounded hover:bg-slate-500 font-medium"
                                              >
                                                Reject
                                              </button>
                                            )}
                                            <button
                                              onClick={() => handleDeleteComment(crs.id, cm.id)}
                                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                              title="Delete comment"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
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

      {/* Record Response Modal */}
      <Modal open={!!respondModal} onClose={() => setRespondModal(null)} title="Record Comment Response">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Response / Disposition *</label>
            <textarea
              rows={3}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="Explain technical disposition or revision implemented..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Response Provided By</label>
            <input
              type="text"
              value={responseBy}
              onChange={e => setResponseBy(e.target.value)}
              placeholder="e.g. Arjun Mehta / Lead Design Engineer"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setRespondModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              onClick={submitResponse}
              disabled={!responseText.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Submit Response
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Comment Modal */}
      <Modal open={!!addCommentCrsId} onClose={() => setAddCommentCrsId(null)} title="Add Review Comment">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sheet / Page Reference</label>
              <input
                type="text"
                value={commentForm.page}
                onChange={e => setCommentForm(p => ({ ...p, page: e.target.value }))}
                placeholder="e.g. Sheet 1, Cl. 4.2"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Comment Severity</label>
              <select
                value={commentForm.commentType}
                onChange={e => setCommentForm(p => ({ ...p, commentType: e.target.value as CommentType }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Major">Major (Critical Design Impact)</option>
                <option value="Minor">Minor (Editorial / Dimensioning)</option>
                <option value="Info">Info (Clarification Only)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Comment By</label>
              <input
                type="text"
                value={commentForm.commentBy}
                onChange={e => setCommentForm(p => ({ ...p, commentBy: e.target.value }))}
                placeholder="Reviewer name / organization"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Resolution Due Date</label>
              <input
                type="date"
                value={commentForm.dueDate}
                onChange={e => setCommentForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Comment Text *</label>
            <textarea
              rows={3}
              value={commentForm.commentText}
              onChange={e => setCommentForm(p => ({ ...p, commentText: e.target.value }))}
              placeholder="Detail the review observation or requirement..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAddCommentCrsId(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              onClick={handleAddComment}
              disabled={!commentForm.commentText.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Comment
            </button>
          </div>
        </div>
      </Modal>

      {/* New CRS Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Comment Response Sheet (CRS)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Document No *</label>
              <input
                type="text"
                placeholder="e.g. APAR-ELE-DWG-003"
                value={form.documentNo}
                onChange={e => setForm(p => ({ ...p, documentNo: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Revision</label>
              <input
                type="text"
                placeholder="e.g. A or 0"
                value={form.revision}
                onChange={e => setForm(p => ({ ...p, revision: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                placeholder="e.g. Protection Relay Logic Schematic"
                value={form.documentTitle}
                onChange={e => setForm(p => ({ ...p, documentTitle: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Review Stage</label>
              <select
                value={form.reviewStage}
                onChange={e => setForm(p => ({ ...p, reviewStage: e.target.value as ReviewStage }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {REVIEW_STAGES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Reviewed By (Person / Authority)</label>
              <input
                type="text"
                placeholder="e.g. Mr. Desai / GETCO"
                value={form.reviewedBy}
                onChange={e => setForm(p => ({ ...p, reviewedBy: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setNewModal(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!form.documentNo.trim() || !form.documentTitle.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Create CRS
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit CRS Modal */}
      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Edit CRS — ${editRow?.crsNo}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Document No *</label>
              <input
                type="text"
                value={form.documentNo}
                onChange={e => setForm(p => ({ ...p, documentNo: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Revision</label>
              <input
                type="text"
                value={form.revision}
                onChange={e => setForm(p => ({ ...p, revision: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                value={form.documentTitle}
                onChange={e => setForm(p => ({ ...p, documentTitle: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Review Stage</label>
              <select
                value={form.reviewStage}
                onChange={e => setForm(p => ({ ...p, reviewStage: e.target.value as ReviewStage }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {REVIEW_STAGES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Reviewed By</label>
              <input
                type="text"
                value={form.reviewedBy}
                onChange={e => setForm(p => ({ ...p, reviewedBy: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditRow(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button
              onClick={handleSaveEdit}
              disabled={!form.documentNo.trim() || !form.documentTitle.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.crsNo ?? ''}
        recordType="CRS Sheet"
        onConfirm={() => {
          setCrsList(p => p.filter(c => c.id !== deleteRow?.id));
          setDeleteRow(null);
        }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default CRSList;
