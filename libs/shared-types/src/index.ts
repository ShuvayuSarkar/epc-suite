export const ProjectStage = {
  S0_BIDDING: 'S0_BIDDING',
  S1_AWARD_RECEIPT: 'S1_AWARD_RECEIPT',
  S2_GOLDEN_PERIOD: 'S2_GOLDEN_PERIOD',
  S3_POST_AWARD_EXECUTION: 'S3_POST_AWARD_EXECUTION',
  S4_MATERIAL_EXECUTION: 'S4_MATERIAL_EXECUTION',
  S5_INSTALLATION: 'S5_INSTALLATION',
  S6_COMMISSIONING: 'S6_COMMISSIONING',
  S7_BILLING: 'S7_BILLING',
  EOT_DELAY_CLAIMS: 'EOT_DELAY_CLAIMS',
  CLOSED_LOST: 'CLOSED_LOST',
  PROJECT_CLOSEOUT: 'PROJECT_CLOSEOUT',
} as const;
export type ProjectStage = (typeof ProjectStage)[keyof typeof ProjectStage];

export const ProjectTypeCode = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
} as const;
export type ProjectTypeCode = (typeof ProjectTypeCode)[keyof typeof ProjectTypeCode];

export const AwardDocumentType = {
  LOA: 'LOA',
  NOA: 'NOA',
  LOI: 'LOI',
} as const;
export type AwardDocumentType = (typeof AwardDocumentType)[keyof typeof AwardDocumentType];

export const BaselineType = {
  CONTRACTUAL: 'CONTRACTUAL',
  ACCELERATED: 'ACCELERATED',
} as const;
export type BaselineType = (typeof BaselineType)[keyof typeof BaselineType];

export const MilestoneStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
} as const;
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus];

export const DocumentType = {
  DRAWING: 'DRAWING',
  GTP: 'GTP',
  DRUM_SCHEDULE: 'DRUM_SCHEDULE',
  SAG_TENSION: 'SAG_TENSION',
  SURVEY_REPORT: 'SURVEY_REPORT',
  TYPE_TEST: 'TYPE_TEST',
  MQP: 'MQP',
  ITP: 'ITP',
  FAT_PROCEDURE: 'FAT_PROCEDURE',
  DRUM_PLANNING: 'DRUM_PLANNING',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const RFIStatus = {
  OPEN: 'OPEN',
  RESPONDED: 'RESPONDED',
  CLOSED: 'CLOSED',
} as const;
export type RFIStatus = (typeof RFIStatus)[keyof typeof RFIStatus];

export const PunchListSeverity = {
  A: 'A',
  B: 'B',
  C: 'C',
} as const;
export type PunchListSeverity = (typeof PunchListSeverity)[keyof typeof PunchListSeverity];

export const PunchListStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
} as const;
export type PunchListStatus = (typeof PunchListStatus)[keyof typeof PunchListStatus];

export const PortalIntegrationType = {
  API: 'API',
  SFTP: 'SFTP',
  MANUAL: 'MANUAL',
} as const;
export type PortalIntegrationType = (typeof PortalIntegrationType)[keyof typeof PortalIntegrationType];

export const WBSType = {
  CONTRACT: 'CONTRACT',
  PACKAGE: 'PACKAGE',
  LINE_SEGMENT: 'LINE_SEGMENT',
  SITE: 'SITE',
  ACTIVITY: 'ACTIVITY',
} as const;
export type WBSType = (typeof WBSType)[keyof typeof WBSType];
