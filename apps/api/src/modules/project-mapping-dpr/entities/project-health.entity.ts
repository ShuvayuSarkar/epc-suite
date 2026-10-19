import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RAGStatus {
    RED = 'RED',
    AMBER = 'AMBER',
    GREEN = 'GREEN'
}

@Entity('project_health_snapshots')
export class ProjectHealth {
    @PrimaryGeneratedColumn('uuid')
    snapshotId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'date' })
    snapshotDate: Date;

    @Column({ type: 'enum', enum: RAGStatus })
    overallRAGStatus: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    manufacturingRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    procurementRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    installationRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    commissioningRAG: RAGStatus;

    @Column({ type: 'enum', enum: RAGStatus })
    financeRAG: RAGStatus;

    @Column({ type: 'int', default: 0 })
    scheduleVarianceDays: number;

    @Column({ type: 'decimal', default: 0 })
    costVariancePercent: number;

    @Column({ type: 'int', default: 0 })
    approvalsPending: number;

    @Column({ type: 'int', default: 0 })
    rfisOpen: number;

    @Column({ type: 'int', default: 0 })
    hotspotsOpen: number;

    @Column({ type: 'text', nullable: true })
    remarks: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
