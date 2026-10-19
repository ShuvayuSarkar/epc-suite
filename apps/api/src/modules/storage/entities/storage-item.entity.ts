import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('epc_storage')
export class StorageItem {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'jsonb' })
  data: any;

  @UpdateDateColumn()
  updated_at: Date;
}
