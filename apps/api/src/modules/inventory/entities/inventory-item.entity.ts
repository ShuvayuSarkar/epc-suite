import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';

export enum InventoryItemStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ISSUED = 'ISSUED'
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  InventoryItemID: string;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column()
  MaterialCode: string;

  @Column()
  MaterialDescription: string;

  @Column()
  Category: string;

  @Column()
  StoreLocation: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  CurrentQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  ReorderLevel: number;

  @Column({ type: 'date', nullable: true })
  LastReconciliationDate: Date;

  @Column({ nullable: true })
  DrumNumber: string;

  @Column({ nullable: true })
  DrumCondition: string;

  @Column({ type: 'enum', enum: InventoryItemStatus, default: InventoryItemStatus.IN_STOCK })
  Status: InventoryItemStatus;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
