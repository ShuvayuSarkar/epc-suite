import React, { useState, useMemo } from 'react';
import {
  Plus, Search, FileText, QrCode, Printer, CheckCircle2, Clock,
  AlertTriangle, Eye, Pencil, Trash2, ArrowRight, Layers, FileCheck,
  Send, History, Sparkles, Filter
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { FileAttachment } from '../../components/ui/FileAttachment';
import { WorkflowTimeline } from '../../components/workflow/WorkflowTimeline';
import { WorkflowStagePanel } from '../../components/workflow/WorkflowStagePanel';
import { QRCodeBadge } from '../../components/ui/QRCodeBadge';
import { printDocumentCoversheet } from '../../utils/printWithQR';
import { generateDocNumber, DISCIPLINE_CODES, DOC_TYPE_CODES } from '../../utils/docNumbering';
import { formatRevisionForRelease, getNextInternalRevision } from '../../utils/revisionEngine';
import { WorkflowStage, DocumentRevision, ClientApprovalCode } from '../../types/workflow';
import { Attachment } from '../../types/attachment';

export interface FullEngDoc {
  id: string;
  docNo: string;
  title: string;
  discipline: string;
  docType: string;
  project: string;
  currentRev: string;
  releaseType: 'internal' | 'client' | 'ifc';
  status: 'Draft' | 'Under Review' | 'Client Review' | 'Approved' | 'IFC' | 'Superseded';
  plannedIFA: string;
  actualIFA?: string;
  author: string;
  workflowStages: WorkflowStage[];
  currentStageIndex: number;
  revisions: DocumentRevision[];
  attachments: Attachment[];
}

const DEFAULT_STAGES = (leadEngineer: string = 'Arjun Mehta'): WorkflowStage[] => [
  { id: 's1', name: 'Design Creation', order: 1, assignedRoles: ['lead_design_engineer'], assignedUsers: [leadEngineer], status: 'completed', completedAt: '2026-09-01T10:00:00Z', completedBy: leadEngineer, comments: 'Initial design completed.' },
  { id: 's2', name: 'Internal Review', order: 2, assignedRoles: ['quality_inspector', 'project_manager'], assignedUsers: ['Rajesh Kumar'], status: 'completed', completedAt: '2026-09-08T15:00:00Z', completedBy: 'Rajesh Kumar', comments: 'Quality and clearance checked.' },
  { id: 's3', name: 'Client Review', order: 3, assignedRoles: ['client_stakeholder', 'project_director'], assignedUsers: ['Mr. Desai (GETCO)'], status: 'in_progress', approvalCode: 'A2' },
  { id: 's4', name: 'IFC Release', order: 4, assignedRoles: ['document_controller'], assignedUsers: ['Priya Sharma'], status: 'pending' },
];

const MOCK_ENG_DOCS: FullEngDoc[] = [];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function EngineeringDocList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.18');
  const [docs, setDocs] = usePersistentState<FullEngDoc[]>('epc_eng_docs', MOCK_ENG_DOCS);
  const [activeTab, setActiveTab] = useState<'register' | 'kanban'>('register');
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [inspectDoc, setInspectDoc] = useState<FullEngDoc | null>(null);
  const [newDocModal, setNewDocModal] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<FullEngDoc | null>(null);
  const [newRevisionModal, setNewRevisionModal] = useState(false);
  const [newRevDesc, setNewRevDesc] = useState('');

  // Form for New Document
  const [newForm, setNewForm] = useState({
    project: 'Rajkot-Jetpur 220kV Line',
    discipline: 'Electrical',
    docType: 'Drawing',
    title: '',
    author: 'Arjun Mehta',
    plannedIFA: new Date(Date.now() + 86400000 * 21).toISOString().slice(0, 10),
  });

  const filteredDocs = useMemo(() => {
    return docs.filter(d => {
      if (search && !d.docNo.toLowerCase().includes(search.toLowerCase()) && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (disciplineFilter && d.discipline !== disciplineFilter) return false;
      if (projectFilter && d.project !== projectFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      return true;
    });
  }, [docs, search, disciplineFilter, projectFilter, statusFilter]);

  const handleCreateDocument = () => {
    const nextSeq = docs.length + 1;
    const generatedDocNo = generateDocNumber(
      newForm.project.slice(0, 4),
      newForm.discipline,
      newForm.docType,
      nextSeq
    );

    const stages = DEFAULT_STAGES(newForm.author);
    const newDoc: FullEngDoc = {
      id: `ED-${Date.now()}`,
      docNo: generatedDocNo,
      title: newForm.title || `${newForm.discipline} ${newForm.docType}`,
      discipline: newForm.discipline,
      docType: newForm.docType,
      project: newForm.project,
      currentRev: 'A',
      releaseType: 'internal',
      status: 'Draft',
      plannedIFA: newForm.plannedIFA,
      author: newForm.author,
      currentStageIndex: 0,
      workflowStages: stages.map((s, idx) => ({ ...s, status: idx === 0 ? 'in_progress' : 'pending', completedAt: undefined })),
      revisions: [
        {
          revision: 'A',
          stage: 'Design Creation',
          releaseType: 'internal',
          issuedDate: new Date().toISOString().slice(0, 10),
          issuedBy: newForm.author,
          description: 'Document initiated',
        }
      ],
      attachments: [],
    };

    setDocs(prev => [newDoc, ...prev]);
    setNewDocModal(false);
    setNewForm({
      project: 'Rajkot-Jetpur 220kV Line',
      discipline: 'Electrical',
      docType: 'Drawing',
      title: '',
      author: 'Arjun Mehta',
      plannedIFA: new Date(Date.now() + 86400000 * 21).toISOString().slice(0, 10),
    });
  };

  const handleWorkflowApprove = (comments: string, code?: ClientApprovalCode) => {
    if (!inspectDoc) return;
    const nextStages = [...inspectDoc.workflowStages];
    const currIdx = inspectDoc.currentStageIndex;

    nextStages[currIdx] = {
      ...nextStages[currIdx],
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: 'Current Reviewer',
      comments,
      approvalCode: code,
    };

    const nextIdx = currIdx + 1;
    let nextStatus = inspectDoc.status;

    if (nextIdx < nextStages.length) {
      nextStages[nextIdx] = {
        ...nextStages[nextIdx],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      };
      if (nextStages[nextIdx].name === 'Client Review') nextStatus = 'Client Review';
      if (nextStages[nextIdx].name === 'IFC Release') nextStatus = 'Approved';
    } else {
      nextStatus = 'IFC';
    }

    const updated = {
      ...inspectDoc,
      workflowStages: nextStages,
      currentStageIndex: Math.min(nextIdx, nextStages.length - 1),
      status: nextStatus,
    };

    setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
    setInspectDoc(updated);
  };

  const handleWorkflowReturn = (comments: string) => {
    if (!inspectDoc) return;
    const nextStages = inspectDoc.workflowStages.map((s, i) => {
      if (i === 0) return { ...s, status: 'in_progress' as const, comments: `Returned: ${comments}` };
      return { ...s, status: 'pending' as const };
    });

    const updated = {
      ...inspectDoc,
      workflowStages: nextStages,
      currentStageIndex: 0,
      status: 'Draft' as const,
    };

    setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
    setInspectDoc(updated);
  };

  const handleWorkflowReject = (comments: string) => {
    if (!inspectDoc) return;
    const nextStages = [...inspectDoc.workflowStages];
    nextStages[inspectDoc.currentStageIndex] = {
      ...nextStages[inspectDoc.currentStageIndex],
      status: 'rejected',
      comments,
    };

    const updated = {
      ...inspectDoc,
      workflowStages: nextStages,
      status: 'Draft' as const,
    };

    setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
    setInspectDoc(updated);
  };

  const handleCreateRevision = () => {
    if (!inspectDoc) return;
    const nextRev = formatRevisionForRelease(inspectDoc.currentRev, inspectDoc.releaseType);
    const newRevEntry: DocumentRevision = {
      revision: nextRev,
      stage: 'Design Creation',
      releaseType: inspectDoc.releaseType,
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: inspectDoc.author,
      description: newRevDesc || 'Revision created for incorporation of review comments',
    };

    const stages = DEFAULT_STAGES(inspectDoc.author).map((s, idx) => ({
      ...s,
      status: idx === 0 ? ('in_progress' as const) : ('pending' as const),
      completedAt: undefined,
    }));

    const updated = {
      ...inspectDoc,
      currentRev: nextRev,
      workflowStages: stages,
      currentStageIndex: 0,
      status: 'Draft' as const,
      revisions: [newRevEntry, ...inspectDoc.revisions],
    };

    setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
    setInspectDoc(updated);
    setNewRevisionModal(false);
    setNewRevDesc('');
  };

  const handlePrintCoversheet = (doc: FullEngDoc) => {
    const currentStageName = doc.workflowStages[doc.currentStageIndex]?.name || 'Completed';
    printDocumentCoversheet({
      docNo: doc.docNo,
      title: doc.title,
      revision: doc.currentRev,
      discipline: doc.discipline,
      docType: doc.docType,
      project: doc.project,
      status: doc.status,
      author: doc.author,
      stage: currentStageName,
      date: new Date().toLocaleDateString(),
    });
  };

  const kanbanColumns = [
    { title: 'Design Creation', stageIndex: 0 },
    { title: 'Internal Review', stageIndex: 1 },
    { title: 'Client Review', stageIndex: 2 },
    { title: 'IFC Release', stageIndex: 3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Document Control (EDMS)"
        subtitle="Deliverables register, multi-stage review workflows, revision management & coversheet QR validation"
        actions={
          canCreate ? (
            <button
              onClick={() => setNewDocModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Deliverable
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'register'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Document Register ({docs.length})
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'kanban'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Workflow Board (Kanban)
        </button>
      </div>

      {activeTab === 'register' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by doc no, title, drawing..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">All Projects</option>
                <option value="Rajkot-Jetpur 220kV Line">Rajkot-Jetpur 220kV Line</option>
                <option value="Surat-Bardoli 132kV Cable">Surat-Bardoli 132kV Cable</option>
              </select>
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">All Disciplines</option>
                {Object.keys(DISCIPLINE_CODES).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Client Review">Client Review</option>
                <option value="Approved">Approved</option>
                <option value="IFC">IFC</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Doc No.</th>
                  <th className="py-3 px-4">Rev</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Workflow Stage</th>
                  <th className="py-3 px-4">Planned IFA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const currStage = doc.workflowStages[doc.currentStageIndex];
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {doc.docNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {doc.currentRev}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-sm truncate" title={doc.title}>
                        {doc.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc.discipline}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          {currStage?.name || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc.plannedIFA}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          doc.status === 'IFC' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'Client Review' ? 'bg-blue-100 text-blue-800' :
                          doc.status === 'Approved' ? 'bg-teal-100 text-teal-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setInspectDoc(doc)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
                            title="Inspect Workflow & Revisions"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrintCoversheet(doc)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            title="Print Coversheet with QR"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {canRemove && (
                            <button
                              onClick={() => setDeleteDoc(doc)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colDocs = docs.filter(d => d.currentStageIndex === col.stageIndex);
            return (
              <div key={col.title} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 min-h-[500px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">{col.title}</h4>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {colDocs.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setInspectDoc(doc)}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-600">{doc.docNo}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          Rev {doc.currentRev}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-slate-800 line-clamp-2">{doc.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                        <span>{doc.discipline}</span>
                        <span>Due: {doc.plannedIFA}</span>
                      </div>
                    </div>
                  ))}
                  {colDocs.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No documents in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspector / Workflow Modal */}
      <Modal
        open={!!inspectDoc}
        onClose={() => setInspectDoc(null)}
        title={inspectDoc ? `${inspectDoc.docNo} (Rev ${inspectDoc.currentRev}) — Workflow & Review` : 'Document Details'}
      >
        {inspectDoc && (
          <div className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Top Summary Banner */}
            <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600">{inspectDoc.project}</span>
                <h3 className="text-sm font-bold text-slate-900">{inspectDoc.title}</h3>
                <p className="text-slate-500">
                  {inspectDoc.discipline} · {inspectDoc.docType} · Prepared by: <strong>{inspectDoc.author}</strong>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <QRCodeBadge
                  docNo={inspectDoc.docNo}
                  revision={inspectDoc.currentRev}
                  status={inspectDoc.status}
                  project={inspectDoc.project}
                  size={52}
                />
                <button
                  type="button"
                  onClick={() => handlePrintCoversheet(inspectDoc)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Coversheet
                </button>
              </div>
            </div>

            {/* Stepper */}
            <div>
              <p className="font-bold text-slate-800 text-xs mb-1">Review & Approval Stages</p>
              <WorkflowTimeline
                stages={inspectDoc.workflowStages}
                currentStageIndex={inspectDoc.currentStageIndex}
              />
            </div>

            {/* Stage Action Panel */}
            <WorkflowStagePanel
              currentStage={inspectDoc.workflowStages[inspectDoc.currentStageIndex]}
              onApprove={handleWorkflowApprove}
              onReturn={handleWorkflowReturn}
              onReject={handleWorkflowReject}
              canAction={canUpdate}
            />

            {/* Revisions Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  Revision History ({inspectDoc.revisions.length})
                </p>
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => setNewRevisionModal(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + New Revision
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Revision</th>
                      <th className="py-2 px-3">Stage</th>
                      <th className="py-2 px-3">Release Type</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Issued By</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectDoc.revisions.map((rev) => (
                      <tr key={rev.revision} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600">{rev.revision}</td>
                        <td className="py-2 px-3 text-slate-600">{rev.stage}</td>
                        <td className="py-2 px-3 capitalize">{rev.releaseType}</td>
                        <td className="py-2 px-3 text-slate-500">{rev.issuedDate}</td>
                        <td className="py-2 px-3 text-slate-600">{rev.issuedBy}</td>
                        <td className="py-2 px-3 text-slate-700">{rev.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attachments */}
            <FileAttachment
              attachments={inspectDoc.attachments}
              onAdd={(att) => {
                const updated = { ...inspectDoc, attachments: [...inspectDoc.attachments, att] };
                setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
                setInspectDoc(updated);
              }}
              onRemove={(attId) => {
                const updated = { ...inspectDoc, attachments: inspectDoc.attachments.filter(a => a.id !== attId) };
                setDocs(prev => prev.map(d => d.id === inspectDoc.id ? updated : d));
                setInspectDoc(updated);
              }}
              readOnly={!canUpdate}
            />
          </div>
        )}
      </Modal>

      {/* New Document Modal */}
      <Modal
        open={newDocModal}
        onClose={() => setNewDocModal(false)}
        title="Register New Deliverable (Auto-Numbering)"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                value={newForm.project}
                onChange={(e) => setNewForm(f => ({ ...f, project: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Rajkot-Jetpur 220kV Line">Rajkot-Jetpur 220kV Line</option>
                <option value="Surat-Bardoli 132kV Cable">Surat-Bardoli 132kV Cable</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discipline</label>
              <select
                value={newForm.discipline}
                onChange={(e) => setNewForm(f => ({ ...f, discipline: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                {Object.keys(DISCIPLINE_CODES).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
              <select
                value={newForm.docType}
                onChange={(e) => setNewForm(f => ({ ...f, docType: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                {Object.keys(DOC_TYPE_CODES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Planned Target IFA Date</label>
              <input
                type="date"
                value={newForm.plannedIFA}
                onChange={(e) => setNewForm(f => ({ ...f, plannedIFA: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deliverable Title</label>
            <input
              type="text"
              placeholder="e.g. Foundation Design Calculation Report for Angle Tower"
              value={newForm.title}
              onChange={(e) => setNewForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Design Engineer</label>
            <input
              type="text"
              value={newForm.author}
              onChange={(e) => setNewForm(f => ({ ...f, author: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <p className="text-slate-600 text-[11px]">
              Document Number will be auto-generated according to project prefix and discipline schema (e.g. <code>RJ22-ELE-DWG-005</code>).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewDocModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateDocument}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Create Deliverable
            </button>
          </div>
        </div>
      </Modal>

      {/* New Revision Modal */}
      <Modal
        open={newRevisionModal}
        onClose={() => setNewRevisionModal(false)}
        title="Increment Document Revision"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Incrementing revision for <strong>{inspectDoc?.docNo}</strong> from{' '}
            <strong className="text-indigo-600">Rev {inspectDoc?.currentRev}</strong>.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Revision Description / Change Log</label>
            <textarea
              rows={3}
              placeholder="Detail design changes made in response to review comments..."
              value={newRevDesc}
              onChange={(e) => setNewRevDesc(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewRevisionModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateRevision}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Confirm Revision
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteDoc}
        recordName={deleteDoc?.docNo || ''}
        recordType="Engineering Deliverable"
        onConfirm={() => {
          if (deleteDoc) {
            setDocs(prev => prev.filter(d => d.id !== deleteDoc.id));
            setDeleteDoc(null);
          }
        }}
        onCancel={() => setDeleteDoc(null)}
      />
    </div>
  );
}