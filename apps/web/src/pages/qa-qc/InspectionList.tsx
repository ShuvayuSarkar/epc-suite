import React, { useState, useMemo } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Plus, Calendar, Factory, CheckCircle2, AlertCircle, Clock, Pencil, Trash2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { usePersistentState } from '../../hooks/usePersistentState';

// ── BRD §3.7 — Inspection Scheduling (Factory + TPIA + FAT) ────────────────
type InspType = 'Factory Inspection'|'FAT'|'TPIA'|'25% Readiness Demo'|'Pre-Dispatch'|'Stage Inspection';
type InspStatus = 'Scheduled'|'Notice Issued'|'TPIA Confirmed'|'FAT Procedure Approved'|'Completed'|'Failed'|'Rescheduled';

interface Inspection {
  id: string; category: string; vendor: string; location: string;
  inspType: InspType; scheduledDate: string; slaDays: number; daysFromAward: number;
  status: InspStatus; tpiaAgency: string; fatProcedureRef: string;
  noticeIssued: boolean; reportRef: string; project: string;
  outcome: 'Cleared'|'Minor NCR'|'Major NCR'|'Pending'|'';
}

const INITIAL_INSPECTIONS: Inspection[] = [];

const STATUS_V: Record<string,string> = {
  Scheduled:'primary', 'Notice Issued':'warning', 'TPIA Confirmed':'warning',
  'FAT Procedure Approved':'secondary', Completed:'success', Failed:'danger', Rescheduled:'secondary'
};
const OUTCOME_V: Record<string,string> = { Cleared:'success', 'Minor NCR':'warning', 'Major NCR':'danger', Pending:'secondary', '':'secondary' };

const TPIA_AGENCIES = ['Bureau Veritas','TÜV SÜD India','Intertek India','STUP Consultants','RITES Ltd','SGS India'];
const INSP_TYPES: InspType[] = ['Factory Inspection','FAT','TPIA','25% Readiness Demo','Pre-Dispatch','Stage Inspection'];
const CATEGORIES = ['Conductor','Tower','Hardware','OPGW','Transformer','Switchgear','Bay Equipment','Civil'];

export default function InspectionList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.13');
  const [activeTab, setActiveTab]   = useState('schedule');
  const [filterCat, setFilterCat]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [showForm, setShowForm]     = useState(false);
  const [inspections, setInspections] = usePersistentState<Inspection[]>('epc_inspections', INITIAL_INSPECTIONS);
  const [projectsList] = usePersistentState<any[]>('epc_projects', []);
  const [editRow, setEditRow] = useState<Inspection | null>(null);
  const [deleteRow, setDeleteRow] = useState<Inspection | null>(null);

  const [newInspForm, setNewInspForm] = useState({
    project: '',
    category: CATEGORIES[0],
    type: INSP_TYPES[0] as InspType,
    tpia: TPIA_AGENCIES[0],
    vendor: '',
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    fatRef: 'FAT-APAR-001-R0',
  });

  const handleScheduleInspection = () => {
    const projName = newInspForm.project || projectsList[0]?.name || 'Transmission Project';
    const newInsp: Inspection = {
      id: `INS-2026-${String(inspections.length + 1).padStart(3, '0')}`,
      project: projName,
      category: newInspForm.category,
      vendor: newInspForm.vendor || 'Vendor Facility',
      location: 'Site / Factory',
      inspType: newInspForm.type,
      scheduledDate: newInspForm.scheduledDate || new Date().toISOString().split('T')[0],
      slaDays: 7,
      daysFromAward: 14,
      status: 'Scheduled',
      tpiaAgency: newInspForm.tpia,
      fatProcedureRef: newInspForm.fatRef,
      noticeIssued: false,
      reportRef: '',
      outcome: 'Pending',
    };
    setInspections([newInsp, ...inspections]);
    setShowForm(false);
  };

  const projects = [...new Set([...projectsList.map(p=>p.name), ...inspections.map(i=>i.project)])];

  const filtered = useMemo(() => inspections.filter(i=>
    (filterCat==='All'||i.category===filterCat) &&
    (filterStatus==='All'||i.status===filterStatus) &&
    (filterProject==='All'||i.project===filterProject)
  ), [inspections, filterCat,filterStatus,filterProject]);

  const completed = inspections.filter(i=>i.status==='Completed').length;
  const slaAt30   = inspections.filter(i=>i.daysFromAward<=30).length;
  const upcoming7 = inspections.filter(i=>{
    const d = Math.round((new Date(i.scheduledDate).getTime()-Date.now())/86400000);
    return d>=0 && d<=7 && i.status!=='Completed';
  }).length;

  const catData = CATEGORIES.map(c=>({
    cat:c,
    done:inspections.filter(i=>i.category===c&&i.status==='Completed').length,
    pending:inspections.filter(i=>i.category===c&&i.status!=='Completed').length,
  })).filter(d=>d.done+d.pending>0);

  const tabs = [
    { id:'schedule', label:'Inspection Schedule' },
    { id:'tpia',     label:'TPIA / FAT Register' },
    { id:'analytics',label:'Analytics' },
  ];

  const handleDelete = (row: Inspection) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setInspections(prev => prev.filter(r => r !== deleteRow));
    setDeleteRow(null);
  };

  const handleSaveEdit = () => {
    if (!editRow) return;
    setInspections(prev => prev.map(i => i.id === editRow.id ? editRow : i));
    setEditRow(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inspection Scheduling (BRD §3.7)" description="Factory Inspections · TPIA · FAT · 25% Readiness Demo · SLA ≤30 days" />
        <ReadOnlyBanner moduleId="4.13" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Inspections', value:inspections.length, color:'text-indigo-600 bg-indigo-50', icon:<Factory size={18}/> },
          { label:'Completed',         value:completed, color:'text-green-600 bg-green-50', icon:<CheckCircle2 size={18}/> },
          { label:'Within 30d SLA',    value:slaAt30,   color:'text-amber-600 bg-amber-50', icon:<Calendar size={18}/> },
          { label:'Due This Week',     value:upcoming7, color:upcoming7>0?'text-red-600 bg-red-50':'text-slate-700 bg-slate-100', icon:<AlertCircle size={18}/> },
        ].map(k=>(
          <Card key={k.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>{k.icon}</div>
            <div><p className="text-xs text-slate-500">{k.label}</p><p className="text-xl font-bold text-slate-800">{k.value}</p></div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {activeTab==='schedule' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {[
              {val:filterProject, set:setFilterProject, label:'All Projects', opts:projects},
              {val:filterCat,     set:setFilterCat,     label:'All Categories', opts:CATEGORIES},
              {val:filterStatus,  set:setFilterStatus,  label:'All Statuses', opts:['Scheduled','Notice Issued','TPIA Confirmed','FAT Procedure Approved','Completed','Failed','Rescheduled']},
            ].map(f=>(
              <select key={f.label} value={f.val} onChange={e=>f.set(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                <option value="All">{f.label}</option>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length}/{inspections.length}</span>
            <Button onClick={()=>setShowForm(true)} className="flex items-center gap-2 text-sm"><Plus size={14}/>Schedule Inspection</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['ID','Category','Vendor','Location','Type','Scheduled Date','SLA','Days from Award','TPIA','FAT Proc.','Notice?','Status','Outcome',(canUpdate||canRemove)?'Actions':null].filter(Boolean).map(h=>(
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(i=>{
                    const daysLeft = Math.round((new Date(i.scheduledDate).getTime()-Date.now())/86400000);
                    return (
                      <tr key={i.id} className={`hover:bg-slate-50 ${i.status==='Failed'?'bg-red-50/30':i.status==='Completed'?'bg-green-50/10':daysLeft<=7?'bg-amber-50/20':''}`}>
                        <td className="px-3 py-3 font-mono text-xs text-indigo-600">{i.id}</td>
                        <td className="px-3 py-3 text-xs text-slate-700">{i.category}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 max-w-[120px] truncate" title={i.vendor}>{i.vendor}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{i.location}</td>
                        <td className="px-3 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">{i.inspType}</td>
                        <td className={`px-3 py-3 text-xs ${daysLeft<=7&&daysLeft>=0&&i.status!=='Completed'?'text-red-600 font-bold':'text-slate-500'}`}>{i.scheduledDate}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{i.slaDays}d</td>
                        <td className={`px-3 py-3 text-xs font-semibold ${i.daysFromAward<=30?'text-green-600':'text-amber-600'}`}>{i.daysFromAward}d</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{i.tpiaAgency||'—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{i.fatProcedureRef||'—'}</td>
                        <td className="px-3 py-3 text-xs text-center">{i.noticeIssued?<CheckCircle2 size={14} className="text-green-500 mx-auto"/>:<Clock size={14} className="text-slate-300 mx-auto"/>}</td>
                        <td className="px-3 py-3"><Badge variant={STATUS_V[i.status] as any}>{i.status}</Badge></td>
                        <td className="px-3 py-3">{i.outcome?<Badge variant={OUTCOME_V[i.outcome] as any}>{i.outcome}</Badge>:<span className="text-xs text-slate-400">—</span>}</td>
                        {(canUpdate || canRemove) && (
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {canUpdate && (
                                <button onClick={() => setEditRow(i)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                  <Pencil size={13} />
                                </button>
                              )}
                              {canRemove && (
                                <button onClick={() => handleDelete(i)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab==='tpia' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.filter(i=>i.tpiaAgency).map(i=>(
              <Card key={i.id} className={`p-5 border-l-4 ${i.status==='Completed'?'border-green-400':i.status==='TPIA Confirmed'?'border-indigo-400':'border-amber-400'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold text-indigo-600">{i.inspType}</p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{i.category} — {i.vendor.split('(')[0].trim()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_V[i.status] as any}>{i.status}</Badge>
                    {canUpdate && (
                      <button onClick={() => setEditRow(i)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                        <Pencil size={13} />
                      </button>
                    )}
                    {canRemove && (
                      <button onClick={() => handleDelete(i)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  {[['TPIA Agency',i.tpiaAgency],['Location',i.location],['Scheduled',i.scheduledDate],['Notice Issued',i.noticeIssued?'✅ Yes':'❌ Pending'],['FAT Procedure',i.fatProcedureRef||'—'],['Report Ref',i.reportRef||'—']].map(([k,v])=>(
                    <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="text-slate-800 font-medium">{v}</span></div>
                  ))}
                </div>
                {i.outcome&&i.outcome!=='Pending' && (
                  <div className={`mt-3 p-2 rounded text-xs font-semibold ${i.outcome==='Cleared'?'bg-green-50 text-green-700':i.outcome==='Minor NCR'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>Outcome: {i.outcome}</div>
                )}
              </Card>
            ))}
          </div>
          <Card className="p-4 bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <p className="font-semibold mb-1">BRD §3.7 Requirements</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Inspection call letter to be raised within 30 days of award</li>
              <li>FAT procedure to be submitted and approved before FAT</li>
              <li>TPIA coordination mandatory for client-witnessed inspections</li>
              <li>25% readiness demonstration is a mandatory pre-production gate</li>
            </ul>
          </Card>
        </div>
      )}

      {activeTab==='analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Inspections by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{top:4,right:8,left:-20,bottom:30}}>
                <XAxis dataKey="cat" tick={{fontSize:9}} angle={-30} textAnchor="end"/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip/><Legend/>
                <Bar dataKey="done" stackId="a" fill="#22c55e" name="Completed"/>
                <Bar dataKey="pending" stackId="a" fill="#6366f1" name="Pending" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Checklist: Inspection Readiness</h3>
            {[
              { label:'All TPIA agencies confirmed', done:inspections.filter(i=>i.tpiaAgency&&['TPIA Confirmed','FAT Procedure Approved','Completed'].includes(i.status)).length >= 2 },
              { label:'FAT procedures approved', done:inspections.some(i=>i.status==='FAT Procedure Approved') },
              { label:'25% Readiness Demo scheduled', done:inspections.some(i=>i.inspType==='25% Readiness Demo') },
              { label:'All inspection notices issued', done:inspections.filter(i=>!i.noticeIssued&&i.status!=='Completed').length===0 },
              { label:'SLA ≤30d for all inspections', done:inspections.every(i=>i.daysFromAward<=30||i.slaDays>30) },
            ].map(c=>(
              <div key={c.label} className={`flex items-center gap-3 p-3 rounded-lg ${c.done?'bg-green-50 border border-green-200':'bg-amber-50 border border-amber-200'}`}>
                {c.done ? <CheckCircle2 size={16} className="text-green-600 shrink-0"/> : <Clock size={16} className="text-amber-600 shrink-0"/>}
                <span className={`text-xs font-medium ${c.done?'text-green-700':'text-amber-700'}`}>{c.label}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-semibold text-slate-800">Schedule Inspection</h3><button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button></div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
                <select 
                  value={newInspForm.project} 
                  onChange={e => setNewInspForm({ ...newInspForm, project: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="">— Select Project —</option>
                  {projectsList.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newInspForm.category} 
                  onChange={e => setNewInspForm({ ...newInspForm, category: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inspection Type</label>
                <select 
                  value={newInspForm.type} 
                  onChange={e => setNewInspForm({ ...newInspForm, type: e.target.value as InspType })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {INSP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">TPIA Agency</label>
                <select 
                  value={newInspForm.tpia} 
                  onChange={e => setNewInspForm({ ...newInspForm, tpia: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  {TPIA_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vendor / Plant Location</label>
                <input 
                  type="text" 
                  value={newInspForm.vendor} 
                  onChange={e => setNewInspForm({ ...newInspForm, vendor: e.target.value })}
                  placeholder="e.g. APAR Silvassa Works" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Scheduled Date</label>
                <input 
                  type="date" 
                  value={newInspForm.scheduledDate} 
                  onChange={e => setNewInspForm({ ...newInspForm, scheduledDate: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">FAT Procedure Ref</label>
                <input 
                  type="text" 
                  value={newInspForm.fatRef} 
                  onChange={e => setNewInspForm({ ...newInspForm, fatRef: e.target.value })}
                  placeholder="e.g. FAT-APAR-001-R0" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
              <Button onClick={handleScheduleInspection}>Schedule Inspection</Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.id ?? 'this record'}
        recordType="Inspection"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Inspection</h3>
              <button onClick={() => setEditRow(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input 
                  value={editRow.category} 
                  onChange={e => setEditRow({ ...editRow, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vendor</label>
                <input 
                  value={editRow.vendor} 
                  onChange={e => setEditRow({ ...editRow, vendor: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date</label>
                <input 
                  value={editRow.scheduledDate} 
                  onChange={e => setEditRow({ ...editRow, scheduledDate: e.target.value })}
                  type="date" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">TPIA Agency</label>
                <input 
                  value={editRow.tpiaAgency} 
                  onChange={e => setEditRow({ ...editRow, tpiaAgency: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <input 
                  value={editRow.status} 
                  onChange={e => setEditRow({ ...editRow, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setEditRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}