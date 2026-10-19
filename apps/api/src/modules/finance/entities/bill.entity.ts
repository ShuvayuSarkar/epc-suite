import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

export enum BillType {
  MANUFACTURING = 'MANUFACTURING',
  BUYOUT = 'BUYOUT',
  DISPATCH = 'DISPATCH',
  INSTALLATION = 'INSTALLATION',
  ASSET_RENTAL = 'ASSET_RENTAL',
  STORAGE = 'STORAGE',
  TPIA = 'TPIA',
  OTDR = 'OTDR',
  SUPPLY_80 = 'SUPPLY_80',
  SERVICE_20 = 'SERVICE_20'
}

export enum BillStatus {
  RECEIVED = 'RECEIVED',
  VALIDATED = 'VALIDATED',
  TECH_APPROVED = 'TECH_APPROVED',
  FIN_APPROVED = 'FIN_APPROVED',
  SCHEDULED = 'SCHEDULED',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export enum PaymentMethod {
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  LC = 'LC'
}

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  BillID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'enum', enum: BillType })
  BillType: BillType;

  @Column({ unique: true })
  BillNumber: string;

  @Column({ nullable: true })
  VendorName: string;

  @Column({ nullable: true })
  PONumber: string;

  @Column('decimal', { precision: 12, scale: 2 })
  GrossAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  TDSAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  GSTAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  NetAmount: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.RECEIVED })
  Status: BillStatus;

  @Column({ nullable: true })
  TechnicalApprover: string;

  @Column({ type: 'date', nullable: true })
  TechnicalApprovalDate: Date;

  @Column({ nullable: true })
  FinancialApprover: string;

  @Column({ type: 'date', nullable: true })
  FinancialApprovalDate: Date;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  PaymentMethod: PaymentMethod;

  @Column({ type: 'date', nullable: true })
  PaymentDate: Date;

  @Column({ nullable: true })
  PaymentReference: string;

  @Column({ type: 'date' })
  SubmittedDate: Date;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
