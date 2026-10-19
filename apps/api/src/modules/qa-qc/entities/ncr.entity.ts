import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NcrSeverity {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL'
}

export enum NcrStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED'
}

@Entity('ncrs')
export class NCR {
    @PrimaryGeneratedColumn('uuid')
    ncrId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid', nullable: true })
    inspectionId: string | null;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: NcrSeverity })
    severity: NcrSeverity;

    @Column({ type: 'text', nullable: true })
    rootCause: string | null;

    @Column({ type: 'text', nullable: true })
    correctiveAction: string | null;

    @Column({ type: 'varchar', nullable: true })
    responsibleParty: string | null;

    @Column({ type: 'date', nullable: true })
    targetDate: Date | null;

    @Column({ type: 'date', nullable: true })
    closedDate: Date | null;

    @Column({ type: 'enum', enum: NcrStatus, default: NcrStatus.OPEN })
    status: NcrStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
