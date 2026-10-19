import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectType } from '../../../database/entities/project-type.entity';

@Entity('project_type_templates')
export class ProjectTypeTemplate {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column({ type: 'uuid' })
  projectTypeId: string;

  @ManyToOne(() => ProjectType)
  @JoinColumn({ name: 'projectTypeId' })
  projectType: ProjectType;

  @Column({ type: 'varchar' })
  templateName: string;

  @Column({ type: 'jsonb' })
  activityList: any;

  @Column({ type: 'jsonb' })
  materialCategories: any;

  @Column({ type: 'jsonb' })
  wbsHierarchy: any;

  @Column({ type: 'jsonb' })
  approvalMatrix: any;

  @Column({ type: 'jsonb' })
  benchmarks: any;

  @Column({ type: 'jsonb' })
  docChecklist: any;

  @Column({ type: 'jsonb', nullable: true })
  customActivitySets?: any;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
