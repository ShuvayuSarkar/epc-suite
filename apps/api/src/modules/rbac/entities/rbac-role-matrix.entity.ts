import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('rbac_role_matrix')
export class RbacRoleMatrix {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  role_id: string;

  @Column({ type: 'jsonb' })
  permissions: Record<string, string | null>;

  @UpdateDateColumn()
  updated_at: Date;
}
