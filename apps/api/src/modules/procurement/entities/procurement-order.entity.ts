import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum POStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    IN_PRODUCTION = 'IN_PRODUCTION',
    DISPATCHED = 'DISPATCHED',
    DELIVERED = 'DELIVERED',
    CLOSED = 'CLOSED'
}

export enum TechnicalApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('procurement_orders')
export class ProcurementOrder {
    @PrimaryGeneratedColumn('uuid')
    procurementOrderId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid' })
    vendorId: string;

    @Column({ type: 'varchar', unique: true })
    poNumber: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'date' })
    orderDate: Date;

    @Column({ type: 'date', nullable: true })
    deliveryDate: Date | null;

    @Column({ type: 'decimal' })
    totalValue: number;

    @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
    status: POStatus;

    @Column({ type: 'enum', enum: TechnicalApprovalStatus, nullable: true })
    technicalApprovalStatus: TechnicalApprovalStatus | null;

    @Column({ type: 'date', nullable: true })
    technicalApprovalDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
