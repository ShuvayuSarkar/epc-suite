import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';
import { Client } from '../../../database/entities/client.entity';

@Entity('collection_targets')
export class CollectionTarget {
  @PrimaryGeneratedColumn('uuid')
  targetId: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'varchar' })
  collectorName: string;

  @Column({ type: 'varchar' })
  targetMonth: string; // YYYY-MM

  @Column({ type: 'decimal' })
  targetAmount: number;

  @Column({ type: 'decimal', default: 0 })
  collectedAmount: number;

  @Column({ type: 'decimal', default: 0 })
  achievementPercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
