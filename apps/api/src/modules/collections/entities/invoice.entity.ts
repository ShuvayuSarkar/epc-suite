import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';
import { Client } from '../../../database/entities/client.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  invoiceId: string;

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
  invoiceNumber: string;

  @Column({ type: 'enum', enum: ['SUPPLY_80', 'SERVICE_20', 'MANDATORY_SPARES', 'RETENTION_RELEASE'] })
  invoiceType: string;

  @Column({ type: 'varchar', nullable: true })
  billReference: string;

  @Column({ type: 'decimal' })
  grossAmount: number;

  @Column({ type: 'decimal', default: 0 })
  tdsDeducted: number;

  @Column({ type: 'decimal', default: 0 })
  gstAmount: number;

  @Column({ type: 'decimal' })
  netAmount: number;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  certificationDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentReceivedDate: Date;

  @Column({ type: 'decimal', default: 0 })
  paymentAmount: number;

  @Column({ type: 'enum', enum: ['UNBILLED', 'BILLED', 'DUE', 'OVERDUE', 'CERTIFIED', 'PAID', 'PARTIALLY_PAID'] })
  status: string;

  @Column({ type: 'int', default: 0 })
  overdueDays: number;

  @Column({ type: 'enum', enum: ['CURRENT', 'OVERDUE_0_30', 'OVERDUE_30_60', 'OVERDUE_60_90', 'OVERDUE_90_120_PLUS'], nullable: true })
  agingBucket: string;

  @Column({ type: 'enum', enum: ['NONE', 'TEAM', 'PD', 'CFO', 'LEGAL'], default: 'NONE' })
  escalationLevel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
