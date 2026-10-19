import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WBSType } from '@epc/shared-types';

@Entity('wbs')
export class WBS {
  @PrimaryGeneratedColumn('uuid')
  WBSID: string;

  @Column({ type: 'uuid' })
  ContractID: string;

  @Column({ type: 'uuid', nullable: true })
  PackageID: string;

  @Column({ type: 'uuid', nullable: true })
  LineSegmentID: string;

  @Column({ type: 'uuid', nullable: true })
  ActivityID: string;

  @ManyToOne(() => WBS)
  @JoinColumn({ name: 'ParentWBSID' })
  ParentWBS: WBS;

  @Column({ type: 'uuid', nullable: true })
  ParentWBSID: string;

  @Column({ type: 'enum', enum: WBSType })
  Type: WBSType;
}
