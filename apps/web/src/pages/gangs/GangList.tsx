import React, { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Users, Fingerprint, MapPin, Award, CheckCircle2, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// BRD Stage 5 (5.1 - 5.4) Gang Mobilization, Biometric, Geofencing, Skill Cert
interface Gang {
  id: string; name: string; project: string; type: string; supervisor: string;
  size: number; biometricPct: number; geofenceStatus: string; skillCertPct: number; status: string;
}
interface Member {
  id: string; name: string; gangId: string; role: string; biometric: boolean;
  skillId: string; skillValid: boolean; geofence: string;
}

const INITIAL_GANGS: Gang[] = [];

const INITIAL_MEMBERS: Member[] = [];

const chartData = [
  { gang: 'G-01', biometric: 100, skill: 100 },
  { gang: 'G-02', biometric: 92, skill: 100 },
  { gang: 'G-03', biometric: 60, skill: 75 },
  { gang: 'G-04', biometric: 100, skill: 100 },
  { gang: 'G-05', biometric: 0, skill: 50 },
];

import { usePersistentState } from '../../hooks/usePersistentState';

export default function GangList() {
  const { canCreate, canUpdate, canRemove } = usePermission('4.3');
  const [activeTab, setActiveTab] = useState('gangs');
  const [gangs, setGangs] = usePersistentState<Gang[]>('epc_gangs', INITIAL_GANGS);
  const [members, setMembers] = usePersistentState<Member[]>('epc_gang_members', INITIAL_MEMBERS);
  const [editGang, setEditGang] = useState<Gang | null>(null);
  const [deleteGang, setDeleteGang] = useState<Gang | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const confirmDeleteGang = () => {
    if (!deleteGang) return;
    setGangs(prev => prev.filter(r => r !== deleteGang));
    setDeleteGang(null);
  };
  const confirmDeleteMember = () => {
    if (!deleteMember) return;
    setMembers(prev => prev.filter(r => r !== deleteMember));
    setDeleteMember(null);
  };

  const [storedProjects] = usePersistentState<any[]>('epc_projects', []);
  const [showMobilizeModal, setShowMobilizeModal] = useState(false);
  const [newGangForm, setNewGangForm] = useState<Partial<Gang>>({
    name: '',
    project: '',
    type: 'Stringing',
    supervisor: 'Sunil Kumar',
    size: 14,
    biometricPct: 90,
    geofenceStatus: 'Inside',
    skillCertPct: 95,
    status: 'Active'
  });

  const handleMobilizeGang = () => {
    if (!newGangForm.name) return;
    const nextId = `GANG-0${gangs.length + 1}`;
    const selectedProj = newGangForm.project || storedProjects[0]?.name || 'Transmission Project';
    const newGang: Gang = {
      id: nextId,
      name: newGangForm.name,
      project: selectedProj,
      type: newGangForm.type || 'Stringing',
      supervisor: newGangForm.supervisor || 'Site Lead',
      size: Number(newGangForm.size) || 12,
      biometricPct: Number(newGangForm.biometricPct) || 85,
      geofenceStatus: newGangForm.geofenceStatus || 'Inside',
      skillCertPct: Number(newGangForm.skillCertPct) || 90,
      status: newGangForm.status || 'Active'
    };
    setGangs([newGang, ...gangs]);
    setShowMobilizeModal(false);
    setNewGangForm({
      name: '',
      project: storedProjects[0]?.name || '',
      type: 'Stringing',
      supervisor: 'Sunil Kumar',
      size: 14,
      biometricPct: 90,
      geofenceStatus: 'Inside',
      skillCertPct: 95,
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gang Mobilization & Tracking (BRD §4.6)" 
        description="Gang composition · Biometric attendance · Geofencing · Skill certification"
        action={
          canCreate ? (
            <Button onClick={() => setShowMobilizeModal(true)} className="flex items-center gap-2">
              + Mobilize Gang
            </Button>
          ) : undefined
        } 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={18}/></div>
          <div><p className="text-xs text-slate-500">Total Gangs</p><p className="text-xl font-bold">{gangs.length}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Fingerprint size={18}/></div>
          <div><p className="text-xs text-slate-500">Biometric Compliance</p><p className="text-xl font-bold text-green-600">85%</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><MapPin size={18}/></div>
          <div><p className="text-xs text-slate-500">Geofence Alerts</p><p className="text-xl font-bold text-amber-600">1</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Award size={18}/></div>
          <div><p className="text-xs text-slate-500">Skill Cert Compliance</p><p className="text-xl font-bold">90%</p></div>
        </Card>
      </div>

      <Tabs tabs={[
        { id: 'gangs', label: 'Gang Register' },
        { id: 'members', label: 'Member Roster & Skills' },
        { id: 'analytics', label: 'Compliance Analytics' }
      ]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'gangs' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Gang ID','Name','Project','Type','Supervisor','Size','Biometric %','Geofence','Skill Cert %','Status', ...(canUpdate||canRemove?['Actions']:[])].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gangs.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs text-indigo-600">{g.id}</td>
                  <td className="px-3 py-3 text-xs font-semibold">{g.name}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{g.project}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{g.type}</td>
                  <td className="px-3 py-3 text-xs">{g.supervisor}</td>
                  <td className="px-3 py-3 text-xs">{g.size}</td>
                  <td className={`px-3 py-3 text-xs font-bold ${g.biometricPct < 100 ? 'text-amber-600' : 'text-green-600'}`}>{g.biometricPct}%</td>
                  <td className="px-3 py-3">
                    <Badge variant={g.geofenceStatus === 'Inside' ? 'success' : g.geofenceStatus === 'Out of Bounds' ? 'danger' : 'secondary' as any}>{g.geofenceStatus}</Badge>
                  </td>
                  <td className={`px-3 py-3 text-xs font-bold ${g.skillCertPct < 100 ? 'text-amber-600' : 'text-green-600'}`}>{g.skillCertPct}%</td>
                  <td className="px-3 py-3">
                    <Badge variant={g.status === 'Active' ? 'success' : g.status === 'Warning' ? 'warning' : 'secondary' as any}>{g.status}</Badge>
                  </td>
                  {(canUpdate || canRemove) && (
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button onClick={() => setEditGang(g)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {canRemove && (
                          <button onClick={() => setDeleteGang(g)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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

      {activeTab === 'members' && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Emp ID','Name','Gang ID','Role','Biometric Enrolled','Skill Cert ID','Cert Valid','Live Geofence', ...(canUpdate||canRemove?['Actions']:[])].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs">{m.id}</td>
                  <td className="px-3 py-3 text-xs font-medium">{m.name}</td>
                  <td className="px-3 py-3 text-xs text-indigo-600">{m.gangId}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{m.role}</td>
                  <td className="px-3 py-3">
                    {m.biometric ? <CheckCircle2 size={16} className="text-green-600"/> : <AlertCircle size={16} className="text-red-600"/>}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{m.skillId}</td>
                  <td className="px-3 py-3">
                    {m.skillValid ? <Badge variant="success">Valid</Badge> : <Badge variant="danger">Expired</Badge>}
                  </td>
                  <td className={`px-3 py-3 text-xs font-semibold ${m.geofence === 'Inside' ? 'text-green-600' : 'text-red-600'}`}>{m.geofence}</td>
                  {(canUpdate || canRemove) && (
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button onClick={() => setEditMember(m)} className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {canRemove && (
                          <button onClick={() => setDeleteMember(m)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Compliance by Gang (Biometric & Skill Cert)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{top:10, right:10, left:-20, bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="gang" tick={{fontSize: 11}}/>
              <YAxis tick={{fontSize: 11}}/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="biometric" name="Biometric %" fill="#6366f1" radius={[2,2,0,0]}/>
              <Bar dataKey="skill" name="Skill Cert %" fill="#10b981" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Edit Gang Modal */}
      {editGang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Gang — {editGang.id}</h3>
              <button onClick={() => setEditGang(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gang Name</label>
                  <input 
                    value={editGang.name} 
                    onChange={e => setEditGang({ ...editGang, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Supervisor</label>
                  <input 
                    value={editGang.supervisor} 
                    onChange={e => setEditGang({ ...editGang, supervisor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
                  <input 
                    value={editGang.project} 
                    onChange={e => setEditGang({ ...editGang, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select 
                    value={editGang.status} 
                    onChange={e => setEditGang({ ...editGang, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option>Active</option>
                    <option>Warning</option>
                    <option>Mobilizing</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setEditGang(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => {
                  setGangs(prev => prev.map(g => g.id === editGang.id ? editGang : g));
                  setEditGang(null);
                }} 
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Member — {editMember.name}</h3>
              <button onClick={() => setEditMember(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input 
                    value={editMember.name} 
                    onChange={e => setEditMember({ ...editMember, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                  <input 
                    value={editMember.role} 
                    onChange={e => setEditMember({ ...editMember, role: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gang ID</label>
                <input 
                  value={editMember.gangId} 
                  onChange={e => setEditMember({ ...editMember, gangId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setEditMember(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => {
                  setMembers(prev => prev.map(m => m.id === editMember.id ? editMember : m));
                  setEditMember(null);
                }} 
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobilize Gang Modal */}
      {showMobilizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Mobilize New Gang</h3>
              <button onClick={() => setShowMobilizeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gang Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Gang Delta - Tower Erection"
                  value={newGangForm.name} 
                  onChange={e => setNewGangForm({ ...newGangForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                  <select 
                    value={newGangForm.project || (storedProjects[0]?.name || '')} 
                    onChange={e => setNewGangForm({ ...newGangForm, project: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  >
                    {storedProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                    ))}
                    {storedProjects.length === 0 && <option value="">No projects available</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    value={newGangForm.type} 
                    onChange={e => setNewGangForm({ ...newGangForm, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Foundation</option>
                    <option>Tower Erection</option>
                    <option>Stringing</option>
                    <option>Cabling</option>
                    <option>Testing & Commissioning</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Supervisor</label>
                  <input 
                    type="text" 
                    value={newGangForm.supervisor} 
                    onChange={e => setNewGangForm({ ...newGangForm, supervisor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Crew Size</label>
                  <input 
                    type="number" 
                    value={newGangForm.size} 
                    onChange={e => setNewGangForm({ ...newGangForm, size: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowMobilizeModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleMobilizeGang} disabled={!newGangForm.name?.trim()} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Mobilize Gang</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteGang}
        recordName={deleteGang?.name ?? 'this record'}
        recordType="Gang"
        onConfirm={confirmDeleteGang}
        onCancel={() => setDeleteGang(null)}
      />
      <ConfirmDeleteDialog
        open={!!deleteMember}
        recordName={deleteMember?.name ?? 'this record'}
        recordType="Member"
        onConfirm={confirmDeleteMember}
        onCancel={() => setDeleteMember(null)}
      />
    </div>
  );
}
