import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DelayEventType {
    JMC_DELAY = 'JMC_DELAY',
    UTILITY_CERT_DELAY = 'UTILITY_CERT_DELAY',
    SHUTDOWN = 'SHUTDOWN',
    ROW = 'ROW',
    APPROVAL_DELAY = 'APPROVAL_DELAY',
    FORCE_MAJEURE = 'FORCE_MAJEURE',
    DELIVERABLE_DELAY = 'DELIVERABLE_DELAY',
    SURVEY_BOQ_DELAY = 'SURVEY_BOQ_DELAY'
}

export enum DelayEventSource {
    STAGE_3 = 'STAGE_3',
    STAGE_5 = 'STAGE_5'
}

export enum DelayEventStatus {
    LOGGED = 'LOGGED',
    NOD_ISSUED = 'NOD_ISSUED',
    EVIDENCE_COLLECTED = 'EVIDENCE_COLLECTED',
    CLAIM_PREPARED = 'CLAIM_PREPARED',
    SUBMITTED = 'SUBMITTED',
    RESOLVED = 'RESOLVED',
    DISPUTED = 'DISPUTED'
}

@Entity('delay_events')
export class DelayEvent {
    @PrimaryGeneratedColumn('uuid')
    eventId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: DelayEventType })
    eventType: DelayEventType;

    @Column({ type: 'enum', enum: DelayEventSource })
    source: DelayEventSource;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'date' })
    eventDate: Date;

    @Column({ type: 'varchar' })
    loggedBy: string;

    @Column({ type: 'enum', enum: DelayEventStatus, default: DelayEventStatus.LOGGED })
    status: DelayEventStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
