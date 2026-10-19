import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

export enum GangType {
  CONDUCTOR = 'CONDUCTOR',
  OPGW = 'OPGW',
  SUBSTATION = 'SUBSTATION',
  CIVIL = 'CIVIL'
}

export enum GangStatus {
  MOBILIZED = 'MOBILIZED',
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  DEMOBILIZED = 'DEMOBILIZED'
}

export enum TerrainType {
  PLAIN = 'PLAIN',
  HILLY = 'HILLY',
  FOREST = 'FOREST'
}

@Entity('gangs')
export class Gang {
  @PrimaryGeneratedColumn('uuid')
  GangID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column()
  GangName: string;

  @Column({ type: 'enum', enum: GangType })
  GangType: GangType;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column()
  SupervisorName: string;

  @Column({ nullable: true })
  SupervisorContact: string;

  @Column({ type: 'int', default: 0 })
  FitterCount: number;

  @Column({ type: 'int', default: 0 })
  LaborCount: number;

  @Column({ type: 'int', default: 0 })
  HelperCount: number;

  @Column({ type: 'int', default: 0 })
  RiggerCount: number;

  @Column({ type: 'int', default: 0 })
  SplicerCount: number;

  @Column({ type: 'enum', enum: GangStatus, default: GangStatus.MOBILIZED })
  Status: GangStatus;

  @Column({ type: 'date', nullable: true })
  MobilizationDate: Date;

  @Column({ type: 'date', nullable: true })
  DemobilizationDate: Date;

  @Column({ type: 'enum', enum: TerrainType, nullable: true })
  TerrainType: TerrainType;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  TargetKmPerDay: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
