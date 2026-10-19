import React, { useState, useMemo } from 'react';
import {
  Plus, Search, BarChart2, CheckCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Pencil, Trash2, Calendar
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import SCurve from '../../components/charts/SCurve';
import { Deliverable, DeliverableMilestone, SCurveDataPoint } from '../../types/deliverable';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_DELIVERABLES: Deliverable[] = [];

// S-Curve data
const ENG_SCURVE: SCurveDataPoint[] = [
  { period: "Aug'26", planned: 5,  actual: 3,  forecast: 3 },
  { period: "Sep'26", planned: 25, actual: 20, forecast: 22 },
  { period: "Oct'26", planned: 55, actual: 42, forecast: 47 },
  { period: "Nov'26", planned: 78, actual: 0,  forecast: 68 },
  { period: "Dec'26", planned: 92, actual: 0,  forecast: 88 },
  { period: "Jan'27", planned: 100, actual: 0, forecast: 100 },
];

const PRO_SCURVE: SCurveDataPoint[] = [
  { period: "Sep'26", planned: 10, actual: 8,  forecast: 8 },
  { period: "Oct'26", planned: 30, actual: 20, forecast: 22 },
  { period: "Nov'26", planned: 65, actual: 0,  forecast: 58 },
  { period: "Dec'26", planned: 85, actual: 0,  forecast: 80 },
  { period: "Jan'27", planned: 100, actual: 0, forecast: 100 },
];

const CON_SCURVE: SCurveDataPoint[] = [
  { period: "Oct'26", planned: 5,  actual: 3,  forecast: 3 },
  { period: "Nov'26", planned: 20, actual: 0,  forecast: 15 },
  { period: "Dec'26", planned: 40, actual: 0,  forecast: 35 },
  { period: "Jan'27", planned: 65, actual: 0,  forecast: 58 },
  { period: "Feb'27", planned: 85, actual: 0,  forecast: 80 },
  { period: "Mar'27", planned: 100, actual: 0, forecast: 100 },
];

function computeProgress(milestones: DeliverableMilestone[]) {
  if (milestones.length === 0) return 0;
  const completedWeight = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.weight, 0);
  return Math.round(completedWeight);
}

function statusBadge(status: Deliverable['status']) {
  const map: Record<string, string> = {
    not_started: 'bg-slate-100 text-slate-600',
    in_progress:  'bg-blue-100 text-blue-700',
    completed:    'bg-green-100 text-green-700',
    on_hold:      'bg-amber-100 text-amber-700',
    overdue:      'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    not_started: 'Not Started', in_progress: 'In Progress',
    completed: 'Completed', on_hold: 'On Hold', overdue: 'Overdue',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
}

function progressColor(actual: number, planned: number) {
  if (actual >= planned) return 'bg-green-500';
  if (actual >= planned * 0.9) return 'bg-amber-500';
  return 'bg-red-500';
}

type TabId = 'Engineering' | 'Procurement' | 'Construction' | 'S-Curve';

import { usePersistentState } from '../../hooks/usePersistentState';

const DeliverableList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.24');
  const [deliverables, setDeliverables] = usePersistentState<Deliverable[]>('epc_deliverables', MOCK_DELIVERABLES);
  const [activeTab, setActiveTab] = useState<TabId>('Engineering');
  const [search, setSearch] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [deleteRow, setDeleteRow] = useState<Deliverable | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [editRow, setEditRow] = useState<Deliverable | null>(null);

  // Form for New / Edit Deliverable
  const initialForm = {
    code: '',
    title: '',
    discipline: 'Electrical',
    docType: 'Drawing',
    assignedTo: '',
    wbsCode: 'W-ELE-01',
    weight: 5,
    status: 'not_started' as Deliverable['status'],
    plannedProgress: 0,
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Add Milestone Modal State
  const [addMilestoneDelId, setAddMilestoneDelId] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    shortCode: 'IFR',
    weight: 25,
    plannedDate: new Date().toISOString().slice(0, 10),
  });

  const filtered = useMemo(() => {
    return deliverables.filter(d => {
      if (activeTab !== 'S-Curve' && d.category !== activeTab) return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterDiscipline && d.discipline !== filterDiscipline) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      return true;
    });
  }, [deliverables, activeTab, search, filterDiscipline, filterStatus]);

  const disciplines = [...new Set(deliverables.map(d => d.discipline))];

  const stats = {
    total: deliverables.length,
    completed: deliverables.filter(d => d.status === 'completed').length,
    inProgress: deliverables.filter(d => d.status === 'in_progress').length,
    overdue: deliverables.filter(d => {
      const hasOverdueMilestone = d.milestones.some(
        m => !m.actualDate && m.plannedDate < new Date().toISOString().slice(0, 10) && m.status !== 'completed'
      );
      return hasOverdueMilestone && d.status !== 'completed';
    }).length,
  };

  const handleOpenCreate = () => {
    setEditRow(null);
    setForm(initialForm);
    setNewModal(true);
  };

  const handleOpenEdit = (d: Deliverable) => {
    setEditRow(d);
    setForm({
      code: d.code,
      title: d.title,
      discipline: d.discipline,
      docType: d.docType,
      assignedTo: d.assignedTo,
      wbsCode: d.wbsCode,
      weight: d.weight,
      status: d.status,
      plannedProgress: d.plannedProgress,
      notes: d.notes,
    });
  };

  const handleSaveDeliverable = () => {
    if (editRow) {
      setDeliverables(prev => prev.map(d => d.id === editRow.id ? {
        ...d,
        code: form.code,
        title: form.title,
        discipline: form.discipline,
        docType: form.docType,
        assignedTo: form.assignedTo,
        wbsCode: form.wbsCode,
        weight: form.weight,
        status: form.status,
        plannedProgress: form.plannedProgress,
        notes: form.notes,
      } : d));
      setEditRow(null);
    } else {
      const count = deliverables.filter(d => d.category === activeTab).length + 1;
      const newDel: Deliverable = {
        id: `del-${Date.now()}`,
        code: form.code || `${activeTab.slice(0, 3).toUpperCase()}-NEW-${String(count).padStart(3, '0')}`,
        title: form.title,
        category: activeTab === 'S-Curve' ? 'Engineering' : activeTab,
        discipline: form.discipline,
        docType: form.docType,
        wbsCode: form.wbsCode,
        assignedTo: form.assignedTo,
        plannedHours: 0,
        actualHours: 0,
        weight: form.weight,
        status: form.status,
        project: 'Rajkot-Jetpur 220kV Line',
        notes: form.notes,
        plannedProgress: form.plannedProgress,
        actualProgress: 0,
        forecastProgress: 0,
        milestones: [
          { id: `ms-1`, name: 'Issue for Review', shortCode: 'IFR', plannedDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), weight: 30, status: 'not_started' },
          { id: `ms-2`, name: 'Issue for Approval', shortCode: 'IFA', plannedDate: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10), weight: 40, status: 'not_started' },
          { id: `ms-3`, name: 'Issue for Construction', shortCode: 'IFC', plannedDate: new Date(Date.now() + 42 * 86400000).toISOString().slice(0, 10), weight: 30, status: 'not_started' },
        ],
      };
      setDeliverables(prev => [newDel, ...prev]);
      setNewModal(false);
    }
  };

  const handleUpdateMilestone = (delId: string, msId: string, actualDate: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id !== delId) return d;
      const updatedMs = d.milestones.map(m =>
        m.id === msId ? { ...m, actualDate, status: 'completed' as const } : m
      );
      const newActual = computeProgress(updatedMs);
      const newStatus = newActual === 100 ? 'completed' : newActual > 0 ? 'in_progress' : d.status;
      return {
        ...d,
        milestones: updatedMs,
        actualProgress: newActual,
        status: newStatus,
      };
    }));
  };

  const handleAddMilestone = () => {
    if (!addMilestoneDelId) return;
    setDeliverables(prev => prev.map(d => {
      if (d.id !== addMilestoneDelId) return d;
      const newMs: DeliverableMilestone = {
        id: `ms-${Date.now()}`,
        name: milestoneForm.name.trim(),
        shortCode: milestoneForm.shortCode.trim().toUpperCase(),
        weight: Number(milestoneForm.weight) || 20,
        plannedDate: milestoneForm.plannedDate,
        status: 'not_started',
      };
      const updatedMs = [...d.milestones, newMs];
      return {
        ...d,
        milestones: updatedMs,
        actualProgress: computeProgress(updatedMs),
      };
    }));
    setAddMilestoneDelId(null);
    setMilestoneForm({
      name: '',
      shortCode: 'IFR',
      weight: 25,
      plannedDate: new Date().toISOString().slice(0, 10),
    });
  };

  const handleDeleteMilestone = (delId: string, msId: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id !== delId) return d;
      const updatedMs = d.milestones.filter(m => m.id !== msId);
      return {
        ...d,
        milestones: updatedMs,
        actualProgress: computeProgress(updatedMs),
      };
    }));
  };

  const tabs: TabId[] = ['Engineering', 'Procurement', 'Construction', 'S-Curve'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverable Schedule"
        subtitle="Engineering · Procurement · Construction — Planned vs Actual vs Forecast"
        actions={
          activeTab !== 'S-Curve' && canCreate ? (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Deliverable
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: BarChart2, color: 'text-indigo-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600' },
          { label: 'Overdue Milestones', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-4 pt-3">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'S-Curve' ? '📈 S-Curve' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'S-Curve' ? (
          <div className="p-6 space-y-4">
            <SCurve data={ENG_SCURVE} title="Engineering Progress" category="Engineering" todayLabel="Oct'26" />
            <SCurve data={PRO_SCURVE} title="Procurement Progress" category="Procurement" todayLabel="Oct'26" />
            <SCurve data={CON_SCURVE} title="Construction Progress" category="Construction" todayLabel="Oct'26" />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-3 p-4 border-b border-slate-100 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deliverables by code / title..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={filterDiscipline}
                onChange={e => setFilterDiscipline(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Disciplines</option>
                {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                {['not_started', 'in_progress', 'completed', 'on_hold', 'overdue'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discipline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress (Plan / Actual)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">No deliverables found</td>
                    </tr>
                  )}
                  {filtered.map(d => {
                    const actual = computeProgress(d.milestones) || d.actualProgress;
                    const planned = d.plannedProgress;
                    const isExpanded = expandedId === d.id;
                    return (
                      <React.Fragment key={d.id}>
                        <tr
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : d.id)}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold whitespace-nowrap">{d.code}</td>
                          <td className="px-4 py-3 font-medium text-slate-700 max-w-[220px] truncate" title={d.title}>{d.title}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{d.discipline}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{d.assignedTo}</td>
                          <td className="px-4 py-3 min-w-[170px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div className="bg-blue-300 h-1.5 rounded-full" style={{ width: `${planned}%` }} />
                              </div>
                              <span className="text-[11px] text-slate-400 w-8">{planned}%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${progressColor(actual, planned)}`} style={{ width: `${actual}%` }} />
                              </div>
                              <span className="text-[11px] font-semibold text-slate-700 w-8">{actual}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{statusBadge(d.status)}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{d.weight}%</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              {canUpdate && (
                                <button
                                  onClick={() => handleOpenEdit(d)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                                  title="Edit deliverable"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              {canRemove && (
                                <button
                                  onClick={() => setDeleteRow(d)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                  title="Delete deliverable"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : d.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                                title={isExpanded ? 'Collapse milestones' : 'Expand milestones'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-200">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Milestone Tracker ({d.milestones.length})
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    Weighted milestone completion contributes directly to actual progress
                                  </p>
                                </div>
                                {canUpdate && (
                                  <button
                                    onClick={() => {
                                      setAddMilestoneDelId(d.id);
                                      setMilestoneForm({
                                        name: '',
                                        shortCode: 'IFA',
                                        weight: 25,
                                        plannedDate: new Date().toISOString().slice(0, 10),
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                                  </button>
                                )}
                              </div>

                              {d.milestones.length === 0 ? (
                                <div className="py-6 text-center bg-white border border-dashed border-slate-200 rounded-lg">
                                  <p className="text-xs text-slate-500 mb-2">No milestones defined for this deliverable.</p>
                                  {canUpdate && (
                                    <button
                                      onClick={() => {
                                        setAddMilestoneDelId(d.id);
                                        setMilestoneForm({
                                          name: 'Issue for Approval',
                                          shortCode: 'IFA',
                                          weight: 40,
                                          plannedDate: new Date().toISOString().slice(0, 10),
                                        });
                                      }}
                                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                      + Click here to add the first milestone
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {d.milestones.map(m => {
                                    const isOverdue = !m.actualDate && m.plannedDate < new Date().toISOString().slice(0, 10);
                                    return (
                                      <div
                                        key={m.id}
                                        className={`rounded-lg border p-3 shadow-sm ${
                                          m.status === 'completed'
                                            ? 'bg-green-50 border-green-200'
                                            : isOverdue
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-bold text-slate-700 font-mono">{m.shortCode}</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                              {m.weight}% weight
                                            </span>
                                            {canUpdate && (
                                              <button
                                                onClick={() => handleDeleteMilestone(d.id, m.id)}
                                                className="p-0.5 text-slate-300 hover:text-red-600 rounded"
                                                title="Delete milestone"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-xs text-slate-800 font-medium mb-2">{m.name}</p>
                                        <div className="space-y-1 text-[11px]">
                                          <div className="flex justify-between text-slate-500">
                                            <span>Planned:</span>
                                            <span className="font-medium text-slate-700">{m.plannedDate}</span>
                                          </div>
                                          {m.actualDate ? (
                                            <div className="flex justify-between text-green-700">
                                              <span>Actual:</span>
                                              <span className="font-semibold">{m.actualDate} ✓</span>
                                            </div>
                                          ) : (
                                            canUpdate && (
                                              <div className="mt-2 pt-2 border-t border-slate-100">
                                                <input
                                                  type="date"
                                                  className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                                                  placeholder="Set actual date"
                                                  onChange={e => {
                                                    if (e.target.value) handleUpdateMilestone(d.id, m.id, e.target.value);
                                                  }}
                                                />
                                                <p className="text-[10px] text-slate-400 mt-0.5">Pick date to mark completed</p>
                                              </div>
                                            )
                                          )}
                                          {m.forecastDate && !m.actualDate && (
                                            <div className="flex justify-between text-amber-600">
                                              <span>Forecast:</span>
                                              <span className="font-medium">{m.forecastDate}</span>
                                            </div>
                                          )}
                                        </div>
                                        {isOverdue && !m.actualDate && (
                                          <div className="mt-2 flex items-center gap-1 text-red-600 text-[10px] font-semibold">
                                            <AlertTriangle className="w-3 h-3" /> OVERDUE
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {d.notes && (
                                <p className="text-xs text-slate-500 mt-3 italic bg-white p-2 rounded border border-slate-100">
                                  <strong>Note:</strong> {d.notes}
                                </p>
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
          </>
        )}
      </div>

      {/* New / Edit Deliverable Modal */}
      <Modal
        open={newModal || !!editRow}
        onClose={() => { setNewModal(false); setEditRow(null); }}
        title={editRow ? `Edit Deliverable — ${editRow.code}` : 'New Deliverable'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Deliverable Code *</label>
              <input
                type="text"
                placeholder="ENG-ELE-003"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Discipline</label>
              <select
                value={form.discipline}
                onChange={e => setForm(p => ({ ...p, discipline: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {['Electrical', 'Civil', 'Structural', 'Mechanical', 'Instrumentation'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                placeholder="Drawing title / deliverable name"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Doc Type</label>
              <select
                value={form.docType}
                onChange={e => setForm(p => ({ ...p, docType: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {['Drawing', 'Calculation', 'Specification', 'Report', 'Procurement', 'Activity'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Engineer</label>
              <input
                type="text"
                placeholder="e.g. Arjun Mehta"
                value={form.assignedTo}
                onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">WBS Code</label>
              <input
                type="text"
                placeholder="W-ELE-01"
                value={form.wbsCode}
                onChange={e => setForm(p => ({ ...p, wbsCode: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Weight (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={e => setForm(p => ({ ...p, weight: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {editRow && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Deliverable['status'] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {['not_started', 'in_progress', 'completed', 'on_hold', 'overdue'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Planned Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.plannedProgress}
                    onChange={e => setForm(p => ({ ...p, plannedProgress: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setNewModal(false); setEditRow(null); }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDeliverable}
              disabled={!form.title.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {editRow ? 'Save Changes' : 'Create Deliverable'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal
        open={!!addMilestoneDelId}
        onClose={() => setAddMilestoneDelId(null)}
        title="Add Milestone"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Milestone Name *</label>
            <input
              type="text"
              placeholder="e.g. Issue for Approval / Factory Acceptance Test"
              value={milestoneForm.name}
              onChange={e => setMilestoneForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code (IFR/IFA/IFC)</label>
              <input
                type="text"
                placeholder="IFA"
                value={milestoneForm.shortCode}
                onChange={e => setMilestoneForm(p => ({ ...p, shortCode: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Weight (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={milestoneForm.weight}
                onChange={e => setMilestoneForm(p => ({ ...p, weight: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Planned Date</label>
              <input
                type="date"
                value={milestoneForm.plannedDate}
                onChange={e => setMilestoneForm(p => ({ ...p, plannedDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAddMilestoneDelId(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMilestone}
              disabled={!milestoneForm.name.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              Add Milestone
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.title ?? ''}
        recordType="Deliverable"
        onConfirm={() => {
          setDeliverables(prev => prev.filter(d => d.id !== deleteRow?.id));
          setDeleteRow(null);
        }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default DeliverableList;
