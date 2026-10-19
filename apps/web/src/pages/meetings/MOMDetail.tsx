import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckSquare, AlertTriangle, Users, Calendar, Clock,
  MapPin, Printer, Plus, Trash2, CheckCircle2, UserPlus, FileText
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { Modal } from '../../components/ui/Modal';
import { Meeting, AgendaItem, ActionItem, MeetingParticipant } from '../../types/meeting';

const MOCK_MEETINGS: Meeting[] = [];

const roleColors: Record<string, string> = {
  chair: 'bg-indigo-100 text-indigo-700',
  recorder: 'bg-blue-100 text-blue-700',
  attendee: 'bg-slate-100 text-slate-600',
  external: 'bg-orange-100 text-orange-700',
};

const aiStatusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
};

import { usePersistentState } from '../../hooks/usePersistentState';

const MOMDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate } = usePermission('4.22');

  const [meetings, setMeetings] = usePersistentState<Meeting[]>('epc_meetings', MOCK_MEETINGS);
  const meeting = meetings.find(m => m.id === id) || null;

  const setMeeting = useCallback((action: React.SetStateAction<Meeting | null>) => {
    setMeetings(prevMeetings => {
      const current = prevMeetings.find(m => m.id === id) || null;
      const next = typeof action === 'function' ? (action as (p: Meeting | null) => Meeting | null)(current) : action;
      if (!next) return prevMeetings.filter(m => m.id !== id);
      return prevMeetings.map(m => m.id === id ? next : m);
    });
  }, [id, setMeetings]);

  const [expandedAgenda, setExpandedAgenda] = useState<Set<string>>(new Set(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']));

  // Modals
  const [newActionModal, setNewActionModal] = useState<string | null>(null); // agendaItemId
  const [actionForm, setActionForm] = useState({ description: '', owner: '', dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10) });

  const [newAgendaModal, setNewAgendaModal] = useState(false);
  const [agendaForm, setAgendaForm] = useState({ topic: '', discussion: '' });

  const [newParticipantModal, setNewParticipantModal] = useState(false);
  const [participantForm, setParticipantForm] = useState({
    name: '',
    role: 'attendee' as MeetingParticipant['role'],
    company: 'APAR Industries',
    accepted: true,
  });

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Meeting not found</p>
        <button onClick={() => navigate('/meetings')} className="text-indigo-600 hover:underline text-sm font-semibold">← Back to Meetings</button>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const isPublished = meeting.status === 'completed';

  const toggleAgenda = (agendaId: string) => {
    setExpandedAgenda(prev => {
      const next = new Set(prev);
      next.has(agendaId) ? next.delete(agendaId) : next.add(agendaId);
      return next;
    });
  };

  const updateActionStatus = (agendaId: string, aiId: string, status: ActionItem['status']) => {
    setMeeting(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        agenda: prev.agenda.map(a => a.id === agendaId ? {
          ...a,
          actionItems: a.actionItems.map(ai => ai.id === aiId ? {
            ...ai, status,
            closedAt: status === 'closed' ? today : undefined,
          } : ai)
        } : a)
      };
    });
  };

  const handleAddActionItem = () => {
    if (!newActionModal || !actionForm.description) return;
    const newAI: ActionItem = {
      id: `ai-${Date.now()}`,
      agendaItemId: newActionModal,
      description: actionForm.description,
      owner: actionForm.owner || 'Unassigned',
      dueDate: actionForm.dueDate,
      status: 'open',
    };
    setMeeting(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        agenda: prev.agenda.map(a => a.id === newActionModal ? {
          ...a,
          actionItems: [...a.actionItems, newAI]
        } : a)
      };
    });
    setNewActionModal(null);
    setActionForm({ description: '', owner: '', dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10) });
  };

  const handleDeleteActionItem = (agendaId: string, aiId: string) => {
    setMeeting(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        agenda: prev.agenda.map(a => a.id === agendaId ? {
          ...a,
          actionItems: a.actionItems.filter(ai => ai.id !== aiId)
        } : a)
      };
    });
  };

  const handleAddAgendaItem = () => {
    if (!agendaForm.topic) return;
    const nextNum = String(meeting.agenda.length + 1);
    const newAgenda: AgendaItem = {
      id: `agenda-${Date.now()}`,
      number: nextNum,
      topic: agendaForm.topic,
      discussion: agendaForm.discussion,
      actionItems: [],
    };
    setMeeting(prev => prev ? { ...prev, agenda: [...prev.agenda, newAgenda] } : prev);
    setExpandedAgenda(prev => new Set(prev).add(newAgenda.id));
    setNewAgendaModal(false);
    setAgendaForm({ topic: '', discussion: '' });
  };

  const handleDeleteAgendaItem = (agendaId: string) => {
    setMeeting(prev => prev ? {
      ...prev,
      agenda: prev.agenda.filter(a => a.id !== agendaId)
    } : prev);
  };

  const handleAddParticipant = () => {
    if (!participantForm.name) return;
    const newP: MeetingParticipant = {
      id: `part-${Date.now()}`,
      name: participantForm.name,
      role: participantForm.role,
      company: participantForm.company,
      accepted: participantForm.accepted,
    };
    setMeeting(prev => prev ? { ...prev, participants: [...prev.participants, newP] } : prev);
    setNewParticipantModal(false);
    setParticipantForm({ name: '', role: 'attendee', company: 'APAR Industries', accepted: true });
  };

  const handleDeleteParticipant = (partId: string) => {
    setMeeting(prev => prev ? { ...prev, participants: prev.participants.filter(p => p.id !== partId) } : prev);
  };

  const publish = () => {
    setMeeting(prev => prev ? { ...prev, status: 'completed', publishedAt: new Date().toISOString() } : prev);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div>
        <button onClick={() => navigate('/meetings')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Meetings
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="font-mono text-sm font-bold text-indigo-600">{meeting.meetingNo}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isPublished ? 'Published' : meeting.status.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{meeting.type}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">{meeting.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{meeting.project}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">
              <Printer className="w-4 h-4" /> Print MOM
            </button>
            {!isPublished && canUpdate && (
              <button onClick={publish}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm transition-colors">
                Publish MOM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Meeting Metadata</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Project', value: meeting.project },
            { label: 'Date', value: meeting.date, icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
            { label: 'Time', value: meeting.time, icon: <Clock className="w-3.5 h-3.5 text-slate-400" /> },
            { label: 'Venue', value: meeting.venue || '—', icon: <MapPin className="w-3.5 h-3.5 text-slate-400" /> },
            { label: 'Chairperson', value: meeting.chairperson },
            { label: 'Recorder', value: meeting.recorder },
            { label: 'Published Status', value: meeting.publishedAt ? new Date(meeting.publishedAt).toLocaleString() : 'Draft / In Progress' },
          ].map(({ label, value, icon }) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                {icon}{value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Participants ({meeting.participants.length})
          </p>
          {canUpdate && !isPublished && (
            <button
              onClick={() => setNewParticipantModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Add Attendee
            </button>
          )}
        </div>
        <table className="table-auto w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Company', 'Role', 'Accepted / Present', ...(canUpdate && !isPublished ? ['Action'] : [])].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meeting.participants.map((p: MeetingParticipant) => (
              <tr key={p.id}>
                <td className="px-3 py-2 font-medium text-slate-700">{p.name}</td>
                <td className="px-3 py-2 text-slate-500">{p.company}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[p.role]}`}>{p.role}</span>
                </td>
                <td className="px-3 py-2">
                  {p.accepted
                    ? <span className="text-green-600 font-semibold">✓ Yes</span>
                    : <span className="text-slate-400">✗ No</span>}
                </td>
                {canUpdate && !isPublished && (
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Remove attendee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agenda & Minutes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agenda & Discussion Minutes</p>
          {canUpdate && !isPublished && (
            <button
              onClick={() => setNewAgendaModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Agenda Topic
            </button>
          )}
        </div>

        <div className="space-y-3">
          {meeting.agenda.map((item: AgendaItem) => {
            const isExpanded = expandedAgenda.has(item.id);
            const overdueAI = item.actionItems.filter(ai => ai.dueDate < today && ai.status !== 'closed');
            return (
              <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left">
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleAgenda(item.id)}>
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{item.number}</span>
                    <span className="font-semibold text-slate-800 text-sm">{item.topic}</span>
                    {overdueAI.length > 0 && (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />{overdueAI.length} overdue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canUpdate && !isPublished && (
                      <button
                        onClick={() => handleDeleteAgendaItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete agenda item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-slate-400 text-xs cursor-pointer" onClick={() => toggleAgenda(item.id)}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 py-4 space-y-4">
                    {/* Discussion */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Minutes / Discussion Notes</p>
                      {canUpdate && !isPublished ? (
                        <textarea
                          rows={3}
                          value={item.discussion}
                          placeholder="Type discussion points and agreements reached..."
                          onChange={e => {
                            const val = e.target.value;
                            setMeeting(prev => prev ? { ...prev, agenda: prev.agenda.map(a => a.id === item.id ? { ...a, discussion: val } : a) } : prev);
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed">{item.discussion || <em className="text-slate-400">No discussion recorded.</em>}</p>
                      )}
                    </div>

                    {/* Action Items */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Action Items ({item.actionItems.length})
                        </p>
                        {canUpdate && !isPublished && (
                          <button
                            onClick={() => setNewActionModal(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <Plus className="w-3 h-3" /> + Add Action Item
                          </button>
                        )}
                      </div>

                      {item.actionItems.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">No action items assigned for this topic.</p>
                      ) : (
                        <table className="table-auto w-full text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              {['Action Item Description', 'Owner', 'Due Date', 'Status', ...(canUpdate && !isPublished ? ['Status Update', 'Delete'] : [])].map(h => (
                                <th key={h} className="px-3 py-1.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {item.actionItems.map((ai: ActionItem) => {
                              const isOverdue = ai.dueDate < today && ai.status !== 'closed';
                              return (
                                <tr key={ai.id} className={isOverdue ? 'bg-red-50' : ''}>
                                  <td className={`px-3 py-2 ${ai.status === 'closed' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{ai.description}</td>
                                  <td className="px-3 py-2 text-slate-600 font-medium">{ai.owner}</td>
                                  <td className={`px-3 py-2 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>{ai.dueDate}</td>
                                  <td className="px-3 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${aiStatusColors[ai.status]}`}>
                                      {ai.status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  {canUpdate && !isPublished && (
                                    <>
                                      <td className="px-3 py-2">
                                        <select
                                          value={ai.status}
                                          onChange={e => updateActionStatus(item.id, ai.id, e.target.value as ActionItem['status'])}
                                          className="text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none"
                                        >
                                          <option value="open">Open</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="closed">Closed</option>
                                        </select>
                                      </td>
                                      <td className="px-3 py-2">
                                        <button
                                          onClick={() => handleDeleteActionItem(item.id, ai.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                          title="Delete action item"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {(meeting.notes || canUpdate) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">General Notes & Decisions</p>
          {canUpdate && !isPublished ? (
            <textarea rows={3} value={meeting.notes}
              onChange={e => setMeeting(prev => prev ? { ...prev, notes: e.target.value } : prev)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="Record any general announcements, schedule deviations or agreed dates..." />
          ) : (
            <p className="text-sm text-slate-700">{meeting.notes || <em className="text-slate-400">No notes.</em>}</p>
          )}
        </div>
      )}

      {/* Add Action Item Modal */}
      <Modal open={!!newActionModal} onClose={() => setNewActionModal(null)} title="New Action Item">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Description *</label>
            <textarea
              rows={2}
              placeholder="Specify the action agreed upon..."
              value={actionForm.description}
              onChange={e => setActionForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Action Owner *</label>
              <input
                type="text"
                placeholder="Person responsible"
                value={actionForm.owner}
                onChange={e => setActionForm(f => ({ ...f, owner: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Due Date *</label>
              <input
                type="date"
                value={actionForm.dueDate}
                onChange={e => setActionForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setNewActionModal(null)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600">Cancel</button>
            <button onClick={handleAddActionItem} disabled={!actionForm.description} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">Add Action Item</button>
          </div>
        </div>
      </Modal>

      {/* Add Agenda Modal */}
      <Modal open={newAgendaModal} onClose={() => setNewAgendaModal(false)} title="Add Agenda Item">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Agenda Topic *</label>
            <input
              type="text"
              placeholder="e.g. Substation Earthing & Cable Trench Layout"
              value={agendaForm.topic}
              onChange={e => setAgendaForm(f => ({ ...f, topic: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Discussion Points</label>
            <textarea
              rows={3}
              placeholder="Key notes discussed..."
              value={agendaForm.discussion}
              onChange={e => setAgendaForm(f => ({ ...f, discussion: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setNewAgendaModal(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600">Cancel</button>
            <button onClick={handleAddAgendaItem} disabled={!agendaForm.topic} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">Create Agenda Item</button>
          </div>
        </div>
      </Modal>

      {/* Add Participant Modal */}
      <Modal open={newParticipantModal} onClose={() => setNewParticipantModal(false)} title="Add Meeting Attendee">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attendee Name *</label>
            <input
              type="text"
              placeholder="e.g. Mr. K. Patel"
              value={participantForm.name}
              onChange={e => setParticipantForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. GETCO, APAR, PMC"
                value={participantForm.company}
                onChange={e => setParticipantForm(f => ({ ...f, company: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Role</label>
              <select
                value={participantForm.role}
                onChange={e => setParticipantForm(f => ({ ...f, role: e.target.value as MeetingParticipant['role'] }))}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="chair">Chairperson</option>
                <option value="recorder">Recorder</option>
                <option value="attendee">Attendee</option>
                <option value="external">External / Client</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="accepted-chk"
              checked={participantForm.accepted}
              onChange={e => setParticipantForm(f => ({ ...f, accepted: e.target.checked }))}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="accepted-chk" className="text-slate-700 font-medium cursor-pointer">Confirmed Present / Signed-off</label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setNewParticipantModal(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600">Cancel</button>
            <button onClick={handleAddParticipant} disabled={!participantForm.name} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">Add Attendee</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MOMDetail;
