export interface ProjectMachineContext {
  projectId: string;
  clientId: string;
  projectTypeCode: 'A'|'B'|'C'|'D'|'E' | null;
  bidId: string | null;
  contractRef: string | null;
  contractValue: number | null;
  currentBaselineId: string | null;
  awardDocType: 'LOA'|'NOA'|'LOI' | null;
  
  // Stage 2 tracking
  vendorSelections: Map<string, string>;
  compliancePassed: boolean;
  preProductionReadinessPercent: number;
  hotspotRegisterActive: boolean;
  
  // Stage 3 tracking
  engineeringDocsSubmitted: string[];
  clientApprovalStatus: 'PENDING'|'APPROVED'|'REJECTED' | null;
  
  // Stage 5 tracking
  gangIds: string[];
  dprCount: number;
  jmcLineSigned: boolean;
  jmcSubstationSigned: boolean;
  
  // Stage 6 tracking
  tcLineCompleted: boolean;
  tcSubstationCompleted: boolean;
  tcOpgwCompleted: boolean;
  punchListOpenCount: number;
  punchListClosedCount: number;
  dlpStartDate: string | null;
  
  // Stage 7 tracking
  supplyBillSubmitted: boolean;
  serviceBillSubmitted: boolean;
  clientCertified: boolean;
  currentOverdueDays: number;
  retentionReleased: boolean;
  
  // EOT cross-cutting
  eotSource: 'STAGE_3' | 'STAGE_5' | null;
  activeEotEventId: string | null;
  eotClaimRef: string | null;
  
  // Audit
  stageHistory: Array<{ stage: string; enteredAt: string; exitedAt: string | null }>;
}
