import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum VendorStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BLACKLISTED = 'BLACKLISTED'
}

@Entity('vendors')
export class Vendor {
    @PrimaryGeneratedColumn('uuid')
    vendorId: string;

    @Column({ type: 'varchar' })
    vendorName: string;

    @Column({ type: 'varchar', unique: true })
    vendorCode: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'varchar', nullable: true })
    contactPerson: string | null;

    @Column({ type: 'varchar', nullable: true })
    email: string | null;

    @Column({ type: 'varchar', nullable: true })
    phone: string | null;

    @Column({ type: 'text', nullable: true })
    address: string | null;

    @Column({ type: 'boolean', default: false })
    isEmpanelled: boolean;

    @Column({ type: 'simple-array', nullable: true })
    empanelledByClientIds: string[] | null;

    @Column({ type: 'decimal', nullable: true })
    qualityRating: number | null;

    @Column({ type: 'decimal', nullable: true })
    deliveryRating: number | null;

    @Column({ type: 'decimal', nullable: true })
    overallScore: number | null;

    @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE })
    status: VendorStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
