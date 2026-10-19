import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';
import { Client } from '../../../database/entities/client.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  contractId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'varchar', unique: true })
  contractNumber: string;

  @Column({ type: 'varchar' })
  contractType: string;

  @Column({ type: 'date', nullable: true })
  signedDate: Date;

  @Column({ type: 'decimal' })
  contractValue: number;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'enum', enum: ['DRAFT', 'ACTIVE', 'AMENDED', 'COMPLETED', 'DISPUTED', 'CLOSED'], default: 'DRAFT' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  ldClauseReference: string;

  @Column({ type: 'decimal', nullable: true })
  retentionPct: number;

  @Column({ type: 'varchar', nullable: true })
  paymentTerms: string;

  @Column({ type: 'jsonb', nullable: true })
  clauses: any;

  @Column({ type: 'enum', enum: ['COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW'], default: 'UNDER_REVIEW' })
  complianceStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  disputeLog: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
