import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EmploymentType {
    PERMANENT = 'PERMANENT',
    CONTRACT = 'CONTRACT',
    DAILY_WAGE = 'DAILY_WAGE'
}

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    TERMINATED = 'TERMINATED'
}

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    employeeId: string;

    @Column({ type: 'varchar' })
    fullName: string;

    @Column({ type: 'varchar', unique: true })
    employeeCode: string;

    @Column({ type: 'varchar' })
    department: string;

    @Column({ type: 'varchar' })
    designation: string;

    @Column({ type: 'enum', enum: EmploymentType })
    employmentType: EmploymentType;

    @Column({ type: 'uuid', nullable: true })
    reportingTo: string | null;

    @Column({ type: 'simple-array', nullable: true })
    skillSet: string[] | null;

    @Column({ type: 'date' })
    joinDate: Date;

    @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
    status: EmployeeStatus;

    @Column({ type: 'decimal', nullable: true })
    monthlySalary: number | null;

    @Column({ type: 'varchar', nullable: true })
    bankAccountNumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    pfNumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    esiNumber: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
