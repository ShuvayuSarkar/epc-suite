import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PunchListSeverity { A = 'A', B = 'B', C = 'C' }
export enum PunchListStatus { OPEN = 'OPEN', CLOSED = 'CLOSED' }

@Entity('punch_list_items')
export class PunchListItem {
    @PrimaryGeneratedColumn('uuid')
    itemId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column('text')
    description: string;

    @Column({ type: 'enum', enum: PunchListSeverity })
    severity: PunchListSeverity;

    @Column({ type: 'enum', enum: PunchListStatus, default: PunchListStatus.OPEN })
    status: PunchListStatus;

    @Column({ type: 'simple-array', nullable: true })
    photos: string[] | null;

    @Column('decimal', { nullable: true })
    gpsLat: number | null;

    @Column('decimal', { nullable: true })
    gpsLon: number | null;

    @CreateDateColumn()
    createdAt: Date;
}
