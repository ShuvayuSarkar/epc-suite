import React, { useState } from 'react';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ReadOnlyBanner } from '../../components/auth/ReadOnlyBanner';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { CheckCircle2, FileText, AlertCircle, FileSignature, Pencil, Trash2, X } from 'lucide-react';

interface LineJMC {
  id: string; project: string; segment: string; periodFrom: string; periodTo: string;
  activity: string; claimedQty: string; approvedQty: string; inspector: string; date: string; status: string;
}
interface SubstationJMC {
  id: string; project: string; substation: string; equipment: string; bay: string;
  claimedQty: string; approvedQty: string; inspector: string; date: string; status: string;
}

const INITIAL_LINE_JMCS: LineJMC[] = [];

const INITIAL_SUBSTATION_JMCS: SubstationJMC[] = [];

const analyticsData = [
  { month: 'Jul 2026', Claimed: 45, Approved: 40 },
  { month: 'Aug 2026', Claimed: 52, Approved: 50 },
  { month: 'Sep 2026', Claimed: 38, Approved: 12 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function JMCList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [activeTab, setActiveTab] = useState('line');
  const [lineJMCs, setLineJMCs] = usePersistentState<LineJMC[]>('epc_line_jmcs', INITIAL_LINE_JMCS);
  const [substationJMCs, setSubstationJMCs] = usePersistentState<SubstationJMC[]>('epc_substation_jmcs', INITIAL_SUBSTATION_JMCS);
  const [editLineRow, setEditLineRow] = useState<LineJMC | null>(null);
  const [editSubRow, setEditSubRow] = useState<SubstationJMC | null>(null);
  const [deleteLineRow, setDeleteLineRow] = useState<LineJMC | null>(null);
  const [deleteSubRow, setDeleteSubRow] = useState<SubstationJMC | null>(null);

  const confirmDeleteLine = () => {
    if (!deleteLineRow) return;
    setLineJMCs(prev => prev.filter(r => r !== deleteLineRow));
    setDeleteLineRow(null);
  };
  const confirmDeleteSub = () => {
    if (!deleteSubRow) return;
    setSubstationJMCs(prev => prev.filter(r => r !== deleteSubRow));
    setDeleteSubRow(null);
  };

  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newLineForm, setNewLineForm] = useState<Partial<LineJMC>>({
    project: '', segment: 'Seg 1 (0-15km)', periodFrom: '2026-10-01', periodTo: '2026-10-15',
    activity: 'Erection', claimedQty: '5 Nos', inspector: 'Client AE', status: 'Submitted'
  });
  const [newSubForm, setNewSubForm] = useState<Partial<SubstationJMC>>({
    project: '', substation: '400kV Switchyard', equipment: 'Transformers', bay: 'Bay 1',
    claimedQty: '1 No', inspector: 'Client SE', status: 'Prepared'
  });

  const handleCreateJMC = () => {
    const defaultProj = storedProjects[0]?.name || 'Transmission Project';
    if (activeTab === 'substation') {
      const nextId = `JMC-S-0${substationJMCs.length + 1}`;
      const newSub: SubstationJMC = {
        id: nextId,
        project: newSubForm.project || defaultProj,
        substation: newSubForm.substation || '400kV Switchyard',
        equipment: newSubForm.equipment || 'Equipment',
        bay: newSubForm.bay || 'Bay 1',
        claimedQty: newSubForm.claimedQty || '1 No',
        approvedQty: '-',
        inspector: newSubForm.inspector || 'Pending',
        date: new Date().toISOString().split('T')[0],
        status: newSubForm.status || 'Prepared'
      };
      setSubstationJMCs([newSub, ...substationJMCs]);
    } else {
      const nextId = `JMC-L-0${lineJMCs.length + 1}`;
      const newLine: LineJMC = {
        id: nextId,
        project: newLineForm.project || defaultProj,
        segment: newLineForm.segment || 'Seg 1 (0-15km)',
        periodFrom: newLineForm.periodFrom || '2026-10-01',
        periodTo: newLineForm.periodTo || '2026-10-15',
        activity: newLineForm.activity || 'Foundation',
        claimedQty: newLineForm.claimedQty || '5 Nos',
        approvedQty: '-',
        inspector: newLineForm.inspector || 'Pending',
        date: new Date().toISOString().split('T')[0],
        status: newLineForm.status || 'Submitted'
      };
      setLineJMCs([newLine, ...lineJMCs]);
    }
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Joint Measurement Certificates (JMC)" 
        description="Line and Substation JMCs triggering Service Billing (BRD §4.6)"
        action={
          canCreate ? (
            <Button onClick={() => setShowNewModal(true)} className="flex items-center gap-2">
              + Create JMC
            </Button>
          ) : undefined
        } 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-xs text-slate-500 font-medium">Total JMCs Submitted</p>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2">24 <FileText size={18} className="text-slate-400"/></div>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-xs text-slate-500 font-medium">Client Approved</p>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2 text-green-600">18 <CheckCircle2 size={18}/></div>
        </Card>
        <Card className="p-4 flex flex-col justify-center border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-700 font-medium">Pending Approval</p>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2 text-amber-600">5 <FileSignature size={18}/></div>
        </Card>
        <Card className="p-4 flex flex-col justify-center border-red-200 bg-red-50">
          <p className="text-xs text-red-700 font-medium">Disputed</p>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2 text-red-600">1 <AlertCircle size={18}/></div>
        </Card>
      </div>

      <Tabs tabs={[
        { id: 'line', label: 'Transmission Line JMCs' },
        { id: 'substation', label: 'Substation JMCs' },
        { id: 'analytics', label: 'Approval Analytics' }
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'line' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['JMC No.','Project','Segment','Period','Activity','Claimed','Approved','Inspector','Date','Status', ...(canUpdate||canRemove?['Actions']:[])].map(h => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineJMCs.map(j => (
                <tr key={j.id} className={`hover:bg-slate-50 ${j.status === 'Disputed' ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{j.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{j.project}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{j.segment}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">{j.periodFrom}<br/>to {j.periodTo}</td>
                  <td className="px-4 py-3 text-xs font-medium">{j.activity}</td>
                  <td className="px-4 py-3 text-xs font-bold">{j.claimedQty}</td>
                  <td className={`px-4 py-3 text-xs font-bold ${j.approvedQty !== '-' && j.approvedQty !== j.claimedQty ? 'text-red-600' : 'text-green-600'}`}>{j.approvedQty}</td>
                  <td className="px-4 py-3 text-xs">{j.inspector}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{j.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={j.status === 'Client Approved' ? 'success' : j.status === 'Disputed' ? 'danger' : 'secondary' as any}>{j.status}</Badge>
                  </td>
                  {(canUpdate || canRemove) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button onClick={() => setEditLineRow(j)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {canRemove && (
                          <button onClick={() => setDeleteLineRow(j)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'substation' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['JMC No.','Project','Substation','Equipment','Bay','Claimed','Approved','Inspector','Date','Status', ...(canUpdate||canRemove?['Actions']:[])].map(h => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {substationJMCs.map(j => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{j.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{j.project}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{j.substation}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{j.equipment}</td>
                  <td className="px-4 py-3 text-xs font-medium">{j.bay}</td>
                  <td className="px-4 py-3 text-xs font-bold">{j.claimedQty}</td>
                  <td className="px-4 py-3 text-xs font-bold text-green-600">{j.approvedQty}</td>
                  <td className="px-4 py-3 text-xs">{j.inspector}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{j.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={j.status === 'Client Approved' ? 'success' : 'secondary' as any}>{j.status}</Badge>
                  </td>
                  {(canUpdate || canRemove) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button onClick={() => setEditSubRow(j)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {canRemove && (
                          <button onClick={() => setDeleteSubRow(j)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Claimed vs Approved Value (₹Cr)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData} margin={{top:10, right:10, left:-20, bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize: 11}}/>
              <YAxis tick={{fontSize: 11}}/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="Claimed" fill="#94a3b8" radius={[2,2,0,0]} barSize={40} />
              <Bar dataKey="Approved" fill="#10b981" radius={[2,2,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Edit Line JMC Modal */}
      {editLineRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit JMC</h3>
              <button onClick={() => setEditLineRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">JMC No.</label>
                <input defaultValue={editLineRow.id} readOnly className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={editLineRow.project} 
                    onChange={e => setEditLineRow({ ...editLineRow, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Activity</label>
                <input 
                  value={editLineRow.activity} 
                  onChange={e => setEditLineRow({ ...editLineRow, activity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Claimed Qty</label>
                <input 
                  value={editLineRow.claimedQty} 
                  onChange={e => setEditLineRow({ ...editLineRow, claimedQty: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select 
                  value={editLineRow.status} 
                  onChange={e => setEditLineRow({ ...editLineRow, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option>Client Approved</option>
                  <option>Submitted</option>
                  <option>Disputed</option>
                  <option>Prepared</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
            <button onClick={() => setEditLineRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button 
              onClick={() => {
                setLineJMCs(prev => prev.map(r => r.id === editLineRow.id ? editLineRow : r));
                setEditLineRow(null);
              }} 
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Edit Substation JMC Modal */}
      {editSubRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Substation JMC — {editSubRow.id}</h3>
              <button onClick={() => setEditSubRow(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">JMC No.</label>
                <input value={editSubRow.id} readOnly className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={editSubRow.project} 
                    onChange={e => setEditSubRow({ ...editSubRow, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Substation</label>
                  <input 
                    value={editSubRow.substation} 
                    onChange={e => setEditSubRow({ ...editSubRow, substation: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select 
                  value={editSubRow.status} 
                  onChange={e => setEditSubRow({ ...editSubRow, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option>Client Approved</option>
                  <option>Submitted</option>
                  <option>Prepared</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setEditSubRow(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => {
                  setSubstationJMCs(prev => prev.map(r => r.id === editSubRow.id ? editSubRow : r));
                  setEditSubRow(null);
                }} 
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New JMC Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">
                Create {activeTab === 'substation' ? 'Substation' : 'Transmission Line'} JMC
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {activeTab === 'substation' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                      <select 
                        value={newSubForm.project || (storedProjects[0]?.name || '')}
                        onChange={e => setNewSubForm({ ...newSubForm, project: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {storedProjects.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                        ))}
                        {storedProjects.length === 0 && <option value="">No projects available</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Substation *</label>
                      <input 
                        type="text"
                        value={newSubForm.substation}
                        onChange={e => setNewSubForm({ ...newSubForm, substation: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Equipment</label>
                      <input 
                        type="text"
                        value={newSubForm.equipment}
                        onChange={e => setNewSubForm({ ...newSubForm, equipment: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Claimed Qty</label>
                      <input 
                        type="text"
                        value={newSubForm.claimedQty}
                        onChange={e => setNewSubForm({ ...newSubForm, claimedQty: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                      <select 
                        value={newLineForm.project || (storedProjects[0]?.name || '')}
                        onChange={e => setNewLineForm({ ...newLineForm, project: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {storedProjects.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                        ))}
                        {storedProjects.length === 0 && <option value="">No projects available</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Segment *</label>
                      <input 
                        type="text"
                        value={newLineForm.segment}
                        onChange={e => setNewLineForm({ ...newLineForm, segment: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Activity</label>
                      <input 
                        type="text"
                        value={newLineForm.activity}
                        onChange={e => setNewLineForm({ ...newLineForm, activity: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Claimed Qty</label>
                      <input 
                        type="text"
                        value={newLineForm.claimedQty}
                        onChange={e => setNewLineForm({ ...newLineForm, claimedQty: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateJMC} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Create JMC</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteLineRow}
        recordName={deleteLineRow?.id ?? 'this record'}
        recordType="JMC"
        onConfirm={confirmDeleteLine}
        onCancel={() => setDeleteLineRow(null)}
      />
      <ConfirmDeleteDialog
        open={!!deleteSubRow}
        recordName={deleteSubRow?.id ?? 'this record'}
        recordType="JMC"
        onConfirm={confirmDeleteSub}
        onCancel={() => setDeleteSubRow(null)}
      />
    </div>
  );
}
