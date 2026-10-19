import { ProjectMachineContext, ProjectEvent } from '@epc/state-machine-types';

export const guards = {
  isL1Won: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'BID_RESULT' && event.result === 'L1_WON';
  },
  isBidLost: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'BID_RESULT' && event.result === 'LOST';
  },
  isPreProductionReady: ({ context }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return context.preProductionReadinessPercent >= 25;
  },
  isClientApprovalApproved: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'CLIENT_APPROVAL_DECISION' && event.decision === 'APPROVED';
  },
  isClientApprovalRejected: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'CLIENT_APPROVAL_DECISION' && event.decision === 'REJECTED';
  },
  isClientApprovalDelayEot: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'CLIENT_APPROVAL_DECISION' && event.decision === 'DELAY_EOT';
  },
  isJmcSigned: ({ context }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return context.jmcLineSigned && context.jmcSubstationSigned;
  },
  isJmcNotReady: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'JMC_SIGNOFF_DECISION' && event.decision === 'NOT_READY';
  },
  isJmcDelayEvent: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'JMC_SIGNOFF_DECISION' && event.decision === 'DELAY_EVENT';
  },
  isPunchListClosed: ({ context }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return context.punchListOpenCount === 0;
  },
  isOverdueBeyondThreshold: ({ context }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return context.currentOverdueDays > 60;
  },
  isEotApproved: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'EOT_RESOLUTION' && event.decision === 'APPROVED';
  },
  isEotRejected: ({ event }: { context: ProjectMachineContext; event: ProjectEvent }) => {
    return event.type === 'EOT_RESOLUTION' && event.decision === 'REJECTED';
  },
};
