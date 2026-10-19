import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AwardDocumentType, PortalIntegrationType } from '@epc/shared-types';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  ClientID: string;

  @Column()
  LegalName: string;

  @Column()
  ShortName: string;

  @Column({ type: 'enum', enum: AwardDocumentType })
  AwardDocumentType: AwardDocumentType;

  @Column()
  ReferenceFormat: string;

  @Column({ nullable: true })
  DefaultSLASetID: string;

  @Column({ type: 'enum', enum: PortalIntegrationType })
  PortalIntegrationType: PortalIntegrationType;

  @Column({ nullable: true })
  TemplateSetID: string;

  @Column()
  PaymentTerms: string;

  @Column('decimal', { precision: 5, scale: 2 })
  RetentionPct: number;

  @Column({ nullable: true })
  LDClauseReference: string;

  @Column({ nullable: true })
  EmpanelledVendorListID: string;

  @Column({ default: 'INR' })
  Currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
