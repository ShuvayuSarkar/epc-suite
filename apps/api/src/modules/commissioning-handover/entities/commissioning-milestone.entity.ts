import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CommMilestoneType {
    PRE_COMMISSIONING = 'PRE_COMMISSIONING',
    LINE_TC = 'LINE_TC',
    SUBSTATION_TC = 'SUBSTATION_TC',
    OPGW_OFC_TC = 'OPGW_OFC_TC',
    CHARGING = 'CHARGING',
    TRIAL_RUN = 'TRIAL_RUN'
}

export enum CommMilestoneStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

@Entity('commissioning_milestones')
export class CommissioningMilestone {
    @PrimaryGeneratedColumn('uuid')
    commMilestoneId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: CommMilestoneType })
    milestoneType: CommMilestoneType;

    @Column({ type: 'enum', enum: CommMilestoneStatus, default: CommMilestoneStatus.NOT_STARTED })
    status: CommMilestoneStatus;

    @Column({ type: 'jsonb', nullable: true })
    checklistData: any | null;

    @Column({ type: 'date', nullable: true })
    completedDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    certificateRef: string | null;

    @Column({ type: 'varchar', nullable: true })
    signedBy: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
