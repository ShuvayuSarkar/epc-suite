import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  BudgetID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column()
  CostHead: string;

  @Column('decimal', { precision: 14, scale: 2 })
  BudgetedAmount: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  ActualAmount: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  VarianceAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  VariancePercent: number;

  @Column()
  Period: string; // YYYY-MM

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
