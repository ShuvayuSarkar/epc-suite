import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum HandoverStatus {
    PRE_COMMISSIONING = 'PRE_COMMISSIONING',
    COMMISSIONING = 'COMMISSIONING',
    PUNCH_LIST = 'PUNCH_LIST',
    HANDOVER = 'HANDOVER',
    DLP_ACTIVE = 'DLP_ACTIVE',
    CLOSED = 'CLOSED'
}

@Entity('handovers')
export class Handover {
    @PrimaryGeneratedColumn('uuid')
    handoverId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'boolean', default: false })
    omManualAssembled: boolean;

    @Column({ type: 'date', nullable: true })
    omManualDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    handoverCertificateRef: string | null;

    @Column({ type: 'date', nullable: true })
    handoverCertificateDate: Date | null;

    @Column({ type: 'date', nullable: true })
    dlpStartDate: Date | null;

    @Column({ type: 'date', nullable: true })
    dlpEndDate: Date | null;

    @Column({ type: 'boolean', default: false })
    dlp30DayAlertSent: boolean;

    @Column({ type: 'boolean', default: false })
    dlp60DayAlertSent: boolean;

    @Column({ type: 'boolean', default: false })
    dlp90DayAlertSent: boolean;

    @Column({ type: 'varchar', nullable: true })
    completionCertificateRef: string | null;

    @Column({ type: 'text', nullable: true })
    lessonsLearned: string | null;

    @Column({ type: 'enum', enum: HandoverStatus, default: HandoverStatus.PRE_COMMISSIONING })
    status: HandoverStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
