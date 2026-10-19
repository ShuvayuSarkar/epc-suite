import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowRight, Send, Pencil, Trash2, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

// BRD 5.10: RFI Workflow - Raise -> Route -> Respond -> Close
// SLA: Internal <=3 days | Client <=7 days | Client-visible via portal

type RFIStatus = 'Open' | 'Routed' | 'Responded' | 'Closed' | 'Overdue';
type RFIPriority = 'Critical' | 'High' | 'Medium' | 'Low';
type RFIAssignee = 'Internal' | 'Client';
type RFICategory = 'Engineering' | 'ROW/Access' | 'Procurement' | 'Statutory' | 'Contractual' | 'Safety';

interface RFI {
  id: string; project: string; subject: string; description: string;
  category: string; raisedBy: string; raisedDate: string;
  assignedTo: string; assigneeType: RFIAssignee;
  routedDate: string; responseDate: string; closedDate: string;
  status: RFIStatus; priority: RFIPriority; daysOpen: number;
  response: string; attachments: number;
}

const MOCK_RFIS: RFI[] = [];

const STATUS_V: Record<string, string> = { Open:'warning', Routed:'primary', Responded:'success', Closed:'secondary', Overdue:'danger' };
const PRIO_V: Record<string, string> = { Critical:'danger', High:'warning', Medium:'primary', Low:'secondary' };

const agingData = [
  { bucket:'0-3d', internal:2, client:1 },
  { bucket:'4-7d', internal:1, client:2 },
  { bucket:'8-14d', internal:1, client:0 },
  { bucket:'>14d', internal:0, client:1 },
];

const trendData = [
  { week:'W1-Oct', raised:3, closed:1 }, { week:'W2-Oct', raised:2, closed:2 },
  { week:'W3-Oct', raised:3, closed:1 }, { week:'W4-Oct', raised:2, closed:null },
];

const catData = [
  { name:'Engineering', value:3 }, { name:'ROW/Access', value:1 },
  { name:'Procurement', value:1 }, { name:'Statutory', value:1 },
  { name:'Contractual', value:1 }, { name:'Safety', value:1 },
];
const COLORS = ['#6366f1','#ef4444','#0891b2','#d97706','#7c3aed','#059669'];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function RFIList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.21');
  const [rfis, setRfis] = usePersistentState<RFI[]>('epc_rfis', MOCK_RFIS);
  const [editRow, setEditRow] = React.useState<RFI | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<RFI | null>(null);
  const confirmDelete = () => { if (!deleteRow) return; setRfis(prev => prev.filter(r => r.id !== deleteRow.id)); setDeleteRow(null); };

  const updateStatus = (id: string, newStatus: RFIStatus) => {
    setRfis(prev => prev.map(item => {
      if (item.id === id) {
        const today = new Date().toISOString().split('T')[0];
        return {
          ...item,
          status: newStatus,
          routedDate: (newStatus === 'Routed' || newStatus === 'Responded' || newStatus === 'Closed') && !item.routedDate ? today : item.routedDate,
          responseDate: (newStatus === 'Responded' || newStatus === 'Closed') && !item.responseDate ? today : item.responseDate,
          closedDate: newStatus === 'Closed' ? today : (item.status === 'Closed' ? '' : item.closedDate),
        };
      }
      return item;
    }));
  };
  const [projectsList] = usePersistentState<any[]>('epc_projects', []);
  const [activeTab, setActiveTab] = useState('register');
  const [filterProject, setFilterProject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [expandedRFI, setExpandedRFI] = useState<string | null>(null);

  const [newRfiForm, setNewRfiForm] = useState({
    subject: '',
    project: '',
    category: 'Engineering' as RFICategory,
    priority: 'Medium' as RFIPriority,
    assignedTo: 'Engineering Lead',
    assigneeType: 'Internal' as 'Internal' | 'Client',
    desc: '',
  });

  const handleRaiseRFI = () => {
    if (!newRfiForm.subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    const proj = newRfiForm.project || projectsList[0]?.name || 'Transmission Project';
    const newRfi: RFI = {
      id: `RFI-2026-${String(rfis.length + 1).padStart(3, '0')}`,
      subject: newRfiForm.subject.trim(),
      project: proj,
      description: newRfiForm.desc || newRfiForm.subject,
      category: newRfiForm.category,
      priority: newRfiForm.priority,
      raisedBy: 'Engineering Team',
      raisedDate: new Date().toISOString().split('T')[0],
      assignedTo: newRfiForm.assignedTo || 'Lead Design Engineer',
      assigneeType: newRfiForm.assigneeType,
      routedDate: new Date().toISOString().split('T')[0],
      responseDate: '',
      closedDate: '',
      daysOpen: 0,
      status: 'Open',
      response: '',
      attachments: 0,
    };
    setRfis([newRfi, ...rfis]);
    setShowForm(false);
    setNewRfiForm({
      subject: '',
      project: '',
      category: 'Engineering',
      priority: 'Medium',
      assignedTo: 'Engineering Lead',
      assigneeType: 'Internal',
      desc: '',
    });
  };

  const projects = [...new Set([...projectsList.map(p => p.name), ...rfis.map(r => r.project)])];

  const filtered = useMemo(() => rfis.filter(r =>
    (filterProject === 'All' || r.project === filterProject) &&
    (filterStatus === 'All' || r.status === filterStatus) &&
    (filterAssignee === 'All' || r.assigneeType === filterAssignee)
  ), [filterProject, filterStatus, filterAssignee]);

  const openCount = rfis.filter(r => !['Closed'].includes(r.status)).length;
  const overdueInternal = rfis.filter(r => r.assigneeType === 'Internal' && r.daysOpen > 3 && r.status !== 'Closed').length;
  const overdueClient = rfis.filter(r => r.assigneeType === 'Client' && r.daysOpen > 7 && r.status !== 'Closed').length;
  const avgResponse = Math.round(rfis.filter(r => r.responseDate).reduce((s,r) => s + r.daysOpen, 0) / Math.max(rfis.filter(r => r.responseDate).length, 1) * 10) / 10;

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFI Register (BRD 5.10)"
        description="Raise -> Route -> Respond -> Close | Internal SLA: 3 days | Client SLA: 7 days"
        actions={<Button onClick={() => setShowForm(true)} className="flex items-center gap-2"><Plus size={14}/>
        <ReadOnlyBanner moduleId="4.21" /> Raise RFI</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Open RFIs', value:openCount, color:'text-amber-600 bg-amber-50', icon:<MessageSquare size={18}/> },
          { label:'Overdue (Internal >3d)', value:overdueInternal, color:overdueInternal>0?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<Clock size={18}/> },
          { label:'Overdue (Client >7d)', value:overdueClient, color:overdueClient>0?'text-red-600 bg-red-50':'text-green-600 bg-green-50', icon:<AlertCircle size={18}/> },
          { label:'Avg Response (days)', value:avgResponse, color:'text-indigo-600 bg-indigo-50', icon:<Send size={18}/> },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      {(overdueInternal > 0 || overdueClient > 0) && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-sm text-red-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 shrink-0"/>
          <span><strong>{overdueInternal + overdueClient} RFI(s) overdue.</strong> Internal SLA: respond within 3 days. Client SLA: respond within 7 days. Escalate immediately.</span>
        </div>
      )}

      <Tabs tabs={[
        { id:'register', label:'RFI Register' },
        { id:'workflow', label:'Workflow Pipeline' },
        { id:'analytics', label:'Analytics' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { val:filterProject, set:setFilterProject, label:'All Projects', opts:projects },
              { val:filterStatus, set:setFilterStatus, label:'All Statuses', opts:['Open','Routed','Responded','Closed'] },
              { val:filterAssignee, set:setFilterAssignee, label:'All Assignees', opts:['Internal','Client'] },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white">
                <option value="All">{f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} result(s)</span>
          </div>

          <div className="space-y-3">
            {filtered.map(r => {
              const isOverdue = (r.assigneeType === 'Internal' && r.daysOpen > 3 && r.status !== 'Closed') ||
                                (r.assigneeType === 'Client' && r.daysOpen > 7 && r.status !== 'Closed');
              const isExpanded = expandedRFI === r.id;
              return (
                <Card key={r.id} className={`p-0 overflow-hidden ${isOverdue ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <div className="p-4 cursor-pointer hover:bg-slate-50/50" onClick={() => setExpandedRFI(isExpanded ? null : r.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span>
                          <Badge variant={PRIO_V[r.priority] as any}>{r.priority}</Badge>
                          {canUpdate ? (
                            <select
                              value={r.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation();
                                updateStatus(r.id, e.target.value as RFIStatus);
                              }}
                              className="text-xs font-semibold rounded px-2 py-0.5 border border-slate-300 bg-white hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm text-slate-800"
                              title="Click to change RFI status"
                            >
                              <option value="Open">Open</option>
                              <option value="Routed">Routed</option>
                              <option value="Responded">Responded</option>
                              <option value="Closed">Closed</option>
                            </select>
                          ) : (
                            <Badge variant={STATUS_V[r.status] as any}>{r.status}</Badge>
                          )}
                          {isOverdue && <Badge variant="danger">OVERDUE</Badge>}
                          <span className="text-[10px] text-slate-400">{r.category}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">{r.subject}</h4>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 flex-wrap">
                          <span>{r.project}</span>
                          <span>Raised: {r.raisedDate}</span>
                          <span>By: {r.raisedBy}</span>
                          <span>Assigned: <strong className={r.assigneeType==='Client'?'text-purple-600':'text-indigo-600'}>{r.assignedTo}</strong> ({r.assigneeType})</span>
                          <span className={`font-semibold ${isOverdue?'text-red-600':'text-slate-600'}`}>{r.daysOpen}d open</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {r.attachments > 0 && <span>{r.attachments} files</span>}
                        {(canUpdate || canRemove) && (
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-2">
                            {canUpdate && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditRow(r); }}
                                className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors text-slate-500"
                                title="Edit RFI"
                              >
                                <Pencil size={14}/>
                              </button>
                            )}
                            {canRemove && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteRow(r); }}
                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors text-slate-500"
                                title="Delete RFI"
                              >
                                <Trash2 size={14}/>
                              </button>
                            )}
                          </div>
                        )}
                        <ArrowRight size={14} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}/>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                      <div><p className="text-xs font-semibold text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700">{r.description}</p></div>
                      <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle2 size={14} className="text-white"/></div>
                            <div className="w-0.5 h-4 bg-slate-300"/>
                          </div>
                          <div><p className="text-[10px] text-slate-500">Raised</p><p className="text-xs font-semibold">{r.raisedDate}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.routedDate?'bg-green-500':'bg-slate-300'}`}><Send size={12} className="text-white"/></div>
                            <div className="w-0.5 h-4 bg-slate-300"/>
                          </div>
                          <div><p className="text-[10px] text-slate-500">Routed</p><p className="text-xs font-semibold">{r.routedDate||'Pending'}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.responseDate?'bg-green-500':'bg-slate-300'}`}><MessageSquare size={12} className="text-white"/></div>
                            <div className="w-0.5 h-4 bg-slate-300"/>
                          </div>
                          <div><p className="text-[10px] text-slate-500">Responded</p><p className="text-xs font-semibold">{r.responseDate||'Awaiting'}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.closedDate?'bg-green-500':'bg-slate-300'}`}><CheckCircle2 size={14} className="text-white"/></div>
                          <div><p className="text-[10px] text-slate-500">Closed</p><p className="text-xs font-semibold">{r.closedDate||'Open'}</p></div>
                        </div>
                      </div>
                      {r.response && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs font-semibold text-green-700 mb-1">Response:</p>
                          <p className="text-sm text-green-800">{r.response}</p>
                        </div>
                      )}
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-600">Quick Change Status:</span>
                          {(['Open', 'Routed', 'Responded', 'Closed'] as RFIStatus[]).map(st => (
                            <button
                              key={st}
                              disabled={!canUpdate || r.status === st}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(r.id, st);
                              }}
                              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                                r.status === st
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                        {canUpdate && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditRow(r); }}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                          >
                            <Pencil size={13} /> Edit Full Details
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Visual pipeline showing all RFIs grouped by workflow stage (BRD 5.10: Raise {'->'} Route {'->'} Respond {'->'} Close)</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['Open','Routed','Responded','Closed'] as RFIStatus[]).map(stage => {
              const items = rfis.filter(r => r.status === stage);
              const stageColors: Record<string, string> = { Open:'border-amber-400 bg-amber-50', Routed:'border-indigo-400 bg-indigo-50', Responded:'border-green-400 bg-green-50', Closed:'border-slate-400 bg-slate-50' };
              return (
                <div key={stage} className={`p-4 rounded-xl border-2 ${stageColors[stage]} min-h-[200px]`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700">{stage}</h4>
                    <Badge variant={STATUS_V[stage] as any}>{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map(r => (
                      <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] font-bold text-indigo-600">{r.id}</span>
                          <Badge variant={PRIO_V[r.priority] as any} className="text-[8px]">{r.priority}</Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-700 line-clamp-2">{r.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{r.assignedTo} | {r.daysOpen}d</p>
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No items</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">RFI Aging by Assignee Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agingData} margin={{top:4,right:8,left:-20,bottom:0}}>
                <XAxis dataKey="bucket" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Legend/>
                <Bar dataKey="internal" name="Internal" fill="#6366f1" radius={[4,4,0,0]}/>
                <Bar dataKey="client" name="Client" fill="#d97706" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Weekly RFI Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{top:4,right:8,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="week" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Legend/>
                <Line type="monotone" dataKey="raised" stroke="#ef4444" name="Raised" strokeWidth={2}/>
                <Line type="monotone" dataKey="closed" stroke="#22c55e" name="Closed" strokeWidth={2} connectNulls={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">RFI Category Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {catData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">SLA Compliance</h3>
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">Internal Response (SLA: 3 days)</span><span className="font-bold text-green-600">75%</span></div>
                <div className="w-full bg-slate-200 rounded-full h-3 relative">
                  <div className="bg-green-500 h-3 rounded-full" style={{width:'75%'}}/>
                  <div className="absolute top-0 h-3 border-r-2 border-red-500 border-dashed" style={{left:'100%'}}/>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">Client Response (SLA: 7 days)</span><span className="font-bold text-amber-600">60%</span></div>
                <div className="w-full bg-slate-200 rounded-full h-3 relative">
                  <div className="bg-amber-500 h-3 rounded-full" style={{width:'60%'}}/>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">Overall Closure Rate</span><span className="font-bold text-indigo-600">25%</span></div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{width:'25%'}}/>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-semibold text-slate-800">Raise New RFI</h3><button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  value={newRfiForm.subject} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, subject: e.target.value })}
                  placeholder="e.g. Tower Spotting Clearance at Span 45" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
                <select 
                  value={newRfiForm.project} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, project: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="">— Select Project —</option>
                  {projectsList.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newRfiForm.category} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, category: e.target.value as RFICategory })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {['Engineering','ROW/Access','Procurement','Statutory','Contractual','Safety'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  value={newRfiForm.priority} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, priority: e.target.value as RFIPriority })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {['Critical','High','Medium','Low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assignee Type</label>
                <select 
                  value={newRfiForm.assigneeType} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, assigneeType: e.target.value as 'Internal' | 'Client' })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="Internal">Internal Team</option>
                  <option value="Client">Client Stakeholder</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned To Person / Role</label>
                <input 
                  type="text" 
                  value={newRfiForm.assignedTo} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, assignedTo: e.target.value })}
                  placeholder="e.g. Lead Design Engineer" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea 
                  rows={3} 
                  value={newRfiForm.desc} 
                  onChange={e => setNewRfiForm({ ...newRfiForm, desc: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none" 
                  placeholder="Provide technical background and request details..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleRaiseRFI}>Raise RFI</Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow ? deleteRow.id : ''}
        recordType="RFI"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit RFI — {editRow.id}</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={editRow.status}
                  onChange={e => {
                    const st = e.target.value as RFIStatus;
                    const today = new Date().toISOString().split('T')[0];
                    setEditRow({
                      ...editRow,
                      status: st,
                      routedDate: (st === 'Routed' || st === 'Responded' || st === 'Closed') && !editRow.routedDate ? today : editRow.routedDate,
                      responseDate: (st === 'Responded' || st === 'Closed') && !editRow.responseDate ? today : editRow.responseDate,
                      closedDate: st === 'Closed' ? today : (editRow.status === 'Closed' ? '' : editRow.closedDate),
                    });
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Routed">Routed</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                <input
                  value={editRow.subject}
                  onChange={e => setEditRow({ ...editRow, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
                <input
                  value={editRow.assignedTo}
                  onChange={e => setEditRow({ ...editRow, assignedTo: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Official Response</label>
                <textarea
                  value={editRow.response || ''}
                  onChange={e => setEditRow({ ...editRow, response: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Enter clarification or response..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => {
                  setRfis(prev => prev.map(item => item.id === editRow.id ? editRow : item));
                  setEditRow(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}