import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { WorkflowStage, WorkflowStageStatus, ClientApprovalCode } from '../../types/workflow';

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  currentStageIndex: number;
}

const statusIcons: Record<WorkflowStageStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  in_progress: <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />,
  pending: <Clock className="w-5 h-5 text-slate-300" />,
  rejected: <XCircle className="w-5 h-5 text-rose-600" />,
  skipped: <AlertCircle className="w-5 h-5 text-slate-400" />,
};

const approvalCodeBadges: Record<ClientApprovalCode, { label: string; cls: string }> = {
  A1: { label: 'A1 - Approved as Submitted', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  A2: { label: 'A2 - Approved with Comments', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
  A3: { label: 'A3 - Revise & Resubmit', cls: 'bg-rose-100 text-rose-800 border-rose-300' },
  A4: { label: 'A4 - Information Only', cls: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  stages,
  currentStageIndex,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-5 left-8 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
          style={{
            width: `${(Math.min(currentStageIndex, stages.length - 1) / (stages.length - 1)) * 100}%`,
          }}
        />

        {stages.map((stage, idx) => {
          const isCurrent = idx === currentStageIndex;
          const isDone = stage.status === 'completed';
          const isRejected = stage.status === 'rejected';

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 min-w-[120px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                  isCurrent
                    ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-md'
                    : isDone
                    ? 'border-emerald-500 bg-emerald-50'
                    : isRejected
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                {statusIcons[stage.status]}
              </div>

              <div className="mt-2 text-center">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.name}
                </p>
                {stage.status === 'in_progress' && (
                  <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-[10px] text-indigo-700 font-medium rounded mt-0.5">
                    Active
                  </span>
                )}
                {stage.completedAt && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(stage.completedAt).toLocaleDateString()}
                  </p>
                )}
                {stage.approvalCode && (
                  <span className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded border ${approvalCodeBadges[stage.approvalCode]?.cls}`}>
                    {stage.approvalCode}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default WorkflowTimeline;
