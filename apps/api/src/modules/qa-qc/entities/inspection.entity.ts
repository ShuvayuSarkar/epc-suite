import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InspectionType {
    FACTORY = 'FACTORY',
    TPIA = 'TPIA',
    FAT = 'FAT',
    SITE = 'SITE',
    PRE_COMMISSIONING = 'PRE_COMMISSIONING'
}

export enum InspectionResult {
    PASS = 'PASS',
    FAIL = 'FAIL',
    CONDITIONAL = 'CONDITIONAL'
}

export enum InspectionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('inspections')
export class Inspection {
    @PrimaryGeneratedColumn('uuid')
    inspectionId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'enum', enum: InspectionType })
    inspectionType: InspectionType;

    @Column({ type: 'varchar', nullable: true })
    category: string | null;

    @Column({ type: 'date' })
    scheduledDate: Date;

    @Column({ type: 'date', nullable: true })
    actualDate: Date | null;

    @Column({ type: 'varchar', nullable: true })
    inspectorName: string | null;

    @Column({ type: 'enum', enum: InspectionResult, nullable: true })
    result: InspectionResult | null;

    @Column({ type: 'text', nullable: true })
    findings: string | null;

    @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.SCHEDULED })
    status: InspectionStatus;

    @Column({ type: 'uuid', nullable: true })
    procurementOrderId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
