import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { BaselineType } from '@epc/shared-types';

@Entity('baselines')
export class Baseline {
  @PrimaryGeneratedColumn('uuid')
  BaselineID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column({ type: 'enum', enum: BaselineType })
  Type: BaselineType;

  @Column()
  GovernsLD: boolean;

  @Column({ type: 'timestamp', nullable: true })
  LockedDate: Date;

  @CreateDateColumn()
  CreatedAt: Date;
}
