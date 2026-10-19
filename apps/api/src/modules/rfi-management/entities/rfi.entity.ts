import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RfiStatus {
    OPEN = 'OPEN',
    ROUTED = 'ROUTED',
    RESPONDED = 'RESPONDED',
    CLOSED = 'CLOSED'
}

@Entity('rfis')
export class RFI {
    @PrimaryGeneratedColumn('uuid')
    rfiId: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column()
    subject: string;

    @Column('text')
    description: string;

    @Column({ type: 'simple-array', nullable: true })
    attachments: string[] | null;

    @Column({ nullable: true })
    assignedTo: string | null;

    @Column({ type: 'enum', enum: RfiStatus, default: RfiStatus.OPEN })
    status: RfiStatus;

    @Column('text', { nullable: true })
    response: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
