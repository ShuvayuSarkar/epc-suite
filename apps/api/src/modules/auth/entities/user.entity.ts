import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type RoleId =
  | 'system_admin' | 'project_director' | 'project_manager'
  | 'bid_manager' | 'finance_controller' | 'lead_design_engineer'
  | 'vendor_manager' | 'quality_inspector' | 'store_manager'
  | 'gang_supervisor' | 'safety_hse_officer' | 'hr_manager'
  | 'claims_manager' | 'contract_manager' | 'document_controller'
  | 'client_stakeholder' | 'sales_executive' | 'survey_team'
  | 'plant_manager' | 'compliance_officer' | 'treasury_manager'
  | 'legal_contracts';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string; // e.g. 'U001'

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ type: 'varchar', length: 50 })
  role: RoleId;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'jsonb', nullable: true })
  overrides: Record<string, string | null>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
