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

@Entity('jmc_records')
export class JMCRecord {
  @PrimaryGeneratedColumn('uuid')
  JMCID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column()
  JMCType: string; // 'LINE' | 'SUBSTATION'

  @Column({ default: false })
  IsSigned: boolean;

  @Column({ nullable: true })
  SignedBy: string;

  @Column({ type: 'date', nullable: true })
  SignedDate: Date;

  @Column({ type: 'text', nullable: true })
  Remarks: string;

  @Column({ type: 'simple-array', nullable: true })
  AttachmentIDs: string[];

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
