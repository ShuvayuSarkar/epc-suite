import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

@Entity('site_surveys')
export class SiteSurvey {
  @PrimaryGeneratedColumn('uuid')
  SurveyID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column()
  SurveyType: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  GPSLat: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  GPSLon: number;

  @Column({ type: 'text', nullable: true })
  Findings: string;

  @Column({ type: 'jsonb', nullable: true })
  Measurements: Record<string, unknown>;

  @Column({ nullable: true })
  SurveyorName: string;

  @Column({ type: 'date' })
  SurveyDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  PhotoIDs: string[];

  @Column({ default: false })
  IsGPSTagged: boolean;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
