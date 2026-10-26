import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Pencil, Trash2, Plus, AlertTriangle, ShieldCheck, Flame, CheckCircle, Clock, HeartPulse } from 'lucide-react';

type IncidentCategory = 'Incident' | 'Near-Miss';
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type IncidentStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED';

interface SafetyRecord {
  id: string;
  category: IncidentCategory;
  title: string;
  project: string;
  date: string;
  severity: Severity;
  status: IncidentStatus;
  reportedBy: string;
  responsibleAgency: string;
  rootCause: string;
  capaAction: string;
  daysLost: number;
}

const initialRecords: SafetyRecord[] = [];

const severityVariant: Record<Severity, string> = {
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
  HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
  MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
};

import { usePersistentState } from '../../hooks/usePersistentState';

export default function IncidentList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.12');
  const [records, setRecords] = usePersistentState<SafetyRecord[]>('epc_safety_incidents', initialRecords);
  const [activeTab, setActiveTab] = useState<IncidentCategory>('Incident');
  const [newModal, setNewModal] = useState(false);
  const [editRow, setEditRow] = useState<SafetyRecord | null>(null);
  const [deleteRow, setDeleteRow] = useState<SafetyRecord | null>(null);

  const [form, setForm] = useState({
    title: '',
    project: 'Rajkot-Jetpur 220kV Line',
    category: 'Incident' as IncidentCategory,
    severity: 'MEDIUM' as Severity,
    reportedBy: 'Suresh Patil',
    responsibleAgency: 'Contractor Gang',
    rootCause: '',
    capaAction: '',
    daysLost: 0,
  });

  const totalManHours = 1480000;
  const lostTimeIncidents = records.filter(r => r.category === 'Incident' && r.daysLost > 0).length;
  const totalRecordable = records.filter(r => r.category === 'Incident').length;

  const trir = ((totalRecordable * 200000) / totalManHours).toFixed(2);
  const ltir = ((lostTimeIncidents * 200000) / totalManHours).toFixed(2);

  const filteredRecords = records.filter(r => r.category === activeTab);

  const handleCreate = () => {
    const nextSeq = records.length + 1;
    const prefix = form.category === 'Near-Miss' ? 'NM-2026' : 'INC-2026';
    const newRecord: SafetyRecord = {
      id: `${prefix}-${String(nextSeq).padStart(3, '0')}`,
      category: form.category,
      title: form.title,
      project: form.project,
      date: new Date().toISOString().slice(0, 10),
      severity: form.severity,
      status: 'OPEN',
      reportedBy: form.reportedBy,
      responsibleAgency: form.responsibleAgency,
      rootCause: form.rootCause,
      capaAction: form.capaAction,
      daysLost: Number(form.daysLost),
    };
    setRecords(prev => [newRecord, ...prev]);
    setNewModal(false);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setRecords(prev => prev.map(r => r.id === editRow.id ? editRow : r));
    setEditRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HSE Incident & Near-Miss Management"
        subtitle="Zero-Harm safety monitoring, TRIR / LTIR rates, near-miss reporting and root-cause CAPA"
        actions={
          canCreate ? (
            <button
              onClick={() => {
                setForm(f => ({ ...f, category: activeTab }));
                setNewModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Report {activeTab}
            </button>
          ) : undefined
        }
      />

      {/* Safety KPIs Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Safe Hours Worked</p>
            <p className="text-xl font-bold text-slate-800">1,480,000</p>
            <p className="text-[10px] text-emerald-600 font-semibold">184 Days LTI-Free</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">TRIR (Recordable Rate)</p>
            <p className="text-xl font-bold text-slate-800">{trir}</p>
            <p className="text-[10px] text-slate-400">Target: &lt; 0.50</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">LTIR (Lost Time Rate)</p>
            <p className="text-xl font-bold text-emerald-600">{ltir}</p>
            <p className="text-[10px] text-slate-400">Only 1 LTI event YTD</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Near-Misses Logged</p>
            <p className="text-xl font-bold text-slate-800">
              {records.filter(r => r.category === 'Near-Miss').length}
            </p>
            <p className="text-[10px] text-blue-600 font-semibold">Proactive Hazard Mitigation</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('Incident')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'Incident'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Incidents Register ({records.filter(r => r.category === 'Incident').length})
        </button>
        <button
          onClick={() => setActiveTab('Near-Miss')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'Near-Miss'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Near-Miss Observation Register ({records.filter(r => r.category === 'Near-Miss').length})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredRecords.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-xl border p-4 shadow-sm border-l-4 ${
              r.severity === 'CRITICAL' ? 'border-l-rose-500' :
              r.severity === 'HIGH' ? 'border-l-amber-500' : 'border-l-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityVariant[r.severity]}`}>
                    {r.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    r.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                  {r.daysLost > 0 && (
                    <span className="text-rose-600 font-bold text-[10px]">
                      ⚠ {r.daysLost} Days Lost
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900">{r.title}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700 block">Root Cause Analysis:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{r.rootCause}</p>
                  </div>
                  <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                    <span className="font-semibold text-emerald-800 block">Corrective & Preventive Action (CAPA):</span>
                    <p className="text-emerald-700 text-[11px] mt-0.5">{r.capaAction}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-2">
                  <span>📍 {r.project}</span>
                  <span>📅 Reported on {r.date}</span>
                  <span>👤 By {r.reportedBy}</span>
                  <span>🏢 Agency: {r.responsibleAgency}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-3">
                {canUpdate && (
                  <button
                    onClick={() => setEditRow(r)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                    title="Edit record"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {canRemove && (
                  <button
                    onClick={() => setDeleteRow(r)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No {activeTab.toLowerCase()} records logged.
          </div>
        )}
      </div>

      {/* New Record Modal */}
      <Modal
        open={newModal}
        onClose={() => setNewModal(false)}
        title={`Report Safety ${form.category}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title / Event Summary</label>
            <input
              type="text"
              placeholder="Concise description of the unsafe act, condition or incident"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classification</label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value as IncidentCategory }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Incident">Incident (Injury / Property Damage)</option>
                <option value="Near-Miss">Near-Miss (Hazard Observation)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Rating</label>
              <select
                value={form.severity}
                onChange={(e) => setForm(f => ({ ...f, severity: e.target.value as Severity }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical (High Potential)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                value={form.project}
                onChange={(e) => setForm(f => ({ ...f, project: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Rajkot-Jetpur 220kV Line">Rajkot-Jetpur 220kV Line</option>
                <option value="Surat-Bardoli 132kV Cable">Surat-Bardoli 132kV Cable</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Responsible Gang / Agency</label>
              <input
                type="text"
                value={form.responsibleAgency}
                onChange={(e) => setForm(f => ({ ...f, responsibleAgency: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Root Cause Analysis</label>
            <textarea
              rows={2}
              placeholder="Identify why the incident or near-miss occurred (equipment, training, behavior)..."
              value={form.rootCause}
              onChange={(e) => setForm(f => ({ ...f, rootCause: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corrective & Preventive Action (CAPA)</label>
            <textarea
              rows={2}
              placeholder="Immediate action taken and steps to prevent recurrence..."
              value={form.capaAction}
              onChange={(e) => setForm(f => ({ ...f, capaAction: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setNewModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editRow}
        onClose={() => setEditRow(null)}
        title={`Update Safety Record — ${editRow?.id}`}
      >
        {editRow && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={editRow.status}
                onChange={(e) => setEditRow({ ...editRow, status: e.target.value as IncidentStatus })}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="OPEN">Open</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="CLOSED">Closed (CAPA Verified)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CAPA Action Taken</label>
              <textarea
                rows={3}
                value={editRow.capaAction}
                onChange={(e) => setEditRow({ ...editRow, capaAction: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditRow(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Save Updates
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.title || ''}
        recordType="Safety Record"
        onConfirm={() => {
          if (deleteRow) {
            setRecords(prev => prev.filter(r => r.id !== deleteRow.id));
            setDeleteRow(null);
          }
        }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}
