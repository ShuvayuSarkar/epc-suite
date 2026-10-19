import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { ProjectType } from './project-type.entity';
import { ProjectStage } from '@epc/shared-types';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  ProjectID: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'ClientID' })
  Client: Client;

  @Column({ type: 'uuid' })
  ClientID: string;

  @ManyToOne(() => ProjectType)
  @JoinColumn({ name: 'ProjectTypeID' })
  ProjectType: ProjectType;

  @Column({ type: 'uuid' })
  ProjectTypeID: string;

  @Column({ type: 'enum', enum: ProjectStage })
  CurrentStage: ProjectStage;

  @Column()
  CurrentSubState: string;

  @Column({ unique: true })
  BidID: string;

  @Column({ type: 'date', nullable: true })
  AwardDate: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  ContractValue: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
