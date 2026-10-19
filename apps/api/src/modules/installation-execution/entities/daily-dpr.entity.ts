import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

@Entity('daily_dprs')
export class DailyDPR {
  @PrimaryGeneratedColumn('uuid')
  DPRID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column({ type: 'uuid', nullable: true })
  GangID: string;

  @Column({ type: 'date' })
  ReportDate: Date;

  @Column('decimal', { precision: 6, scale: 2, default: 0 })
  KmInstalled: number;

  @Column({ type: 'int', default: 0 })
  ManpowerCount: number;

  @Column('decimal', { precision: 4, scale: 2, default: 0 })
  IdleTimeHours: number;

  @Column({ nullable: true })
  IdleTimeReason: string;

  @Column({ nullable: true })
  HotspotStatus: string;

  @Column({ nullable: true })
  WeatherCondition: string;

  @Column({ type: 'int', default: 0 })
  RFICount: number;

  @Column('decimal', { precision: 10, scale: 7 })
  GPSLat: number;

  @Column('decimal', { precision: 10, scale: 7 })
  GPSLon: number;

  @Column({ default: false })
  IsGeofenced: boolean;

  @Column({ type: 'jsonb', nullable: true })
  SubActivities: Record<string, unknown>;

  @Column({ type: 'simple-array', nullable: true })
  PhotoIDs: string[];

  @CreateDateColumn()
  CreatedAt: Date;
}
