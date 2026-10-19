import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum HotspotType {
    ROW = 'ROW',
    SHUTDOWN = 'SHUTDOWN',
    CROP = 'CROP',
    OLD_COMP = 'OLD_COMP',
    FOREST = 'FOREST',
    CLIENT = 'CLIENT',
    UTILITY = 'UTILITY'
}

export enum HotspotSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum HotspotStatus {
    IDENTIFIED = 'IDENTIFIED',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    ESCALATED = 'ESCALATED'
}

@Entity('hotspots')
export class Hotspot {
    @PrimaryGeneratedColumn('uuid')
    hotspotId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid', nullable: true })
    lineSegmentId: string | null;

    @Column({ type: 'enum', enum: HotspotType })
    hotspotType: HotspotType;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal' })
    gpsLat: number;

    @Column({ type: 'decimal' })
    gpsLon: number;

    @Column({ type: 'enum', enum: HotspotSeverity })
    severity: HotspotSeverity;

    @Column({ type: 'enum', enum: HotspotStatus, default: HotspotStatus.IDENTIFIED })
    status: HotspotStatus;

    @Column({ type: 'uuid', nullable: true })
    assignedSalesExecId: string | null;

    @Column({ type: 'varchar', nullable: true })
    assignedSalesExecName: string | null;

    @Column({ type: 'date' })
    identifiedDate: Date;

    @Column({ type: 'date', nullable: true })
    targetResolutionDate: Date | null;

    @Column({ type: 'date', nullable: true })
    actualResolutionDate: Date | null;

    @Column({ type: 'text', nullable: true })
    rootCause: string | null;

    @Column({ type: 'int', default: 0 })
    escalationLevel: number;

    @Column({ type: 'date', nullable: true })
    lastVisitDate: Date | null;

    @Column({ type: 'int', default: 0 })
    visitCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
