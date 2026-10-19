import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SafetyAuditStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CORRECTIVE_ACTIONS = 'CORRECTIVE_ACTIONS'
}

@Entity('safety_audits')
export class SafetyAudit {
    @PrimaryGeneratedColumn('uuid')
    auditId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    auditType: string;

    @Column({ type: 'date' })
    auditDate: Date;

    @Column({ type: 'varchar' })
    auditorName: string;

    @Column({ type: 'text' })
    findings: string;

    @Column({ type: 'int', nullable: true })
    score: number | null;

    @Column({ type: 'enum', enum: SafetyAuditStatus, default: SafetyAuditStatus.SCHEDULED })
    status: SafetyAuditStatus;

    @Column({ type: 'date', nullable: true })
    nextAuditDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}
