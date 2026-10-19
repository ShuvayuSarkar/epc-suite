import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EOTClientDecision {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('eot_claims')
export class EOTClaim {
    @PrimaryGeneratedColumn('uuid')
    claimId: string;

    @Column({ type: 'uuid' })
    delayEventId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar', nullable: true })
    nodReference: string | null;

    @Column({ type: 'date', nullable: true })
    nodDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    claimReference: string | null;

    @Column({ type: 'text', nullable: true })
    executiveSummary: string | null;

    @Column({ type: 'text', nullable: true })
    contractualClauses: string | null;

    @Column({ type: 'int', nullable: true })
    timeImpactDays: number | null;

    @Column({ type: 'date', nullable: true })
    submissionDate: Date | null;

    @Column({ type: 'enum', enum: EOTClientDecision, nullable: true })
    clientDecision: EOTClientDecision | null;

    @Column({ type: 'date', nullable: true })
    clientDecisionDate: Date | null;

    @Column({ type: 'decimal', nullable: true })
    delayCostAmount: number | null;

    @Column({ type: 'boolean', nullable: true })
    ldApplicable: boolean | null;

    @Column({ type: 'varchar', nullable: true })
    poAmendmentRef: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
