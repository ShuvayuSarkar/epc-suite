import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Baseline } from './baseline.entity';
import { MilestoneStatus } from '@epc/shared-types';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  MilestoneID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column()
  Type: string;

  @Column({ type: 'date' })
  TargetDate: Date;

  @Column({ type: 'date', nullable: true })
  ActualDate: Date;

  @Column({ type: 'enum', enum: MilestoneStatus })
  Status: MilestoneStatus;

  @ManyToOne(() => Baseline)
  @JoinColumn({ name: 'BaselineID' })
  Baseline: Baseline;

  @Column({ type: 'uuid', nullable: true })
  BaselineID: string;

  @Column()
  ClientConfigurable: boolean;
}
