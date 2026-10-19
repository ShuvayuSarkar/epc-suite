import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { PunchListSeverity, PunchListStatus } from '@epc/shared-types';

@Entity('punch_list_items')
export class PunchListItem {
  @PrimaryGeneratedColumn('uuid')
  ItemID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column()
  Type: string;

  @Column('text')
  Description: string;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  GPSLat: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  GPSLon: number;

  @Column({ type: 'enum', enum: PunchListSeverity })
  Severity: PunchListSeverity;

  @Column({ nullable: true })
  ResponsibleParty: string;

  @Column({ type: 'date', nullable: true })
  TargetDate: Date;

  @Column({ type: 'enum', enum: PunchListStatus })
  Status: PunchListStatus;

  @Column({ type: 'uuid', nullable: true })
  PhotoID: string;
}
