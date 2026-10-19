import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  user_email: string;

  @Column({ nullable: true })
  user_role: string;

  @Column({ type: 'int', nullable: true })
  status_code: number;

  @Column({ type: 'int', nullable: true })
  duration_ms: number;

  @Column({ nullable: true })
  ip: string;
}
