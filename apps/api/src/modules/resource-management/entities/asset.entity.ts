import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AssetStatus {
    AVAILABLE = 'AVAILABLE',
    IN_USE = 'IN_USE',
    MAINTENANCE = 'MAINTENANCE',
    RETIRED = 'RETIRED'
}

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    assetId: string;

    @Column({ type: 'varchar' })
    assetName: string;

    @Column({ type: 'varchar' })
    assetType: string;

    @Column({ type: 'varchar', nullable: true })
    serialNumber: string | null;

    @Column({ type: 'varchar' })
    currentLocation: string;

    @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
    status: AssetStatus;

    @Column({ type: 'uuid', nullable: true })
    assignedToProjectId: string | null;

    @Column({ type: 'uuid', nullable: true })
    assignedToGangId: string | null;

    @Column({ type: 'date', nullable: true })
    insuranceExpiryDate: Date | null;

    @Column({ type: 'date', nullable: true })
    calibrationExpiryDate: Date | null;

    @Column({ type: 'decimal', nullable: true })
    depreciationValue: number | null;

    @Column({ type: 'decimal', nullable: true })
    rentalRate: number | null;

    @Column({ type: 'boolean', default: false })
    isRented: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
