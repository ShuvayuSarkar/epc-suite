import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AttendanceType {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    HALF_DAY = 'HALF_DAY',
    LEAVE = 'LEAVE'
}

export enum AttendanceSource {
    BIOMETRIC = 'BIOMETRIC',
    MANUAL = 'MANUAL',
    GPS = 'GPS'
}

@Entity('attendance_records')
export class AttendanceRecord {
    @PrimaryGeneratedColumn('uuid')
    attendanceId: string;

    @Column({ type: 'uuid' })
    employeeId: string;

    @Column({ type: 'uuid', nullable: true })
    projectId: string | null;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkInTime: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    checkOutTime: Date | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLat: number | null;

    @Column({ type: 'decimal', nullable: true })
    gpsLon: number | null;

    @Column({ type: 'boolean', default: false })
    isGeofenced: boolean;

    @Column({ type: 'enum', enum: AttendanceType })
    attendanceType: AttendanceType;

    @Column({ type: 'enum', enum: AttendanceSource })
    source: AttendanceSource;

    @CreateDateColumn()
    createdAt: Date;
}
