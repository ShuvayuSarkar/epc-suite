import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('approval_matrix_rows')
export class ApprovalMatrixRow {
  @PrimaryGeneratedColumn('uuid')
  RowID: string;

  @Column()
  ProcessStep: string;

  @Column()
  ApprovalFrom: string;

  @Column()
  SystemTrigger: string;

  @Column('int')
  SLADays: number;

  @Column()
  EscalationPath: string;

  @Column()
  ClientConfigurable: boolean;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'ClientID' })
  Client: Client;

  @Column({ type: 'uuid', nullable: true })
  ClientID: string;
}
