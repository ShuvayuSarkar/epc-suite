import React, { useState } from 'react';
import { ShieldCheck, Check, RotateCcw, X, MessageSquare, AlertCircle } from 'lucide-react';
import { WorkflowStage, ClientApprovalCode } from '../../types/workflow';

interface WorkflowStagePanelProps {
  currentStage?: WorkflowStage;
  onApprove: (comments: string, code?: ClientApprovalCode) => void;
  onReturn: (comments: string) => void;
  onReject: (comments: string) => void;
  canAction: boolean;
}

export const WorkflowStagePanel: React.FC<WorkflowStagePanelProps> = ({
  currentStage,
  onApprove,
  onReturn,
  onReject,
  canAction,
}) => {
  const [comments, setComments] = useState('');
  const [approvalCode, setApprovalCode] = useState<ClientApprovalCode>('A1');

  if (!currentStage) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
        Workflow is completed or inactive.
      </div>
    );
  }

  const isClientStage = currentStage.name.toLowerCase().includes('client');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
            Current Stage #{currentStage.order}
          </span>
          <h4 className="text-sm font-bold text-slate-800">{currentStage.name}</h4>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Assigned Reviewers:</span>
          <p className="text-xs font-medium text-slate-700">
            {currentStage.assignedRoles.join(', ')}
          </p>
        </div>
      </div>

      {canAction ? (
        <div className="space-y-3">
          {isClientStage && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Review Code (as per Contract)
              </label>
              <select
                value={approvalCode}
                onChange={(e) => setApprovalCode(e.target.value as ClientApprovalCode)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="A1">A1 — Approved as Submitted (IFC Clearance)</option>
                <option value="A2">A2 — Approved with Comments (Proceed with Revision)</option>
                <option value="A3">A3 — Revise & Resubmit (Unapproved)</option>
                <option value="A4">A4 — Information Only / Retained</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reviewer Comments / Action Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Enter review notes, engineering stipulations or comment sheet references..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onApprove(comments, isClientStage ? approvalCode : undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Approve & Advance
            </button>
            <button
              type="button"
              onClick={() => onReturn(comments)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return for Revision
            </button>
            <button
              type="button"
              onClick={() => onReject(comments)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reject Document
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>You do not have approval authorization for this workflow stage.</span>
        </div>
      )}
    </div>
  );
};
export default WorkflowStagePanel;
