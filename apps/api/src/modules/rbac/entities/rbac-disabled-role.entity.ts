import { Entity, PrimaryColumn } from 'typeorm';

@Entity('rbac_disabled_roles')
export class RbacDisabledRole {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  role_id: string;
}
