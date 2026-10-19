import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { DocumentType, DocumentStatus } from '@epc/shared-types';

@Entity('engineering_documents')
export class EngineeringDocument {
  @PrimaryGeneratedColumn('uuid')
  DocumentID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column({ type: 'uuid', nullable: true })
  MaterialCategoryID: string;

  @Column({ type: 'enum', enum: DocumentType })
  DocumentType: DocumentType;

  @Column({ default: 1 })
  Version: number;

  @Column({ type: 'enum', enum: DocumentStatus })
  Status: DocumentStatus;

  @Column({ type: 'timestamp', nullable: true })
  SubmittedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  ApprovedDate: Date;

  @Column({ nullable: true })
  FileURL: string;
}
