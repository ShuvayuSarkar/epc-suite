import { setup, assign } from 'xstate';
import { ProjectMachineContext, ProjectEvent } from '@epc/state-machine-types';
import { guards } from './guards';
import { actions } from './actions';

export const projectLifecycleMachine = (setup as any)({
  types: {
    context: {} as ProjectMachineContext,
    events: {} as ProjectEvent,
  },
  guards,
  actions,
}).createMachine(({
  id: 'epcProjectLifecycle',
  initial: 'bidding',
  context: {
    projectId: '',
    clientId: '',
    projectTypeCode: null,
    bidId: null,
    contractRef: null,
    contractValue: null,
    currentBaselineId: null,
    awardDocType: null,
    vendorSelections: new Map(),
    compliancePassed: false,
    preProductionReadinessPercent: 0,
    hotspotRegisterActive: false,
    engineeringDocsSubmitted: [],
    clientApprovalStatus: null,
    gangIds: [],
    dprCount: 0,
    jmcLineSigned: false,
    jmcSubstationSigned: false,
    tcLineCompleted: false,
    tcSubstationCompleted: false,
    tcOpgwCompleted: false,
    punchListOpenCount: -1,
    punchListClosedCount: 0,
    dlpStartDate: null,
    supplyBillSubmitted: false,
    serviceBillSubmitted: false,
    clientCertified: false,
    currentOverdueDays: 0,
    retentionReleased: false,
    eotSource: null,
    activeEotEventId: null,
    eotClaimRef: null,
    stageHistory: [],
  },
  states: {
    bidding: {
      initial: 'tenderLogged',
      entry: { type: 'recordStageEntry', params: { stage: 'bidding' } },
      exit: 'recordStageExit',
      states: {
        tenderLogged: {
          on: { CLIENT_IDENTIFIED: 'clientIdentified' },
        },
        clientIdentified: {
          on: { PROJECT_TYPE_SELECTED: 'projectTypeSelected' },
        },
        projectTypeSelected: {
          on: { COST_ESTIMATION_COMPLETED: 'costEstimation' },
        },
        costEstimation: {
          on: { PROPOSAL_SUBMITTED: 'proposalSubmitted' },
        },
        proposalSubmitted: {
          on: {
            BID_RESULT: [
              { guard: 'isL1Won', target: '#epcProjectLifecycle.award' },
              { guard: 'isBidLost', target: '#epcProjectLifecycle.closedLost' },
              { target: 'l1L2L3Tracking' },
            ],
          },
        },
        /**
         * L2/L3 tracking state — bid is still competitive but not yet L1.
         * Record can receive updated BID_RESULT events to re-evaluate.
         * Exit criteria: "Stage 0 is NOT done until L1/L2/L3 status genuinely
         * branches the record — L1 triggers S1 entry, Lost terminates to
         * CLOSED_LOST. A mere status field is insufficient."
         */
        l1L2L3Tracking: {
          on: {
            BID_RESULT: [
              { guard: 'isL1Won', target: '#epcProjectLifecycle.award' },
              { guard: 'isBidLost', target: '#epcProjectLifecycle.closedLost' },
              { target: 'l1L2L3Tracking' },
            ],
          },
        },
      },
    },

    award: {
      initial: 'loaNoaLoiReceived',
      entry: { type: 'recordStageEntry', params: { stage: 'award' } },
      exit: 'recordStageExit',
      states: {
        /** Entry requires AWARD_RECEIVED event with awardDocType (LOA/NOA/LOI) */
        loaNoaLoiReceived: {
          on: { LEGAL_REVIEW_COMPLETED: 'legalReviewAcceptance' },
        },
        legalReviewAcceptance: {
          on: { KICKOFF_MEETING_LOGGED: 'kickoffMeetingLogged' },
        },
        kickoffMeetingLogged: {
          on: { CPBG_CPG_SUBMITTED: 'cpbgCpgSubmitted' },
        },
        cpbgCpgSubmitted: {
          on: { CONTRACT_SIGNED: 'contractSignedRegistered' },
        },
        contractSignedRegistered: {
          always: '#epcProjectLifecycle.goldenPeriod',
        },
      },
    },

    goldenPeriod: {
      type: 'parallel',
      entry: { type: 'recordStageEntry', params: { stage: 'goldenPeriod' } },
      exit: 'recordStageExit',
      onDone: 'postAwardExecution',
      states: {
        vendorTrack: {
          initial: 'siteSurveys',
          states: {
            siteSurveys: {
              on: { VENDOR_SELECTED_FOR_CATEGORY: 'vendorSelectionPerCategory' },
            },
            vendorSelectionPerCategory: {
              actions: 'updateVendorSelection',
              on: {
                COMPLIANCE_CHECKS_PASSED: 'complianceChecks',
                VENDOR_SELECTED_FOR_CATEGORY: 'vendorSelectionPerCategory',
              },
            },
            complianceChecks: {
              on: { PRE_PRODUCTION_READINESS_CHECK: 'preProductionReadinessGate' },
            },
            preProductionReadinessGate: {
              actions: 'updatePreProductionReadiness',
              always: [
                { guard: 'isPreProductionReady', target: 'done' },
                { target: 'vendorSelectionPerCategory' },
              ],
            },
            done: { type: 'final' },
          },
        },
        hotspotTrack: {
          initial: 'hotspotRiskRegister',
          states: {
            hotspotRiskRegister: {
              on: { HOTSPOT_REGISTER_UPDATED: 'hotspotRiskRegister' },
            },
          },
        },
      },
    },

    postAwardExecution: {
      initial: 'l2DualBaselinePlanning',
      entry: { type: 'recordStageEntry', params: { stage: 'postAwardExecution' } },
      exit: 'recordStageExit',
      states: {
        l2DualBaselinePlanning: {
          on: { PO_ISSUED: 'officialProcurementPo' },
        },
        officialProcurementPo: {
          on: { ENGINEERING_DOCS_SUBMITTED: 'engineeringDocs' },
        },
        engineeringDocs: {
          on: { CLIENT_APPROVAL_DECISION: 'clientApprovalGate' },
        },
        clientApprovalGate: {
          always: [
            { guard: 'isClientApprovalApproved', target: 'inspectionSchedulingFat' },
            { guard: 'isClientApprovalRejected', target: 'engineeringDocs' },
            { guard: 'isClientApprovalDelayEot', target: '#epcProjectLifecycle.eotDelayClaims', actions: 'setEotSource' },
          ],
        },
        inspectionSchedulingFat: {
          on: { FAT_INSPECTION_SCHEDULED: '#epcProjectLifecycle.materialExecution' },
        },
      },
    },

    materialExecution: {
      initial: 'productionTrackingVsL2',
      entry: { type: 'recordStageEntry', params: { stage: 'materialExecution' } },
      exit: 'recordStageExit',
      states: {
        productionTrackingVsL2: {
          on: { DISPATCH_PLANNED: 'dispatchPlanning' },
        },
        dispatchPlanning: {
          on: { STORE_RECEIPT_JVR_COMPLETED: 'storeReceiptJvr' },
        },
        storeReceiptJvr: {
          on: { STORE_SETUP_MILESTONE_CERTIFIED: 'storeSetupMilestone' },
        },
        storeSetupMilestone: {
          always: '#epcProjectLifecycle.installation',
        },
      },
    },

    installation: {
      initial: 'gangMobilization',
      entry: { type: 'recordStageEntry', params: { stage: 'installation' } },
      exit: 'recordStageExit',
      states: {
        gangMobilization: {
          on: { DAILY_DPR_SUBMITTED: 'dailyDprGpsGeofenced' },
        },
        dailyDprGpsGeofenced: {
          on: {
            RFI_RAISED: 'installationOngoing',
            HOTSPOT_VISIT_LOGGED: 'installationOngoing',
            JMC_SIGNOFF_DECISION: 'installationOngoing',
          },
        },
        installationOngoing: {
          type: 'parallel',
          onDone: '#epcProjectLifecycle.commissioning',
          states: {
            rfiWorkflow: {
              initial: 'active',
              states: {
                active: {
                  on: { RFI_RAISED: 'active' },
                },
              },
            },
            hotspotWeeklyVisits: {
              initial: 'active',
              states: {
                active: {
                  on: { HOTSPOT_VISIT_LOGGED: 'active' },
                },
              },
            },
            jmcSignoffGate: {
              initial: 'checking',
              states: {
                checking: {
                  on: {
                    JMC_SIGNOFF_DECISION: 'evaluating',
                  },
                },
                evaluating: {
                  always: [
                    { guard: 'isJmcSigned', target: 'done' },
                    { guard: 'isJmcDelayEvent', target: '#epcProjectLifecycle.eotDelayClaims', actions: 'setEotSource' },
                    { guard: 'isJmcNotReady', target: '#epcProjectLifecycle.installation.dailyDprGpsGeofenced' },
                    { target: 'checking' }
                  ],
                },
                done: { type: 'final' },
              },
            },
          },
        },
      },
    },

    commissioning: {
      initial: 'preCommissioningChecks',
      entry: { type: 'recordStageEntry', params: { stage: 'commissioning' } },
      exit: 'recordStageExit',
      states: {
        preCommissioningChecks: {
          on: { TC_COMPLETED: 'lineSubstationOpgwTc' },
        },
        lineSubstationOpgwTc: {
          actions: 'markTcCompleted',
          on: {
            TC_COMPLETED: 'lineSubstationOpgwTc',
            PUNCH_LIST_UPDATED: 'digitalPunchList',
          },
        },
        digitalPunchList: {
          actions: 'updatePunchListCounts',
          on: {
            PUNCH_LIST_CLOSURE_CHECK: 'punchListClosureGate',
            PUNCH_LIST_UPDATED: 'digitalPunchList',
          },
        },
        punchListClosureGate: {
          always: [
            { guard: 'isPunchListClosed', target: 'omManualHandoverCert' },
            { target: 'digitalPunchList' },
          ],
        },
        omManualHandoverCert: {
          on: { OM_MANUAL_ASSEMBLED: 'dlpAlerts' },
        },
        dlpAlerts: {
          on: {
            DLP_ALERT: 'dlpAlerts',
            HANDOVER_CERTIFICATE_ISSUED: '#epcProjectLifecycle.billing',
          },
        },
      },
    },

    billing: {
      initial: 'supplyBill80Jvr',
      entry: { type: 'recordStageEntry', params: { stage: 'billing' } },
      exit: 'recordStageExit',
      states: {
        supplyBill80Jvr: {
          on: { CLIENT_CERTIFICATION_RECEIVED: 'clientCertification' },
        },
        clientCertification: {
          on: { SERVICE_BILL_SUBMITTED: 'serviceBill20Jmc' },
        },
        serviceBill20Jmc: {
          on: { AR_AGING_UPDATED: 'arAgingCollections' },
        },
        arAgingCollections: {
          actions: 'updateOverdueDays',
          on: { OVERDUE_ESCALATION_CHECK: 'overdueEscalationGate' },
        },
        overdueEscalationGate: {
          always: [
            { guard: 'isOverdueBeyondThreshold', target: 'escalationCfoLegal' },
            { target: 'retentionRelease5Pct' },
          ],
        },
        escalationCfoLegal: {
          on: {
            ESCALATION_SENT: 'escalationCfoLegal',
            AR_AGING_UPDATED: 'arAgingCollections',
            RETENTION_RELEASED: 'retentionRelease5Pct',
          },
        },
        retentionRelease5Pct: {
          on: { RETENTION_RELEASED: 'retentionRelease5Pct' },
          always: '#epcProjectLifecycle.projectCloseout',
        },
      },
    },

    eotDelayClaims: {
      initial: 'eventLogged',
      states: {
        eventLogged: {
          on: { NOD_ISSUED: 'nodIssued' },
        },
        nodIssued: {
          on: { EOT_EVIDENCE_COLLECTED: 'evidenceCollection' },
        },
        evidenceCollection: {
          on: { EOT_CLAIM_PREPARED: 'claimPreparation' },
        },
        claimPreparation: {
          on: { EOT_CLAIM_SUBMITTED: 'claimSubmission' },
        },
        claimSubmission: {
          on: { EOT_FOLLOWUP_COMPLETED: 'followUp' },
        },
        followUp: {
          on: { EOT_DELAY_COST_CLAIMED: 'delayCostClaim' },
        },
        delayCostClaim: {
          on: { EOT_LD_CHECK_COMPLETED: 'ldApplicabilityCheck' },
        },
        ldApplicabilityCheck: {
          on: { EOT_RESOLUTION: 'resolution' },
        },
        resolution: {
          always: [
            { guard: 'isEotApproved', target: 'poAmendment' },
            { guard: 'isEotRejected', target: 'dispute' },
          ],
        },
        poAmendment: {
          on: {
            PO_AMENDMENT_ISSUED: {
              target: '#epcProjectLifecycle.postAwardExecution.officialProcurementPo',
              actions: 'clearEotState',
            },
          },
        },
        dispute: {
          // Terminal state for this loop if rejected, can escalate to legal manually
        },
      },
    },

    closedLost: {
      type: 'final',
    },
    projectCloseout: {
      type: 'final',
    },
  },
} as any));
