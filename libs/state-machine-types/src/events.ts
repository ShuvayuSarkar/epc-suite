export type ProjectEvent =
  // Stage 0 events
  | { type: 'TENDER_LOGGED'; bidId: string; clientId: string }
  | { type: 'CLIENT_IDENTIFIED'; clientId: string }
  | { type: 'PROJECT_TYPE_SELECTED'; projectTypeCode: 'A'|'B'|'C'|'D'|'E' }
  | { type: 'COST_ESTIMATION_COMPLETED'; estimatedValue: number }
  | { type: 'PROPOSAL_SUBMITTED' }
  | { type: 'BID_RESULT'; result: 'L1_WON' | 'L2' | 'L3' | 'LOST' }

  // Stage 1 events
  | { type: 'AWARD_RECEIVED'; awardDocType: 'LOA'|'NOA'|'LOI'; awardDocId: string }
  | { type: 'LEGAL_REVIEW_COMPLETED'; acceptanceLetterRef: string }
  | { type: 'KICKOFF_MEETING_LOGGED'; meetingId: string }
  | { type: 'CPBG_CPG_SUBMITTED'; bgNumber: string; value: number; validityDate: string }
  | { type: 'CONTRACT_SIGNED'; contractRef: string }

  // Stage 2 events
  | { type: 'SITE_SURVEYS_COMPLETED'; surveyCount: number }
  | { type: 'VENDOR_SELECTED_FOR_CATEGORY'; category: string; vendorId: string }
  | { type: 'COMPLIANCE_CHECKS_PASSED' }
  | { type: 'PRE_PRODUCTION_READINESS_CHECK'; readinessPercent: number }
  | { type: 'HOTSPOT_REGISTER_UPDATED'; hotspotCount: number }

  // Stage 3 events
  | { type: 'L2_BASELINE_LOCKED'; baselineId: string }
  | { type: 'PO_ISSUED'; poNumber: string }
  | { type: 'ENGINEERING_DOCS_SUBMITTED'; docIds: string[] }
  | { type: 'CLIENT_APPROVAL_DECISION'; decision: 'APPROVED' | 'REJECTED' | 'DELAY_EOT' }
  | { type: 'FAT_INSPECTION_SCHEDULED'; inspectionDate: string }

  // Stage 4 events
  | { type: 'PRODUCTION_TRACKED' }
  | { type: 'DISPATCH_PLANNED'; ewayBillNumber: string }
  | { type: 'STORE_RECEIPT_JVR_COMPLETED'; jvrRef: string }
  | { type: 'STORE_SETUP_MILESTONE_CERTIFIED' }

  // Stage 5 events
  | { type: 'GANG_MOBILIZED'; gangId: string }
  | { type: 'DAILY_DPR_SUBMITTED'; dprId: string; gpsLat: number; gpsLon: number }
  | { type: 'RFI_RAISED'; rfiId: string }
  | { type: 'HOTSPOT_VISIT_LOGGED'; hotspotId: string }
  | { type: 'JMC_SIGNOFF_DECISION'; decision: 'SIGNED' | 'NOT_READY' | 'DELAY_EVENT' }

  // Stage 6 events
  | { type: 'PRE_COMMISSIONING_PASSED' }
  | { type: 'TC_COMPLETED'; tcType: 'LINE' | 'SUBSTATION' | 'OPGW_OFC' }
  | { type: 'PUNCH_LIST_UPDATED'; openCount: number; closedCount: number }
  | { type: 'PUNCH_LIST_CLOSURE_CHECK' }
  | { type: 'OM_MANUAL_ASSEMBLED' }
  | { type: 'HANDOVER_CERTIFICATE_ISSUED'; dlpStartDate: string }
  | { type: 'DLP_ALERT'; daysMark: 30 | 60 | 90 }

  // Stage 7 events
  | { type: 'SUPPLY_BILL_SUBMITTED'; billRef: string; amount: number }
  | { type: 'CLIENT_CERTIFICATION_RECEIVED' }
  | { type: 'SERVICE_BILL_SUBMITTED'; billRef: string; amount: number }
  | { type: 'AR_AGING_UPDATED'; overdueDays: number }
  | { type: 'OVERDUE_ESCALATION_CHECK' }
  | { type: 'ESCALATION_SENT'; escalatedTo: 'PD' | 'CFO' | 'LEGAL' }
  | { type: 'RETENTION_RELEASED' }
  | { type: 'PROJECT_CLOSED_OUT' }

  // Cross-cutting EOT events
  | { type: 'EOT_EVENT_LOGGED'; eventId: string; source: 'STAGE_3' | 'STAGE_5' }
  | { type: 'NOD_ISSUED'; nodRef: string }
  | { type: 'EOT_EVIDENCE_COLLECTED' }
  | { type: 'EOT_CLAIM_PREPARED'; claimRef: string }
  | { type: 'EOT_CLAIM_SUBMITTED' }
  | { type: 'EOT_FOLLOWUP_COMPLETED' }
  | { type: 'EOT_DELAY_COST_CLAIMED'; amount: number }
  | { type: 'EOT_LD_CHECK_COMPLETED' }
  | { type: 'EOT_RESOLUTION'; decision: 'APPROVED' | 'REJECTED' }
  | { type: 'PO_AMENDMENT_ISSUED'; amendedPoNumber: string };
