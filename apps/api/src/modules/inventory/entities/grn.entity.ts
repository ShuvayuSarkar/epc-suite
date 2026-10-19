import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

export enum GRNStatus {
  RECEIVED = 'RECEIVED',
  INSPECTED = 'INSPECTED',
  STORED = 'STORED',
  ISSUED = 'ISSUED'
}

@Entity('grns')
export class GRN {
  @PrimaryGeneratedColumn('uuid')
  GRNID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column()
  PONumber: string;

  @Column()
  MaterialCode: string;

  @Column()
  MaterialDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  ReceivedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  AcceptedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  RejectedQuantity: number;

  @Column({ type: 'text', nullable: true })
  RejectionReason: string;

  @Column()
  StoreLocation: string;

  @Column()
  ReceivedBy: string;

  @Column({ type: 'date' })
  ReceivedDate: Date;

  @Column({ nullable: true })
  JVRReference: string;

  @Column({ nullable: true })
  BarcodeScanID: string;

  @Column({ nullable: true })
  RFIDTag: string;

  @Column({ nullable: true })
  DrumNumber: string;

  @Column({ type: 'enum', enum: GRNStatus, default: GRNStatus.RECEIVED })
  Status: GRNStatus;

  @CreateDateColumn()
  CreatedAt: Date;
}
