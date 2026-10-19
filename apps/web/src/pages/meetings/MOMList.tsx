import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Clock, MapPin, Users, CheckSquare, Eye, Pencil, Trash2 } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Meeting, MeetingType, MeetingStatus } from '../../types/meeting';

const MOCK_MEETINGS: Meeting[] = [];

const typeColors: Record<MeetingType, string> = {
  'Kick-off':        'bg-purple-100 text-purple-700',
  'Technical Review':'bg-indigo-100 text-indigo-700',
  'Client Review':   'bg-orange-100 text-orange-700',
  'Safety':          'bg-red-100 text-red-700',
  'Progress Review': 'bg-teal-100 text-teal-700',
  'Site Coordination':'bg-amber-100 text-amber-700',
  'Other':           'bg-slate-100 text-slate-600',
};
const statusColors: Record<MeetingStatus, string> = {
  scheduled:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-slate-100 text-slate-500',
};
const statusLabels: Record<MeetingStatus, string> = {
  scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Published', cancelled: 'Cancelled',
};

const EMPTY_FORM = {
  title: '', type: 'Progress Review' as MeetingType, project: 'Rajkot-Jetpur 220kV Line',
  date: new Date().toISOString().slice(0, 10), time: '10:00', venue: '', chairperson: '', recorder: '',
};

import { usePersistentState } from '../../hooks/usePersistentState';

const MOMList: React.FC = () => {
  const { canCreate, canUpdate, canRemove } = usePermission('4.22');
  const navigate = useNavigate();
  const [meetings, setMeetings] = usePersistentState<Meeting[]>('epc_meetings', MOCK_MEETINGS);
  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [newModal, setNewModal] = useState(false);
  const [editRow, setEditRow] = useState<Meeting | null>(null);
  const [deleteRow, setDeleteRow] = useState<Meeting | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => meetings.filter(m => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.meetingNo.includes(search)) return false;
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    if (filterProject && m.project !== filterProject) return false;
    return true;
  }), [meetings, search, filterType, filterStatus, filterProject]);

  const today = new Date().toISOString().slice(0, 10);
  const openActionItems = meetings.flatMap(m => m.agenda.flatMap(a => a.actionItems)).filter(ai => ai.status !== 'closed');
  const overdueActions = openActionItems.filter(ai => ai.dueDate < today).length;

  const handleCreate = () => {
    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      meetingNo: `MOM-2026-${String(meetings.length + 1).padStart(3, '0')}`,
      ...form,
      status: 'scheduled',
      participants: [],
      agenda: [],
      attachments: [],
      notes: '',
    };
    setMeetings(prev => [...prev, newMeeting]);
    setNewModal(false);
    setForm(EMPTY_FORM);
  };

  const projects = useMemo(() => {
    const list = storedProjects.map((p: any) => p.name || p.projectName || p.id).filter(Boolean);
    return Array.from(new Set([...list, ...meetings.map(m => m.project)].filter(Boolean)));
  }, [storedProjects, meetings]);
  const meetingTypes: MeetingType[] = ['Kick-off', 'Technical Review', 'Client Review', 'Safety', 'Progress Review', 'Site Coordination', 'Other'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minutes of Meeting"
        subtitle={`${meetings.length} meetings · ${openActionItems.length} open action items${overdueActions > 0 ? ` · ⚠ ${overdueActions} overdue` : ''}`}
        actions={canCreate ? (
          <button onClick={() => setNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> New Meeting
          </button>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Meetings', value: meetings.length, color: 'text-slate-700' },
          { label: 'Published', value: meetings.filter(m => m.status === 'completed').length, color: 'text-green-600' },
          { label: 'Scheduled', value: meetings.filter(m => m.status === 'scheduled').length, color: 'text-blue-600' },
          { label: 'Open Actions', value: openActionItems.length, color: overdueActions > 0 ? 'text-red-600' : 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3 p-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search meetings..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">All Types</option>
            {meetingTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {(['scheduled','in_progress','completed','cancelled'] as MeetingStatus[]).map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Meeting Cards */}
        <div className="p-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center py-10 text-slate-400">No meetings found</p>
          )}
          {filtered.map(m => {
            const openAI = m.agenda.flatMap(a => a.actionItems).filter(ai => ai.status !== 'closed').length;
            const totalAI = m.agenda.flatMap(a => a.actionItems).length;
            return (
              <div key={m.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600">{m.meetingNo}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[m.type]}`}>{m.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.project}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time}</span>
                        {m.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.venue}</span>}
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.participants.length} participants</span>
                        {totalAI > 0 && (
                          <span className={`flex items-center gap-1 font-medium ${openAI > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            <CheckSquare className="w-3 h-3" />{openAI}/{totalAI} actions open
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => navigate(`/meetings/${m.id}`)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50" title="View / Minutes">
                      <Eye className="w-4 h-4" />
                    </button>
                    {canUpdate && (
                      <button onClick={() => setEditRow(m)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50" title="Edit Meeting Details">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {canRemove && (
                      <button onClick={() => setDeleteRow(m)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Meeting Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Meeting">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Meeting Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Monthly Progress Review – November"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as MeetingType }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {meetingTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
              <select value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {projects.map(proj => <option key={proj}>{proj}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Venue</label>
              <input type="text" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                placeholder="Conference room, site office, virtual platform..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Chairperson</label>
              <input type="text" value={form.chairperson} onChange={e => setForm(p => ({ ...p, chairperson: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Recorder</label>
              <input type="text" value={form.recorder} onChange={e => setForm(p => ({ ...p, recorder: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setNewModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button onClick={handleCreate} disabled={!form.title}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              Create Meeting
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Meeting Modal */}
      <Modal open={!!editRow} onClose={() => setEditRow(null)} title={`Edit Meeting — ${editRow?.meetingNo}`}>
        {editRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Meeting Title *</label>
                <input type="text" value={editRow.title} onChange={e => setEditRow({ ...editRow, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select value={editRow.type} onChange={e => setEditRow({ ...editRow, type: e.target.value as MeetingType })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {meetingTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select value={editRow.status} onChange={e => setEditRow({ ...editRow, status: e.target.value as MeetingStatus })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {(['scheduled','in_progress','completed','cancelled'] as MeetingStatus[]).map(s => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={editRow.date} onChange={e => setEditRow({ ...editRow, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                <input type="time" value={editRow.time} onChange={e => setEditRow({ ...editRow, time: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Venue</label>
                <input type="text" value={editRow.venue} onChange={e => setEditRow({ ...editRow, venue: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Chairperson</label>
                <input type="text" value={editRow.chairperson} onChange={e => setEditRow({ ...editRow, chairperson: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Recorder</label>
                <input type="text" value={editRow.recorder} onChange={e => setEditRow({ ...editRow, recorder: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditRow(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button
                onClick={() => {
                  setMeetings(prev => prev.map(m => m.id === editRow.id ? editRow : m));
                  setEditRow(null);
                }}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteRow} recordName={deleteRow?.title ?? ''} recordType="Meeting"
        onConfirm={() => { setMeetings(prev => prev.filter(m => m.id !== deleteRow?.id)); setDeleteRow(null); }}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
};

export default MOMList;
