import { Attachment } from './attachment';

export type StatutoryApprovalStatus = 'not_applied' | 'applied' | 'under_review' | 'approved' | 'rejected' | 'expired';

export interface StatutoryApproval {
  id: string;
  approvalNo: string;        // e.g. STAT-2026-001
  project: string;
  approvalType: string;      // "Forest Clearance" | "Land Acquisition / ROW" | "Electrical Inspector (CEIG)" | "Railway Crossing" | "NHAI Highway Crossing" | "Pollution Control Board" | "Aviation NOC"
  authority: string;         // Issuing authority name (e.g. GETCO, CEIG, NHAI, Forest Dept)
  appliedDate: string;
  expectedApprovalDate: string;
  actualApprovalDate?: string;
  validityDate?: string;     // Expiry date of the clearance
  status: StatutoryApprovalStatus;
  remarks: string;
  documents: Attachment[];
}
