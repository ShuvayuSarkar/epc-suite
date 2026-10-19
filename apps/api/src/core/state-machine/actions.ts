import { assign } from 'xstate';
import { ProjectMachineContext, ProjectEvent } from '@epc/state-machine-types';

export const actions = {
  recordStageEntry: assign({
    stageHistory: ({ context, event }, params: { stage: string }) => {
      const history = [...context.stageHistory];
      history.push({
        stage: params.stage,
        enteredAt: new Date().toISOString(),
        exitedAt: null,
      });
      return history;
    },
  }),
  recordStageExit: assign({
    stageHistory: ({ context }) => {
      const history = [...context.stageHistory];
      if (history.length > 0) {
        history[history.length - 1].exitedAt = new Date().toISOString();
      }
      return history;
    },
  }),
  setEotSource: assign({
    eotSource: ({ event }) => {
      if (event.type === 'EOT_EVENT_LOGGED') {
        return event.source;
      }
      if (event.type === 'CLIENT_APPROVAL_DECISION' && event.decision === 'DELAY_EOT') {
        return 'STAGE_3';
      }
      if (event.type === 'JMC_SIGNOFF_DECISION' && event.decision === 'DELAY_EVENT') {
        return 'STAGE_5';
      }
      return null;
    },
  }),
  clearEotState: assign({
    eotSource: null,
    activeEotEventId: null,
    eotClaimRef: null,
  }),
  updateVendorSelection: assign({
    vendorSelections: ({ context, event }) => {
      if (event.type !== 'VENDOR_SELECTED_FOR_CATEGORY') return context.vendorSelections;
      const newMap = new Map(context.vendorSelections);
      newMap.set(event.category, event.vendorId);
      return newMap;
    },
  }),
  updatePreProductionReadiness: assign({
    preProductionReadinessPercent: ({ event }) => {
      if (event.type !== 'PRE_PRODUCTION_READINESS_CHECK') return 0;
      return event.readinessPercent;
    },
  }),
  markJmcLineSigned: assign({
    jmcLineSigned: true,
  }),
  markJmcSubstationSigned: assign({
    jmcSubstationSigned: true,
  }),
  markTcCompleted: assign({
    tcLineCompleted: ({ context, event }) => event.type === 'TC_COMPLETED' && event.tcType === 'LINE' ? true : context.tcLineCompleted,
    tcSubstationCompleted: ({ context, event }) => event.type === 'TC_COMPLETED' && event.tcType === 'SUBSTATION' ? true : context.tcSubstationCompleted,
    tcOpgwCompleted: ({ context, event }) => event.type === 'TC_COMPLETED' && event.tcType === 'OPGW_OFC' ? true : context.tcOpgwCompleted,
  }),
  updatePunchListCounts: assign({
    punchListOpenCount: ({ context, event }) => event.type === 'PUNCH_LIST_UPDATED' ? event.openCount : context.punchListOpenCount,
    punchListClosedCount: ({ context, event }) => event.type === 'PUNCH_LIST_UPDATED' ? event.closedCount : context.punchListClosedCount,
  }),
  updateOverdueDays: assign({
    currentOverdueDays: ({ context, event }) => event.type === 'AR_AGING_UPDATED' ? event.overdueDays : context.currentOverdueDays,
  }),
};
