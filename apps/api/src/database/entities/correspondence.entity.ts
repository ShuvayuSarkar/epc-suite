import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Client } from './client.entity';

@Entity('correspondences')
export class Correspondence {
  @PrimaryGeneratedColumn('uuid')
  CorrespondenceID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'ClientID' })
  Client: Client;

  @Column({ type: 'uuid' })
  ClientID: string;

  @Column({ unique: true })
  ReferenceNumber: string;

  @Column()
  LetterType: string;

  @Column()
  DraftedBy: string;

  @Column({ nullable: true })
  SignedBy: string;

  @Column({ type: 'date', nullable: true })
  DispatchedDate: Date;

  @Column({ type: 'date', nullable: true })
  AcknowledgedDate: Date;

  @Column('simple-array', { nullable: true })
  AttachmentIDs: string[];
}
