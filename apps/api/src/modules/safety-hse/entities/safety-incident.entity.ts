import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SafetyIncidentSeverity {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL',
    FATAL = 'FATAL'
}

export enum SafetyInvestigationStatus {
    REPORTED = 'REPORTED',
    INVESTIGATING = 'INVESTIGATING',
    CLOSED = 'CLOSED'
}

@Entity('safety_incidents')
export class SafetyIncident {
    @PrimaryGeneratedColumn('uuid')
    incidentId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'varchar' })
    incidentType: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'decimal', nullable: true })
    gpsLat: number | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLon: number | null;

    @Column({ type: 'enum', enum: SafetyIncidentSeverity })
    severity: SafetyIncidentSeverity;

    @Column({ type: 'varchar' })
    reportedBy: string;

    @Column({ type: 'date' })
    reportedDate: Date;

    @Column({ type: 'enum', enum: SafetyInvestigationStatus, default: SafetyInvestigationStatus.REPORTED })
    investigationStatus: SafetyInvestigationStatus;

    @Column({ type: 'text', nullable: true })
    investigationFindings: string | null;

    @Column({ type: 'text', nullable: true })
    correctiveActions: string | null;

    @Column({ type: 'date', nullable: true })
    closedDate: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}
