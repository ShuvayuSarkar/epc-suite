import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

export enum RiskProbability {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export enum RiskImpact {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ASSESSED = 'ASSESSED',
  MITIGATING = 'MITIGATING',
  MONITORING = 'MONITORING',
  CLOSED = 'CLOSED',
}

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  RiskID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid', nullable: true })
  HotspotID: string;

  @Column()
  RiskCategory: string;

  @Column({ type: 'text' })
  Description: string;

  @Column({ type: 'enum', enum: RiskProbability, nullable: true })
  Probability: RiskProbability;

  @Column({ type: 'enum', enum: RiskImpact, nullable: true })
  Impact: RiskImpact;

  @Column({ type: 'int', nullable: true })
  RiskScore: number;

  @Column({ type: 'text', nullable: true })
  MitigationPlan: string;

  @Column({ nullable: true })
  MitigationOwner: string;

  @Column({ type: 'enum', enum: RiskStatus, default: RiskStatus.IDENTIFIED })
  Status: RiskStatus;

  @Column({ type: 'date' })
  IdentifiedDate: Date;

  @Column({ type: 'date', nullable: true })
  TargetClosureDate: Date;

  @Column({ type: 'date', nullable: true })
  ActualClosureDate: Date;

  @Column({ type: 'text', nullable: true })
  LessonsLearned: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
