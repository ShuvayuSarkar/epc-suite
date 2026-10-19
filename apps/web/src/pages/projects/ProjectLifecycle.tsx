import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Project } from './ProjectList';

const ALL_STAGES = [
  { id: 'S0', code: 'S0', name: 'Tendering / Bidding', desc: 'Bid submission, cost estimation, and initial proposal' },
  { id: 'S1', code: 'S1', name: 'Award Receipt', desc: 'LOA receipt, acceptance letter, contract kick-off' },
  { id: 'S2', code: 'S2', name: 'Golden Period', desc: 'Route survey, vendor finalization, and statutory clearance' },
  { id: 'S3', code: 'S3', name: 'Manufacturing', desc: 'Factory manufacturing, type testing, and clearance' },
  { id: 'S4', code: 'S4', name: 'Procurement', desc: 'PO issuance, dispatch, and central store receipt' },
  { id: 'S5', code: 'S5', name: 'Installation', desc: 'Foundation, tower erection, and stringing operations' },
  { id: 'S6', code: 'S6', name: 'Commissioning', desc: 'Pre-commissioning, testing, and charging' },
  { id: 'S7', code: 'S7', name: 'Billing & Handover', desc: 'Final invoice, retention release, and DLP handover' },
];

export default function ProjectLifecycle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projects] = usePersistentState<Project[]>('epc_projects', []);
  const project = projects.find(p => p.id === id);

  // Extract stage index (0 to 7)
  const currentStageCode = project?.stage ? (project.stage.match(/S[0-7]/i)?.[0]?.toUpperCase() || 'S5') : 'S5';
  const stageNum = parseInt(currentStageCode.replace('S', ''), 10) || 5;

  const dynamicStages = ALL_STAGES.map((s, idx) => {
    let status: 'completed' | 'current' | 'pending' = 'pending';
    if (idx < stageNum) status = 'completed';
    else if (idx === stageNum) status = 'current';
    return { ...s, status };
  });

  const projectName = project ? project.name : (id || 'Project');
  const projectClient = project ? project.client : 'Client';
  const projectStage = project ? project.stage : 'S5: Installation';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(id ? `/projects/${id}` : '/projects')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border-slate-300"
          >
            <ArrowLeft size={15}/> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Lifecycle — {projectName}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Project Code: <span className="font-mono font-medium text-indigo-600">{id || '—'}</span> &bull; Client: <span className="font-medium text-slate-700">{projectClient}</span> &bull; Active Stage: <span className="font-medium text-indigo-700">{projectStage}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(id ? `/projects/${id}` : '/projects')}>
          View Project Master
        </Button>
      </div>
      
      {/* Visual Flowchart */}
      <Card className="p-8 overflow-x-auto">
        <div className="flex items-center min-w-max pb-4">
          {dynamicStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <div 
                className={`relative flex flex-col items-center justify-center w-36 h-28 rounded-lg border-2 p-2 transition-all ${
                  stage.status === 'completed' ? 'bg-green-50 border-green-500 text-green-700' :
                  stage.status === 'current' ? 'bg-indigo-600 border-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' :
                  'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {stage.status === 'completed' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-green-600" />}
                {stage.status === 'current' && <Clock size={16} className="absolute top-2 right-2 text-indigo-200 animate-pulse" />}
                <span className="font-bold text-lg">{stage.id}</span>
                <span className="text-xs font-semibold text-center mt-1 line-clamp-2">{stage.name}</span>
                <Badge variant="outline" className={`text-[10px] mt-1 py-0 px-1 border-0 ${
                  stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                  stage.status === 'current' ? 'bg-white text-indigo-900 font-bold' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {stage.status === 'completed' ? 'Done' : stage.status === 'current' ? 'Active' : 'Pending'}
                </Badge>
              </div>

              {/* Arrow */}
              {idx < dynamicStages.length - 1 && (
                <div className="w-10 flex items-center justify-center">
                  <ArrowRight className={`w-5 h-5 ${stage.status === 'completed' ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Stage Panel */}
        <Card className="p-6 lg:col-span-1 border-l-4 border-l-indigo-600 bg-indigo-50/30">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Current Active Stage</h3>
          <p className="text-indigo-700 font-bold text-sm mb-4">{projectStage}</p>
          <p className="text-sm text-slate-600 mb-6">
            {ALL_STAGES[stageNum]?.desc || 'Project execution and milestone tracking.'}
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stage Status</h4>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
                Stage {currentStageCode} &bull; {project?.completion || 0}% Complete
              </Badge>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">Contract Value Under Execution</span>
              <span className="text-lg font-bold text-slate-900">{project?.value || '—'}</span>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-500 block mb-1">Health Indicator</span>
              <Badge variant={project?.health === 'red' ? 'danger' : project?.health === 'amber' ? 'warning' : 'success'}>
                {String(project?.health || 'green').toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Lifecycle Milestones */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lifecycle Milestones for {projectName}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Milestone Scope</th>
                  <th className="px-4 py-3">Lifecycle State</th>
                  <th className="px-4 py-3">Target / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dynamicStages.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">{st.id}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{st.name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{st.desc}</td>
                    <td className="px-4 py-3.5">
                      {st.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12}/> Completed
                        </span>
                      )}
                      {st.status === 'current' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          <Clock size={12}/> In Execution
                        </span>
                      )}
                      {st.status === 'pending' && (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
