import { RoleId } from '../config/rbac';

export type WorkflowStageStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rejected';
export type ClientApprovalCode = 'A1' | 'A2' | 'A3' | 'A4';
// A1: Approved as submitted
// A2: Approved with comments (proceed with revision)
// A3: Rejected / Revise & Resubmit
// A4: For Information Only / Retained

export interface WorkflowStage {
  id: string;
  name: string;             // "Design Creation" | "Internal Review" | "Client Review" | "IFC Release"
  order: number;
  assignedRoles: RoleId[];  // Roles authorized to approve/complete this stage
  assignedUsers: string[];  // Specific users
  status: WorkflowStageStatus;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  comments?: string;
  approvalCode?: ClientApprovalCode;
}

export interface DocumentRevision {
  revision: string;         // "A", "B", "C" or "1", "2" or "0"
  stage: string;
  releaseType: 'internal' | 'client' | 'ifc';
  issuedDate: string;
  issuedBy: string;
  description: string;
  fileName?: string;
  fileSize?: number;
}

export interface DocumentWorkflow {
  id: string;
  documentId: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'rejected';
}
