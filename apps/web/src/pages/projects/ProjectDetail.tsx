import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { RAGIndicator } from '../../components/ui/RAGIndicator';
import { usePermission } from '../../hooks/usePermission';
import { 
  IndianRupee, Clock, AlertCircle, FileText, CheckCircle2, Download, 
  Edit2, X, ArrowLeft, ArrowRight, Calendar, Users, Briefcase, FileCheck, DollarSign
} from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Project } from './ProjectList';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate } = usePermission('4.1');
  const [activeTab, setActiveTab] = useState('Overview');

  // Load master project collection from persistent state / Supabase
  const [projects, setProjects] = usePersistentState<Project[]>('epc_projects', []);
  const activeProject = projects.find(p => p.id === id);

  // Load supplementary module collections for dynamic tab integration
  const [employees] = usePersistentState<any[]>('epc_employees', []);
  const [bills] = usePersistentState<any[]>('epc_bills', []);
  const [invoices] = usePersistentState<any[]>('epc_invoices', []);
  const [rfis] = usePersistentState<any[]>('epc_rfis', []);
  const [hotspots] = usePersistentState<any[]>('epc_hotspots', []);
  const [docs] = usePersistentState<any[]>('epc_engineering_docs', []);

  // Compute baseline properties directly from activeProject
  const currentTitle = activeProject?.name || (id ? `Project ${id}` : 'Transmission Project');
  const currentClient = activeProject?.client || 'APAR Utility Client';
  const currentStage = activeProject?.stage || 'S0: Tendering';
  const currentType = activeProject?.type || 'Type A (Turnkey)';
  const currentValue = activeProject?.value || '₹100.0 Cr';
  const currentCompletion = activeProject?.completion !== undefined ? activeProject.completion : 50;
  const currentDate = activeProject?.date || 'Today';

  const defaultDetail = {
    title: currentTitle,
    client: currentClient,
    stage: currentStage,
    projectType: currentType,
    contractNumber: `EPC/${id || 'PRJ'}/2024`,
    contractValue: currentValue,
    completion: currentCompletion,
    awardDate: currentDate,
    l0Finish: '31 Dec 2026',
    l2Finish: '15 Nov 2026'
  };

  const [projectDetail, setProjectDetail] = usePersistentState(`epc_project_detail_${id || 'default'}`, defaultDetail);

  // Sync whenever activeProject is fetched or changed
  useEffect(() => {
    if (activeProject) {
      setProjectDetail(prev => ({
        ...prev,
        title: activeProject.name,
        client: activeProject.client,
        stage: activeProject.stage,
        projectType: activeProject.type || prev.projectType,
        contractValue: activeProject.value || prev.contractValue,
        completion: activeProject.completion !== undefined ? activeProject.completion : prev.completion,
        awardDate: activeProject.date || prev.awardDate,
      }));
    }
  }, [activeProject, id]);

  // Derived project information with activeProject taking highest precedence
  const projectInfo = {
    title: activeProject?.name || projectDetail.title || currentTitle,
    client: activeProject?.client || projectDetail.client || currentClient,
    stage: activeProject?.stage || projectDetail.stage || currentStage,
    projectType: activeProject?.type || projectDetail.projectType || currentType,
    contractNumber: projectDetail.contractNumber || `EPC/${id}/2024`,
    contractValue: activeProject?.value || projectDetail.contractValue || currentValue,
    completion: activeProject?.completion !== undefined ? activeProject.completion : (projectDetail.completion ?? currentCompletion),
    awardDate: activeProject?.date || projectDetail.awardDate || currentDate,
    l0Finish: projectDetail.l0Finish || '31 Dec 2026',
    l2Finish: projectDetail.l2Finish || '15 Nov 2026'
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(projectInfo);

  // Open edit modal with latest values
  const handleOpenEdit = () => {
    setEditForm({ ...projectInfo });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setProjectDetail(editForm);
    // Sync updates back to master epc_projects list so Supabase database gets updated
    setProjects(prev => prev.map(p => p.id === id ? {
      ...p,
      name: editForm.title,
      client: editForm.client,
      stage: editForm.stage,
      value: editForm.contractValue,
      completion: Number(editForm.completion) || p.completion,
      type: editForm.projectType || p.type
    } : p));
    setShowEditModal(false);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectInfo, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${id}_project_summary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter related items for this project
  const projectRfis = rfis.filter(r => !r.project || r.project.toLowerCase().includes(projectInfo.client.toLowerCase()) || r.project.toLowerCase().includes(projectInfo.title.toLowerCase()));
  const projectHotspots = hotspots.filter(h => !h.project || h.project.toLowerCase().includes(projectInfo.client.toLowerCase()) || h.project.toLowerCase().includes(projectInfo.title.toLowerCase()));
  const projectDocs = docs.filter(d => !d.project || d.project.toLowerCase().includes(projectInfo.client.toLowerCase()) || d.project.toLowerCase().includes(projectInfo.title.toLowerCase()));
  const projectBills = bills.filter(b => !b.project || b.project.toLowerCase().includes(projectInfo.client.toLowerCase()));
  const projectInvoices = invoices.filter(i => !i.client || i.client.toLowerCase().includes(projectInfo.client.toLowerCase()));

  const tabs = ['Overview', 'Timeline', 'Documents', 'Finance', 'Team'];

  const recentActivity = [
    { date: 'Today, 10:30 AM', title: `Inspection Logged for ${projectInfo.client}`, user: 'QA Lead' },
    { date: 'Yesterday, 4:15 PM', title: 'Route Survey GPS Verification Approved', user: 'Survey Team' },
    { date: '12 Oct 2026, 2:00 PM', title: 'Material Dispatch Handover Confirmed', user: 'Store Manager' },
    { date: '10 Oct 2026, 11:45 AM', title: 'Daily Progress Report Submitted', user: 'Site Supervisor' },
  ];

  const STAGES_LIST = [
    { id: 'S0', name: 'Tendering & Bidding', desc: 'Pre-award estimation and BOQ setup', done: true },
    { id: 'S1', name: 'Award Receipt & LOA', desc: 'Contract kick-off and CPBG submission', done: true },
    { id: 'S2', name: 'Golden Period (Survey & Approvals)', desc: 'Route walkover, vendor empanelment & ROW clearance', done: projectInfo.completion >= 25 },
    { id: 'S3', name: 'Manufacturing & FAT', desc: 'Factory inspection, conductor and tower fabrication', done: projectInfo.completion >= 45 },
    { id: 'S4', name: 'Procurement & Logistics', desc: 'PO release, transit dispatch, warehouse staging', done: projectInfo.completion >= 60 },
    { id: 'S5', name: 'Installation Execution', desc: 'Foundation, tower erection, stringing and sagging', done: projectInfo.completion >= 75 },
    { id: 'S6', name: 'Testing & Commissioning', desc: 'T&C pre-checks, punch list clearing, energization', done: projectInfo.completion >= 90 },
    { id: 'S7', name: 'Billing & Commercial Closeout', desc: 'Final invoice certification, retention release, DLP', done: projectInfo.completion >= 98 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border-slate-300"
          >
            <ArrowLeft size={15}/> Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{projectInfo.title}</h1>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">{projectInfo.stage}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Project ID: <span className="font-mono font-medium text-indigo-600">{id}</span> &bull; Client: <span className="font-medium text-slate-700">{projectInfo.client}</span> &bull; Type: <span className="font-medium text-slate-700">{projectInfo.projectType}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/projects/${id}/lifecycle`)}
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 border-indigo-200 bg-indigo-50"
          >
            Lifecycle Flowchart <ArrowRight size={14}/>
          </Button>
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={handleOpenEdit} className="flex items-center gap-2">
              <Edit2 size={15}/> Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
            <Download size={15}/> Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Contract Value" value={projectInfo.contractValue} icon={<IndianRupee className="text-slate-400" size={20} />} />
        <StatsCard title="Completion" value={`${projectInfo.completion}%`} icon={<CheckCircle2 className="text-indigo-500" size={20} />} />
        <StatsCard title="Days Remaining" value="142" icon={<Clock className="text-amber-500" size={20} />} />
        <StatsCard title="Open RFIs" value={String(projectRfis.length || 3)} icon={<FileText className="text-slate-400" size={20} />} />
        <StatsCard title="Open Hotspots" value={String(projectHotspots.length || 2)} icon={<AlertCircle className="text-rose-500" size={20} />} />
        <StatsCard title="Active Invoices" value={String(projectInvoices.length || 4)} icon={<IndianRupee className="text-emerald-500" size={20} />} />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Client</p>
                  <p className="font-medium text-slate-800">{projectInfo.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Project Type</p>
                  <p className="font-medium text-slate-800">{projectInfo.projectType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Contract Number</p>
                  <p className="font-medium text-slate-800">{projectInfo.contractNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Award Date</p>
                  <p className="font-medium text-slate-800">{projectInfo.awardDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">L0 Baseline Finish</p>
                  <p className="font-medium text-slate-800">{projectInfo.l0Finish}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">L2 Baseline Finish</p>
                  <p className="font-medium text-indigo-600">{projectInfo.l2Finish}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      {idx !== recentActivity.length - 1 && <div className="w-0.5 h-full bg-slate-200 ml-1 mt-1"></div>}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{activity.title}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{activity.user}</span>
                        <span>&bull;</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Module Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Engineering</span>
                  <RAGIndicator status="green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Procurement</span>
                  <RAGIndicator status="green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Installation</span>
                  <RAGIndicator status={projectInfo.completion > 60 ? 'green' : 'amber'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Commissioning</span>
                  <RAGIndicator status="green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Quality (QA/QC)</span>
                  <RAGIndicator status="green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Safety (HSE)</span>
                  <RAGIndicator status="green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Finance & Collections</span>
                  <RAGIndicator status="green" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 border-slate-200">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Stage Progression</h4>
              <p className="text-xs text-slate-500 mb-3">Overall milestone completion for this contract:</p>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${projectInfo.completion}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Current: {projectInfo.stage}</span>
                <span>{projectInfo.completion}%</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'Timeline' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Project Stage Milestones</h3>
              <p className="text-sm text-slate-500">Lifecycle execution breakdown from Bidding to Billing</p>
            </div>
            <Button size="sm" onClick={() => navigate(`/projects/${id}/lifecycle`)} className="flex items-center gap-2">
              Open Interactive Lifecycle <ArrowRight size={14}/>
            </Button>
          </div>

          <div className="space-y-4">
            {STAGES_LIST.map((stage, idx) => (
              <div key={stage.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  stage.done ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {stage.done ? <CheckCircle2 size={18}/> : stage.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-sm">{stage.name}</h4>
                    <Badge variant={stage.done ? 'secondary' : 'outline'} className={stage.done ? 'bg-green-50 text-green-700' : ''}>
                      {stage.done ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Documents Tab */}
      {activeTab === 'Documents' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Project Engineering & Contract Documents</h3>
            <Button size="sm" onClick={() => navigate('/engineering-docs')} variant="outline">
              Open Document Control
            </Button>
          </div>
          {projectDocs.length > 0 ? (
            <div className="divide-y divide-slate-200 border rounded-lg overflow-hidden">
              {projectDocs.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileCheck size={20}/>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{doc.title || doc.name || doc.docNo}</p>
                      <p className="text-xs text-slate-500">Doc No: {doc.docNo || doc.id || 'APAR-DOC-001'} &bull; Rev: {doc.revision || 'Rev A'}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{doc.status || 'APPROVED'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileText size={36} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">No engineering documents uploaded yet for this contract.</p>
              <Button size="sm" onClick={() => navigate('/engineering-docs')} className="mt-3">Upload Drawing</Button>
            </div>
          )}
        </Card>
      )}

      {/* Finance Tab */}
      {activeTab === 'Finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Invoices & Collections</h3>
              <Button size="sm" variant="outline" onClick={() => navigate('/collections/invoices')}>View All</Button>
            </div>
            {projectInvoices.length > 0 ? (
              <div className="space-y-3">
                {projectInvoices.slice(0, 5).map((inv, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{inv.id || `INV-${idx+1}`}</p>
                      <p className="text-xs text-slate-500">Due: {inv.dueDate || '30 Days Net'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{inv.amount || '₹12.5 Cr'}</p>
                      <Badge variant="outline" className="text-xs">{inv.status || 'Active'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No client invoices found for this project.</p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Vendor Bills & Commitments</h3>
              <Button size="sm" variant="outline" onClick={() => navigate('/finance/bills')}>View All</Button>
            </div>
            {projectBills.length > 0 ? (
              <div className="space-y-3">
                {projectBills.slice(0, 5).map((bill, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{bill.id || `BILL-${idx+1}`}</p>
                      <p className="text-xs text-slate-500">{bill.vendor || 'Vendor'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{bill.amount || '₹25.0 Lakhs'}</p>
                      <Badge variant="outline" className="text-xs">{bill.status || 'Approved'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No bills recorded for this project.</p>
            )}
          </Card>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'Team' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Project Staff & Personnel</h3>
              <p className="text-sm text-slate-500">Key members assigned to this transmission contract</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/hr')}>
              Manage Workforce
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(employees.length > 0 ? employees.slice(0, 6) : [
              { name: 'Rajesh Kumar', role: 'Project Director', department: 'Management' },
              { name: 'Priya Sharma', role: 'Project Manager', department: 'Projects' },
              { name: 'Vikram Singh', role: 'Lead Design Engineer', department: 'Engineering' },
              { name: 'Deepa Nair', role: 'Quality Inspector', department: 'QA/QC' },
              { name: 'Suresh Yadav', role: 'Gang Supervisor', department: 'Installation' },
              { name: 'Anita Reddy', role: 'Safety HSE Officer', department: 'HSE' },
            ]).map((emp, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex items-center gap-3 bg-white hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                  <p className="text-xs text-indigo-600 font-medium">{emp.designation || emp.role}</p>
                  <p className="text-[11px] text-slate-400">{emp.department}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Edit Project Information</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project Title</label>
                <input
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Client</label>
                  <input
                    value={editForm.client}
                    onChange={e => setEditForm({ ...editForm, client: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Lifecycle Stage</label>
                  <input
                    value={editForm.stage}
                    onChange={e => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contract Value</label>
                  <input
                    value={editForm.contractValue}
                    onChange={e => setEditForm({ ...editForm, contractValue: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Completion (%)</label>
                  <input
                    type="number"
                    value={editForm.completion}
                    onChange={e => setEditForm({ ...editForm, completion: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">L0 Baseline Finish</label>
                  <input
                    value={editForm.l0Finish}
                    onChange={e => setEditForm({ ...editForm, l0Finish: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">L2 Baseline Finish</label>
                  <input
                    value={editForm.l2Finish}
                    onChange={e => setEditForm({ ...editForm, l2Finish: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-200">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
