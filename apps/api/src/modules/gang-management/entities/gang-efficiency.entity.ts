import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Gang } from './gang.entity';

@Entity('gang_efficiency_records')
export class GangEfficiency {
  @PrimaryGeneratedColumn('uuid')
  RecordID: string;

  @Column({ type: 'uuid' })
  GangID: string;

  @ManyToOne(() => Gang)
  @JoinColumn({ name: 'GangID' })
  Gang: Gang;

  @Column({ type: 'date' })
  Date: Date;

  @Column('decimal', { precision: 8, scale: 2 })
  KmCompleted: number;

  @Column('decimal', { precision: 8, scale: 2 })
  TargetKm: number;

  @Column('decimal', { precision: 5, scale: 2 })
  EfficiencyPercent: number;

  @Column({ type: 'int' })
  ManpowerPresent: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  IdleHours: number;

  @Column({ nullable: true })
  IdleReason: string;

  @Column({ nullable: true })
  WeatherCondition: string;

  @CreateDateColumn()
  CreatedAt: Date;
}
