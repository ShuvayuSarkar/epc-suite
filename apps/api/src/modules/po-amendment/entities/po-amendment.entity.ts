import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

@Entity('po_amendments')
export class POAmendment {
  @PrimaryGeneratedColumn('uuid')
  amendmentId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar' })
  originalPONumber: string;

  @Column({ type: 'enum', enum: ['EOT_APPROVAL', 'SURVEY_FINDING', 'CHANGE_ORDER', 'RATE_REVISION', 'CONTRACTUAL'] })
  triggerType: string;

  @Column({ type: 'varchar', nullable: true })
  triggerReference: string;

  @Column({ type: 'decimal' })
  costImpact: number;

  @Column({ type: 'int', default: 0 })
  timeImpactDays: number;

  @Column({ type: 'text', nullable: true })
  scopeChange: string;

  @Column({ type: 'enum', enum: ['REQUESTED', 'IMPACT_ANALYSIS', 'INTERNAL_APPROVAL', 'CLIENT_APPROVAL', 'APPROVED', 'ISSUED', 'IMPLEMENTED'], default: 'REQUESTED' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  internalApprovers: any;

  @Column({ type: 'date', nullable: true })
  internalApprovalDate: Date;

  @Column({ type: 'boolean', default: false })
  clientApprovalRequired: boolean;

  @Column({ type: 'date', nullable: true })
  clientApprovalDate: Date;

  @Column({ type: 'varchar', nullable: true })
  amendedPONumber: string;

  @Column({ type: 'decimal', nullable: true })
  revisedBudget: number;

  @Column({ type: 'jsonb', nullable: true })
  revisedSchedule: any;

  @Column({ type: 'boolean', default: false })
  baselineUpdateRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
