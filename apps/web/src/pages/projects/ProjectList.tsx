import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RAGIndicator } from '../../components/ui/RAGIndicator';
import { Card } from '../../components/ui/Card';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Search, Filter, Plus, Pencil, Trash2, X, Eye } from 'lucide-react';

import { usePersistentState } from '../../hooks/usePersistentState';

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  stage: string;
  health: string;
  completion: number;
  value: string;
  date: string;
}

export const INITIAL_PROJECTS: Project[] = [];

export default function ProjectList() {
  const navigate = useNavigate();
  const { canCreate, canUpdate, canRemove } = usePermission('4.1');
  const [projects, setProjects] = usePersistentState<Project[]>('epc_projects', INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [clientFilter, setClientFilter] = useState('All Clients');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // Modal States
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    client: '',
    type: 'Type A',
    stage: 'S0: Tendering',
    health: 'green',
    completion: 0,
    value: '₹100.0 Cr',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  const [editRow, setEditRow] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Project | null>(null);
  const [deleteRow, setDeleteRow] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toLowerCase().includes(search.toLowerCase()) ||
                          p.client.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'All Stages' || p.stage.includes(stageFilter.split(':')[0]);
    const matchesClient = clientFilter === 'All Clients' || p.client === clientFilter;
    const matchesType = typeFilter === 'All Types' || p.type === typeFilter;
    return matchesSearch && matchesStage && matchesClient && matchesType;
  });

  const handleOpenEdit = (proj: Project) => {
    setEditRow(proj);
    setEditForm({ ...proj });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setProjects(prev => prev.map(p => p.id === editForm.id ? editForm : p));
    setEditRow(null);
    setEditForm(null);
  };

  const handleCreateProject = () => {
    if (!newProject.name?.trim()) return;
    const year = new Date().getFullYear();
    const nextNum = projects.length + 1;
    const newId = `BID-${year}-${String(nextNum).padStart(3, '0')}`;
    const created: Project = {
      id: newId,
      name: newProject.name.trim(),
      client: newProject.client?.trim() || 'Client',
      type: newProject.type || 'Type A',
      stage: newProject.stage || 'S0: Tendering',
      health: newProject.health || 'green',
      completion: Number(newProject.completion) || 0,
      value: newProject.value || '₹50.0 Cr',
      date: newProject.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setProjects([created, ...projects]);
    setShowNewModal(false);
    setNewProject({
      name: '',
      client: '',
      type: 'Type A',
      stage: 'S0: Tendering',
      health: 'green',
      completion: 0,
      value: '₹100.0 Cr',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  };

  const handleDelete = (row: Project) => setDeleteRow(row);
  const confirmDelete = () => {
    if (!deleteRow) return;
    setProjects(prev => prev.filter(r => r.id !== deleteRow.id));
    setDeleteRow(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Projects" />
        {canCreate && (
          <Button 
            onClick={() => setShowNewModal(true)} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-4 items-center bg-white">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects by name, BID ID or client..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <select 
            value={stageFilter} 
            onChange={e => setStageFilter(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Stages</option>
            <option>S0: Tendering</option>
            <option>S1: Pre-Award</option>
            <option>S2: Planning</option>
            <option>S3: Manufacturing</option>
            <option>S4: Procurement</option>
            <option>S5: Installation</option>
            <option>S6: Commissioning</option>
            <option>S7: Handover</option>
          </select>
          <select 
            value={clientFilter} 
            onChange={e => setClientFilter(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Clients</option>
            <option>NTPC</option>
            <option>PGCIL</option>
            <option>IndiGrid</option>
            <option>MSETCL</option>
            <option>MPPTCL</option>
            <option>UPPTCL</option>
            <option>KPTCL</option>
            <option>OPTCL</option>
            <option>TANTRANSCO</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Types</option>
            <option>Type A</option>
            <option>Type B</option>
            <option>Type C</option>
            <option>Type D</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">BID ID</th>
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Contract Value</th>
                <th className="px-4 py-3">Award Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => (
                <tr 
                  key={proj.id} 
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4 font-medium text-indigo-600">{proj.id}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{proj.name}</td>
                  <td className="px-4 py-4 text-slate-600">{proj.client}</td>
                  <td className="px-4 py-4"><Badge variant="outline">{proj.type}</Badge></td>
                  <td className="px-4 py-4"><Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">{proj.stage}</Badge></td>
                  <td className="px-4 py-4"><RAGIndicator status={proj.health as any} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${proj.completion}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500">{proj.completion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">{proj.value}</td>
                  <td className="px-4 py-4 text-slate-500">{proj.date}</td>
                  <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Eye size={13} /> View
                      </Button>
                      {canUpdate && (
                        <button 
                          onClick={() => handleOpenEdit(proj)} 
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" 
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {canRemove && (
                        <button 
                          onClick={() => handleDelete(proj)} 
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Add New Project Master</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Adani Khavda 765kV D/C Transmission Line"
                  value={newProject.name || ''} 
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Adani / PGCIL / NTPC"
                    value={newProject.client || ''} 
                    onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project Type</label>
                  <select 
                    value={newProject.type} 
                    onChange={e => setNewProject({ ...newProject, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Type A</option>
                    <option>Type B</option>
                    <option>Type C</option>
                    <option>Type D</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stage</label>
                  <select 
                    value={newProject.stage} 
                    onChange={e => setNewProject({ ...newProject, stage: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>S0: Tendering</option>
                    <option>S1: Pre-Award</option>
                    <option>S2: Planning</option>
                    <option>S3: Manufacturing</option>
                    <option>S4: Procurement</option>
                    <option>S5: Installation</option>
                    <option>S6: Commissioning</option>
                    <option>S7: Handover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Health Status</label>
                  <select 
                    value={newProject.health} 
                    onChange={e => setNewProject({ ...newProject, health: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="green">Green (Healthy)</option>
                    <option value="amber">Amber (Warning)</option>
                    <option value="red">Red (Critical)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contract Value</label>
                  <input 
                    type="text"
                    placeholder="e.g. ₹185.0 Cr"
                    value={newProject.value || ''} 
                    onChange={e => setNewProject({ ...newProject, value: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Initial Completion (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.completion} 
                    onChange={e => setNewProject({ ...newProject, completion: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button 
                onClick={() => setShowNewModal(false)} 
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject} 
                disabled={!newProject.name?.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editRow && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-base">Edit Project — {editForm.id}</h3>
              <button onClick={() => { setEditRow(null); setEditForm(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project Name</label>
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client</label>
                  <input 
                    value={editForm.client} 
                    onChange={e => setEditForm({ ...editForm, client: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stage</label>
                  <select 
                    value={editForm.stage} 
                    onChange={e => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>S0: Tendering</option>
                    <option>S1: Pre-Award</option>
                    <option>S2: Planning</option>
                    <option>S3: Manufacturing</option>
                    <option>S4: Procurement</option>
                    <option>S5: Installation</option>
                    <option>S6: Commissioning</option>
                    <option>S7: Handover</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contract Value</label>
                  <input 
                    value={editForm.value} 
                    onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Completion (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={editForm.completion} 
                    onChange={e => setEditForm({ ...editForm, completion: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Health Status</label>
                <select 
                  value={editForm.health} 
                  onChange={e => setEditForm({ ...editForm, health: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="green">Green (Healthy)</option>
                  <option value="amber">Amber (Warning)</option>
                  <option value="red">Red (Critical)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200 bg-slate-50">
              <button 
                onClick={() => { setEditRow(null); setEditForm(null); }} 
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteRow}
        recordName={deleteRow?.name ?? deleteRow?.id ?? 'this record'}
        recordType="Project"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}
