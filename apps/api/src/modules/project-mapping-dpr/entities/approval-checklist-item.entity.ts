import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApprovalStatus {
    PENDING = 'PENDING',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    OVERDUE = 'OVERDUE'
}

@Entity('approval_checklist_items')
export class ApprovalChecklistItem {
    @PrimaryGeneratedColumn('uuid')
    checklistItemId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    approvalStep: string;

    @Column({ type: 'varchar', nullable: true })
    category: string | null;

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
    status: ApprovalStatus;

    @Column({ type: 'date', nullable: true })
    submittedDate: Date | null;

    @Column({ type: 'date', nullable: true })
    approvedDate: Date | null;

    @Column({ type: 'int' })
    slaDays: number;

    @Column({ type: 'int', default: 0 })
    daysElapsed: number;

    @Column({ type: 'boolean', default: false })
    isOverdue: boolean;

    @Column({ type: 'boolean', default: false })
    escalationTriggered: boolean;

    @Column({ type: 'boolean', default: false })
    clientSLA: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
