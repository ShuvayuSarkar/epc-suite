import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProjectTypeCode } from '@epc/shared-types';

@Entity('project_types')
export class ProjectType {
  @PrimaryGeneratedColumn('uuid')
  ProjectTypeID: string;

  @Column({ type: 'enum', enum: ProjectTypeCode })
  Code: ProjectTypeCode;

  @Column()
  Name: string;

  @Column({ nullable: true })
  ActivityListID: string;

  @Column({ nullable: true })
  MaterialCategoryListID: string;

  @Column({ nullable: true })
  WBSHierarchyID: string;

  @Column({ nullable: true })
  ApprovalMatrixID: string;

  @Column({ nullable: true })
  BenchmarkSetID: string;

  @Column({ nullable: true })
  DocChecklistID: string;
}
