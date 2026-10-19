import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { RFIStatus } from '@epc/shared-types';

@Entity('rfis')
export class RFI {
  @PrimaryGeneratedColumn('uuid')
  RFIID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column()
  RaisedBy: string;

  @Column({ type: 'timestamp' })
  RaisedDate: Date;

  @Column()
  Subject: string;

  @Column('text')
  Description: string;

  @Column('simple-array', { nullable: true })
  AttachmentIDs: string[];

  @Column({ nullable: true })
  AssignedTo: string;

  @Column({ type: 'timestamp', nullable: true })
  ResponseDate: Date;

  @Column('text', { nullable: true })
  Response: string;

  @Column({ type: 'enum', enum: RFIStatus })
  Status: RFIStatus;
}
