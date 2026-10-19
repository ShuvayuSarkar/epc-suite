import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('po_line_items')
export class POLineItem {
  @PrimaryGeneratedColumn('uuid')
  POLineItemID: string;

  @Column()
  PONumber: string;

  @Column()
  HeaderNumber: string;

  @Column()
  SchLine: string;

  @Column()
  MaterialCode: string;

  @Column()
  MaterialDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  Quantity: number;

  @Column()
  Category: string;

  @Column({ type: 'date', nullable: true })
  ReceiptAtSiteDate: Date;

  @Column({ type: 'date', nullable: true })
  ExWorksDispatchDate: Date;

  @Column({ type: 'date', nullable: true })
  InspectionDate: Date;

  @Column()
  OrderUnit: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'ProjectID' })
  Project: Project;

  @Column({ type: 'uuid' })
  ProjectID: string;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;
}
